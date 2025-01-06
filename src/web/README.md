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

## Authentication

The application uses JWT-based authentication with:
- Login/logout functionality
- Token storage in localStorage
- Automatic token refresh handling
- 401 error redirect to login

## Health Monitoring

The application includes a comprehensive health monitoring dashboard that shows:
- API service status (/health endpoint)
- System readiness status (/ready endpoint)
- Database connectivity
- Redis cache status
- Version information
- Detailed service metrics

## Security Features

- JWT authentication
- Secure token storage
- Automatic token refresh
- Role-based access control
- Protected routes
- Error boundary handling

## Environment Variables

- REACT_APP_API_URL: Backend API URL (default: http://localhost:8000)

## Docker Build Features

- Multi-stage build process
- Development and production configurations
- Nginx for static file serving
- Optimized final image size
- Version tagging
- Secure default configuration
