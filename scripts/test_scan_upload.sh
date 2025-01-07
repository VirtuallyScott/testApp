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

# Function to parse Trivy scan results
parse_scan_results() {
    local scan_file=$1
    
    # Parse required fields from Trivy JSON
    image_name=$(jq -r '.ArtifactName // empty' "$scan_file")
    image_tag=$(jq -r '.ArtifactName | if contains(":") then split(":")[1] else "latest" end' "$scan_file")
    image_sha256=$(jq -r '.Metadata.ImageID | if startswith("sha256:") then sub("sha256:"; "") else . end // empty' "$scan_file")
    scan_timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S+00:00")
    
    # Count vulnerabilities by severity
    severity_critical=$(jq -r '[.Results[].Vulnerabilities[]? | select(.Severity=="CRITICAL")] | length // 0' "$scan_file")
    severity_high=$(jq -r '[.Results[].Vulnerabilities[]? | select(.Severity=="HIGH")] | length // 0' "$scan_file")
    severity_medium=$(jq -r '[.Results[].Vulnerabilities[]? | select(.Severity=="MEDIUM")] | length // 0' "$scan_file")
    severity_low=$(jq -r '[.Results[].Vulnerabilities[]? | select(.Severity=="LOW")] | length // 0' "$scan_file")
    
    # Validate required fields
    if [ -z "$image_name" ] || [ -z "$image_sha256" ]; then
        echo "Error: Missing required fields from scan results"
        echo "image_name: $image_name"
        echo "image_sha256: $image_sha256"
        exit 1
    fi
    
    # Create JSON payload
    payload=$(cat <<EOF
{
    "image_name": "${image_name}",
    "image_tag": "${image_tag}",
    "image_sha256": "${image_sha256}",
    "scan_timestamp": "${scan_timestamp}",
    "severity_critical": ${severity_critical:-0},
    "severity_high": ${severity_high:-0},
    "severity_medium": ${severity_medium:-0},
    "severity_low": ${severity_low:-0},
    "raw_results": $(cat "$scan_file")
}
EOF
    )
    
    echo "$payload"
}

# Function to upload scan
upload_scan() {
    local scan_file=$1
    echo "Uploading scan from file: $scan_file..."
    
    if [ ! -f "$scan_file" ]; then
        echo "Error: Scan file not found: $scan_file"
        exit 1
    fi
    
    # Parse and format the scan results
    payload=$(parse_scan_results "$scan_file")
    
    # Upload the scan
    response=$(curl -s -X POST "$API_URL/api/v1/scans" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$payload")
    
    # Check response
    if echo "$response" | jq -e '.id' >/dev/null 2>&1; then
        echo "Scan uploaded successfully"
        echo "$response" | jq '.'
    else
        echo "Failed to upload scan"
        echo "$response"
        exit 1
    fi
}

# Function to list all scans
list_scans() {
    echo -e "\nListing all scans..."
    response=$(curl -s -X GET \
      -H "Authorization: Bearer $TOKEN" \
      -H "Accept: application/json" \
      "$API_URL/api/v1/scans")
    
    if echo "$response" | jq -e '. | length' >/dev/null 2>&1; then
        echo "$response" | jq '.'
    else
        echo "Error: Invalid response from API"
        echo "$response"
        exit 1
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
