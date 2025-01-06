from fastapi import Security, HTTPException, Depends, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from datetime import datetime
from . import models, database
from passlib.context import CryptContext

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_api_key(api_key: str) -> str:
    return pwd_context.hash(api_key)

def verify_api_key(plain_api_key: str, hashed_key: str) -> bool:
    return pwd_context.verify(plain_api_key, hashed_key)

async def get_api_key_user(
    api_key: str = Security(api_key_header),
    db: Session = Depends(database.get_db)
):
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is required",
        )
    
    # Find the API key in the database
    db_key = db.query(models.ApiKey).filter(
        models.ApiKey.is_active == True
    ).all()
    
    valid_key = None
    for key in db_key:
        if verify_api_key(api_key, key.key_hash):
            valid_key = key
            break
    
    if not valid_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )
    
    # Check if key has expired
    if valid_key.expires_at and valid_key.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key has expired",
        )
    
    # Update last used timestamp
    valid_key.last_used_at = datetime.utcnow()
    db.commit()
    
    return valid_key.user
