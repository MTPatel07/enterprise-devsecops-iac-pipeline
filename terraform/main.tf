# Terraform configuration for SecureFlow E-commerce Platform
# This IaC will be scanned by Checkov/TFSec in the CI/CD pipeline

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "secureflow-vpc"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false # Security: Don't auto-assign public IPs

  tags = {
    Name        = "secureflow-public-subnet-${count.index + 1}"
    Environment = var.environment
  }
}

# Private Subnets for database
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "secureflow-private-subnet-${count.index + 1}"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "secureflow-igw"
    Environment = var.environment
  }
}

# Security Group for Application Load Balancer
resource "aws_security_group" "alb" {
  name        = "secureflow-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTPS from Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from Internet (redirect to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "secureflow-alb-sg"
    Environment = var.environment
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs_tasks" {
  name        = "secureflow-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow traffic from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "secureflow-ecs-tasks-sg"
    Environment = var.environment
  }
}

# Security Group for RDS Database
resource "aws_security_group" "rds" {
  name        = "secureflow-rds-sg"
  description = "Security group for RDS PostgreSQL database"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "secureflow-rds-sg"
    Environment = var.environment
  }
}

# S3 Bucket for application assets (with security best practices)
resource "aws_s3_bucket" "assets" {
  bucket = "secureflow-assets-${var.environment}"

  tags = {
    Name        = "secureflow-assets"
    Environment = var.environment
  }
}

# Enable versioning for the S3 bucket
resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption for the S3 bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access to S3 bucket
resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable logging for the S3 bucket
resource "aws_s3_bucket_logging" "assets" {
  bucket = aws_s3_bucket.assets.id

  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "s3-access-logs/"
}

# S3 Bucket for logs
resource "aws_s3_bucket" "logs" {
  bucket = "secureflow-logs-${var.environment}"

  tags = {
    Name        = "secureflow-logs"
    Environment = var.environment
  }
}

# Enable encryption for logs bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access to logs bucket
resource "aws_s3_bucket_public_access_block" "logs" {
  bucket = aws_s3_bucket.logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudWatch Log Group for application logs
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/secureflow-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "secureflow-logs"
    Environment = var.environment
  }
}

# KMS Key for encryption
resource "aws_kms_key" "main" {
  description             = "KMS key for SecureFlow encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Name        = "secureflow-kms"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "main" {
  name          = "alias/secureflow-${var.environment}"
  target_key_id = aws_kms_key.main.key_id
}

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# Outputs
output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "The IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "The IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "s3_assets_bucket" {
  description = "The name of the S3 assets bucket"
  value       = aws_s3_bucket.assets.id
}

output "cloudwatch_log_group" {
  description = "The name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.app.name
}
