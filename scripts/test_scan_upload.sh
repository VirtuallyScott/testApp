#!/bin/bash
set -e

API_URL=${API_URL:-"http://localhost:8000"}

# Function to get authentication token
get_auth_token() {
    echo "Getting authentication token..."
    TOKEN=$(curl -s -X POST -F "username=admin" -F "password=Admin@123" "$API_URL/api/v1/token" | jq -r .access_token)
    
    if [ -z "$TOKEN" ]; then
        echo "Failed to get authentication token"
        exit 1
    fi
    
    echo "Successfully obtained token"
}

# Function to upload scan
upload_scan() {
    local scan_file=$1
    echo "Uploading scan from file: $scan_file..."
    
    if [ ! -f "$scan_file" ]; then
        echo "Error: Scan file not found: $scan_file"
        exit 1
    fi
    
    curl -s -X POST "$API_URL/api/v1/scans" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d @"$scan_file" | jq '.'
}

# Function to list all scans
list_scans() {
    echo -e "\nListing all scans..."
    SCAN_LIST=$(curl -s -X GET \
      -H "Authorization: Bearer $TOKEN" \
      -H "Accept: application/json" \
      -w "\nHTTP_STATUS:%{http_code}" \
      "$API_URL/api/v1/scans")

    HTTP_STATUS=$(echo "$SCAN_LIST" | grep "HTTP_STATUS:" | cut -d":" -f2)
    RESPONSE_BODY=$(echo "$SCAN_LIST" | grep -v "HTTP_STATUS:")

    if [ "$HTTP_STATUS" != "200" ]; then
        echo "Error: HTTP status $HTTP_STATUS"
        echo "Response body: $RESPONSE_BODY"
        exit 1
    fi

    if ! echo "$RESPONSE_BODY" | jq '.' >/dev/null 2>&1; then
        echo "Error: Invalid JSON response from scans endpoint"
        echo "Raw response: $RESPONSE_BODY"
        exit 1
    else
        echo "$RESPONSE_BODY" | jq '.'
    fi
}

# Main script execution
if [ -z "$1" ]; then
    read -p "Enter path to scan file: " SCAN_FILE
else
    SCAN_FILE=$1
fi

get_auth_token
upload_scan "$SCAN_FILE"
list_scans
