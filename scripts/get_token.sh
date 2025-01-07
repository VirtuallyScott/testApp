#!/bin/bash

# Default values
API_URL=${API_URL:-"http://localhost:8000"}
USERNAME=${USERNAME:-"admin"}
PASSWORD=${PASSWORD:-"Admin@123"}

# Get auth token
response=$(curl -s -X POST "${API_URL}/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${USERNAME}&password=${PASSWORD}")

# Extract token using grep and cut
token=$(echo $response | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$token" ]; then
    echo $token
    exit 0
else
    echo "Failed to get token" >&2
    echo $response >&2
    exit 1
fi
