variable "project_name" {
  description = "Short name used to prefix notification resources"
  type        = string
}

variable "ses_sender_email" {
  description = "Email address to verify in SES and send notifications from"
  type        = string
}

variable "tasks_stream_arn" {
  description = "DynamoDB Stream ARN on the Tasks table"
  type        = string
}

variable "user_pool_id" {
  description = "Cognito User Pool ID (used to check if a recipient is deactivated)"
  type        = string
}

variable "user_pool_arn" {
  description = "Cognito User Pool ARN (scopes the notify Lambda's AdminGetUser permission)"
  type        = string
}
