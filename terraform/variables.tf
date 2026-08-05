variable "aws_region" {
  description = "AWS region to deploy the sandbox stack into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short name used to prefix/tag all resources in this stack"
  type        = string
  default     = "task-mgmt"
}

variable "allowed_email_domains" {
  description = "Email domains allowed to sign up via the Cognito pre-signup trigger"
  type        = list(string)
  default     = ["amalitech.com", "amalitechtraining.org"]
}
