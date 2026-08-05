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

output "tasks_table_name" {
  value = module.database.table_name
}

output "tasks_table_arn" {
  value = module.database.table_arn
}

output "amplify_app_id" {
  value = module.frontend.amplify_app_id
}
