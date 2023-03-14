
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    region         = "ap-northeast-1"
    bucket         = "oku3san-tfstate-bucket"
    key            = "slack-shortcuts-test-tfstate"
    dynamodb_table = "tfstate_lock"
    role_arn       = "arn:aws:iam::950007738962:role/terraform"
  }
}

provider "aws" {
  region = "ap-northeast-1"
  assume_role {
    role_arn = "arn:aws:iam::950007738962:role/terraform"
  }
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}


data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_lambda_function" "test_lambda" {
  # If the file is not in the current working directory you will need to include a
  # path.module in the filename.
  filename      = "./../lambda/src/lambda_function.zip"
  function_name = "lambda_function_name"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "app.handler"

  runtime = "nodejs18.x"

  environment {
    variables = {
      foo = "bar"
    }
  }
}
