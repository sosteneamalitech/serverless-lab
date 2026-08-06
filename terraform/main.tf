module "cognito" {
  source = "./modules/cognito"

  project_name             = var.project_name
  allowed_email_domains    = var.allowed_email_domains
  admin_email              = var.admin_email
  admin_temporary_password = var.admin_temporary_password
}

module "database" {
  source = "./modules/database"

  project_name = var.project_name
}

locals {
  api_functions = {
    create_task = {
      route = "POST /tasks"
      env   = { TASKS_TABLE = module.database.table_name }
      policy_statements = [
        { actions = ["dynamodb:PutItem"], resources = [module.database.table_arn] },
      ]
    }
    update_task = {
      route = "PATCH /tasks/{taskId}"
      env   = { TASKS_TABLE = module.database.table_name }
      policy_statements = [
        { actions = ["dynamodb:UpdateItem"], resources = [module.database.table_arn] },
      ]
    }
    assign_task = {
      route = "POST /tasks/{taskId}/assign"
      env = {
        TASKS_TABLE  = module.database.table_name
        USER_POOL_ID = module.cognito.user_pool_id
      }
      policy_statements = [
        { actions = ["dynamodb:UpdateItem"], resources = [module.database.table_arn] },
        { actions = ["cognito-idp:AdminGetUser"], resources = [module.cognito.user_pool_arn] },
      ]
    }
    close_task = {
      route = "POST /tasks/{taskId}/close"
      env   = { TASKS_TABLE = module.database.table_name }
      policy_statements = [
        { actions = ["dynamodb:UpdateItem"], resources = [module.database.table_arn] },
      ]
    }
    update_status = {
      route = "PATCH /tasks/{taskId}/status"
      env   = { TASKS_TABLE = module.database.table_name }
      policy_statements = [
        { actions = ["dynamodb:GetItem", "dynamodb:UpdateItem"], resources = [module.database.table_arn] },
      ]
    }
    list_tasks = {
      route = "GET /tasks"
      env   = { TASKS_TABLE = module.database.table_name }
      policy_statements = [
        { actions = ["dynamodb:Scan"], resources = [module.database.table_arn] },
      ]
    }
    list_members = {
      route = "GET /users/members"
      env = {
        USER_POOL_ID      = module.cognito.user_pool_id
        MEMBER_GROUP_NAME = module.cognito.member_group_name
      }
      policy_statements = [
        { actions = ["cognito-idp:ListUsersInGroup"], resources = [module.cognito.user_pool_arn] },
      ]
    }
  }
}

module "api" {
  source = "./modules/api"

  project_name        = var.project_name
  aws_region          = var.aws_region
  user_pool_id        = module.cognito.user_pool_id
  user_pool_client_id = module.cognito.app_client_id
  functions           = local.api_functions
}

module "notifications" {
  source = "./modules/notifications"

  project_name     = var.project_name
  ses_sender_email = var.ses_sender_email
  tasks_stream_arn = module.database.stream_arn
  user_pool_id     = module.cognito.user_pool_id
  user_pool_arn    = module.cognito.user_pool_arn
  admin_email      = var.admin_email
}

module "frontend" {
  source = "./modules/frontend"

  project_name  = var.project_name
  aws_region    = var.aws_region
  user_pool_id  = module.cognito.user_pool_id
  app_client_id = module.cognito.app_client_id
  api_url       = module.api.invoke_url
}
