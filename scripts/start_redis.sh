#!/bin/bash

# Start only the redis service
docker-compose up -d redis

echo "Redis service started. Use 'docker-compose logs -f redis' to view logs."
