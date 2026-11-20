"""
LinguaBridge AI - Root Proxy Application Entrypoint
===================================================
Exports the ASGI application from backend.app.main for convenience.
Allows running:
    uvicorn main:app --reload (from backend/)
    uvicorn app.main:app --reload (from backend/)
"""

import os
import sys

# Add app directory to Python search path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "app")))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    from app.models.model_config import settings
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=settings.debug)
