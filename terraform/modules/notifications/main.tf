resource "aws_ses_email_identity" "sender" {
  email = var.ses_sender_email
}

resource "aws_ses_email_identity" "admin" {
  count = var.admin_email != "" ? 1 : 0

  email = var.admin_email
}

module "notify" {
  source = "../lambda"

  function_name = "${var.project_name}-notify"
  source_file   = "${path.module}/../../../lambda/notify/index.mjs"

  environment_variables = {
    SES_SENDER_EMAIL = var.ses_sender_email
    USER_POOL_ID     = var.user_pool_id
  }

  policy_statements = [
    {
      actions = [
        "dynamodb:DescribeStream",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:ListStreams",
      ]
      resources = [var.tasks_stream_arn]
    },
    {
      actions   = ["ses:SendEmail", "ses:SendRawEmail"]
      resources = ["*"]
    },
    {
      actions   = ["cognito-idp:AdminGetUser"]
      resources = [var.user_pool_arn]
    },
  ]
}

resource "aws_lambda_event_source_mapping" "tasks_stream" {
  event_source_arn  = var.tasks_stream_arn
  function_name     = module.notify.function_arn
  starting_position = "LATEST"
  batch_size        = 10
}
