# Frontend Application

React/TypeScript frontend for the three-tier application.

## Features

- React/TypeScript based SPA
- Integration with FastAPI backend
- Health and readiness check monitoring
- Service status dashboard
- Production-ready Nginx configuration
- Multi-stage Docker builds for optimal image size

## Development

### Local Development (without Docker)
```bash
npm install
npm start
```

### Docker Development Build
```bash
docker build -t web-app:dev .
docker run -p 80:80 web-app:dev
```

## Production Build

```bash
# Build production Docker image
docker build -t web-app:prod .
docker run -p 80:80 web-app:prod
```

## Health Monitoring

The application includes a health monitoring dashboard that shows:
- API service status (/health endpoint)
- System readiness status (/ready endpoint)
- Database connectivity
- Redis cache status

## Environment Variables

- REACT_APP_API_URL: Backend API URL (default: http://localhost:8000)

## Docker Build Features

- Multi-stage build process
- Development and production configurations
- Nginx for static file serving
- Optimized final image size
