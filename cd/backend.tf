# Backend configuration for state management

terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "three-tier-app/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
