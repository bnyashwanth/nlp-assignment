# ============================================================================
# LinguaBridge AI - Hugging Face Spaces Dockerfile
# ============================================================================
# Compatible with Hugging Face Spaces Docker SDK (runs on port 7860 as UID 1000)

FROM python:3.10-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860 \
    HOME=/home/user

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user required by Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Set working directory
WORKDIR /home/user/app

# Install Python dependencies
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application source code
COPY --chown=user:user app/ ./app/

# Expose Hugging Face Spaces default port
EXPOSE 7860

# Health check probe
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:7860/ || exit 1

# Start FastAPI application with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
