import pytest
from datetime import datetime
from src.api.models import User, Role, ApiKey, ScanResult
from sqlalchemy.orm import Session
from src.api.database import get_db, engine
import json

@pytest.fixture
def db():
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()

def test_create_user(db: Session):
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash="hashedpassword"
    )
    db.add(user)
    db.commit()
    
    assert user.id is not None
    assert user.username == "testuser"
    assert user.is_active == True

def test_create_api_key(db: Session):
    user = db.query(User).first()
    api_key = ApiKey(
        key_hash="hashedkey",
        name="Test Key",
        user_id=user.id,
        permissions=["read", "write"]
    )
    db.add(api_key)
    db.commit()
    
    assert api_key.id is not None
    assert api_key.is_active == True
