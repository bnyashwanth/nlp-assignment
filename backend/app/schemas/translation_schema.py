"""
LinguaBridge AI - Pydantic Request & Response Schemas
=====================================================
Module: backend/app/schemas/translation_schema.py
Purpose: Type-safe input/output data schemas, field validation rules,
         and OpenAPI documentation examples for translation endpoints.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ============================================================================
# 1. Translation Schemas
# ============================================================================

class TranslationRequest(BaseModel):
    """Payload for POST /api/translate."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Text to be translated.",
        example="The government announced new educational policies for rural schools.",
    )
    source_lang: str = Field(
        default="eng_Latn",
        description="FLORES-200 / BCP-47 source language code.",
        example="eng_Latn",
    )
    target_lang: str = Field(
        default="kan_Knda",
        description="FLORES-200 / BCP-47 target language code.",
        example="kan_Knda",
    )
    model_variant: Optional[str] = Field(
        default=None,
        description="Optional legacy frontend field; IndicTrans2 routing ignores model_variant.",
    )
    num_beams: Optional[int] = Field(
        default=4,
        ge=1,
        le=10,
        description="Beam search width for autoregressive generation.",
        example=4,
    )


class TranslationResponse(BaseModel):
    """Response payload for POST /api/translate."""

    source_text: Optional[str] = Field(default=None, description="Original input text after normalization.")
    translated_text: str = Field(..., description="Final translated target text.")
    source_lang: str = Field(..., description="Source language code.")
    target_lang: str = Field(..., description="Target language code.")
    model_variant: Optional[str] = Field(default=None, description="Legacy optional model field.")
    latency_ms: float = Field(..., description="Inference execution time in milliseconds.")
    character_count: Optional[int] = Field(default=None, description="Character count of translated output.")
    engine: str = Field(default="AI4Bharat IndicTrans2", description="IndicTrans2 engine identifier.")


# ============================================================================
# 2. Comparison Schemas
# ============================================================================

class ComparisonRequest(BaseModel):
    """Payload for POST /api/compare."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Text to translate through multiple architectures for side-by-side comparison.",
        example="Artificial Intelligence is transforming regional language translation.",
    )
    source_lang: str = Field(default="eng_Latn", example="eng_Latn")
    target_lang: str = Field(default="kan_Knda", example="kan_Knda")


class ModelPredictionItem(BaseModel):
    """Individual model output item within the comparison response."""

    model_variant: str
    model_name: str
    translated_text: str
    latency_ms: float
    benchmark_bleu: float
    benchmark_chrf: float


class ComparisonResponse(BaseModel):
    """Response payload for POST /api/compare."""

    source_text: str
    source_lang: str
    target_lang: str
    baseline: ModelPredictionItem
    finetuned_lora: ModelPredictionItem
    finetuned_lora_bt: ModelPredictionItem
    relative_gain_summary: Dict[str, str]


# ============================================================================
# 3. Metadata & Language Schemas
# ============================================================================

class LanguageInfo(BaseModel):
    """Metadata details for a supported language."""

    code: str
    name: str
    script: str
    native_name: str
    sample: str


class LanguagesResponse(BaseModel):
    """Response payload for GET /api/languages."""

    languages: List[LanguageInfo]
    supported_pairs: List[str]


# ============================================================================
# 4. Metrics Schemas
# ============================================================================

class MetricsResponse(BaseModel):
    """Response payload for GET /api/metrics."""

    project: str
    model: str
    direction: str
    timestamp: Optional[str] = None
    test_set_size: int
    systems: Dict[str, Any]
    relative_improvements: Dict[str, Any]


# ============================================================================
# 5. Error Schema
# ============================================================================

class ErrorDetail(BaseModel):
    """Standardized error structure returned by exception handlers."""

    error_code: str
    message: str
    details: Optional[Dict[str, Any]] = None
