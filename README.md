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
```

## Development Setup

1. Install Docker and Docker Compose
2. Run `docker-compose up --build`
3. Access:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs
   - API: http://localhost:8000/api/v1

## Development Requirements
- Docker
- Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
