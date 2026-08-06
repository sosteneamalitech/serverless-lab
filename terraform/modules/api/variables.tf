variable "project_name" {
  description = "Short name used to prefix API resources"
  type        = string
}

variable "aws_region" {
  description = "AWS region (used to build the Cognito JWT issuer URL)"
  type        = string
}

variable "tasks_table_name" {
  description = "Name of the DynamoDB Tasks table"
  type        = string
}

variable "tasks_table_arn" {
  description = "ARN of the DynamoDB Tasks table"
  type        = string
}

variable "user_pool_id" {
  description = "Cognito User Pool ID (JWT authorizer issuer, and AdminGetUser checks)"
  type        = string
}

variable "user_pool_arn" {
  description = "Cognito User Pool ARN (scopes assign_task's AdminGetUser permission)"
  type        = string
}

variable "user_pool_client_id" {
  description = "Cognito User Pool Client ID (JWT authorizer audience)"
  type        = string
}

variable "member_group_name" {
  description = "Cognito user group name for members (used by list_members)"
  type        = string
}
