#!/bin/bash

# Run a Trivy scan against the ubuntu-golden image
trivy image ubuntu-golden --output results.json
