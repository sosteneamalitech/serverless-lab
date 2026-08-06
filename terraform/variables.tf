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

variable "ses_sender_email" {
  description = "Email address to verify in SES and send task notifications from"
  type        = string
}

variable "admin_email" {
  description = "Email of an initial Admin user to seed (leave empty to skip and promote someone by hand instead)"
  type        = string
  default     = ""
}

variable "admin_temporary_password" {
  description = "Temporary password for the seeded admin - leave empty to auto-generate one (see the admin_temporary_password output)"
  type        = string
  default     = ""
  sensitive   = true
}
