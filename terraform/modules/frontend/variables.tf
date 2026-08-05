variable "project_name" {
  description = "Short name used to prefix frontend resources"
  type        = string
}

variable "user_pool_id" {
  description = "Cognito User Pool ID, exposed to the frontend build as an env var"
  type        = string
}

variable "app_client_id" {
  description = "Cognito App Client ID, exposed to the frontend build as an env var"
  type        = string
}

variable "aws_region" {
  description = "AWS region, exposed to the frontend build as an env var"
  type        = string
}

variable "api_url" {
  description = "API Gateway invoke URL, exposed to the frontend build as an env var (empty until the API module exists)"
  type        = string
  default     = ""
}
