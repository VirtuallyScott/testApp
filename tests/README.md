# Test-Driven Development (TDD) Suite

This directory contains test suites following TDD principles for our three-tier application.

## Structure

```
tests/
├── unit/           # Unit tests for individual components
│   ├── test_auth.py
│   ├── test_models.py
│   └── test_api.py
├── integration/    # Integration tests between components
└── e2e/            # End-to-end tests for full application flows
```

## Running Tests

### Backend Tests
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_auth.py

# Run with coverage
pytest --cov=src
```

### Frontend Tests
```bash
cd src/web
npm test
```

### API Tests
```bash
newman run postman/collections/development/api_tests.json
```

## Test Categories

### Unit Tests
- Authentication & Authorization
- Database models
- API endpoints
- React components
- Business logic

### Integration Tests
- API-Database interactions
- API-Redis interactions
- Frontend-API communications

### End-to-End Tests
- User workflows
- Security scans
- Performance monitoring

## Coverage Reports

Coverage reports are generated in the `coverage/` directory after running:
```bash
pytest --cov=src --cov-report=html
```

## Continuous Integration

Tests are automatically run on:
- Pull requests
- Merges to main branch
- Nightly builds
