terraform {
  backend "s3" {
    bucket       = "sostene-serverless-lab-tfstate"
    key          = "serverless-lab/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}
