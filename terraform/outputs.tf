output "user_pool_id" {
  value = module.cognito.user_pool_id
}

output "user_pool_arn" {
  value = module.cognito.user_pool_arn
}

output "app_client_id" {
  value = module.cognito.app_client_id
}

output "admin_group_name" {
  value = module.cognito.admin_group_name
}

output "member_group_name" {
  value = module.cognito.member_group_name
}

output "admin_temporary_password" {
  value       = module.cognito.admin_temporary_password
  sensitive   = true
  description = "Run `terraform output -raw admin_temporary_password` to reveal it, if admin_email was set"
}

output "tasks_table_name" {
  value = module.database.table_name
}

output "tasks_table_arn" {
  value = module.database.table_arn
}

output "amplify_app_id" {
  value = module.frontend.amplify_app_id
}

output "amplify_app_url" {
  value = module.frontend.amplify_app_url
}

output "api_invoke_url" {
  value = module.api.invoke_url
}

output "ses_identity_arn" {
  value = module.notifications.ses_identity_arn
}
