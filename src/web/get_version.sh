#!/bin/bash

# Try to get version from git
VERSION=$(git describe --tags --always 2>/dev/null || echo "0.0.1")

# If no tags exist, use commit hash
if [[ $VERSION == "0.0.1" ]]; then
  VERSION=$(git rev-parse --short HEAD 2>/dev/null || echo "0.0.1")
fi

# Remove 'v' prefix if present
VERSION=${VERSION#v}

echo $VERSION
