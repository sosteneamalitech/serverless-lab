locals {
  admin_group_name  = "Admin"
  member_group_name = "Member"
}

module "pre_signup" {
  source = "../lambda"

  function_name = "${var.project_name}-pre-signup"
  source_file   = "${path.module}/../../../lambda/pre_signup/index.mjs"

  environment_variables = {
    ALLOWED_EMAIL_DOMAINS = join(",", var.allowed_email_domains)
  }
}

resource "aws_lambda_permission" "allow_cognito_invoke_pre_signup" {
  statement_id  = "AllowCognitoInvokePreSignup"
  action        = "lambda:InvokeFunction"
  function_name = module.pre_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.this.arn
}

module "post_confirmation" {
  source = "../lambda"

  function_name = "${var.project_name}-post-confirmation"
  source_file   = "${path.module}/../../../lambda/post_confirmation/index.mjs"

  environment_variables = {
    MEMBER_GROUP_NAME = local.member_group_name
  }

  policy_statements = [
    {
      actions   = ["cognito-idp:AdminAddUserToGroup"]
      resources = [aws_cognito_user_pool.this.arn]
    },
    {
      actions   = ["ses:VerifyEmailIdentity"]
      resources = ["*"]
    }
  ]
}

resource "aws_lambda_permission" "allow_cognito_invoke_post_confirmation" {
  statement_id  = "AllowCognitoInvokePostConfirmation"
  action        = "lambda:InvokeFunction"
  function_name = module.post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.this.arn
}

resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-user-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  lambda_config {
    pre_sign_up       = module.pre_signup.function_arn
    post_confirmation = module.post_confirmation.function_arn
  }
}

resource "aws_cognito_user_pool_client" "this" {
  name         = "${var.project_name}-client"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}

resource "aws_cognito_user_group" "admin" {
  name         = local.admin_group_name
  user_pool_id = aws_cognito_user_pool.this.id
}

resource "aws_cognito_user_group" "member" {
  name         = local.member_group_name
  user_pool_id = aws_cognito_user_pool.this.id
}

resource "random_password" "admin" {
  count = var.admin_email != "" && var.admin_temporary_password == "" ? 1 : 0

  length      = 16
  special     = false
  min_upper   = 2
  min_lower   = 2
  min_numeric = 2
}

resource "aws_cognito_user" "admin" {
  count = var.admin_email != "" ? 1 : 0

  user_pool_id       = aws_cognito_user_pool.this.id
  username           = var.admin_email
  temporary_password = var.admin_temporary_password != "" ? var.admin_temporary_password : random_password.admin[0].result
  message_action     = "SUPPRESS"

  attributes = {
    email          = var.admin_email
    email_verified = "true"
  }

  lifecycle {
    ignore_changes = [temporary_password]
  }
}

resource "aws_cognito_user_in_group" "admin" {
  count = var.admin_email != "" ? 1 : 0

  user_pool_id = aws_cognito_user_pool.this.id
  group_name   = aws_cognito_user_group.admin.name
  username     = aws_cognito_user.admin[0].username
}
