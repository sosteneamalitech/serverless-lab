resource "aws_amplify_app" "this" {
  name = "${var.project_name}-frontend"

  environment_variables = {
    VITE_USER_POOL_ID        = var.user_pool_id
    VITE_USER_POOL_CLIENT_ID = var.app_client_id
    VITE_AWS_REGION          = var.aws_region
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.this.id
  branch_name = "main"
}

locals {
  frontend_dir   = "${path.module}/../../../frontend"
  frontend_files = fileset(local.frontend_dir, "src/**")
  frontend_hash  = sha1(join("", [for f in local.frontend_files : filesha1("${local.frontend_dir}/${f}")]))
}

resource "local_file" "env" {
  filename = "${local.frontend_dir}/.env"
  content  = <<-EOT
    VITE_USER_POOL_ID=${var.user_pool_id}
    VITE_USER_POOL_CLIENT_ID=${var.app_client_id}
    VITE_AWS_REGION=${var.aws_region}
    VITE_API_URL=${var.api_url}
  EOT
}

resource "null_resource" "deploy" {
  triggers = {
    frontend_hash = local.frontend_hash
    env_content   = local_file.env.content
  }

  provisioner "local-exec" {
    command = "${path.module}/scripts/deploy.sh ${aws_amplify_app.this.id} ${aws_amplify_branch.main.branch_name} ${var.aws_region} ${local.frontend_dir}"
  }

  depends_on = [local_file.env]
}
