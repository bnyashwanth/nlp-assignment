"""
LinguaBridge AI - Pydantic Request & Response Schemas
=====================================================
Module: backend/schemas.py
Purpose: Data validation, request/response models, and OpenAPI specifications
         for the multilingual FastAPI service (English <-> Kannada, English <-> Hindi).
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# =============================================================================
# Translation Schemas
# =============================================================================

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
        description="Source language code (e.g. 'eng_Latn', 'en', 'kan_Knda', 'kn', 'hin_Deva', 'hi').",
        example="eng_Latn",
    )
    target_lang: str = Field(
        default="kan_Knda",
        description="Target language code (e.g. 'kan_Knda', 'kn', 'hin_Deva', 'hi', 'eng_Latn', 'en').",
        example="kan_Knda",
    )
    model_variant: Optional[str] = Field(
        default="lora_bt",
        description="Model architecture: 'baseline', 'lora', or 'lora_bt'.",
        example="lora_bt",
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

    translated_text: str = Field(..., description="Final translated target text.")
    source_lang: str = Field(..., description="Canonical source language code.")
    target_lang: str = Field(..., description="Canonical target language code.")
    engine: str = Field(..., description="Identification of neural engine / adapter used.")
    latency_ms: float = Field(..., description="Inference execution time in milliseconds.")
    source_text: Optional[str] = Field(default=None, description="Normalized source text.")
    model_variant: Optional[str] = Field(default=None, description="Selected model variant.")
    character_count: Optional[int] = Field(default=None, description="Length of translated output.")


# =============================================================================
# Comparison Schemas
# =============================================================================

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


# =============================================================================
# Benchmark Metrics Schemas
# =============================================================================

class SystemMetricItem(BaseModel):
    description: str
    bleu: float
    chrf: float


class MetricsResponse(BaseModel):
    """Response payload for GET /api/metrics."""

    project: str = "LinguaBridge AI"
    model: str = "facebook/nllb-200-distilled-600M"
    direction: str = "eng_Latn -> kan_Knda"
    test_set_size: int = 350
    systems: Dict[str, SystemMetricItem]
    relative_improvements: Dict[str, Dict[str, Any]]


# =============================================================================
# Health & Discovery Schemas
# =============================================================================

class HealthResponse(BaseModel):
    """Response payload for GET /health and GET /."""

    status: str = Field(..., example="online")
    service: str = Field(..., example="LinguaBridge AI - Translation API")
    version: str = Field(..., example="1.1.0")
    device: str = Field(..., example="cpu")
    is_neural_ready: bool = Field(..., example=True)
    base_model: str = Field(..., example="facebook/nllb-200-distilled-600M")
    lora_adapter: Optional[str] = Field(default=None)
    supported_languages: List[str] = Field(default_factory=list)


class LanguageItem(BaseModel):
    code: str
    iso: str
    name: str
    native_name: str
    script: str
    flag: str
    sample: str


class LanguagesResponse(BaseModel):
    """Response payload for GET /api/languages."""

    languages: List[LanguageItem]
    supported_pairs: List[str]
