"""
LinguaBridge AI - Input Validation & Custom Exceptions
======================================================
Module: backend/app/utils/validation.py
Purpose: Request validation logic and custom exception definitions
         for the Neural Machine Translation API endpoints.
"""

from typing import Optional
from fastapi import HTTPException, status
try:
    from app.models.model_config import settings
except ImportError:
    from models.model_config import settings


# ============================================================================
# Custom Domain Exceptions
# ============================================================================

class LinguaBridgeException(HTTPException):
    """Base exception for all domain-specific API errors."""

    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: Optional[dict] = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "error_code": error_code,
                "message": message,
                "details": details or {},
            },
        )


class EmptyTextError(LinguaBridgeException):
    """Raised when the text parameter is empty or composed exclusively of whitespace."""

    def __init__(self, message: str = "Input text cannot be empty or solely whitespace."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="EMPTY_TEXT",
            message=message,
        )


class TextLengthExceededError(LinguaBridgeException):
    """Raised when text character length exceeds the maximum allowed budget."""

    def __init__(self, current_len: int, max_allowed: int):
        super().__init__(
            status_code=422,
            error_code="TEXT_LENGTH_EXCEEDED",
            message=f"Text length ({current_len} chars) exceeds the maximum limit of {max_allowed} characters.",
            details={"current_length": current_len, "max_allowed": max_allowed},
        )


class UnsupportedLanguageError(LinguaBridgeException):
    """Raised when a supplied language code is not supported by NLLB-200 pipeline."""

    def __init__(self, lang_code: str, field_name: str = "language"):
        supported = list(settings.supported_languages.keys())
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="UNSUPPORTED_LANGUAGE",
            message=f"Unsupported {field_name} code: '{lang_code}'. Must be one of: {supported}",
            details={"provided": lang_code, "supported_languages": supported},
        )


class IdenticalLanguageError(LinguaBridgeException):
    """Raised when source and target languages are identical."""

    def __init__(self, lang_code: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="IDENTICAL_LANGUAGES",
            message=f"Source and target languages cannot be identical ('{lang_code}').",
            details={"source_lang": lang_code, "target_lang": lang_code},
        )


class InvalidModelVariantError(LinguaBridgeException):
    """Raised when an unrecognized model variant ID is requested."""

    def __init__(self, variant: str):
        allowed = ["baseline", "lora", "lora_bt"]
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INVALID_MODEL_VARIANT",
            message=f"Invalid model variant '{variant}'. Allowed variants are: {allowed}",
            details={"provided_variant": variant, "allowed_variants": allowed},
        )


class TranslationTimeoutError(LinguaBridgeException):
    """Raised when model inference takes longer than the timeout limit."""

    def __init__(self, timeout_sec: float):
        super().__init__(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            error_code="INFERENCE_TIMEOUT",
            message=f"Translation request timed out after {timeout_sec} seconds.",
            details={"timeout_seconds": timeout_sec},
        )


# ============================================================================
# Validation Helper Functions
# ============================================================================

def validate_translation_input(
    text: str,
    source_lang: str,
    target_lang: str,
    model_variant: Optional[str] = None,
) -> str:
    """
    Performs comprehensive structural and logical validation on translation inputs.

    Args:
        text (str): Input text to be translated.
        source_lang (str): Source language FLORES-200 code.
        target_lang (str): Target language FLORES-200 code.
        model_variant (Optional[str]): Selected model architecture.

    Returns:
        str: Validated and stripped text.

    Raises:
        EmptyTextError
        TextLengthExceededError
        UnsupportedLanguageError
        IdenticalLanguageError
        InvalidModelVariantError
    """
    # 1. Empty Text Check
    if not text or not text.strip():
        raise EmptyTextError()

    clean_text = text.strip()

    # 2. Maximum Length Check
    if len(clean_text) > settings.max_input_chars:
        raise TextLengthExceededError(
            current_len=len(clean_text),
            max_allowed=settings.max_input_chars,
        )

    # 3. Language Code Checks
    if source_lang not in settings.supported_languages:
        raise UnsupportedLanguageError(source_lang, field_name="source_lang")

    if target_lang not in settings.supported_languages:
        raise UnsupportedLanguageError(target_lang, field_name="target_lang")

    if source_lang == target_lang:
        raise IdenticalLanguageError(source_lang)

    # 4. Model Variant Check
    if model_variant is not None:
        if model_variant not in ["baseline", "lora", "lora_bt"]:
            raise InvalidModelVariantError(model_variant)

    return clean_text
