#!/bin/bash

# Start only the database service
docker-compose up -d db

echo "Database service started. Use 'docker-compose logs -f db' to view logs."
