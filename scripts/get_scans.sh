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

# Get token if not provided
if [ -z "$TOKEN" ]; then
    TOKEN=$(./get_token.sh)
    if [ $? -ne 0 ]; then
        echo "Failed to get auth token"
        exit 1
    fi
fi

# Construct API endpoint
if [ -n "$SCAN_ID" ]; then
    ENDPOINT="${API_URL}/scans/${SCAN_ID}"
else
    ENDPOINT="${API_URL}/scans"
fi

# Get scan results
response=$(curl -s -X GET "${ENDPOINT}" \
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
