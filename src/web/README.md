# Frontend Application

React/TypeScript frontend for the container security scanning system.

## Features

- React/TypeScript based SPA with Material UI
- Secure authentication with JWT tokens
- Role-based access control
- Real-time health and readiness monitoring
- Service status dashboard with detailed metrics
- Production-ready Nginx configuration
- Multi-stage Docker builds for optimal image size
- Automatic API token refresh handling
- Error boundary and 401 redirect handling
- Version information in footer
- Scan results management with:
  - Sortable columns (click headers to sort)
  - Alternating row shading
  - Severity-based color coding
  - JSON download functionality

## Development

### Local Development (without Docker)
```bash
npm install
npm start
```

### Docker Development Build
```bash
docker build --target builder --build-arg VERSION=$(./get_version.sh) -t web-app:dev .
docker run -p 80:80 web-app:dev
```

## Production Build

```bash
# Build production Docker image with version
docker build --build-arg VERSION=$(./get_version.sh) -t web-app:prod .
docker run -p 80:80 web-app:prod
```

## Troubleshooting

If you encounter build issues:
1. Make sure Docker is running
2. Clear Docker cache: `docker builder prune`
3. Verify network connectivity
4. Check available disk space
5. Ensure package-lock.json is up to date

## Build Process Details

The Docker build uses a multi-stage process:
1. Version stage: Determines the current version using git
2. Dependency stage: Installs production dependencies
3. Builder stage: Installs dev dependencies and builds the app
4. Runtime stage: Uses nginx to serve the built app

This approach provides:
- Faster builds through dependency caching
- Smaller final image size
- Better separation of concerns
- Reproducible builds

## Authentication

The application uses JWT-based authentication with:
- Login/logout functionality
- Token storage in localStorage
- Automatic token refresh handling
- 401 error redirect to login

## Health Monitoring

The application includes a comprehensive health monitoring dashboard that shows:
- Overall system health status
- Individual service status monitoring:
  - API service health
  - Database connectivity
  - Redis cache status
- System readiness checks:
  - API readiness
  - Database readiness
  - Redis readiness
- Admin user status
- Version information
- Auto-refresh every 30 seconds
- Visual status indicators

## Security Features

- JWT authentication
- Secure token storage
- Automatic token refresh
- Role-based access control
- Protected routes
- Error boundary handling
- Secure API communication

## Environment Variables

- REACT_APP_API_URL: Backend API URL (default: http://localhost:8000)
- VERSION: Application version (set during build)

## Docker Build Features

- Multi-stage build process
- Development and production configurations
- Nginx for static file serving
- Optimized final image size
- Version tagging
- Secure default configuration
- Git-based version detection
