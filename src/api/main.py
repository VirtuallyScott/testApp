import os
from datetime import datetime, timedelta
from typing import Optional, Dict
from pydantic import BaseModel

class HealthStatus(BaseModel):
    status: str
    checks: Dict[str, Dict[str, str]]

class ReadinessStatus(BaseModel):
    status: str 
    checks: Dict[str, Dict[str, str]]
    admin_exists: str
from fastapi import FastAPI, Depends, HTTPException, status, Request, Body
from version import get_version
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, List
import logging
from datetime import timedelta

import models
import database
import auth
from database import engine, get_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
try:
    models.Base.metadata.create_all(bind=engine)
    logger.info("Successfully created database tables")
except Exception as e:
    logger.error(f"Failed to create database tables: {str(e)}")
    raise

# Create main FastAPI app
app = FastAPI(title="Container Security Scan API")

# Create sub-application for API v1
api_v1 = FastAPI()

# Mount the API v1 sub-application
app.mount("/api/v1", api_v1)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@api_v1.post("/token")
async def login(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        # Try to parse as JSON first
        json_data = await request.json()
        username = json_data.get("username")
        password = json_data.get("password")
    except:
        # Fall back to form data
        form_data = await request.form()
        username = form_data.get("username")
        password = form_data.get("password")
    
    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Both username and password are required"
        )
        
    logger.info(f"Login attempt for user: {username}")
    try:
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            logger.warning(f"Login attempt failed: User {username} not found in database")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not auth.verify_password(password, user.password_hash):
            logger.warning(f"Login attempt failed: Invalid password for user {username}")
            logger.debug(f"Stored hash for user {username}: {user.password_hash}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"Successful login for user {username}")
        
        access_token = auth.create_access_token(
            data={"sub": user.username},
            expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
    logger.info(f"Login attempt for user: {form_data.username}")
    try:
        user = db.query(models.User).filter(models.User.username == form_data.username).first()
        if not user:
            logger.warning(f"Login attempt failed: User {form_data.username} not found in database")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not auth.verify_password(form_data.password, user.password_hash):
            logger.warning(f"Login attempt failed: Invalid password for user {form_data.username}")
            logger.debug(f"Stored hash for user {form_data.username}: {user.password_hash}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"Successful login for user {form_data.username}")
        
        access_token = auth.create_access_token(
            data={"sub": user.username},
            expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )

@api_v1.post("/scans")
async def upload_scan(
    scan_data: Dict,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a new security scan result"""
    # Validate required fields
    required_fields = ["image_name", "image_tag", "image_sha256", "scan_timestamp", "raw_results"]
    for field in required_fields:
        if field not in scan_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Allow duplicate scans by not checking for existing entries
    scan_result = models.ScanResult(
        image_name=scan_data["image_name"],
        image_tag=scan_data["image_tag"],
        image_sha256=scan_data["image_sha256"],
        scanner_type="trivy",  # Fixed as Trivy scanner
        scan_timestamp=datetime.fromisoformat(scan_data["scan_timestamp"]),
        severity_critical=scan_data.get("severity_critical", 0),
        severity_high=scan_data.get("severity_high", 0),
        severity_medium=scan_data.get("severity_medium", 0),
        severity_low=scan_data.get("severity_low", 0),
        raw_results=scan_data["raw_results"],
        uploaded_by=current_user.id
    )
    
    db.add(scan_result)
    db.commit()
    db.refresh(scan_result)
    return scan_result

@api_v1.get("/scans")
async def list_scans(
    page: int = 1,
    per_page: int = 25,
    sort_by: str = "scan_timestamp",
    sort_order: str = "desc",
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
) -> Dict:
    """List security scan results with pagination and sorting"""
    try:
        logger.info(f"User {current_user.username} requesting scan list - page {page}, per_page {per_page}")
        
        # Validate and normalize sort parameters
        valid_sort_fields = {
            "scan_timestamp": models.ScanResult.scan_timestamp,
            "image_name": models.ScanResult.image_name,
            "severity_critical": models.ScanResult.severity_critical,
            "severity_high": models.ScanResult.severity_high,
            "severity_medium": models.ScanResult.severity_medium,
            "severity_low": models.ScanResult.severity_low
        }
        
        sort_field = valid_sort_fields.get(sort_by, models.ScanResult.scan_timestamp)
        if sort_order.lower() == "asc":
            query = query.order_by(sort_field.asc())
        else:
            query = query.order_by(sort_field.desc())
            
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        scans = query.offset(offset).limit(per_page).all()
        logger.info(f"Successfully retrieved {len(scans)} scans (page {page} of {(total_count + per_page - 1) // per_page})")
        
        items = []
        for scan in scans:
            try:
                # Ensure raw_results is a dict
                raw_results = scan.raw_results if isinstance(scan.raw_results, dict) else {}
                
                scan_dict = {
                    "id": scan.id,
                    "image_name": str(scan.image_name),
                    "image_tag": str(scan.image_tag),
                    "scanner_type": str(scan.scanner_type),
                    "scan_timestamp": scan.scan_timestamp.isoformat() if scan.scan_timestamp else None,
                    "severity_critical": int(scan.severity_critical or 0),
                    "severity_high": int(scan.severity_high or 0),
                    "severity_medium": int(scan.severity_medium or 0),
                    "severity_low": int(scan.severity_low or 0),
                    "raw_results": raw_results,
                    "uploaded_by": int(scan.uploaded_by) if scan.uploaded_by else None
                }
                items.append(scan_dict)
                logger.debug(f"Successfully processed scan {scan.id}")
            except Exception as scan_error:
                logger.error(f"Error processing scan {scan.id}: {str(scan_error)}", exc_info=True)
                continue
        
        logger.info(f"Successfully processed {len(items)} out of {len(scans)} scans")
        return {
            "items": items,
            "total": total_count,
            "page": page,
            "per_page": per_page,
            "total_pages": (total_count + per_page - 1) // per_page
        }
    except Exception as e:
        logger.error(f"Error retrieving scans: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving scan results"
        )

@api_v1.get("/scans/{scan_id}")
async def get_scan(
    scan_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific scan result"""
    scan = db.query(models.ScanResult).filter(models.ScanResult.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan

@api_v1.get("/version")
async def version() -> Dict[str, str]:
    """Get application version"""
    return {"version": get_version()}

@api_v1.get("/health", response_model=HealthStatus)
async def health_check(db: Session = Depends(get_db)) -> HealthStatus:
    """Health check endpoint"""
    try:
        # Check database
        db_status = "healthy"
        try:
            db.execute(text("SELECT 1"))
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            db_status = "unhealthy"

        # Check Redis (assuming Redis connection is available)
        redis_status = "healthy"
        try:
            from redis import Redis
            redis = Redis(host='redis', port=6379, password='redis_password', socket_connect_timeout=2)
            redis.ping()
        except Exception as e:
            logger.error(f"Redis health check failed: {str(e)}")
            redis_status = "unhealthy"

        return HealthStatus(
            status="healthy" if db_status == "healthy" and redis_status == "healthy" else "unhealthy",
            checks={
                "database": {"status": db_status},
                "redis": {"status": redis_status},
                "api": {"status": "healthy"}
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return HealthStatus(
            status="unhealthy",
            checks={
                "database": {"status": "unknown"},
                "redis": {"status": "unknown"},
                "api": {"status": "unhealthy"}
            }
        )

class ApiKeyCreate(BaseModel):
    name: str
    expires_in_days: Optional[int] = 30

@api_v1.post("/api-keys")
async def create_api_key(
    key_data: ApiKeyCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new API key"""
    api_key = auth.generate_api_key()
    hashed_key = auth.get_api_key_hash(api_key)
    
    db_key = models.ApiKey(
        key_hash=hashed_key,
        name=key_data.name,
        user_id=current_user.id,
        expires_at=datetime.utcnow() + timedelta(days=key_data.expires_in_days) if key_data.expires_in_days else None,
        is_active=True
    )
    
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    
    return {
        "api_key": api_key,  # Only returned once!
        "id": db_key.id,
        "name": db_key.name,
        "created_at": db_key.created_at,
        "expires_at": db_key.expires_at
    }

@api_v1.get("/api-keys")
async def list_api_keys(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """List all API keys for current user"""
    keys = db.query(models.ApiKey).filter(models.ApiKey.user_id == current_user.id).all()
    return [{
        "id": key.id,
        "name": key.name,
        "created_at": key.created_at,
        "expires_at": key.expires_at,
        "last_used_at": key.last_used_at,
        "is_active": key.is_active
    } for key in keys]

@api_v1.put("/api-keys/{key_id}/extend")
async def extend_api_key(
    key_id: int,
    days: int = Body(..., embed=True),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Extend an API key's expiration date"""
    key = db.query(models.ApiKey).filter(
        models.ApiKey.id == key_id,
        models.ApiKey.user_id == current_user.id
    ).first()
    
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    if not key.expires_at:
        raise HTTPException(status_code=400, detail="API key has no expiration date")
    
    key.expires_at = key.expires_at + timedelta(days=days)
    db.commit()
    db.refresh(key)
    
    return {
        "id": key.id,
        "name": key.name,
        "expires_at": key.expires_at
    }

@api_v1.delete("/api-keys/{key_id}")
async def delete_api_key(
    key_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an API key"""
    key = db.query(models.ApiKey).filter(
        models.ApiKey.id == key_id,
        models.ApiKey.user_id == current_user.id
    ).first()
    
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    db.delete(key)
    db.commit()
    return {"status": "deleted"}

@api_v1.put("/api-keys/{key_id}/suspend")
async def suspend_api_key(
    key_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle API key active status"""
    key = db.query(models.ApiKey).filter(
        models.ApiKey.id == key_id,
        models.ApiKey.user_id == current_user.id
    ).first()
    
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    key.is_active = not key.is_active
    db.commit()
    db.refresh(key)
    return {
        "id": key.id,
        "is_active": key.is_active,
        "status": "active" if key.is_active else "suspended"
    }

@api_v1.post("/users")
async def create_user(
    request: Request,
    current_user: models.User = Depends(auth.check_admin_role),
    db: Session = Depends(get_db)
):
    try:
        # Try to parse as JSON first
        json_data = await request.json()
        username = json_data.get("username")
        email = json_data.get("email")
        password = json_data.get("password")
        is_active = json_data.get("is_active", True)
    except:
        # Fall back to form data
        form_data = await request.form()
        username = form_data.get("username")
        email = form_data.get("email")
        password = form_data.get("password")
        is_active = form_data.get("is_active", "true").lower() == "true"
    
    if not username or not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Username, email and password are required"
        )
    """Create a new user"""
    # Check if username already exists
    existing_user = db.query(models.User).filter(models.User.username == username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Create new user
    new_user = models.User(
        username=username,
        email=email,
        password_hash=auth.get_password_hash(password),
        is_active=is_active
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@api_v1.put("/users/{user_id}/password")
async def change_password(
    user_id: int,
    new_password: str,
    current_user: models.User = Depends(auth.check_admin_role),
    db: Session = Depends(get_db)
):
    """Change a user's password"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.password_hash = auth.get_password_hash(new_password)
    db.commit()
    return {"status": "password updated"}

@api_v1.put("/users/{user_id}/email")
async def update_email(
    user_id: int,
    new_email: str,
    current_user: models.User = Depends(auth.check_admin_role),
    db: Session = Depends(get_db)
):
    """Update a user's email address"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.email = new_email
    db.commit()
    return {"status": "email updated"}

@api_v1.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    is_active: bool = Body(..., embed=True),
    current_user: models.User = Depends(auth.check_admin_role),
    db: Session = Depends(get_db)
):
    """Activate or deactivate a user"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = is_active
    db.commit()
    return {"status": "active" if is_active else "inactive"}

@api_v1.get("/users")
async def list_users(
    current_user: models.User = Depends(auth.check_admin_role),
    db: Session = Depends(get_db)
):
    """List all users"""
    users = db.query(models.User).all()
    return [{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active,
        "created_at": user.created_at
    } for user in users]

@api_v1.get("/users/me/roles")
async def get_current_user_roles(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get roles for current user"""
    try:
        # Refresh the user object to ensure we have latest roles
        db.refresh(current_user)
        roles = [role.name for role in current_user.roles]
        logger.info(f"Retrieved roles for user {current_user.username}: {roles}")
        return {"roles": roles}
    except Exception as e:
        logger.error(f"Error getting roles for user {current_user.username}: {str(e)}")
        return {"roles": []}

@api_v1.get("/users/me/preferences")
async def get_user_preferences(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's preferences"""
    prefs = db.query(models.UserPreferences).filter(
        models.UserPreferences.user_id == current_user.id
    ).first()
    
    if not prefs:
        # Create default preferences if none exist
        prefs = models.UserPreferences(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    
    return prefs

@api_v1.put("/users/me/preferences")
async def update_user_preferences(
    preferences: dict,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's preferences"""
    prefs = db.query(models.UserPreferences).filter(
        models.UserPreferences.user_id == current_user.id
    ).first()
    
    if not prefs:
        prefs = models.UserPreferences(user_id=current_user.id)
        db.add(prefs)
    
    for key, value in preferences.items():
        if hasattr(prefs, key):
            setattr(prefs, key, value)
    
    db.commit()
    db.refresh(prefs)
    return prefs

@api_v1.get("/ready", response_model=ReadinessStatus)
async def readiness_check(db: Session = Depends(get_db)) -> ReadinessStatus:
    """Readiness check endpoint"""
    try:
        # Check database
        db_status = "ready"
        admin_exists = False
        try:
            db.execute(text("SELECT 1"))
            admin = db.query(models.User).filter(models.User.username == 'admin').first()
            admin_exists = admin is not None
        except Exception as e:
            logger.error(f"Database readiness check failed: {str(e)}")
            db_status = "not ready"

        # Check Redis
        redis_status = "ready"
        try:
            from redis import Redis
            redis = Redis(host='redis', port=6379, password='redis_password', socket_connect_timeout=2)
            redis.ping()
        except Exception as e:
            logger.error(f"Redis readiness check failed: {str(e)}")
            redis_status = "not ready"

        return ReadinessStatus(
            status="ready" if db_status == "ready" and redis_status == "ready" else "not ready",
            checks={
                "database": {"status": db_status},
                "redis": {"status": redis_status},
                "api": {"status": "ready"}
            },
            admin_exists=str(admin_exists).lower()
        )
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        return ReadinessStatus(
            status="not ready",
            checks={
                "database": {"status": "unknown"},
                "redis": {"status": "unknown"},
                "api": {"status": "not ready"}
            },
            admin_exists="false"
        )
