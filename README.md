# Three-Tier Application

A modern three-tier application with:
- Web Frontend (React/TypeScript)
- API Backend (FastAPI/Python)
- Database (PostgreSQL)
- Redis Cache (Session Management)

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
- Docker
- Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
