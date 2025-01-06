# Database

PostgreSQL database with automatic initialization and idempotent setup.

## Features

- Automatic initialization with `init.sql`
- Idempotent schema creation
- Secure password hashing using pgcrypto
- Default admin user creation
- Role-based access control

## Schema Management

The database schema is managed through the `init.sql` file which:
- Creates all necessary tables
- Sets up user roles and permissions
- Implements secure password hashing functions
- Creates a default admin user if one doesn't exist

## Initial Setup

The database is automatically initialized with:
- Core tables: users, roles, user_roles, api_keys, scan_results
- Default roles: admin, viewer, uploader
- Default admin user (username: admin, password: Admin@123)
- Secure password hashing functions

## Security Features

- Password hashing with bcrypt using pgcrypto
- Salted password storage
- API key hashing
- Role-based access control
- Secure default configuration

## Environment Variables

- POSTGRES_USER: Database user (default: postgres)
- POSTGRES_PASSWORD: Database password (default: postgres)
- POSTGRES_DB: Database name (default: app_db)
