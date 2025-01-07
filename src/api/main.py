from fastapi import FastAPI, Depends, HTTPException, status
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
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Container Security Scan API")

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
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/scans")
async def upload_scan(
    scan_data: Dict,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a new security scan result"""
    scan_result = models.ScanResult(
        image_name=scan_data["image_name"],
        image_tag=scan_data["image_tag"],
        scanner_type=scan_data["scanner_type"],
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
    scans = db.query(models.ScanResult).all()
    return scans

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
        return {"status": "ready"}
    except Exception as e:
        logger.error(f"Database check failed: {str(e)}")
        return {"status": "not ready"}
