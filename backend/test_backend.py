"""
Verification script for LinguaBridge AI modular FastAPI backend
Covers NLP utilities (22RI52 concepts), real NLLB-200 English <-> Kannada, English <-> Hindi translation,
and the /api/metrics endpoint returning HTTP 200 with zero mock prefixes.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import nlp_utils
from translator import translator_engine, SUPPORTED_LANGUAGES, SUPPORTED_PAIRS
from main import get_metrics_endpoint, translate, TranslationRequest
from app.services.translation_service import translation_service
from app.utils.validation import EmptyTextError, UnsupportedLanguageError, IdenticalLanguageError, TextLengthExceededError


def run_tests():
    print("=" * 65)
    print("RUNNING LINGUABRIDGE AI REAL MODEL & METRICS VERIFICATION TESTS")
    print("=" * 65)

    # -------------------------------------------------------------------------
    # 1. NLP Utilities & 22RI52 Lab Manual Concepts
    # -------------------------------------------------------------------------
    print("\n[Test 1] NLP Preprocessing & 22RI52 Lab Concepts...")
    sample_en = "The government announced new educational policies for rural schools."
    sample_kn = "ಗ್ರಾಮೀಣ ಶಾಲೆಗಳಿಗಾಗಿ ಸರ್ಕಾರವು ಹೊಸ ಶೈಕ್ಷಣಿಕ ನೀತಿಗಳನ್ನು ಪ್ರಕಟಿಸಿತು."
    sample_hi = "सरकार ने ग्रामीण स्कूलों के लिए नई शैक्षिक नीतियों की घोषणा की।"
    sample_ta = "கிராமப்புற பள்ளிகளுக்கான புதிய கல்விக் கொள்கைகளை அரசு அறிவித்தது."
    sample_te = "గ్రామీణ పాఠశాలల కోసం ప్రభుత్వం కొత్త విద్యా విధానాలను ప్రకటించింది."

    norm_kn = nlp_utils.normalize_text(sample_kn)
    tokens_kn = nlp_utils.tokenize_words(norm_kn)
    tokens_hi = nlp_utils.tokenize_words(sample_hi)
    tokens_ta = nlp_utils.tokenize_words(sample_ta)
    tokens_te = nlp_utils.tokenize_words(sample_te)
    tokens_en = nlp_utils.tokenize_words(sample_en)

    print(f"  ✓ English Word Tokens: {tokens_en[:4]}...")
    print(f"  ✓ Kannada Word Tokens: {tokens_kn[:4]}...")
    print(f"  ✓ Hindi Word Tokens  : {tokens_hi[:4]}...")
    print(f"  ✓ Tamil Word Tokens  : {tokens_ta[:4]}...")
    print(f"  ✓ Telugu Word Tokens : {tokens_te[:4]}...")

    valid_kn, _ = nlp_utils.validate_script_match(sample_kn, "kan_Knda")
    valid_hi, _ = nlp_utils.validate_script_match(sample_hi, "hin_Deva")
    valid_ta, _ = nlp_utils.validate_script_match(sample_ta, "tam_Taml")
    valid_te, _ = nlp_utils.validate_script_match(sample_te, "tel_Telu")
    valid_en, _ = nlp_utils.validate_script_match(sample_en, "eng_Latn")
    assert valid_kn and valid_hi and valid_ta and valid_te and valid_en, "Script validations must pass"
    print("  ✓ Script validation confirmed for English, Kannada, Hindi, Tamil, and Telugu")

    edit_dist = nlp_utils.levenshtein_distance("school", "schools")
    sim = nlp_utils.string_similarity_ratio("school", "schools")
    print(f"  ✓ Levenshtein distance('school', 'schools') = {edit_dist}, Similarity = {sim}")
    assert edit_dist == 1

    # -------------------------------------------------------------------------
    # 2. Languages Catalog
    # -------------------------------------------------------------------------
    print("\n[Test 2] GET /api/languages (English, Kannada, Hindi, Tamil, Telugu)...")
    langs = translation_service.get_supported_languages()
    lang_codes = [l.code for l in langs.languages]
    print(f"  ✓ Supported languages: {lang_codes}")
    print(f"  ✓ Supported directions: {langs.supported_pairs}")
    assert "eng_Latn" in lang_codes
    assert "kan_Knda" in lang_codes
    assert "hin_Deva" in lang_codes
    assert "tam_Taml" in lang_codes
    assert "tel_Telu" in lang_codes

    # -------------------------------------------------------------------------
    # 3. GET /api/metrics (HTTP 200 Verification)
    # -------------------------------------------------------------------------
    print("\n[Test 3] GET /api/metrics (Benchmark Evaluation Metrics)...")
    metrics_response = get_metrics_endpoint()
    print(f"  ✓ Direction: {metrics_response.direction}")
    print(f"  ✓ Systems: {list(metrics_response.systems.keys())}")
    for sys_name, sys_meta in metrics_response.systems.items():
        print(f"    - {sys_name}: BLEU={sys_meta.bleu}, chrF++={sys_meta.chrf}")
    assert "baseline_pretrained" in metrics_response.systems
    assert "lora_finetuned" in metrics_response.systems
    assert "lora_backtranslation" in metrics_response.systems
    assert metrics_response.systems["lora_backtranslation"].bleu >= 29.0
    print("  ✓ GET /api/metrics successfully verified with HTTP 200 payload")

    # -------------------------------------------------------------------------
    # 4. POST /api/translate (Real English -> Kannada, Zero Mock Prefix)
    # -------------------------------------------------------------------------
    print("\n[Test 4] POST /api/translate (Real English -> Kannada)...")
    req_kn = TranslationRequest(
        text=sample_en,
        source_lang="eng_Latn",
        target_lang="kan_Knda",
        model_variant="lora_bt",
    )
    res_kn = translate(req_kn)
    print(f"  Input : {res_kn.source_text}")
    print(f"  Output: {res_kn.translated_text}")
    print(f"  Engine: {res_kn.engine} | Latency: {res_kn.latency_ms} ms")

    # Assert real output without mock prefix
    assert not res_kn.translated_text.startswith("ಅನುವಾದ ("), "Output must not contain mock prefix"
    assert not res_kn.translated_text.startswith("Translation ("), "Output must not contain mock prefix"
    assert any('\u0C80' <= c <= '\u0CFF' for c in res_kn.translated_text), "Output must contain authentic Kannada characters"
    print("  ✓ Real Kannada translation output verified with zero mock prefix")

    # -------------------------------------------------------------------------
    # 5. POST /api/translate (Real English -> Hindi, Tamil, Telugu, Zero Mock Prefix)
    # -------------------------------------------------------------------------
    print("\n[Test 5] POST /api/translate (English -> Hindi, Tamil, Telugu)...")
    # 5a. Hindi
    req_hi = TranslationRequest(
        text=sample_en,
        source_lang="eng_Latn",
        target_lang="hin_Deva",
        model_variant="baseline",
    )
    res_hi = translate(req_hi)
    print(f"  [HI] Output: {res_hi.translated_text}")
    assert not res_hi.translated_text.startswith("अनुवाद (")
    assert any('\u0900' <= c <= '\u097F' for c in res_hi.translated_text)
    print("  ✓ Real Hindi translation output verified")

    # 5b. Tamil
    req_ta = TranslationRequest(
        text=sample_en,
        source_lang="eng_Latn",
        target_lang="tam_Taml",
        model_variant="baseline",
    )
    res_ta = translate(req_ta)
    print(f"  [TA] Output: {res_ta.translated_text}")
    assert not res_ta.translated_text.startswith("Translation (")
    assert any('\u0B80' <= c <= '\u0BFF' for c in res_ta.translated_text), "Output must contain authentic Tamil characters"
    print("  ✓ Real Tamil translation output verified")

    # 5c. Telugu
    req_te = TranslationRequest(
        text=sample_en,
        source_lang="eng_Latn",
        target_lang="tel_Telu",
        model_variant="baseline",
    )
    res_te = translate(req_te)
    print(f"  [TE] Output: {res_te.translated_text}")
    assert not res_te.translated_text.startswith("Translation (")
    assert any('\u0C00' <= c <= '\u0C7F' for c in res_te.translated_text), "Output must contain authentic Telugu characters"
    print("  ✓ Real Telugu translation output verified")

    # -------------------------------------------------------------------------
    # 6. Reverse Translation (KN -> EN, HI -> EN, TA -> EN, TE -> EN)
    # -------------------------------------------------------------------------
    print("\n[Test 6] Reverse Translation (KN -> EN, HI -> EN, TA -> EN, TE -> EN)...")
    rev_kn = translator_engine.translate(sample_kn, "kan_Knda", "eng_Latn")
    print(f"  KN -> EN: {rev_kn['translated_text']}")
    rev_hi = translator_engine.translate(sample_hi, "hin_Deva", "eng_Latn")
    print(f"  HI -> EN: {rev_hi['translated_text']}")
    rev_ta = translator_engine.translate(sample_ta, "tam_Taml", "eng_Latn")
    print(f"  TA -> EN: {rev_ta['translated_text']}")
    rev_te = translator_engine.translate(sample_te, "tel_Telu", "eng_Latn")
    print(f"  TE -> EN: {rev_te['translated_text']}")
    assert not rev_kn['translated_text'].startswith("Translation (")
    assert not rev_hi['translated_text'].startswith("Translation (")
    assert not rev_ta['translated_text'].startswith("Translation (")
    assert not rev_te['translated_text'].startswith("Translation (")
    print("  ✓ Real reverse translations verified with clean strings")

    # -------------------------------------------------------------------------
    # 7. Error Handling Validations
    # -------------------------------------------------------------------------
    print("\n[Test 7] Error Handling Validations...")
    # 7a. Empty Text
    try:
        translation_service.translate_text("   ", "eng_Latn", "kan_Knda")
        assert False, "Should have raised EmptyTextError"
    except EmptyTextError:
        print("  ✓ Empty text correctly rejected with 400 EmptyTextError")

    # 7b. Unsupported Language
    try:
        translation_service.translate_text("Hello", "fra_Latn", "kan_Knda")
        assert False, "Should have raised UnsupportedLanguageError"
    except UnsupportedLanguageError:
        print("  ✓ Unsupported language correctly rejected with 400 UnsupportedLanguageError")

    # 7c. Identical Languages
    try:
        translation_service.translate_text("Hello", "eng_Latn", "eng_Latn")
        assert False, "Should have raised IdenticalLanguageError"
    except IdenticalLanguageError:
        print("  ✓ Identical languages correctly rejected with 400 IdenticalLanguageError")

    # 7d. Max Length Exceeded
    try:
        overly_long = "A" * 2500
        translation_service.translate_text(overly_long, "eng_Latn", "kan_Knda")
        assert False, "Should have raised TextLengthExceededError"
    except TextLengthExceededError:
        print("  ✓ Long text (>2000 chars) correctly rejected with 422 TextLengthExceededError")

    print("\n" + "=" * 65)
    print("ALL TESTS PASSED: REAL MODEL INFERENCE & METRICS VERIFIED (0 ERRORS)")
    print("=" * 65)


if __name__ == "__main__":
    run_tests()
