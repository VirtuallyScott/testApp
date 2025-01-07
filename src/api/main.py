import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, Request
from version import get_version
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
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

app = FastAPI(
    title="Container Security Scan API",
    root_path="/api/v1",
    openapi_prefix="/api/v1"
)

# Add middleware to ensure proper path handling
@app.middleware("http")
async def add_root_path(request: Request, call_next):
    if request.url.path.startswith("/api/v1"):
        request.scope["path"] = request.scope["path"].replace("/api/v1", "", 1)
    response = await call_next(request)
    return response

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
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

@app.post("/scans")
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

@app.get("/scans")
async def list_scans(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict]:
    """List all security scan results"""
    try:
        logger.info(f"User {current_user.username} requesting scan list")
        scans = db.query(models.ScanResult).all()
        logger.info(f"Successfully retrieved {len(scans)} scans")
        
        result = []
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
                result.append(scan_dict)
                logger.debug(f"Successfully processed scan {scan.id}")
            except Exception as scan_error:
                logger.error(f"Error processing scan {scan.id}: {str(scan_error)}", exc_info=True)
                # Continue processing other scans
                continue
        
        logger.info(f"Successfully processed {len(result)} out of {len(scans)} scans")
        return result
    except Exception as e:
        logger.error(f"Error retrieving scans: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving scan results"
        )

@app.get("/scans/{scan_id}")
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

@app.get("/version")
async def version() -> Dict[str, str]:
    """Get application version"""
    return {"version": get_version()}

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/ready")
async def readiness_check(db: Session = Depends(get_db)) -> Dict[str, str]:
    """Readiness check endpoint"""
    try:
        db.execute("SELECT 1")
        # Check if admin user exists
        admin = db.query(models.User).filter(models.User.username == 'admin').first()
        if admin:
            logger.info("Admin user exists in database")
            return {"status": "ready", "admin_exists": True}
        else:
            logger.warning("Admin user not found in database")
            return {"status": "ready", "admin_exists": False}
    except Exception as e:
        logger.error(f"Database check failed: {str(e)}")
        return {"status": "not ready", "error": str(e)}
