"""
Verification script for LinguaBridge AI modular FastAPI backend
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app
from app.services.translation_service import translation_service
from app.utils.validation import EmptyTextError, UnsupportedLanguageError, IdenticalLanguageError, TextLengthExceededError

def run_tests():
    print("=" * 60)
    print("RUNNING LINGUABRIDGE AI BACKEND VERIFICATION TESTS")
    print("=" * 60)

    # 1. Languages
    print("\n[Test 1] GET /api/languages...")
    langs = translation_service.get_supported_languages()
    print(f"Supported languages: {[l.code for l in langs.languages]}")
    print(f"Supported directions: {langs.supported_pairs}")
    assert len(langs.languages) >= 2, "Expected at least 2 languages"

    # 2. Translate Normal
    print("\n[Test 2] POST /api/translate (Normal)...")
    src = "The government announced new educational policies for rural schools."
    res = translation_service.translate_text(
        text=src,
        source_lang="eng_Latn",
        target_lang="kan_Knda",
        model_variant="lora_bt"
    )
    print(f"Input : {res.source_text}")
    print(f"Output: {res.translated_text}")
    print(f"Latency: {res.latency_ms} ms")
    assert res.translated_text != "", "Translation should not be empty"

    # 3. Compare Models
    print("\n[Test 3] POST /api/compare (Baseline vs. LoRA vs. LoRA+BT)...")
    comp = translation_service.compare_models(
        text="Artificial Intelligence is transforming regional language translation.",
        source_lang="eng_Latn",
        target_lang="kan_Knda"
    )
    print(f"Baseline Output : {comp.baseline.translated_text} (BLEU: {comp.baseline.benchmark_bleu})")
    print(f"LoRA Output     : {comp.finetuned_lora.translated_text} (BLEU: {comp.finetuned_lora.benchmark_bleu})")
    print(f"LoRA+BT Output  : {comp.finetuned_lora_bt.translated_text} (BLEU: {comp.finetuned_lora_bt.benchmark_bleu})")
    print(f"Relative Gains  : {comp.relative_gain_summary}")

    # 4. Metrics
    print("\n[Test 4] GET /api/metrics...")
    metrics = translation_service.get_evaluation_metrics()
    print(f"Systems evaluated: {list(metrics.systems.keys())}")
    print(f"Relative gains   : {metrics.relative_improvements}")

    # 5. Error Handling Tests
    print("\n[Test 5] Error Handling Validations...")
    # 5a. Empty Text
    try:
        translation_service.translate_text("   ", "eng_Latn", "kan_Knda")
        assert False, "Should have raised EmptyTextError"
    except EmptyTextError:
        print("  ✓ Empty text correctly rejected with 400 EmptyTextError")

    # 5b. Unsupported Language
    try:
        translation_service.translate_text("Hello", "fra_Latn", "kan_Knda")
        assert False, "Should have raised UnsupportedLanguageError"
    except UnsupportedLanguageError:
        print("  ✓ Unsupported language correctly rejected with 400 UnsupportedLanguageError")

    # 5c. Identical Languages
    try:
        translation_service.translate_text("Hello", "eng_Latn", "eng_Latn")
        assert False, "Should have raised IdenticalLanguageError"
    except IdenticalLanguageError:
        print("  ✓ Identical languages correctly rejected with 400 IdenticalLanguageError")

    # 5d. Max Length Exceeded
    try:
        overly_long = "A" * 2500
        translation_service.translate_text(overly_long, "eng_Latn", "kan_Knda")
        assert False, "Should have raised TextLengthExceededError"
    except TextLengthExceededError:
        print("  ✓ Long text (>2000 chars) correctly rejected with 422 TextLengthExceededError")

    print("\n" + "=" * 60)
    print("ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
