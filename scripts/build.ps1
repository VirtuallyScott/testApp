# Set error handling
$ErrorActionPreference = "Stop"

# Colors for output
$Colors = @{
    Red = [System.ConsoleColor]::Red
    Green = [System.ConsoleColor]::Green
    Yellow = [System.ConsoleColor]::Yellow
}

# Logging functions
function Write-LogInfo {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Green
}

function Write-LogWarn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor $Colors.Yellow
}

function Write-LogError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

# Check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-LogError "Docker is not running or not accessible"
        return $false
    }
}

# Build a single service
function Build-Service {
    param(
        [string]$Service,
        [string]$Context,
        [string]$Dockerfile = "Dockerfile"
    )
    
    Write-LogInfo "Building $Service service..."
    try {
        docker build -t "three-tier-$Service`:latest" -f "$Context/$Dockerfile" $Context
        if ($LASTEXITCODE -eq 0) {
            Write-LogInfo "$Service service built successfully"
            return $true
        }
        Write-LogError "Failed to build $Service service"
        return $false
    }
    catch {
        Write-LogError "Error building $Service service: $_"
        return $false
    }
}

# Main build function
function Build-All {
    $services = @(
        @{Service="web"; Context="./src/web"; Dockerfile="Dockerfile"},
        @{Service="api"; Context="./src/api"; Dockerfile="Dockerfile"},
        @{Service="db"; Context="./src/db"; Dockerfile="Dockerfile"},
        @{Service="redis"; Context="./src/redis"; Dockerfile="Dockerfile"},
        @{Service="test-redis"; Context="./src/redis"; Dockerfile="Dockerfile.test"}
    )

    foreach ($svc in $services) {
        if (-not (Build-Service -Service $svc.Service -Context $svc.Context -Dockerfile $svc.Dockerfile)) {
            Write-LogError "Build process failed"
            exit 1
        }
    }
}

# Main execution
try {
    Write-LogInfo "Starting build process..."
    
    if (-not (Test-Docker)) {
        exit 1
    }
    
    # Check if running in CI environment
    if ($env:CI -eq "true") {
        Write-LogInfo "Running in CI environment"
    }

    Build-All
    Write-LogInfo "All services built successfully!"
}
catch {
    Write-LogError "Build process failed: $_"
    exit 1
}
