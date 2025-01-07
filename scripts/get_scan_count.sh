#!/bin/bash
set -e

# Get the authentication token
echo "Getting authentication token..."
TOKEN=$(curl -s -X POST -F "username=admin" -F "password=Admin@123" http://localhost:8000/api/v1/token | jq -r .access_token)

if [ -z "$TOKEN" ]; then
    echo "Failed to get authentication token"
    exit 1
fi

echo "Successfully obtained token"

# Get scan results
response=$(curl -s -X GET http://localhost:8000/api/v1/scans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

# Count the number of scans
scan_count=$(echo "$response" | jq '. | length')

echo "Number of scans in the database: $scan_count"
