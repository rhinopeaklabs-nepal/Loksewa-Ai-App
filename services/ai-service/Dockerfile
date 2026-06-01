# Dockerfile for ai-service
FROM python:3.11-slim AS base
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY services/ai-service/requirements.txt* ./
RUN pip install --no-cache-dir -r requirements.txt || true

# Copy application
COPY services/ai-service ./services/ai-service

# Runtime
FROM python:3.11-slim AS runtime
WORKDIR /app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=base /app/services/ai-service ./services/ai-service
COPY --from=base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=base /usr/local/bin /usr/local/bin

EXPOSE 3006
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3006/healthz || exit 1
CMD ["uvicorn", "services.ai-service.src.server:app", "--host", "0.0.0.0", "--port", "3006"]
