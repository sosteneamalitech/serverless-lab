locals {
  functions = {
    create_task = {
      route = "POST /tasks"
      env   = { TASKS_TABLE = var.tasks_table_name }
      policy_statements = [
        { actions = ["dynamodb:PutItem"], resources = [var.tasks_table_arn] },
      ]
    }
    update_task = {
      route = "PATCH /tasks/{taskId}"
      env   = { TASKS_TABLE = var.tasks_table_name }
      policy_statements = [
        { actions = ["dynamodb:UpdateItem"], resources = [var.tasks_table_arn] },
      ]
    }
    assign_task = {
      route = "POST /tasks/{taskId}/assign"
      env = {
        TASKS_TABLE  = var.tasks_table_name
        USER_POOL_ID = var.user_pool_id
      }
      policy_statements = [
        { actions = ["dynamodb:UpdateItem"], resources = [var.tasks_table_arn] },
        { actions = ["cognito-idp:AdminGetUser"], resources = [var.user_pool_arn] },
      ]
    }
    close_task = {
      route = "POST /tasks/{taskId}/close"
      env   = { TASKS_TABLE = var.tasks_table_name }
      policy_statements = [
        { actions = ["dynamodb:UpdateItem"], resources = [var.tasks_table_arn] },
      ]
    }
    update_status = {
      route = "PATCH /tasks/{taskId}/status"
      env   = { TASKS_TABLE = var.tasks_table_name }
      policy_statements = [
        { actions = ["dynamodb:GetItem", "dynamodb:UpdateItem"], resources = [var.tasks_table_arn] },
      ]
    }
    list_tasks = {
      route = "GET /tasks"
      env   = { TASKS_TABLE = var.tasks_table_name }
      policy_statements = [
        { actions = ["dynamodb:Scan"], resources = [var.tasks_table_arn] },
      ]
    }
    list_members = {
      route = "GET /users/members"
      env = {
        USER_POOL_ID      = var.user_pool_id
        MEMBER_GROUP_NAME = var.member_group_name
      }
      policy_statements = [
        { actions = ["cognito-idp:ListUsersInGroup"], resources = [var.user_pool_arn] },
      ]
    }
  }
}

module "fn" {
  source   = "../lambda"
  for_each = local.functions

  function_name         = "${var.project_name}-${replace(each.key, "_", "-")}"
  source_file           = "${path.module}/../../../lambda/${each.key}/index.mjs"
  environment_variables = each.value.env
  policy_statements     = each.value.policy_statements
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["*"]
  }
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.http_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.project_name}-cognito-authorizer"

  jwt_configuration {
    audience = [var.user_pool_client_id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.user_pool_id}"
  }
}

resource "aws_apigatewayv2_integration" "fn" {
  for_each = local.functions

  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = module.fn[each.key].invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "fn" {
  for_each = local.functions

  api_id             = aws_apigatewayv2_api.http_api.id
  route_key          = each.value.route
  target             = "integrations/${aws_apigatewayv2_integration.fn[each.key].id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "allow_apigw_invoke" {
  for_each = local.functions

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = module.fn[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
