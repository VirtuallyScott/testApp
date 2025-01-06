# Backend API

FastAPI backend for the three-tier application.

## Features

- FastAPI/Python backend
- Multi-stage Docker builds
- Optimized dependencies management
- Production-ready configuration

## Development

### Local Development (without Docker)
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

### Docker Development Build
```bash
docker build -t api-app:dev .
docker run -p 8000:8000 api-app:dev
```

## Production Build

```bash
# Build production Docker image
docker build -t api-app:prod .
docker run -p 8000:8000 api-app:prod
```

## API Documentation

When running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Build Features

- Multi-stage build process
- Optimized dependency management
- Minimal final image size
- Production-ready configuration
