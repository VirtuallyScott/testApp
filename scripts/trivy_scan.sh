#!/bin/bash

# Run a Trivy scan against the ubuntu-golden image
trivy image ubuntu-golden --output results.json
#!/bin/bash
set -e

# Use provided image name or default to 'ubuntu-golden'
if [ -z "$1" ]; then
    IMAGE_NAME="ubuntu-golden"
    echo "No image name provided, using default: $IMAGE_NAME"
else
    IMAGE_NAME=$1
fi
DATE=$(date +%m%d%Y)
OUTPUT_FILE="${DATE}-${IMAGE_NAME}.json"

echo "Scanning image: $IMAGE_NAME"
echo "Output will be saved to: $OUTPUT_FILE"

# Run Trivy scan and save results
trivy image --format json --output $OUTPUT_FILE $IMAGE_NAME

echo "Scan completed successfully. Results saved to $OUTPUT_FILE"
