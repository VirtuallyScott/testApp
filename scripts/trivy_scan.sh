#!/bin/bash
set -e

# Function to get image name
get_image_name() {
    if [ -z "$1" ]; then
        read -p "Enter Docker image name (default: ubuntu-golden): " IMAGE_NAME
        IMAGE_NAME=${IMAGE_NAME:-"ubuntu-golden"}
    else
        IMAGE_NAME=$1
    fi
    echo "Using image: $IMAGE_NAME"
}

# Function to generate output filename
generate_output_filename() {
    DATE=$(date +%m%d%Y)
    # Replace special characters in image name with underscores
    SAFE_IMAGE_NAME=$(echo "$IMAGE_NAME" | tr '/:' '_')
    OUTPUT_FILE="${DATE}-${SAFE_IMAGE_NAME}.json"
    echo "Output will be saved to: $OUTPUT_FILE"
}

# Function to run Trivy scan
run_scan() {
    echo "Starting Trivy scan..."
    trivy image --format json --output "$OUTPUT_FILE" "$IMAGE_NAME"
}

# Main script execution
get_image_name "$1"
generate_output_filename
run_scan

echo "Scan completed successfully. Results saved to $OUTPUT_FILE"
