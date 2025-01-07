#!/bin/bash

# Start only the API service
docker-compose up -d api

echo "API service started. Use 'docker-compose logs -f api' to view logs."
