#!/bin/bash

# Try to get version from git
VERSION=$(git describe --tags 2>/dev/null || echo "0.0.1")
echo $VERSION
