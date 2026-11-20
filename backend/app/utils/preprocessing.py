"""
LinguaBridge AI - Text Preprocessing Utilities
==============================================
Module: backend/app/utils/preprocessing.py
Purpose: Text normalization, Unicode NFC cleaning, and script character analysis
         prior to neural tokenization and translation inference.
"""

import re
import unicodedata
from typing import Dict, Tuple

# Unicode codepoint blocks
KANNADA_REGEX = re.compile(r"[\u0C80-\u0CFF]")
LATIN_REGEX = re.compile(r"[a-zA-Z]")


def normalize_text(text: str) -> str:
    """
    Applies Unicode Normalization Form C (NFC) and standardizes whitespace.

    Why NFC is critical for Kannada:
    Kannada is an Indic script where composite characters (aksharas) are composed
    of a base consonant, virama (halant U+0CCD), and dependent vowel signs (matras).
    NFC standardizes decomposed sequences into canonical composed characters,
    preventing subword tokenizers from fragmenting single characters.

    Args:
        text (str): Raw input text.

    Returns:
        str: Cleaned, NFC-normalized string with collapsed whitespace.
    """
    if not text or not isinstance(text, str):
        return ""

    # Canonical Decomposition followed by Canonical Composition
    normalized = unicodedata.normalize("NFC", text)

    # Normalize zero-width joiners and clean duplicate whitespace
    normalized = re.sub(r"[\t\r\f\v]+", " ", normalized)
    normalized = re.sub(r" +", " ", normalized)

    return normalized.strip()


def analyze_script(text: str) -> Dict[str, float]:
    """
    Calculates the proportion of Latin and Kannada characters in the input text.

    Args:
        text (str): Text to analyze.

    Returns:
        Dict[str, float]: Ratios for 'kannada_ratio' and 'latin_ratio'.
    """
    non_space = [c for c in text if not c.isspace()]
    if not non_space:
        return {"kannada_ratio": 0.0, "latin_ratio": 0.0, "total_chars": 0}

    total = len(non_space)
    kannada_chars = len(KANNADA_REGEX.findall("".join(non_space)))
    latin_chars = len(LATIN_REGEX.findall("".join(non_space)))

    return {
        "kannada_ratio": round(kannada_chars / total, 3),
        "latin_ratio": round(latin_chars / total, 3),
        "total_chars": total,
    }


def truncate_text(text: str, max_chars: int) -> Tuple[str, bool]:
    """
    Safely truncates text to max_chars without slicing mid-word if possible.

    Args:
        text (str): Input text.
        max_chars (int): Maximum allowable character count.

    Returns:
        Tuple[str, bool]: (truncated_text, was_truncated)
    """
    if len(text) <= max_chars:
        return text, False

    truncated = text[:max_chars]
    last_space = truncated.rfind(" ")
    if last_space > int(max_chars * 0.8):
        truncated = truncated[:last_space]

    return truncated.strip(), True
