variable "project_name" {
  description = "Short name used to prefix API resources"
  type        = string
}

variable "aws_region" {
  description = "AWS region (used to build the Cognito JWT issuer URL)"
  type        = string
}

variable "user_pool_id" {
  description = "Cognito User Pool ID (JWT authorizer issuer)"
  type        = string
}

variable "user_pool_client_id" {
  description = "Cognito User Pool Client ID (JWT authorizer audience)"
  type        = string
}

variable "functions" {
  description = "Map of Lambda name => { route, env, policy_statements } to deploy behind the API. Lambda source is expected at lambda/<name>/index.mjs."
  type = map(object({
    route = string
    env   = map(string)
    policy_statements = list(object({
      actions   = list(string)
      resources = list(string)
    }))
  }))
}
