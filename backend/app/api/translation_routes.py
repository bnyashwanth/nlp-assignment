"""
LinguaBridge AI - Translation API Route Controllers
===================================================
Module: backend/app/api/translation_routes.py
Purpose: FastAPI routing declarations for translation, multi-model comparison,
         language catalog, and evaluation metric endpoints.
"""

import logging
from fastapi import APIRouter, status

try:
    from app.schemas.translation_schema import (
        ComparisonRequest,
        ComparisonResponse,
        LanguagesResponse,
        MetricsResponse,
        TranslationRequest,
        TranslationResponse,
    )
    from app.services.translation_service import translation_service
except ImportError:
    from schemas.translation_schema import (
        ComparisonRequest,
        ComparisonResponse,
        LanguagesResponse,
        MetricsResponse,
        TranslationRequest,
        TranslationResponse,
    )
    from services.translation_service import translation_service

logger = logging.getLogger("TranslationRoutes")

router = APIRouter(prefix="/api", tags=["Translation"])


@router.get(
    "/languages",
    response_model=LanguagesResponse,
    summary="Get Supported Languages",
    description="Lists all supported languages, their FLORES-200 / BCP-47 codes, scripts, and sample texts.",
)
def list_languages():
    """Returns available source and target languages and supported translation pairs."""
    return translation_service.get_supported_languages()


@router.post(
    "/translate",
    response_model=TranslationResponse,
    status_code=status.HTTP_200_OK,
    summary="Translate Text",
    description=(
        "Translates text among English, Kannada, Hindi, Tamil, and Telugu using "
        "an automatically selected AI4Bharat IndicTrans2 1B model family."
    ),
)
async def translate_text(request: TranslationRequest):
    """
    Executes text translation with input validation and timeout enforcement.
    """
    return await translation_service.translate_text(
        text=request.text,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
        model_variant=request.model_variant,
        num_beams=request.num_beams or 4,
    )


@router.post(
    "/compare",
    response_model=ComparisonResponse,
    status_code=status.HTTP_200_OK,
    summary="Compare Models Side-by-Side",
    description=(
        "Executes translation on the input text across all 3 systems: "
        "Baseline, LoRA Fine-Tuned, and LoRA + Back-Translation, returning outputs side-by-side."
    ),
)
async def compare_translations(request: ComparisonRequest):
    """
    Executes side-by-side multi-model translation inference.
    """
    return await translation_service.compare_models(
        text=request.text,
        source_lang=request.source_lang,
        target_lang=request.target_lang,
    )


@router.get(
    "/metrics",
    response_model=MetricsResponse,
    summary="Get Evaluation Metrics",
    description="Returns empirical SacreBLEU and chrF++ scores, delta comparisons, and test set metadata.",
)
def get_metrics():
    """
    Returns quantitative benchmark evaluation metrics.
    """
    return translation_service.get_evaluation_metrics()
