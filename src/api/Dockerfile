# Version stage
FROM alpine AS version
COPY get_version.sh /get_version.sh
RUN chmod +x /get_version.sh
RUN apk add --no-cache git
RUN VERSION=$(/get_version.sh)

# Build stage
FROM python:3.11-slim AS builder
WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir wheel setuptools pip-tools && \
    mkdir /wheels && \
    pip-compile -o /wheels/requirements.txt requirements.txt && \
    pip wheel --no-deps --wheel-dir /wheels -r /wheels/requirements.txt

# Runtime stage
FROM python:3.11-slim
ARG VERSION
LABEL version=$VERSION

WORKDIR /app

# Copy wheels from builder
COPY --from=builder /wheels /wheels

# Install Python packages from wheels
RUN pip install --no-cache-dir /wheels/*.whl

# Create application directory structure
RUN mkdir -p /app/src/api
COPY . /app/src/api
WORKDIR /app/src/api

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
