output "invoke_url" {
  value = aws_apigatewayv2_stage.default.invoke_url
}

output "function_names" {
  value = { for k, m in module.fn : k => m.function_name }
}
