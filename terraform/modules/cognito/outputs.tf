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
