#!/bin/bash

# Set error handling
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running or not accessible"
        exit 1
    fi
}

# Build a single service
build_service() {
    local service=$1
    local context=$2
    local dockerfile=${3:-Dockerfile}

    log_info "Building $service service..."
    if ! docker build -t "three-tier-$service:latest" \
        -f "$context/$dockerfile" "$context"; then
        log_error "Failed to build $service service"
        return 1
    fi
    log_info "$service service built successfully"
}

# Main build function
build_all() {
    local services=(
        "web:./src/web"
        "api:./src/api"
        "db:./src/db"
        "redis:./src/redis"
        "test-redis:./src/redis:Dockerfile.test"
    )

    for service_config in "${services[@]}"; do
        IFS=':' read -r service context dockerfile <<< "$service_config"
        if ! build_service "$service" "$context" "$dockerfile"; then
            log_error "Build process failed"
            exit 1
        fi
    done
}

# Cleanup function
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "Build process failed with exit code $exit_code"
    fi
    exit $exit_code
}

# Main execution
main() {
    trap cleanup EXIT

    log_info "Starting build process..."
    check_docker
    
    # Check if running in CI environment
    if [ "${CI:-false}" = "true" ]; then
        log_info "Running in CI environment"
    fi

    build_all
    log_info "All services built successfully!"
}

main "$@"
