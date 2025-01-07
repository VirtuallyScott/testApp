#!/bin/sh
set -e

# Wait for database to be ready
python wait_for_db.py

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port 8000
