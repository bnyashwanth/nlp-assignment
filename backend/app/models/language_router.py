"""Language routing for AI4Bharat IndicTrans2 model families."""

from fastapi import HTTPException, status

from app.models.model_config import settings

FLORES_TO_SHORT = {
    "eng_Latn": "en",
    "kan_Knda": "kn",
    "hin_Deva": "hi",
    "tam_Taml": "ta",
    "tel_Telu": "te",
}

INDIC_LANGUAGES = {"kn", "hi", "ta", "te"}


def normalize_language_code(language_code: str) -> str:
    cleaned = (language_code or "").strip()
    alias_map = {
        "en": "eng_Latn",
        "kn": "kan_Knda",
        "hi": "hin_Deva",
        "ta": "tam_Taml",
        "te": "tel_Telu",
    }
    return alias_map.get(cleaned.lower(), cleaned)


def route_translation_family(source_lang: str, target_lang: str) -> str:
    source = normalize_language_code(source_lang)
    target = normalize_language_code(target_lang)

    if source not in FLORES_TO_SHORT:
        raise HTTPException(status_code=400, detail={"message": f"Unsupported source language: '{source_lang}'."})
    if target not in FLORES_TO_SHORT:
        raise HTTPException(status_code=400, detail={"message": f"Unsupported target language: '{target_lang}'."})
    if source == target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Source and target languages must be different."},
        )

    source_short = FLORES_TO_SHORT[source]
    target_short = FLORES_TO_SHORT[target]

    if source_short == "en":
        family = "en-indic"
    elif target_short == "en":
        family = "indic-en"
    else:
        family = "indic-indic"

    return family


def get_family_model_name(family: str) -> str:
    model_names = {
        "en-indic": settings.indictrans2_en_indic,
        "indic-en": settings.indictrans2_indic_en,
        "indic-indic": settings.indictrans2_indic_indic,
    }
    if family not in model_names:
        raise ValueError(f"Unknown IndicTrans2 family: {family}")
    return model_names[family]
