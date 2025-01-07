#!/bin/bash

# Default values
API_URL=${API_URL:-"http://localhost:8000"}

# Help text
usage() {
    echo "Usage: $0 -f <scan_file> [-t <token>]"
    echo "  -f: Path to Trivy JSON scan file (required)"
    echo "  -t: Auth token (optional - will get new token if not provided)"
    echo "  -h: Show this help message"
    exit 1
}

# Parse command line arguments
while getopts "f:t:h" opt; do
    case $opt in
        f) SCAN_FILE="$OPTARG";;
        t) TOKEN="$OPTARG";;
        h) usage;;
        ?) usage;;
    esac
done

# Check if scan file is provided and exists
if [ -z "$SCAN_FILE" ] || [ ! -f "$SCAN_FILE" ]; then
    echo "Error: Must provide valid scan file path with -f"
    usage
fi

# Get token if not provided
if [ -z "$TOKEN" ]; then
    TOKEN=$(./get_token.sh)
    if [ $? -ne 0 ]; then
        echo "Failed to get auth token"
        exit 1
    fi
fi

# Upload scan
response=$(curl -s -X POST "${API_URL}/scans" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d @"${SCAN_FILE}")

# Check response
if echo "$response" | grep -q "id"; then
    echo "Scan uploaded successfully"
    echo "$response"
    exit 0
else
    echo "Failed to upload scan"
    echo "$response"
    exit 1
fi
