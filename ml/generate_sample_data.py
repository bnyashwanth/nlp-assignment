"""
LinguaBridge AI - Sample Corpus Generator
=========================================
Module: ml/generate_sample_data.py
Purpose: Generates a realistic seed dataset for testing and validating the data cleaning,
         back-translation, evaluation, and training pipelines out of the box.

Includes:
1. Valid parallel English ↔ Kannada sentence pairs covering general, educational, and civic domains.
2. Controlled noisy samples:
   - Duplicates (exact matches)
   - Malformed Unicode strings requiring NFC normalization
   - Script mismatches (e.g., untranslated copied English in Kannada slot)
   - Mismatched length ratios
3. Monolingual Kannada text corpus for testing back-translation.
"""

import json
import os
from config import DEFAULT_CONFIG

SEED_PARALLEL_PAIRS = [
    # Clean authentic pairs
    {
        "eng": "The government announced new educational policies for rural schools.",
        "kan": "ಗ್ರಾಮೀಣ ಶಾಲೆಗಳಿಗಾಗಿ ಸರ್ಕಾರವು ಹೊಸ ಶೈಕ್ಷಣಿಕ ನೀತಿಗಳನ್ನು ಪ್ರಕಟಿಸಿತು."
    },
    {
        "eng": "Bengaluru is widely known as the silicon capital of India.",
        "kan": "ಬೆಂಗಳೂರನ್ನು ಭಾರತದ ಸಿಲಿಕಾನ್ ರಾಜಧಾನಿ ಎಂದು ವ್ಯಾಪಕವಾಗಿ ಕರೆಯಲಾಗುತ್ತದೆ."
    },
    {
        "eng": "Farmers require modern irrigation techniques to conserve groundwater.",
        "kan": "ಅಂತರ್ಜಲ ಸಂರಕ್ಷಣೆಗಾಗಿ ರೈತರಿಗೆ ಆಧುನಿಕ ನೀರಾವರಿ ತಂತ್ರಜ್ಞಾನಗಳ ಅಗತ್ಯವಿದೆ."
    },
    {
        "eng": "Artificial Intelligence is transforming regional language translation.",
        "kan": "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯು ಪ್ರಾದೇಶಿಕ ಭಾಷಾ ಅನುವಾದವನ್ನು ಪರಿವರ್ತಿಸುತ್ತಿದೆ."
    },
    {
        "eng": "Public libraries play a significant role in fostering reading habits.",
        "kan": "ಓದುವ ಹವ್ಯಾಸವನ್ನು ಬೆಳೆಸುವಲ್ಲಿ ಸಾರ್ವಜನಿಕ ಗ್ರಂಥಾಲಯಗಳು ಮಹತ್ವದ ಪಾತ್ರ ವಹಿಸುತ್ತವೆ."
    },
    {
        "eng": "The university conducted an annual research symposium on computational linguistics.",
        "kan": "ವಿಶ್ವವಿದ್ಯಾನಿಲಯವು ಕಂಪ್ಯೂಟೇಶನಲ್ ಭಾಷಾಶಾಸ್ತ್ರದ ಕುರಿತು ವಾರ್ಷಿಕ ಸಂಶೋಧನಾ ವಿಚಾರಸಂಕಿರಣವನ್ನು ಆಯೋಜಿಸಿತು."
    },
    {
        "eng": "Renewable solar energy projects are rapidly expanding across Karnataka.",
        "kan": "ಕರ್ನಾಟಕದಾದ್ಯಂತ ನವೀಕರಿಸಬಹುದಾದ ಸೌರಶಕ್ತಿ ಯೋಜನೆಗಳು ವೇಗವಾಗಿ ವಿಸ್ತರಿಸುತ್ತಿವೆ."
    },
    {
        "eng": "Healthcare centers in remote villages need reliable electric power.",
        "kan": "ದೂರದ ಹಳ್ಳಿಗಳಲ್ಲಿನ ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ವಿದ್ಯುತ್ ಸರಬರಾಜು ಅಗತ್ಯವಿದೆ."
    },
    {
        "eng": "Kannada literature possesses a glorious history spanning several centuries.",
        "kan": "ಕನ್ನಡ ಸಾಹಿತ್ಯವು ಹಲವಾರು ಶತಮಾನಗಳ ಭವ್ಯವಾದ ಇತಿಹಾಸವನ್ನು ಹೊಂದಿದೆ."
    },
    {
        "eng": "Digital payment systems have simplified daily transactions for citizens.",
        "kan": "ಡಿಜಿಟಲ್ ಪಾವತಿ ವ್ಯವಸ್ಥೆಗಳು ನಾಗರಿಕರ ದೈನಂದಿನ ವಹಿವಾಟುಗಳನ್ನು ಸರಳಗೊಳಿಸಿವೆ."
    },
    {
        "eng": "Students celebrated the science exhibition with enthusiastic participation.",
        "kan": "ವಿದ್ಯಾರ್ಥಿಗಳು ವಿಜ್ಞಾನ ಪ್ರದರ್ಶನವನ್ನು ಉತ್ಸಾಹಭರಿತ ಭಾಗವಹಿಸುವಿಕೆಯೊಂದಿಗೆ ಆಚರಿಸಿದರು."
    },
    {
        "eng": "The meteorological department predicted heavy rainfall along coastal districts.",
        "kan": "ಕರಾವಳಿ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಭಾರಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ ಎಂದು ಹವಾಮಾನ ಇಲಾಖೆ ಮುನ್ಸೂಚನೆ ನೀಡಿದೆ."
    },
    {
        "eng": "Regular physical exercise is essential for maintaining physical and mental health.",
        "kan": "ದೈಹಿಕ ಮತ್ತು ಮಾನಸಿಕ ಆರೋಗ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ನಿಯಮಿತ ವ್ಯಾಯಾಮ ಅತ್ಯಗತ್ಯ."
    },
    {
        "eng": "Water conservation should be taught to young children in schools.",
        "kan": "ಶಾಲೆಗಳಲ್ಲಿ ಚಿಕ್ಕ ಮಕ್ಕಳಿಗೆ ಜಲ ಸಂರಕ್ಷಣೆಯ ಮಹತ್ವವನ್ನು ಕಲಿಸಬೇಕು."
    },
    {
        "eng": "The metro rail service reduced vehicular traffic congestion in the city.",
        "kan": "ಮೆಟ್ರೋ ರೈಲು ಸೇವೆಯು ನಗರದಲ್ಲಿ ವಾಹನ ದಟ್ಟಣೆಯನ್ನು ಗಣನೀಯವಾಗಿ ಕಡಿಮೆ ಮಾಡಿದೆ."
    },
    {
        "eng": "Preserving ancient historical monuments is our collective cultural responsibility.",
        "kan": "ಪ್ರಾಚೀನ ಐತಿಹಾಸಿಕ ಸ್ಮಾರಕಗಳನ್ನು ರಕ್ಷಿಸುವುದು ನಮ್ಮ ಸಾಮೂಹಿಕ ಸಾಂಸ್ಕೃತಿಕ ಜವಾಬ್ದಾರಿಯಾಗಿದೆ."
    },
    {
        "eng": "The new mobile application allows citizens to register civic grievances easily.",
        "kan": "ಹೊಸ ಮೊಬೈಲ್ ಅಪ್ಲಿಕೇಶನ್ ನಾಗರಿಕರಿಗೆ ನಾಗರಿಕ ಕುಂದುಕೊರತೆಗಳನ್ನು ಸುಲಭವಾಗಿ ನೋಂದಾಯಿಸಲು ಅನುಮತಿಸುತ್ತದೆ."
    },
    {
        "eng": "Higher education institutions must promote entrepreneurship and innovation.",
        "kan": "ಉನ್ನತ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಗಳು ಉದ್ಯಮಶೀಲತೆ ಮತ್ತು ನಾವೀನ್ಯತೆಯನ್ನು ಪ್ರೋತ್ಸಾಹಿಸಬೇಕು."
    },
    {
        "eng": "Traditional folk art forms reflect the vibrant cultural heritage of the region.",
        "kan": "ಸಾಂಪ್ರದಾಯಿಕ ಜಾನಪದ ಕಲಾ ಪ್ರಕಾರಗಳು ಪ್ರದೇಶದ ಶ್ರೀಮಂತ ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆಯನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತವೆ."
    },
    {
        "eng": "Environmental protection laws should be enforced strictly to prevent deforestation.",
        "kan": "ಅರಣ್ಯನಾಶವನ್ನು ತಡೆಗಟ್ಟಲು ಪರಿಸರ ಸಂರಕ್ಷಣಾ ಕಾನೂನುಗಳನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಜಾರಿಗೊಳಿಸಬೇಕು."
    },

    # Controlled Noisy Test Cases for Preprocessing Validation:
    # 1. Exact Duplicate of sample 1
    {
        "eng": "The government announced new educational policies for rural schools.",
        "kan": "ಗ್ರಾಮೀಣ ಶಾಲೆಗಳಿಗಾಗಿ ಸರ್ಕಾರವು ಹೊಸ ಶೈಕ್ಷಣಿಕ ನೀತಿಗಳನ್ನು ಪ್ರಕಟಿಸಿತು."
    },
    # 2. Non-Kannada target (Copied English - Script Purity Filter Test)
    {
        "eng": "Click here to download the updated user manual.",
        "kan": "Click here to download the updated user manual."
    },
    # 3. Bad Length Ratio (Misalignment Filter Test)
    {
        "eng": "Yes.",
        "kan": "ಹೌದು, ನಾವು ಈ ಪ್ರಮುಖ ಯೋಜನೆಯನ್ನು ಮುಂದಿನ ತಿಂಗಳಿನಿಂದ ಪ್ರಾರಂಭಿಸಲು ಎಲ್ಲಾ ಸಿದ್ಧತೆಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದೇವೆ ಎಂದು ತಿಳಿಸಲು ಸಂತೋಷಪಡುತ್ತೇವೆ."
    },
    # 4. Empty or Whitespace-only string
    {
        "eng": "   ",
        "kan": "   "
    }
]

SEED_MONOLINGUAL_KANNADA = [
    "ಕರ್ನಾಟಕದ ಸುಂದರ ಪಶ್ಚಿಮ ಘಟ್ಟಗಳು ಜೀವವೈವಿಧ್ಯತೆಯಿಂದ ಸಮೃದ್ಧವಾಗಿವೆ.",
    "ಕೃಷಿಯಲ್ಲಿ ನೈಸರ್ಗಿಕ ಗೊಬ್ಬರಗಳ ಬಳಕೆಯು ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ.",
    "ಯುವಜನರು ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿ ತರಬೇತಿಯ ಮೂಲಕ ಉದ್ಯೋಗಾವಕಾಶಗಳನ್ನು ಪಡೆಯಬಹುದು.",
    "ನಗರ ಸಾರಿಗೆ ವ್ಯವಸ್ಥೆಯನ್ನು ಸುಧಾರಿಸಲು ಎಲೆಕ್ಟ್ರಿಕ್ ಬಸ್‌ಗಳನ್ನು ಪರಿಚಯಿಸಲಾಗಿದೆ.",
    "ವಿಜ್ಞಾನ ಮತ್ತು ತಂತ್ರಜ್ಞಾನ ಕ್ಷೇತ್ರದಲ್ಲಿ ಭಾರತವು ಹೊಸ ಎತ್ತರಕ್ಕೆ ಬೆಳೆಯುತ್ತಿದೆ.",
    "ಮಕ್ಕಳ ಸರ್ವತೋಮುಖ ಬೆಳವಣಿಗೆಗೆ ಪೌಷ್ಟಿಕ ಆಹಾರ ಮತ್ತು ಕ್ರೀಡೆಗಳು ಅವಶ್ಯಕ.",
    "ಪ್ರಾಚೀನ ಕಲೆಯ ರಕ್ಷಣೆಗೆ ಸಾರ್ವಜನಿಕರ ಸಹಭಾಗಿತ್ವ ಅತ್ಯಂತ ಪ್ರಮುಖವಾಗಿದೆ.",
    "ಗ್ರಾಮೀಣ ಪ್ರದೇಶಗಳಲ್ಲಿ ಸ್ವಚ್ಛ ಕುಡಿಯುವ ನೀರು ಒದಗಿಸುವುದು ಸರ್ಕಾರದ ಆದ್ಯತೆಯಾಗಿದೆ.",
    "ಅಂತರ್ಜಾಲ ಶಿಕ್ಷಣವು ದೂರದ ಊರುಗಳ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೂ ಜ್ಞಾನವನ್ನು ತಲುಪಿಸಿದೆ.",
    "ಪರಿಸರ ಸಮತೋಲನವನ್ನು ಕಾಪಾಡಲು ಪ್ರತಿಯೊಬ್ಬರೂ ಕನಿಷ್ಠ ಒಂದು ಮರವನ್ನು ನೆಡಬೇಕು."
]


def generate_seed_corpora():
    """Generates sample raw parallel corpus and monolingual files."""
    os.makedirs(DEFAULT_CONFIG.data_dir, exist_ok=True)

    # 1. Raw Parallel Corpus
    raw_path = DEFAULT_CONFIG.raw_parallel_data
    with open(raw_path, "w", encoding="utf-8") as f:
        for pair in SEED_PARALLEL_PAIRS:
            entry = {
                "translation": {
                    DEFAULT_CONFIG.src_lang: pair["eng"],
                    DEFAULT_CONFIG.tgt_lang: pair["kan"],
                }
            }
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    print(f"Generated raw parallel corpus with {len(SEED_PARALLEL_PAIRS)} pairs -> {raw_path}")

    # 2. Monolingual Kannada Corpus
    mono_path = DEFAULT_CONFIG.monolingual_kan_data
    with open(mono_path, "w", encoding="utf-8") as f:
        for line in SEED_MONOLINGUAL_KANNADA:
            f.write(line + "\n")
    print(f"Generated monolingual Kannada corpus with {len(SEED_MONOLINGUAL_KANNADA)} lines -> {mono_path}")


if __name__ == "__main__":
    generate_seed_corpora()
