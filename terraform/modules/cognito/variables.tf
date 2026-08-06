variable "project_name" {
  description = "Short name used to prefix auth resources"
  type        = string
}

variable "allowed_email_domains" {
  description = "Email domains allowed to sign up (checked by the pre-signup Lambda trigger)"
  type        = list(string)
}

variable "admin_email" {
  description = "Email of an initial Admin user to seed (leave empty to skip and promote someone by hand instead)"
  type        = string
  default     = ""
}

variable "admin_temporary_password" {
  description = "Temporary password for the seeded admin (must satisfy the pool's password policy) - they're forced to change it on first login"
  type        = string
  default     = ""
  sensitive   = true
}
