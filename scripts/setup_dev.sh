#!/bin/bash

# Create necessary directories
mkdir -p tests/unit tests/integration tests/e2e coverage

# Install backend dependencies
pip install -r src/api/requirements.txt

# Install frontend dependencies
cd src/web
npm install

# Set up pre-commit hooks
if [ ! -f .git/hooks/pre-commit ]; then
    echo "Installing pre-commit hooks..."
    cp scripts/pre-commit .git/hooks/
    chmod +x .git/hooks/pre-commit
fi

# Create test database
docker-compose up -d db
sleep 5  # Wait for database to be ready
docker-compose exec db psql -U postgres -c "CREATE DATABASE test_db;"

echo "Development environment setup complete!"
