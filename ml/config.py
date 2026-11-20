"""
LinguaBridge AI - Centralized Machine Learning Configuration
=============================================================
This module defines all constants, model identifiers, hyperparameters,
and directory paths used across the English <-> Kannada low-resource
Neural Machine Translation pipeline.

Languages (NLLB BCP-47 / FLORES-200 format):
- English: eng_Latn
- Kannada: kan_Knda
"""

import os
from dataclasses import dataclass, field
from typing import List


@dataclass
class NMTConfig:
    """Configuration parameters for NLLB-200 LoRA translation pipeline."""

    # Model Identification
    base_model_name: str = "facebook/nllb-200-distilled-600M"
    src_lang: str = "eng_Latn"
    tgt_lang: str = "kan_Knda"

    # Directory Paths
    base_dir: str = os.path.dirname(os.path.abspath(__file__))
    data_dir: str = os.path.join(base_dir, "data")
    adapters_dir: str = os.path.join(base_dir, "adapters")
    outputs_dir: str = os.path.join(base_dir, "outputs")

    # Data split files
    raw_parallel_data: str = os.path.join(data_dir, "parallel_corpus_raw.jsonl")
    train_data_path: str = os.path.join(data_dir, "train.jsonl")
    val_data_path: str = os.path.join(data_dir, "val.jsonl")
    test_data_path: str = os.path.join(data_dir, "test.jsonl")

    # Back-translation data files
    monolingual_kan_data: str = os.path.join(data_dir, "monolingual_kannada.txt")
    synthetic_parallel_data: str = os.path.join(data_dir, "synthetic_parallel.jsonl")
    augmented_train_data: str = os.path.join(data_dir, "train_augmented.jsonl")

    # Evaluation output files
    metrics_output_path: str = os.path.join(outputs_dir, "metrics.json")
    comparison_output_path: str = os.path.join(outputs_dir, "comparison_examples.json")

    # LoRA / PEFT Hyperparameters
    # r (rank): Dimension of low-rank matrices. 16 balances capacity and efficiency.
    lora_r: int = 16
    # lora_alpha: Scaling parameter; standard practice is 2 * r
    lora_alpha: int = 32
    # lora_dropout: Regularization to avoid overfitting on small corpus (~3,500 pairs)
    lora_dropout: float = 0.05
    # Target modules in NLLB attention layers
    target_modules: List[str] = field(
        default_factory=lambda: ["q_proj", "v_proj", "k_proj", "out_proj"]
    )

    # Data Cleaning Thresholds
    min_word_count: int = 1
    max_word_count: int = 150
    min_length_ratio: float = 0.3
    max_length_ratio: float = 3.3
    min_kannada_char_ratio: float = 0.35  # At least 35% characters in target must be Kannada script
    min_latin_char_ratio: float = 0.50    # At least 50% characters in source must be Latin script

    # Back-translation Generation Parameters
    bt_batch_size: int = 16
    bt_num_beams: int = 4
    bt_max_length: int = 128

    # Training Hyperparameters
    learning_rate: float = 3e-4
    num_train_epochs: int = 5
    per_device_train_batch_size: int = 8
    per_device_eval_batch_size: int = 8
    gradient_accumulation_steps: int = 2
    warmup_ratio: float = 0.1
    weight_decay: float = 0.01
    max_seq_length: int = 128
    random_seed: int = 42


# Global configuration instance
DEFAULT_CONFIG = NMTConfig()
