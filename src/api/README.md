# Backend API

FastAPI backend for the three-tier application.

## Features

- FastAPI/Python backend
- Multi-stage Docker builds
- Optimized dependencies management
- Production-ready configuration
- User preference management
- API key management with role-based access

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

### Health and Readiness Endpoints

The API provides two monitoring endpoints:

#### Health Check (/api/v1/health)
Returns the health status of all system components:
```json
{
  "status": "healthy" | "unhealthy",
  "checks": {
    "database": {"status": "healthy" | "unhealthy"},
    "redis": {"status": "healthy" | "unhealthy"},
    "api": {"status": "healthy" | "unhealthy"}
  }
}
```

Note: All status fields will always be present and contain one of the specified values.

#### Readiness Check (/api/v1/ready)
Returns the readiness status of all system components:
```json
{
  "status": "ready" | "not ready",
  "checks": {
    "database": {"status": "ready" | "not ready"},
    "redis": {"status": "ready" | "not ready"},
    "api": {"status": "ready" | "not ready"}
  },
  "admin_exists": "true" | "false"
}
```

Note: All status fields will always be present and contain one of the specified values.

## Docker Build Features

- Multi-stage build process
- Optimized dependency management
- Minimal final image size
- Production-ready configuration
