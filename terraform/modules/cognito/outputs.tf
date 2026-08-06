output "user_pool_id" {
  value = aws_cognito_user_pool.this.id
}

output "user_pool_arn" {
  value = aws_cognito_user_pool.this.arn
}

output "app_client_id" {
  value = aws_cognito_user_pool_client.this.id
}

output "admin_group_name" {
  value = aws_cognito_user_group.admin.name
}

output "member_group_name" {
  value = aws_cognito_user_group.member.name
}

output "admin_temporary_password" {
  value       = var.admin_email != "" ? aws_cognito_user.admin[0].temporary_password : null
  sensitive   = true
  description = "Temporary password for the seeded admin user (only set if admin_email was provided) - sign in with this and set a permanent password"
}
