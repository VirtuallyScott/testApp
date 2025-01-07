# Scripts Directory

This directory contains utility scripts for interacting with the Container Security API.

## Authentication Scripts

### get_token.sh
Gets an authentication token from the API.

```bash
# Basic usage with default credentials
./get_token.sh

# With custom credentials
API_URL=http://custom-url:8000 USERNAME=myuser PASSWORD=mypass ./get_token.sh
```

Environment variables:
- `API_URL`: API base URL (default: http://localhost:8000)
- `USERNAME`: Login username (default: admin)
- `PASSWORD`: Login password (default: Admin@123)

Returns the access token on success, or error message on failure.

### upload_scan.sh
Uploads a Trivy scan result JSON file to the API.

```bash
# Upload scan with automatic token retrieval
./upload_scan.sh -f /path/to/trivy-scan.json

# Upload scan with existing token
./upload_scan.sh -f /path/to/trivy-scan.json -t YOUR_TOKEN
```

Options:
- `-f`: Path to Trivy JSON scan file (required)
- `-t`: Auth token (optional - will get new token if not provided)
- `-h`: Show help message

Environment variables:
- `API_URL`: API base URL (default: http://localhost:8000)

Returns success/failure message and the API response.

## Example Usage

1. Get a token:
```bash
token=$(./get_token.sh)
```

2. Upload a scan using the token:
```bash
./upload_scan.sh -f trivy-scan.json -t "$token"
```

3. Upload multiple scans:
```bash
for scan in scans/*.json; do
    ./upload_scan.sh -f "$scan"
done
```
