variable "project_name" {
  description = "Short name used to prefix auth resources"
  type        = string
}

variable "allowed_email_domains" {
  description = "Email domains allowed to sign up (checked by the pre-signup Lambda trigger)"
  type        = list(string)
}
