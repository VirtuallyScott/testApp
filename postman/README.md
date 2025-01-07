# Container Security API Postman Collection

This directory contains Postman collections and environment configurations for testing the Container Security API.

## Files

- `Container_Security_API.postman_collection.json` - Main API collection
- `Container_Security_API.postman_environment.json` - Environment variables

## Collection Contents

The collection includes endpoints for:

1. Authentication
   - Login (POST /token)

2. Scan Management
   - Upload Scan Results (POST /scans)
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
3. Execute the Login request first to get an access token
4. Use other endpoints as needed - they'll automatically use the token

## Running via Newman

```bash
newman run Container_Security_API.postman_collection.json -e Container_Security_API.postman_environment.json
```
