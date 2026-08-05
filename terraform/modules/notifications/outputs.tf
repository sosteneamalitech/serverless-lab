output "ses_identity_arn" {
  value = aws_ses_email_identity.sender.arn
}

output "notify_function_name" {
  value = module.notify.function_name
}
