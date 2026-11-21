"""
LinguaBridge AI - NLP Utilities & Text Processing (22RI52 Lab Manual Concepts)
=============================================================================
Module: backend/nlp_utils.py

Incorporates core Natural Language Processing concepts from the 22RI52 syllabus:
1. Text Normalization:
   - Unicode NFC canonical composition for Indic scripts (Kannada & Devanagari/Hindi).
   - Virama (halant) and vowel matra consistency.
   - Whitespace stripping and zero-width joiner (ZWJ/ZWNJ) sanitation.
2. Tokenization:
   - Whitespace & punctuation-aware word tokenization.
   - Sentence segmentation (supporting Danda '।', '.', '?', '!').
   - Character and character n-gram tokenization for morphologically rich Indic languages.
3. Script Validation & Language Detection:
   - Character block detection for Latin (English), Kannada, and Devanagari (Hindi).
   - Script purity ratio computation.
   - Language code normalization (BCP-47 / FLORES-200 <-> ISO 639-1).
4. Text Filtration:
   - Noise / punctuation removal, length validation.
   - Beam search loop / repetitive n-gram detection.
5. Edit Distance & String Similarity:
   - Levenshtein minimum edit distance (insertions, deletions, substitutions).
   - Word Error Rate (WER) and character similarity metrics.
"""

import re
import unicodedata
from typing import Dict, List, Optional, Set, Tuple

# =============================================================================
# 1. Unicode Ranges & Regex Patterns
# =============================================================================

# Unicode codepoint blocks
KANNADA_RANGE = (0x0C80, 0x0CFF)
DEVANAGARI_RANGE = (0x0900, 0x097F)
TAMIL_RANGE = (0x0B80, 0x0BFF)
TELUGU_RANGE = (0x0C00, 0x0C7F)
LATIN_RANGE = (0x0041, 0x007A)  # A-Z, a-z + basic Latin

KANNADA_PATTERN = re.compile(r"[\u0C80-\u0CFF]")
DEVANAGARI_PATTERN = re.compile(r"[\u0900-\u097F]")
TAMIL_PATTERN = re.compile(r"[\u0B80-\u0BFF]")
TELUGU_PATTERN = re.compile(r"[\u0C00-\u0C7F]")
LATIN_PATTERN = re.compile(r"[a-zA-Z]")
PUNCTUATION_PATTERN = re.compile(r"[!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~।॥]")

# Standard language code normalization dictionary
LANG_CODE_MAP = {
    # English
    "en": "eng_Latn",
    "eng": "eng_Latn",
    "eng_latn": "eng_Latn",
    "english": "eng_Latn",
    # Kannada
    "kn": "kan_Knda",
    "kan": "kan_Knda",
    "kan_knda": "kan_Knda",
    "kannada": "kan_Knda",
    # Hindi
    "hi": "hin_Deva",
    "hin": "hin_Deva",
    "hin_deva": "hin_Deva",
    "hindi": "hin_Deva",
    # Tamil
    "ta": "tam_Taml",
    "tam": "tam_Taml",
    "tam_taml": "tam_Taml",
    "tamil": "tam_Taml",
    # Telugu
    "te": "tel_Telu",
    "tel": "tel_Telu",
    "tel_telu": "tel_Telu",
    "telugu": "tel_Telu",
}

# Reverse mapping to ISO 639-1
ISO_MAP = {
    "eng_Latn": "en",
    "kan_Knda": "kn",
    "hin_Deva": "hi",
    "tam_Taml": "ta",
    "tel_Telu": "te",
}

# Common English and Indic stopwords for light filtration
STOPWORDS: Dict[str, Set[str]] = {
    "en": {"the", "a", "an", "in", "is", "of", "and", "to", "for", "with", "on", "at", "by", "this", "that"},
    "kn": {"ಮತ್ತು", "ಇದು", "ಅದು", "ಈ", "ಆ", "ಎಂದು", "ಒಂದು", "ಮೇಲೆ", "ರಲ್ಲಿ", "ಇದೆ", "ಆಗಿದೆ"},
    "hi": {"और", "यह", "वह", "का", "की", "के", "में", "पर", "है", "हैं", "से", "को"},
    "ta": {"மற்றும்", "இது", "அது", "ஒரு", "என்று", "இல்லை", "ஆகும்", "உள்ளது", "இந்த", "அந்த"},
    "te": {"మరియు", "ఇది", "అది", "ఒక", "అని", "లేదు", "ఉంది", "ఈ", "ఆ", "గా"},
}


# =============================================================================
# 2. Language Code Normalization
# =============================================================================

def normalize_lang_code(code: str) -> str:
    """
    Standardizes any language representation (e.g., 'en', 'kn', 'hi', 'kannada')
    into the canonical FLORES-200 code ('eng_Latn', 'kan_Knda', 'hin_Deva').
    """
    if not code:
        return "eng_Latn"
    cleaned = code.strip().lower()
    return LANG_CODE_MAP.get(cleaned, code)


def to_iso_code(code: str) -> str:
    """Converts a FLORES-200 code to ISO 639-1 ('en', 'kn', 'hi')."""
    normalized = normalize_lang_code(code)
    return ISO_MAP.get(normalized, normalized[:2].lower())


# =============================================================================
# 3. Unicode Normalization & Text Cleaning (Lab: Normalization)
# =============================================================================

def normalize_text(text: str) -> str:
    """
    Applies Unicode NFC (Canonical Composition) and cleans irregular whitespace.

    Algorithmic Rationale (from 22RI52 Indic NLP Lab):
    In Dravidian and Indo-Aryan scripts (Kannada, Devanagari), composite characters
    (Aksharas) consist of a base consonant + virama/halant (U+0CCD in Kannada, U+094D in Hindi)
    + dependent vowel signs (matras). NFC guarantees canonical composition into a single
    composed codepoint sequence, preventing tokenizers from fragmenting sub-syllables.
    """
    if not text or not isinstance(text, str):
        return ""

    # Unicode NFC normalization
    normalized = unicodedata.normalize("NFC", text)

    # Sanitize zero-width joiners and non-joiners unless grammatically required
    normalized = normalized.replace("\u200B", "")  # Zero-width space

    # Collapse multiple spaces, tabs, and newlines
    normalized = re.sub(r"[\t\r\f\v]+", " ", normalized)
    normalized = re.sub(r" +", " ", normalized)

    return normalized.strip()


def remove_punctuation(text: str) -> str:
    """Removes standard ASCII punctuation and Indic Danda marks ('।', '॥')."""
    return PUNCTUATION_PATTERN.sub("", text)


# =============================================================================
# 4. Tokenization Utilities (Lab: Tokenization Concepts)
# =============================================================================

def tokenize_words(text: str) -> List[str]:
    """
    Performs word-level tokenization suitable for multilingual text (English, Kannada, Hindi, Tamil, Telugu).
    Preserves Indic characters, vowels, pulli (U+0BCD in Tamil), and virama sequences.
    """
    cleaned = normalize_text(text)
    # Match alphanumeric words or contiguous Indic script sequences
    tokens = re.findall(
        r"[\u0C80-\u0CFF]+|[\u0900-\u097F]+|[\u0B80-\u0BFF]+|[\u0C00-\u0C7F]+|[a-zA-Z0-9]+|[^\s\w]",
        cleaned,
    )
    return [t for t in tokens if t.strip()]


def tokenize_sentences(text: str) -> List[str]:
    """
    Performs sentence segmentation supporting both Latin stops ('.', '!', '?')
    and Indic Purna Virama / Danda marks ('।', '॥').
    """
    cleaned = normalize_text(text)
    if not cleaned:
        return []
    # Split on periods, exclamation/question marks, and Indic danda
    sentences = re.split(r"(?<=[.!?।॥])\s+", cleaned)
    return [s.strip() for s in sentences if s.strip()]


def get_character_ngrams(text: str, n: int = 3) -> List[str]:
    """
    Extracts character n-grams from text (useful for morphologically rich Indic languages
    and sub-word similarity evaluation like chrF++).
    """
    compact = re.sub(r"\s+", " ", text).strip()
    if len(compact) < n:
        return [compact] if compact else []
    return [compact[i : i + n] for i in range(len(compact) - n + 1)]


# =============================================================================
# 5. Script Analysis & Script Validation (Lab: Script Detection)
# =============================================================================

def analyze_script_proportions(text: str) -> Dict[str, float]:
    """
    Computes character script distribution ratios for Latin, Kannada, Devanagari, Tamil, and Telugu.
    """
    non_space = [c for c in text if not c.isspace()]
    if not non_space:
        return {"latin": 0.0, "kannada": 0.0, "devanagari": 0.0, "tamil": 0.0, "telugu": 0.0, "total": 0}

    total = len(non_space)
    latin_count = len(LATIN_PATTERN.findall("".join(non_space)))
    kannada_count = len(KANNADA_PATTERN.findall("".join(non_space)))
    deva_count = len(DEVANAGARI_PATTERN.findall("".join(non_space)))
    tamil_count = len(TAMIL_PATTERN.findall("".join(non_space)))
    telugu_count = len(TELUGU_PATTERN.findall("".join(non_space)))

    return {
        "latin": round(latin_count / total, 3),
        "kannada": round(kannada_count / total, 3),
        "devanagari": round(deva_count / total, 3),
        "tamil": round(tamil_count / total, 3),
        "telugu": round(telugu_count / total, 3),
        "total": total,
    }


def detect_dominant_script(text: str) -> str:
    """
    Detects the dominant script in the given text:
    'eng_Latn', 'kan_Knda', 'hin_Deva', 'tam_Taml', 'tel_Telu', or 'unknown'.
    """
    ratios = analyze_script_proportions(text)
    if ratios["total"] == 0:
        return "unknown"
    if ratios["kannada"] >= 0.25:
        return "kan_Knda"
    if ratios["devanagari"] >= 0.25:
        return "hin_Deva"
    if ratios["tamil"] >= 0.25:
        return "tam_Taml"
    if ratios["telugu"] >= 0.25:
        return "tel_Telu"
    if ratios["latin"] >= 0.30:
        return "eng_Latn"
    return "unknown"


def validate_script_match(text: str, expected_lang: str) -> Tuple[bool, str]:
    """
    Validates whether input text conforms to the expected source language script.
    Allows flexibility for mixed loanwords and proper nouns.
    """
    norm_lang = normalize_lang_code(expected_lang)
    ratios = analyze_script_proportions(text)

    if ratios["total"] == 0:
        return False, "Input text contains no alphabetic content."

    if norm_lang == "kan_Knda":
        if ratios["kannada"] < 0.20 and ratios["latin"] > 0.60:
            return False, "Expected Kannada script, but text appears to be primarily English/Latin."
    elif norm_lang == "hin_Deva":
        if ratios["devanagari"] < 0.20 and ratios["latin"] > 0.60:
            return False, "Expected Hindi (Devanagari) script, but text appears to be primarily English/Latin."
    elif norm_lang == "tam_Taml":
        if ratios["tamil"] < 0.20 and ratios["latin"] > 0.60:
            return False, "Expected Tamil script, but text appears to be primarily English/Latin."
    elif norm_lang == "tel_Telu":
        if ratios["telugu"] < 0.20 and ratios["latin"] > 0.60:
            return False, "Expected Telugu script, but text appears to be primarily English/Latin."
    elif norm_lang == "eng_Latn":
        if ratios["kannada"] > 0.40:
            return False, "Expected English text, but found predominantly Kannada characters."
        if ratios["devanagari"] > 0.40:
            return False, "Expected English text, but found predominantly Hindi (Devanagari) characters."
        if ratios["tamil"] > 0.40:
            return False, "Expected English text, but found predominantly Tamil characters."
        if ratios["telugu"] > 0.40:
            return False, "Expected English text, but found predominantly Telugu characters."

    return True, "Valid"


# =============================================================================
# 6. Quality & Degeneracy Filtering (Lab: Corpus Preprocessing)
# =============================================================================

def has_repetition_loops(text: str, n: int = 3, threshold: int = 3) -> bool:
    """
    Detects beam search degeneration loops (repeated word n-grams).
    Common failure mode in autoregressive Seq2Seq decoders.
    """
    tokens = tokenize_words(text.lower())
    if len(tokens) < n * threshold:
        return False

    ngrams = [tuple(tokens[i : i + n]) for i in range(len(tokens) - n + 1)]
    for i in range(len(ngrams) - threshold + 1):
        candidate = ngrams[i]
        count = 1
        for j in range(i + n, len(ngrams), n):
            if j < len(ngrams) and ngrams[j] == candidate:
                count += 1
                if count >= threshold:
                    return True
            else:
                break
    return False


# =============================================================================
# 7. Edit Distance & String Similarity (Lab: Dynamic Programming / Levenshtein)
# =============================================================================

def levenshtein_distance(s1: str, s2: str) -> int:
    """
    Computes classic Levenshtein minimum edit distance using Dynamic Programming.
    Supports operations: Insertion, Deletion, Substitution (cost = 1 each).

    Time Complexity: O(M * N)
    Space Complexity: O(min(M, N)) with space optimization.
    """
    if s1 == s2:
        return 0
    if not s1:
        return len(s2)
    if not s2:
        return len(s1)

    # Ensure s1 is the shorter string to optimize memory
    if len(s1) > len(s2):
        s1, s2 = s2, s1

    previous_row = list(range(len(s1) + 1))
    for j, c2 in enumerate(s2):
        current_row = [j + 1] * (len(s1) + 1)
        for i, c1 in enumerate(s1):
            insertions = previous_row[i + 1] + 1
            deletions = current_row[i] + 1
            substitutions = previous_row[i] + (0 if c1 == c2 else 1)
            current_row[i + 1] = min(insertions, deletions, substitutions)
        previous_row = current_row

    return previous_row[-1]


def string_similarity_ratio(s1: str, s2: str) -> float:
    """
    Computes normalized similarity ratio between 0.0 (completely distinct)
    and 1.0 (identical) based on Levenshtein distance.
    """
    max_len = max(len(s1), len(s2))
    if max_len == 0:
        return 1.0
    dist = levenshtein_distance(s1, s2)
    return round(1.0 - (dist / max_len), 4)


def word_error_rate(reference: str, hypothesis: str) -> float:
    """
    Calculates Word Error Rate (WER) between reference and hypothesis strings.
    Useful for evaluation of machine translation and speech outputs.
    """
    ref_tokens = tokenize_words(reference)
    hyp_tokens = tokenize_words(hypothesis)

    if not ref_tokens:
        return 1.0 if hyp_tokens else 0.0

    # Levenshtein at token level
    d = [[0] * (len(hyp_tokens) + 1) for _ in range(len(ref_tokens) + 1)]
    for i in range(len(ref_tokens) + 1):
        d[i][0] = i
    for j in range(len(hyp_tokens) + 1):
        d[0][j] = j

    for i in range(1, len(ref_tokens) + 1):
        for j in range(1, len(hyp_tokens) + 1):
            if ref_tokens[i - 1] == hyp_tokens[j - 1]:
                d[i][j] = d[i - 1][j - 1]
            else:
                substitution = d[i - 1][j - 1] + 1
                insertion = d[i][j - 1] + 1
                deletion = d[i - 1][j] + 1
                d[i][j] = min(substitution, insertion, deletion)

    return round(d[len(ref_tokens)][len(hyp_tokens)] / len(ref_tokens), 4)
