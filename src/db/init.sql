-- Enable pgcrypto extension for secure password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users and authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,  -- Changed to TEXT to accommodate longer hashes
    salt TEXT NOT NULL,           -- Added salt column
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Function to hash passwords with salt
CREATE OR REPLACE FUNCTION hash_password(password TEXT, salt TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, salt);
END;
$$ LANGUAGE plpgsql;

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_password(password TEXT, stored_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN stored_hash = crypt(password, stored_hash);
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(id),
    role_id INTEGER REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    permissions JSONB DEFAULT '[]'::jsonb
);

-- Security scan results
CREATE TABLE IF NOT EXISTS scan_results (
    id SERIAL PRIMARY KEY,
    image_name VARCHAR(255) NOT NULL,
    image_tag VARCHAR(100) NOT NULL,
    scanner_type VARCHAR(50) NOT NULL,
    scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    severity_critical INTEGER DEFAULT 0,
    severity_high INTEGER DEFAULT 0,
    severity_medium INTEGER DEFAULT 0,
    severity_low INTEGER DEFAULT 0,
    raw_results JSONB NOT NULL,
    uploaded_by INTEGER REFERENCES users(id)
);

-- Insert default roles
INSERT INTO roles (name) VALUES 
    ('admin'),
    ('viewer'),
    ('uploader')
ON CONFLICT (name) DO NOTHING;

-- Create default admin user
DO $$
DECLARE
    admin_salt TEXT := gen_salt('bf', 8);  -- Generate a secure salt
    admin_password TEXT := 'Admin@123';    -- Default password (change in production!)
    admin_id INT;
BEGIN
    -- Insert admin user with hashed password
    INSERT INTO users (username, email, password_hash, salt)
    VALUES (
        'admin',
        'admin@example.com',
        hash_password(admin_password, admin_salt),
        admin_salt
    )
    RETURNING id INTO admin_id;

    -- Assign admin role to the user
    INSERT INTO user_roles (user_id, role_id)
    VALUES (
        admin_id,
        (SELECT id FROM roles WHERE name = 'admin')
    );
END $$;
