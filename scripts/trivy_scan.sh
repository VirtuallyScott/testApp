#!/bin/bash

# Run a Trivy scan against the ubuntu-golden image
trivy image ubuntu-golden --output results.json
#!/bin/bash
set -e

# Check if image name is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <image-name>"
    exit 1
fi

IMAGE_NAME=$1
DATE=$(date +%m%d%Y)
OUTPUT_FILE="${DATE}-${IMAGE_NAME}.json"

echo "Scanning image: $IMAGE_NAME"
echo "Output will be saved to: $OUTPUT_FILE"

# Run Trivy scan and save results
trivy image --format json --output $OUTPUT_FILE $IMAGE_NAME

echo "Scan completed successfully. Results saved to $OUTPUT_FILE"
