from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import redis
import os
from typing import Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Three-Tier Application API")

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/app_db")
engine = create_engine(DATABASE_URL)

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://:redis_password@redis:6379/0")
redis_client = redis.from_url(REDIS_URL)

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Basic health check endpoint.
    Returns the status of the API service.
    """
    return {"status": "healthy"}

@app.get("/ready")
async def readiness_check() -> Dict[str, str]:
    """
    Readiness check endpoint.
    Verifies connectivity to all required services (PostgreSQL and Redis).
    """
    status = {"status": "ready", "database": "up", "redis": "up"}
    
    # Check database connectivity
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError as e:
        logger.error(f"Database check failed: {str(e)}")
        status["database"] = "down"
        status["status"] = "not ready"

    # Check Redis connectivity
    try:
        redis_client.ping()
    except redis.ConnectionError as e:
        logger.error(f"Redis check failed: {str(e)}")
        status["redis"] = "down"
        status["status"] = "not ready"

    return status

# Add your other API routes below
