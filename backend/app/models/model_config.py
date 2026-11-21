"""
LinguaBridge AI - Model & Application Configuration
===================================================
Module: backend/app/models/model_config.py
Purpose: Centralized settings and environment variable configuration
         for the FastAPI translation backend, supporting Hugging Face Spaces deployment.
"""

import os
from typing import Dict, List, Optional
from pydantic import Field
try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        from pydantic import BaseModel as BaseSettings


class AppConfig(BaseSettings):
    """
    Application configuration parameters loaded from environment variables or .env.
    """

    # Service Metadata
    app_name: str = "LinguaBridge AI - Translation API"
    app_version: str = "1.0.0"
    app_description: str = (
        "Production-grade Neural Machine Translation API for English ↔ Kannada "
        "(eng_Latn ↔ kan_Knda) using facebook/nllb-200-distilled-600M and LoRA."
    )
    port: int = int(os.getenv("PORT", "8000"))  # Default local port 8000 (overridden by PORT env)
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Foundation & Adapter Models
    base_model_name: str = os.getenv(
        "BASE_MODEL_NAME", "facebook/nllb-200-distilled-600M"
    )
    hf_lora_repo_id: str = os.getenv(
        "HF_LORA_REPO_ID", "linguabridge-ai/nllb200-lora-eng-kan"
    )
    hf_token: Optional[str] = os.getenv("HF_TOKEN", None)

    # Local fallback adapter path (if running locally or mounting storage)
    local_adapter_dir: str = os.getenv(
        "LOCAL_ADAPTER_DIR",
        os.path.abspath(
            os.path.join(
                os.path.dirname(__file__), "..", "..", "..", "ml", "adapters", "nllb_lora_bt"
            )
        ),
    )

    # Path to metrics.json (for GET /api/metrics)
    metrics_file_path: str = os.getenv(
        "METRICS_FILE_PATH",
        os.path.abspath(
            os.path.join(
                os.path.dirname(__file__), "..", "..", "..", "ml", "outputs", "metrics.json"
            )
        ),
    )

    # Input Boundaries & Operational Constraints
    max_input_chars: int = int(os.getenv("MAX_INPUT_CHARS", "2000"))
    min_input_chars: int = int(os.getenv("MIN_INPUT_CHARS", "1"))
    max_generation_length: int = int(os.getenv("MAX_GENERATION_LENGTH", "256"))
    default_beam_size: int = int(os.getenv("DEFAULT_BEAM_SIZE", "4"))
    request_timeout_seconds: float = float(
        os.getenv("TRANSLATION_TIMEOUT_SECONDS", "30.0")
    )

    # Hardware & Performance Configuration
    device_override: Optional[str] = os.getenv("DEVICE", None)
    use_fp16: bool = os.getenv("USE_FP16", "true").lower() == "true"

    # CORS Whitelist
    cors_origins: List[str] = ["*"]

    # Language Definitions (FLORES-200 / NLLB BCP-47 codes)
    supported_languages: Dict[str, Dict[str, str]] = {
        "eng_Latn": {
            "name": "English",
            "script": "Latin",
            "native_name": "English",
            "sample": "The government announced new educational policies for rural schools.",
        },
        "kan_Knda": {
            "name": "Kannada",
            "script": "Kannada",
            "native_name": "ಕನ್ನಡ",
            "sample": "ಗ್ರಾಮೀಣ ಶಾಲೆಗಳಿಗಾಗಿ ಸರ್ಕಾರವು ಹೊಸ ಶೈಕ್ಷಣಿಕ ನೀತಿಗಳನ್ನು ಪ್ರಕಟಿಸಿತು.",
        },
        "hin_Deva": {
            "name": "Hindi",
            "script": "Devanagari",
            "native_name": "हिन्दी",
            "sample": "सरकार ने ग्रामीण स्कूलों के लिए नई शैक्षिक नीतियों की घोषणा की।",
        },
        "tam_Taml": {
            "name": "Tamil",
            "script": "Tamil",
            "native_name": "தமிழ்",
            "sample": "கிராமப்புற பள்ளிகளுக்கான புதிய கல்விக் கொள்கைகளை அரசு அறிவித்தது.",
        },
        "tel_Telu": {
            "name": "Telugu",
            "script": "Telugu",
            "native_name": "తెలుగు",
            "sample": "గ్రామీణ పాఠశాలల కోసం ప్రభుత్వం కొత్త విద్యా విధానాలను ప్రకటించింది.",
        },
    }

    # Supported Translation Directions
    supported_pairs: List[str] = [
        "eng_Latn -> kan_Knda",
        "kan_Knda -> eng_Latn",
        "eng_Latn -> hin_Deva",
        "hin_Deva -> eng_Latn",
        "eng_Latn -> tam_Taml",
        "tam_Taml -> eng_Latn",
        "eng_Latn -> tel_Telu",
        "tel_Telu -> eng_Latn",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Global singleton configuration
settings = AppConfig()
