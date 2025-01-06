from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

# Association table for user roles
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    roles = relationship("Role", secondary=user_roles, back_populates="users")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    users = relationship("User", secondary=user_roles, back_populates="roles")

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    image_name = Column(String, index=True)
    image_tag = Column(String)
    scanner_type = Column(String)
    scan_timestamp = Column(DateTime, default=datetime.utcnow)
    severity_critical = Column(Integer, default=0)
    severity_high = Column(Integer, default=0)
    severity_medium = Column(Integer, default=0)
    severity_low = Column(Integer, default=0)
    raw_results = Column(JSON)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
