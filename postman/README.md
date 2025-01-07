# Container Security API Postman Collection

This directory contains Postman collections and environment configurations for testing the Container Security API.

## Files

- `Container_Security_API.postman_collection.json` - Main API collection
- `Container_Security_API.postman_environment.json` - Environment variables

## Collection Contents

The collection includes endpoints for:

1. Authentication
   - Login (POST /token)
   - Get Token Status (GET /token/status)

2. Scan Management
   - Upload Trivy Scan Results (POST /scans)
     - Requires image name, tag, SHA256, scan timestamp and Trivy JSON output
   - List Scans (GET /scans)
   - Get Scan by ID (GET /scans/{id})

3. Health Checks
   - Health Check (GET /health)
   - Readiness Check (GET /ready)
   - Version Info (GET /version)

## Environment Variables

The environment file includes:
- `base_url`: API base URL (default: http://localhost:8000)
- `username`: Login username
- `password`: Login password
- `access_token`: JWT token (automatically set after login)

## Usage

1. Import both the collection and environment files into Postman
2. Select the "Container Security API Environment"
3. The Scans folder has an automatic pre-request script that will fetch a new token
4. You can also manually get a token using the Login request in the Authentication folder
5. All endpoints will automatically use the token stored in the environment

## Running via Newman

```bash
newman run Container_Security_API.postman_collection.json -e Container_Security_API.postman_environment.json
```
