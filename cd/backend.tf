# Backend configuration for state management

terraform {
  backend "gcs" {
    bucket = "your-terraform-state-bucket"
    prefix = "three-tier-app"
  }
}
