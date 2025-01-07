#!/bin/bash

# Start only the web service
docker-compose up -d web

echo "Web service started. Use 'docker-compose logs -f web' to view logs."
