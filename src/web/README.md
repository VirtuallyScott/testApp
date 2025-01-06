# Frontend Application

React/TypeScript frontend for the three-tier application.

## Features

- React/TypeScript based SPA
- Integration with FastAPI backend
- Health and readiness check monitoring
- Service status dashboard

## Local Development

```bash
npm install
npm start
```

## Building

```bash
npm run build
```

## Health Monitoring

The application includes a health monitoring dashboard that shows:
- API service status (/health endpoint)
- System readiness status (/ready endpoint)
- Database connectivity
- Redis cache status

## Environment Variables

- REACT_APP_API_URL: Backend API URL (default: http://localhost:8000)
