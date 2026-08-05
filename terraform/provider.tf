provider "aws" {
  region  = var.aws_region
  profile = "sostene.amalitech"

  default_tags {
    tags = {
      Project     = var.project_name
      ManagedBy   = "terraform"
      Environment = "sandbox"
    }
  }
}