"""
LinguaBridge AI - Monolingual Back-Translation Pipeline
======================================================
Module: ml/back_translation.py
Purpose: Translate monolingual Kannada text (kan_Knda) into synthetic English (eng_Latn)
         to augment the low-resource parallel corpus with high-quality pseudo-parallel pairs.

Background & Motivation (Sennrich et al., 2016):
- In low-resource NMT (English -> Kannada), authentic parallel text is scarce (~3,500 pairs).
- Back-translation generates synthetic source (English) sentences from real, native target
  (Kannada) monolingual sentences.
- Crucially, the target side is authentic, grammatically correct Kannada written by native
  speakers. When training the forward model (eng -> kan), the decoder learns from authentic
  Kannada syntax and vocabulary, drastically boosting chrF and BLEU.

Pipeline Stages:
1. Load monolingual Kannada sentences and perform Unicode NFC normalization.
2. Load NLLB-200 model with target language forced to English (`eng_Latn`).
3. Batched beam-search translation with GPU/CPU support and FP16 auto-detection.
4. Quality Filtering on Synthetic Pairs:
   - Untranslated text detection (rejects copied Kannada characters in English output).
   - Repetition loop detection (rejects degenerate beam-search n-gram loops).
   - Length-ratio consistency filtering.
   - Script purity verification (Latin source vs. Kannada target).
5. Output generation: Saves `synthetic_parallel.jsonl` and optionally merges with `train.jsonl`
   to create `train_augmented.jsonl`.

Author: LinguaBridge AI Team
"""

import argparse
import json
import logging
import os
import re
from typing import Dict, List, Optional, Tuple

import torch
from tqdm import tqdm
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from config import DEFAULT_CONFIG
from data_cleaning import (
    KANNADA_REGEX,
    LATIN_REGEX,
    calculate_script_ratio,
    normalize_unicode,
)

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("BackTranslator")


# ============================================================================
# 1. Hallucination & Degeneracy Filters
# ============================================================================

def has_repetition_loops(text: str, max_ngram: int = 3, max_repeats: int = 3) -> bool:
    """
    Detects degenerative repetition loops frequently produced by beam search.

    Example: "the city is great is great is great is great..."

    Args:
        text (str): Candidate sentence.
        max_ngram (int): Maximum n-gram size to inspect.
        max_repeats (int): Max allowable consecutive occurrences before rejection.

    Returns:
        bool: True if degenerate repeating pattern is detected, else False.
    """
    tokens = text.lower().split()
    if len(tokens) < 6:
        return False

    for n in range(1, max_ngram + 1):
        for i in range(len(tokens) - (n * max_repeats)):
            pattern = tokens[i : i + n]
            repeats = 1
            for k in range(1, max_repeats):
                next_slice = tokens[i + (k * n) : i + ((k + 1) * n)]
                if next_slice == pattern:
                    repeats += 1
                else:
                    break
            if repeats >= max_repeats:
                return True
    return False


def validate_synthetic_pair(
    synth_eng: str,
    orig_kan: str,
    min_words: int = 2,
    max_words: int = 120,
    min_latin_ratio: float = 0.60,
    min_kannada_ratio: float = 0.40,
) -> Tuple[bool, Optional[str]]:
    """
    Verifies that a back-translated synthetic (English, Kannada) pair is high quality.

    Args:
        synth_eng (str): Generated synthetic English translation.
        orig_kan (str): Original native Kannada sentence.
        min_words (int): Minimum token count.
        max_words (int): Maximum token count.
        min_latin_ratio (float): Required Latin script purity in synthetic English.
        min_kannada_ratio (float): Required Kannada script purity in target sentence.

    Returns:
        Tuple[bool, Optional[str]]: (is_valid, failure_reason)
    """
    if not synth_eng or not orig_kan:
        return False, "EMPTY_TEXT"

    eng_tokens = synth_eng.split()
    kan_tokens = orig_kan.split()

    if len(eng_tokens) < min_words or len(kan_tokens) < min_words:
        return False, "TOO_SHORT"
    if len(eng_tokens) > max_words or len(kan_tokens) > max_words:
        return False, "TOO_LONG"

    # Length ratio check
    ratio = len(eng_tokens) / max(len(kan_tokens), 1)
    if ratio < 0.25 or ratio > 3.5:
        return False, f"BAD_LENGTH_RATIO ({ratio:.2f})"

    # Repetition degeneracy check
    if has_repetition_loops(synth_eng):
        return False, "DEGENERATE_REPETITION_LOOP"

    # Verify synthetic English has genuine Latin characters and not copied Kannada
    latin_ratio = calculate_script_ratio(synth_eng, LATIN_REGEX)
    if latin_ratio < min_latin_ratio:
        return False, f"UNTRANSLATED_OR_NON_LATIN ({latin_ratio:.2f})"

    # Verify original Kannada is genuine
    kannada_ratio = calculate_script_ratio(orig_kan, KANNADA_REGEX)
    if kannada_ratio < min_kannada_ratio:
        return False, f"CORRUPT_KANNADA_TARGET ({kannada_ratio:.2f})"

    return True, None


# ============================================================================
# 2. Batched Neural Back-Translation Model
# ============================================================================

class NLLBBackTranslator:
    """
    Wraps NLLB-200 to perform target (kan_Knda) -> source (eng_Latn) back-translation.
    """

    def __init__(
        self,
        model_name: str = DEFAULT_CONFIG.base_model_name,
        src_lang: str = "kan_Knda",
        tgt_lang: str = "eng_Latn",
        device: Optional[str] = None,
    ):
        """
        Initializes tokenizer and model with device configuration.
        """
        self.src_lang = src_lang
        self.tgt_lang = tgt_lang

        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        logger.info(f"Loading tokenizer: {model_name} (src={src_lang}, tgt={tgt_lang})")
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            src_lang=self.src_lang,
        )

        logger.info(f"Loading NLLB model onto {self.device}...")
        torch_dtype = torch.float16 if self.device == "cuda" else torch.float32
        self.model = AutoModelForSeq2SeqLM.from_pretrained(
            model_name,
            torch_dtype=torch_dtype,
        ).to(self.device)
        self.model.eval()

        # Retrieve target language token id for forced bos token
        self.tgt_lang_id = self.tokenizer.convert_tokens_to_ids(self.tgt_lang)
        logger.info(f"Configured target language ID ({self.tgt_lang}): {self.tgt_lang_id}")

    @torch.no_grad()
    def translate_batch(
        self,
        texts: List[str],
        num_beams: int = 4,
        max_length: int = 128,
    ) -> List[str]:
        """
        Translates a batch of Kannada texts into English using beam search.

        Args:
            texts (List[str]): Batch of Kannada sentences.
            num_beams (int): Beam search width.
            max_length (int): Maximum generation length.

        Returns:
            List[str]: Translated English sentences.
        """
        inputs = self.tokenizer(
            texts,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=max_length,
        ).to(self.device)

        generated_tokens = self.model.generate(
            **inputs,
            forced_bos_token_id=self.tgt_lang_id,
            num_beams=num_beams,
            max_length=max_length,
            early_stopping=True,
        )

        decoded = self.tokenizer.batch_decode(
            generated_tokens,
            skip_special_tokens=True,
        )
        return [normalize_unicode(t) for t in decoded]


# ============================================================================
# 3. Pipeline Orchestration
# ============================================================================

def load_monolingual_kannada(file_path: str) -> List[str]:
    """
    Loads Kannada monolingual sentences from a text or JSONL file.
    Applies initial NFC normalization and basic sentence sanity check.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Monolingual file not found: {file_path}")

    sentences = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            line_str = line.strip()
            if not line_str:
                continue
            # Handle if JSON formatted or plain text
            if line_str.startswith("{") and line_str.endswith("}"):
                try:
                    obj = json.loads(line_str)
                    text = obj.get("text", obj.get("kan", obj.get("kan_Knda", "")))
                except json.JSONDecodeError:
                    text = line_str
            else:
                text = line_str

            clean_text = normalize_unicode(text)
            if clean_text:
                sentences.append(clean_text)

    # Deduplicate monolingual inputs
    unique_sentences = list(dict.fromkeys(sentences))
    logger.info(f"Loaded {len(unique_sentences):,} unique monolingual Kannada sentences.")
    return unique_sentences


def run_back_translation(
    input_file: str,
    output_synthetic_file: str,
    batch_size: int = DEFAULT_CONFIG.bt_batch_size,
    num_beams: int = DEFAULT_CONFIG.bt_num_beams,
    max_samples: Optional[int] = None,
    merge_train_file: Optional[str] = None,
    output_augmented_file: Optional[str] = None,
) -> Dict[str, any]:
    """
    Executes back-translation from monolingual Kannada to filtered synthetic parallel pairs.

    Args:
        input_file: Path to monolingual Kannada file.
        output_synthetic_file: Output path for synthetic parallel jsonl.
        batch_size: Inference batch size.
        num_beams: Generation beam width.
        max_samples: Optional limit for testing/quick verification.
        merge_train_file: Optional path to train.jsonl to merge with.
        output_augmented_file: Output path for merged augmented dataset.

    Returns:
        Dict: Statistics of generation and filtering.
    """
    logger.info("=" * 65)
    logger.info("LINGUABRIDGE AI: MONOLINGUAL BACK-TRANSLATION (kan_Knda -> eng_Latn)")
    logger.info(f"Input: {input_file}")
    logger.info(f"Target Synthetic File: {output_synthetic_file}")
    logger.info("=" * 65)

    kan_sentences = load_monolingual_kannada(input_file)
    if max_samples and max_samples < len(kan_sentences):
        kan_sentences = kan_sentences[:max_samples]
        logger.info(f"Capped to max_samples={max_samples}")

    translator = NLLBBackTranslator(
        model_name=DEFAULT_CONFIG.base_model_name,
        src_lang="kan_Knda",
        tgt_lang="eng_Latn",
    )

    synthetic_pairs = []
    stats = {
        "total_monolingual_inputs": len(kan_sentences),
        "generated": 0,
        "valid_retained": 0,
        "rejected_count": 0,
        "rejection_reasons": {},
    }

    # Process in batches
    for i in tqdm(range(0, len(kan_sentences), batch_size), desc="Back-translating"):
        batch_kan = kan_sentences[i : i + batch_size]
        try:
            batch_eng = translator.translate_batch(
                batch_kan,
                num_beams=num_beams,
                max_length=DEFAULT_CONFIG.bt_max_length,
            )
        except Exception as e:
            logger.error(f"Inference error on batch {i}: {e}")
            continue

        stats["generated"] += len(batch_kan)

        for synth_eng, orig_kan in zip(batch_eng, batch_kan):
            is_valid, reason = validate_synthetic_pair(synth_eng, orig_kan)
            if not is_valid:
                stats["rejected_count"] += 1
                stats["rejection_reasons"][reason] = (
                    stats["rejection_reasons"].get(reason, 0) + 1
                )
                continue

            pair = {
                "translation": {
                    DEFAULT_CONFIG.src_lang: synth_eng,
                    DEFAULT_CONFIG.tgt_lang: orig_kan,
                },
                "src": synth_eng,
                "tgt": orig_kan,
                "is_synthetic": True,
            }
            synthetic_pairs.append(pair)

    stats["valid_retained"] = len(synthetic_pairs)
    logger.info(
        f"Synthetic Generation Complete. Generated: {stats['generated']}, "
        f"Retained: {stats['valid_retained']}, Rejected: {stats['rejected_count']}"
    )

    # Save synthetic parallel dataset
    os.makedirs(os.path.dirname(os.path.abspath(output_synthetic_file)), exist_ok=True)
    with open(output_synthetic_file, "w", encoding="utf-8") as f:
        for p in synthetic_pairs:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")
    logger.info(f"Saved synthetic parallel pairs to -> {output_synthetic_file}")

    # Optionally merge with human-labeled train.jsonl
    if merge_train_file and output_augmented_file:
        if os.path.exists(merge_train_file):
            logger.info(f"Merging with clean train set: {merge_train_file}")
            with open(merge_train_file, "r", encoding="utf-8") as f:
                human_train = [json.loads(line) for line in f if line.strip()]

            # Mark human pairs as not synthetic
            for hp in human_train:
                hp["is_synthetic"] = False

            combined = human_train + synthetic_pairs
            os.makedirs(os.path.dirname(os.path.abspath(output_augmented_file)), exist_ok=True)
            with open(output_augmented_file, "w", encoding="utf-8") as f:
                for item in combined:
                    f.write(json.dumps(item, ensure_ascii=False) + "\n")

            logger.info(
                f"Saved Augmented Dataset ({len(human_train)} human + {len(synthetic_pairs)} synthetic = "
                f"{len(combined)} total) to -> {output_augmented_file}"
            )
            stats["augmented_total"] = len(combined)

    return stats


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LinguaBridge AI Back-Translation Pipeline")
    parser.add_argument(
        "--input_kannada",
        type=str,
        default=DEFAULT_CONFIG.monolingual_kan_data,
        help="Path to monolingual Kannada text file",
    )
    parser.add_argument(
        "--output_synthetic",
        type=str,
        default=DEFAULT_CONFIG.synthetic_parallel_data,
        help="Path to save synthetic parallel pairs (.jsonl)",
    )
    parser.add_argument(
        "--merge_train",
        type=str,
        default=DEFAULT_CONFIG.train_data_path,
        help="Path to clean train.jsonl to combine with",
    )
    parser.add_argument(
        "--output_augmented",
        type=str,
        default=DEFAULT_CONFIG.augmented_train_data,
        help="Path to save combined augmented dataset",
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=DEFAULT_CONFIG.bt_batch_size,
        help="Batch size for translation",
    )
    parser.add_argument(
        "--max_samples",
        type=int,
        default=None,
        help="Optional max samples for fast trial",
    )
    args = parser.parse_args()

    run_back_translation(
        input_file=args.input_kannada,
        output_synthetic_file=args.output_synthetic,
        batch_size=args.batch_size,
        max_samples=args.max_samples,
        merge_train_file=args.merge_train,
        output_augmented_file=args.output_augmented,
    )
