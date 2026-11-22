"""IndicTrans2 translation orchestration service."""

import asyncio
import time
from typing import Dict

try:
    from ftfy import fix_text
except ImportError:
    fix_text = None

from app.models.model_config import settings
from app.models.language_router import (
    FLORES_TO_SHORT,
    get_family_model_name,
    normalize_language_code,
    route_translation_family,
)
from app.models.model_loader import model_manager
from app.schemas.translation_schema import (
    ComparisonResponse,
    LanguageInfo,
    LanguagesResponse,
    TranslationResponse,
)
from app.utils.preprocessing import (
    normalize_text,
    postprocess_sentences,
    preprocess_sentences,
    split_paragraphs_and_sentences,
)
from app.utils.validation import (
    EmptyTextError,
    IdenticalLanguageError,
    TextLengthExceededError,
    UnsupportedLanguageError,
)


class TranslationService:
    def __init__(self):
        self.model_manager = model_manager

    @staticmethod
    def _repair_mojibake(value: str) -> str:
        """Recover UTF-8 text that some Indic tokenizers decode with a Latin-1 view."""
        if not value:
            return value
        if fix_text is not None:
            return fix_text(value)
        repaired: list[str] = []
        chunk: list[str] = []

        def flush_chunk() -> None:
            if not chunk:
                return
            raw = "".join(chunk)
            try:
                candidate = bytes(ord(char) & 0xFF for char in raw).decode("utf-8")
                repaired.append(candidate)
            except (UnicodeEncodeError, UnicodeDecodeError):
                repaired.append(raw)
            chunk.clear()

        for char in value:
            codepoint = ord(char)
            if codepoint <= 0xFF:
                chunk.append(char)
            else:
                flush_chunk()
                repaired.append(char)
        flush_chunk()
        return "".join(repaired)

    def _validate(self, text: str, source_lang: str, target_lang: str) -> str:
        if not text or not text.strip():
            raise EmptyTextError()
        clean = text.strip()
        if len(clean) > settings.max_input_chars:
            raise TextLengthExceededError(len(clean), settings.max_input_chars)

        source = normalize_language_code(source_lang)
        target = normalize_language_code(target_lang)
        if source not in settings.supported_languages:
            raise UnsupportedLanguageError(source_lang, "source_lang")
        if target not in settings.supported_languages:
            raise UnsupportedLanguageError(target_lang, "target_lang")
        if source == target:
            raise IdenticalLanguageError(source)
        return clean

    def _translate_sync(self, text: str, source_lang: str, target_lang: str) -> str:
        source = normalize_language_code(source_lang)
        target = normalize_language_code(target_lang)
        family = route_translation_family(source, target)
        source_short = FLORES_TO_SHORT[source]
        target_short = FLORES_TO_SHORT[target]
        tokenizer, model, engine = self.model_manager.get_model(family)

        paragraphs = split_paragraphs_and_sentences(text)
        translated_paragraphs = []

        for paragraph_sentences in paragraphs:
            if engine.startswith("AI4Bharat IndicTrans2"):
                processed = preprocess_sentences(paragraph_sentences, source_short, target_short)
            else:
                processed = paragraph_sentences

            encoded = tokenizer(processed, padding=True, truncation=True, return_tensors="pt")
            encoded = encoded.to(model_manager.device)

            with model_manager.torch.inference_mode():
                if engine.startswith("AI4Bharat IndicTrans2"):
                    generated = model.generate(
                        **encoded,
                        tgt_lang=target_short,
                        num_beams=5,
                        max_new_tokens=256,
                        no_repeat_ngram_size=3,
                        early_stopping=True,
                    )
                else:
                    tokenizer.src_lang = source_lang
                    target_id = tokenizer.convert_tokens_to_ids(target_lang)
                    generated = model.generate(
                        **encoded,
                        forced_bos_token_id=target_id,
                        num_beams=5,
                        max_new_tokens=256,
                        no_repeat_ngram_size=3,
                        early_stopping=True,
                    )

            decoded = tokenizer.batch_decode(generated, skip_special_tokens=True)
            translated = decoded
            translated_paragraphs.append(" ".join(sentence.strip() for sentence in translated if sentence.strip()))

        translated = "\n".join(translated_paragraphs).strip()
        return self._repair_mojibake(translated)

    async def translate_text(
        self,
        text: str,
        source_lang: str,
        target_lang: str,
        model_variant=None,
        num_beams=5,
    ) -> TranslationResponse:
        clean = self._validate(text, source_lang, target_lang)
        source = normalize_language_code(source_lang)
        target = normalize_language_code(target_lang)
        family = route_translation_family(source, target)
        start = time.perf_counter()

        translated = await asyncio.to_thread(
            self._translate_sync,
            clean,
            source,
            target,
        )
        latency = round((time.perf_counter() - start) * 1000, 2)

        return TranslationResponse(
            source_text=clean,
            translated_text=translated,
            source_lang=source,
            target_lang=target,
            model_variant=model_variant,
            latency_ms=latency,
            character_count=len(translated),
            engine="NLLB-200 Public Fallback",
        )

    def get_supported_languages(self) -> LanguagesResponse:
        languages = [
            LanguageInfo(
                code=code,
                name=meta["name"],
                script=meta["script"],
                native_name=meta["native_name"],
                sample=meta["sample"],
            )
            for code, meta in settings.supported_languages.items()
        ]
        return LanguagesResponse(languages=languages, supported_pairs=settings.supported_pairs)

    async def compare_models(self, text: str, source_lang: str, target_lang: str):
        result = await self.translate_text(text, source_lang, target_lang)
        prediction = {
            "model_variant": "indictrans2",
            "model_name": result.engine,
            "translated_text": result.translated_text,
            "latency_ms": result.latency_ms,
            "benchmark_bleu": 0.0,
            "benchmark_chrf": 0.0,
        }
        return {
            "source_text": result.source_text,
            "source_lang": result.source_lang,
            "target_lang": result.target_lang,
            "baseline": prediction,
            "finetuned_lora": prediction,
            "finetuned_lora_bt": prediction,
            "relative_gain_summary": {
                "engine": "AI4Bharat IndicTrans2",
            },
        }

    def get_evaluation_metrics(self):
        return {
            "project": "Setu",
            "model": "AI4Bharat IndicTrans2 1B",
            "direction": "Five-language Indic routing",
            "test_set_size": 0,
            "systems": {},
            "relative_improvements": {},
        }


translation_service = TranslationService()
