"""
LinguaBridge AI - FastAPI Application Entrypoint
================================================
Module: backend/app/main.py
Purpose: Main ASGI application factory, global CORS configuration,
         custom exception handling, and root diagnostic routes.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from app.api.translation_routes import router as translation_router
    from app.models.model_config import settings
    from app.models.model_loader import model_manager
    from app.utils.validation import LinguaBridgeException
except ImportError:
    from api.translation_routes import router as translation_router
    from models.model_config import settings
    from models.model_loader import model_manager
    from utils.validation import LinguaBridgeException

# Configure application logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("LinguaBridgeApp")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler: Preheats models or logs configuration upon startup.
    """
    logger.info("=" * 65)
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info("IndicTrans2 EN-INDIC: %s", settings.indictrans2_en_indic)
    logger.info("IndicTrans2 INDIC-EN: %s", settings.indictrans2_indic_en)
    logger.info("IndicTrans2 INDIC-INDIC: %s", settings.indictrans2_indic_indic)
    logger.info(f"Hardware Device: {model_manager.device}")
    logger.info(f"Neural Framework Ready: {model_manager.is_neural_ready}")
    logger.info(f"Port: {settings.port}")
    logger.info("=" * 65)
    yield
    logger.info("Shutting down LinguaBridge AI backend.")


# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.app_description,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Enable Cross-Origin Resource Sharing (CORS)
ALLOWED_ORIGINS = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://localhost:7860",
    "https://localhost",
    "capacitor://localhost",
    "ionic://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Global Exception Handlers
# ============================================================================

@app.exception_handler(LinguaBridgeException)
async def linguabridge_exception_handler(request: Request, exc: LinguaBridgeException):
    """Handles structured domain exceptions with clear diagnostic codes."""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail,
    )


@app.exception_handler(HTTPException)
async def generic_http_exception_handler(request: Request, exc: HTTPException):
    """Formats standard HTTPExceptions consistently."""
    detail = exc.detail if isinstance(exc.detail, dict) else {"message": str(exc.detail)}
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": "HTTP_ERROR",
            "message": detail.get("message", "An HTTP error occurred."),
            "details": detail,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catches unhandled errors and returns an HTTP 500 error payload."""
    logger.exception(f"Unhandled server exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An internal server error occurred while processing the request.",
            "details": {"exception_type": type(exc).__name__, "error_str": str(exc)},
        },
    )


# ============================================================================
# Root / Health Route
# ============================================================================

@app.get("/health", tags=["Health"], summary="Health check")
@app.get(
    "/",
    tags=["Root"],
    summary="Service Health & Information",
    description="Returns welcome information, operational health, and available endpoints.",
)
async def root():
    """Root health and discovery endpoint."""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "online",
        "description": settings.app_description,
        "device": model_manager.device,
        "is_neural_ready": model_manager.is_neural_ready,
        "models": {
            "en-indic": settings.indictrans2_en_indic,
            "indic-en": settings.indictrans2_indic_en,
            "indic-indic": settings.indictrans2_indic_indic,
        },
        "endpoints": {
            "docs": "/docs",
            "languages": "/api/languages",
            "translate": "/api/translate",
            "compare": "/api/compare",
            "metrics": "/api/metrics",
        },
    }


# Register translation API routes
app.include_router(translation_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=settings.debug)
