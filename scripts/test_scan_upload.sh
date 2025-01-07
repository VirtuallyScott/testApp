#!/bin/bash
set -e

# Get the authentication token
echo "Getting authentication token..."
TOKEN=$(curl -s -X POST -F "username=admin" -F "password=Admin@123" http://localhost:8000/token | jq -r .access_token)

if [ -z "$TOKEN" ]; then
    echo "Failed to get authentication token"
    exit 1
fi

echo "Successfully obtained token"

# Upload a test scan
echo "Uploading test scan..."
curl -s -X POST http://localhost:8000/scans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image_name": "nginx",
    "image_tag": "latest",
    "scanner_type": "trivy",
    "severity_critical": 2,
    "severity_high": 5,
    "severity_medium": 10,
    "severity_low": 15,
    "raw_results": {
      "vulnerabilities": [
        {
          "vulnerability_id": "CVE-2023-1234",
          "severity": "HIGH",
          "package_name": "openssl",
          "installed_version": "1.1.1t-1",
          "fixed_version": "1.1.1u-1"
        }
      ]
    }
  }' | jq '.'

echo -e "\nListing all scans..."
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/scans | jq '.'

if [ $? -ne 0 ]; then
    echo "Error: Failed to list scans"
    exit 1
fi
