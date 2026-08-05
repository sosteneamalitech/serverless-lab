variable "function_name" {
  description = "Lambda function name, also used to derive its IAM role name and log group"
  type        = string
}

variable "source_file" {
  description = "Path to the Lambda's single entrypoint file (e.g. lambda/create_task/index.mjs)"
  type        = string
}

variable "handler" {
  description = "Lambda handler"
  type        = string
  default     = "index.handler"
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs22.x"
}

variable "timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 10
}

variable "memory_size" {
  description = "Lambda memory in MB"
  type        = number
  default     = 128
}

variable "environment_variables" {
  description = "Environment variables for the function"
  type        = map(string)
  default     = {}
}

variable "policy_statements" {
  description = "Extra IAM policy statements this function needs, beyond the CloudWatch Logs permissions every function gets automatically"
  type = list(object({
    actions   = list(string)
    resources = list(string)
  }))
  default = []
}
