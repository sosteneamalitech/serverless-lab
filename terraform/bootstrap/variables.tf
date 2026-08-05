variable "aws_region" {
  description = "AWS region for the state bucket and lock table"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used to prefix bootstrap resources"
  type        = string
  default     = "serverless-lab"
}
