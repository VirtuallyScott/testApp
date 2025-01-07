# Container Security Dashboard

A modern three-tier application for container security scanning and monitoring.

## Features

- **Web Frontend**: React/TypeScript with Material UI
- **API Backend**: FastAPI/Python with JWT authentication
- **Database**: PostgreSQL for persistent storage
- **Redis**: Session management and caching
- **Security Scanning**: Integrated vulnerability scanning with support for duplicate scans
- **Versioning**: Git-based version tracking
- **Health Monitoring**: Comprehensive system health checks
- **CI/CD**: Terraform and CI pipeline configurations

## Directory Structure
```
src/
├── web/         # React frontend
├── api/         # FastAPI backend
├── db/          # Database migrations and schemas
└── redis/       # Redis configuration and cache

ci/             # CI Pipeline configurations
cd/             # Terraform Infrastructure as Code
tests/          # Test suites for TDD
postman/        # Postman Collections for API testing
scripts/        # Development and deployment scripts
```

## Development Setup

1. Install Docker and Docker Compose
2. Create logs directory:
   ```bash
   mkdir -p logs/{web,api,db,redis}
   ```
3. Start the application:
   ```bash
   docker-compose up --build
   ```
4. Access:
   - Frontend: http://localhost
   - API Docs: http://localhost:8000/docs
   - API: http://localhost:8000/api/v1
5. Default credentials:
   - Username: admin
   - Password: Admin@123

Logs will be stored in the `logs/` directory:
- Web: logs/web/
- API: logs/api/
- Database: logs/db/
- Redis: logs/redis/

## Development Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- Git (for version tracking)

## Version Management

The application uses Git tags for version tracking. To set a new version:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The version will be automatically detected during build and displayed in the web interface.

## Production Deployment

For production deployment, ensure you:
1. Set proper environment variables
2. Configure HTTPS
3. Set up proper logging and monitoring
4. Use the production build command:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

## Security Best Practices

- Always use strong passwords
- Rotate API keys regularly
- Keep the system updated
- Monitor security vulnerabilities
- Use HTTPS in production
- Regularly backup the database
