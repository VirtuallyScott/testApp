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

# Parse required fields from Trivy JSON
image_name=$(jq -r '.ArtifactName | split(":")[0]' "${SCAN_FILE}")
image_tag=$(jq -r '.ArtifactName | split(":")[1]' "${SCAN_FILE}")
image_sha256=$(jq -r '.Metadata.ImageID | sub("sha256:"; "")' "${SCAN_FILE}")
scan_timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S+00:00")

# Count vulnerabilities by severity
severity_critical=$(jq -r '[.Results[].Vulnerabilities[] | select(.Severity=="CRITICAL")] | length' "${SCAN_FILE}")
severity_high=$(jq -r '[.Results[].Vulnerabilities[] | select(.Severity=="HIGH")] | length' "${SCAN_FILE}")
severity_medium=$(jq -r '[.Results[].Vulnerabilities[] | select(.Severity=="MEDIUM")] | length' "${SCAN_FILE}")
severity_low=$(jq -r '[.Results[].Vulnerabilities[] | select(.Severity=="LOW")] | length' "${SCAN_FILE}")

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
    "raw_results": $(cat "${SCAN_FILE}")
}
EOF
)

# Upload scan
response=$(curl -s -X POST "${API_URL}/scans" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${payload}")

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
