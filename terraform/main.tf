module "cognito" {
  source = "./modules/cognito"

  project_name          = var.project_name
  allowed_email_domains = var.allowed_email_domains
}

module "database" {
  source = "./modules/database"

  project_name = var.project_name
}

module "frontend" {
  source = "./modules/frontend"

  project_name  = var.project_name
  aws_region    = var.aws_region
  user_pool_id  = module.cognito.user_pool_id
  app_client_id = module.cognito.app_client_id
}
