#!/bin/bash

# Default values
API_URL=${API_URL:-"http://localhost:8000"}

# Help text
usage() {
    echo "Usage: $0 [-t <token>] [-i <scan_id>]"
    echo "  -t: Auth token (optional - will get new token if not provided)"
    echo "  -i: Scan ID (optional - will list all scans if not provided)"
    echo "  -h: Show this help message"
    exit 1
}

# Parse command line arguments
while getopts "t:i:h" opt; do
    case $opt in
        t) TOKEN="$OPTARG";;
        i) SCAN_ID="$OPTARG";;
        h) usage;;
        ?) usage;;
    esac
done

# Get the authentication token
echo "Getting authentication token..."
TOKEN=$(curl -s -X POST -F "username=admin" -F "password=Admin@123" http://localhost:8000/api/v1/token | jq -r .access_token)

if [ -z "$TOKEN" ]; then
    echo "Failed to get authentication token"
    exit 1
fi

echo "Successfully obtained token"

# Get scan results
response=$(curl -s -X GET "${API_URL}/api/v1/scans" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/json")

# Pretty print JSON response
echo "$response" | jq '.'

# Check if response was successful
if [ $? -eq 0 ]; then
    exit 0
else
    echo "Failed to get scan results"
    echo "$response"
    exit 1
fi
