"""
LinguaBridge AI - Low-Rank Adaptation (LoRA) Fine-Tuning Pipeline
=================================================================
Module: ml/train_lora.py
Purpose: Parameter-Efficient Fine-Tuning (PEFT) of facebook/nllb-200-distilled-600M
         for English -> Kannada (eng_Latn -> kan_Knda) translation using LoRA.

PEFT / LoRA Theoretical Overview (Hu et al., 2021):
- Full fine-tuning of 600M parameters on ~3,500 parallel pairs risks severe catastrophic
  forgetting and overfitting.
- LoRA freezes the pre-trained model weights W_0 in the multi-head self-attention and cross-attention
  layers and injects trainable rank decomposition matrices:
      W = W_0 + Delta_W = W_0 + (B * A) * (alpha / r)
  where B in R^{d x r}, A in R^{r x k}, with r << min(d, k).
- LoRA trains < 1% of the total model parameters, vastly reducing VRAM usage and training time
  while preserving multilingual representations learned across FLORES-200.

Pipelines Supported:
1. LoRA on Parallel Data:
   python train_lora.py --data_path data/train.jsonl --output_dir adapters/nllb_lora_baseline_data
2. LoRA on Parallel + Back-Translated Synthetic Data:
   python train_lora.py --data_path data/train_augmented.jsonl --output_dir adapters/nllb_lora_bt

Author: LinguaBridge AI Team
"""

import argparse
import json
import logging
import os
from typing import Dict, List, Optional

import torch
from datasets import Dataset
from peft import (
    LoraConfig,
    TaskType,
    get_peft_model,
    prepare_model_for_kbit_training,
)
from transformers import (
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
    DataCollatorForSeq2Seq,
    Seq2SeqTrainer,
    Seq2SeqTrainingArguments,
)

from config import DEFAULT_CONFIG

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("LoRATrainer")


def load_dataset_from_jsonl(file_path: str, src_lang: str, tgt_lang: str) -> Dataset:
    """
    Loads JSONL translation data and formats it into a Hugging Face Dataset.

    Args:
        file_path (str): Path to JSONL file.
        src_lang (str): Source language identifier.
        tgt_lang (str): Target language identifier.

    Returns:
        Dataset: Hugging Face Dataset with 'source' and 'target' text columns.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found: {file_path}")

    sources, targets = [], []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            item = json.loads(line)
            if "translation" in item:
                s = item["translation"].get(src_lang, "")
                t = item["translation"].get(tgt_lang, "")
            else:
                s = item.get("src", item.get("source", ""))
                t = item.get("tgt", item.get("target", ""))

            if s and t:
                sources.append(s)
                targets.append(t)

    logger.info(f"Loaded {len(sources):,} pairs from {file_path}")
    return Dataset.from_dict({"source": sources, "target": targets})


def preprocess_function(
    examples: Dict[str, List[str]],
    tokenizer: AutoTokenizer,
    src_lang: str,
    tgt_lang: str,
    max_length: int = 128,
) -> Dict[str, torch.Tensor]:
    """
    Tokenizes parallel source and target sentences for Seq2Seq loss computation.
    """
    # Set source language token
    tokenizer.src_lang = src_lang
    model_inputs = tokenizer(
        examples["source"],
        max_length=max_length,
        padding=False,
        truncation=True,
    )

    # Set target language token for labels
    tokenizer.src_lang = tgt_lang
    labels = tokenizer(
        text_target=examples["target"],
        max_length=max_length,
        padding=False,
        truncation=True,
    )

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs


def train_lora_nmt(
    train_data_path: str,
    val_data_path: str,
    output_adapter_dir: str,
    model_name: str = DEFAULT_CONFIG.base_model_name,
    src_lang: str = DEFAULT_CONFIG.src_lang,
    tgt_lang: str = DEFAULT_CONFIG.tgt_lang,
    lora_r: int = DEFAULT_CONFIG.lora_r,
    lora_alpha: int = DEFAULT_CONFIG.lora_alpha,
    lora_dropout: float = DEFAULT_CONFIG.lora_dropout,
    learning_rate: float = DEFAULT_CONFIG.learning_rate,
    epochs: int = DEFAULT_CONFIG.num_train_epochs,
    batch_size: int = DEFAULT_CONFIG.per_device_train_batch_size,
    gradient_accumulation_steps: int = DEFAULT_CONFIG.gradient_accumulation_steps,
) -> None:
    """
    Orchestrates the PEFT / LoRA fine-tuning procedure for NLLB-200.
    """
    logger.info("=" * 65)
    logger.info("LINGUABRIDGE AI: NLLB-200 LoRA FINE-TUNING")
    logger.info(f"Base Model: {model_name}")
    logger.info(f"Source Lang: {src_lang} | Target Lang: {tgt_lang}")
    logger.info(f"LoRA Config: r={lora_r}, alpha={lora_alpha}, dropout={lora_dropout}")
    logger.info(f"Output Directory: {output_adapter_dir}")
    logger.info("=" * 65)

    # 1. Load Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name, src_lang=src_lang)

    # 2. Load Datasets
    raw_train = load_dataset_from_jsonl(train_data_path, src_lang, tgt_lang)
    raw_val = load_dataset_from_jsonl(val_data_path, src_lang, tgt_lang)

    # 3. Tokenize Data
    logger.info("Tokenizing datasets...")
    train_tokenized = raw_train.map(
        lambda ex: preprocess_function(ex, tokenizer, src_lang, tgt_lang),
        batched=True,
        remove_columns=raw_train.column_names,
    )
    val_tokenized = raw_val.map(
        lambda ex: preprocess_function(ex, tokenizer, src_lang, tgt_lang),
        batched=True,
        remove_columns=raw_val.column_names,
    )

    # 4. Load Base Model in FP16 / FP32
    device = "cuda" if torch.cuda.is_available() else "cpu"
    torch_dtype = torch.float16 if device == "cuda" else torch.float32

    logger.info(f"Loading Base Seq2Seq Model: {model_name} on {device}...")
    base_model = AutoModelForSeq2SeqLM.from_pretrained(
        model_name,
        torch_dtype=torch_dtype,
    )

    # 5. Configure LoRA
    # TaskType.SEQ_2_SEQ_LM ensures adapter hooks into both encoder and decoder
    peft_config = LoraConfig(
        task_type=TaskType.SEQ_2_SEQ_LM,
        inference_mode=False,
        r=lora_r,
        lora_alpha=lora_alpha,
        lora_dropout=lora_dropout,
        target_modules=DEFAULT_CONFIG.target_modules,
        bias="none",
    )

    logger.info("Injecting LoRA adapters into NLLB attention layers...")
    model = get_peft_model(base_model, peft_config)
    model.print_trainable_parameters()

    # 6. Training Arguments
    training_args = Seq2SeqTrainingArguments(
        output_dir=output_adapter_dir,
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=learning_rate,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        gradient_accumulation_steps=gradient_accumulation_steps,
        weight_decay=DEFAULT_CONFIG.weight_decay,
        num_train_epochs=epochs,
        predict_with_generate=False,
        fp16=(device == "cuda"),
        logging_steps=10,
        save_total_limit=2,
        load_best_model_at_end=True,
        report_to="none",  # Avoid external telemetry by default
    )

    data_collator = DataCollatorForSeq2Seq(
        tokenizer,
        model=model,
        label_pad_token_id=-100,
        pad_to_multiple_of=8 if device == "cuda" else None,
    )

    # 7. Trainer Setup
    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_tokenized,
        eval_dataset=val_tokenized,
        tokenizer=tokenizer,
        data_collator=data_collator,
    )

    # 8. Train & Save Adapter
    logger.info("Commencing LoRA fine-tuning...")
    trainer.train()

    logger.info(f"Saving fine-tuned LoRA adapter weights to: {output_adapter_dir}")
    model.save_pretrained(output_adapter_dir)
    tokenizer.save_pretrained(output_adapter_dir)
    logger.info("LoRA fine-tuning complete!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LinguaBridge AI LoRA Fine-Tuning")
    parser.add_argument(
        "--data_path",
        type=str,
        default=DEFAULT_CONFIG.train_data_path,
        help="Path to training jsonl (e.g., train.jsonl or train_augmented.jsonl)",
    )
    parser.add_argument(
        "--val_path",
        type=str,
        default=DEFAULT_CONFIG.val_data_path,
        help="Path to validation jsonl",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default=os.path.join(DEFAULT_CONFIG.adapters_dir, "nllb_lora_baseline_data"),
        help="Directory to save LoRA adapter",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=DEFAULT_CONFIG.num_train_epochs,
        help="Number of training epochs",
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=DEFAULT_CONFIG.per_device_train_batch_size,
        help="Batch size per device",
    )
    parser.add_argument(
        "--lr",
        type=float,
        default=DEFAULT_CONFIG.learning_rate,
        help="Learning rate",
    )
    args = parser.parse_args()

    train_lora_nmt(
        train_data_path=args.data_path,
        val_data_path=args.val_path,
        output_adapter_dir=args.output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
    )
