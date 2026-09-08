# Week 3: Infrastructure as Code (IaC) Security

## Overview

Week 3 focuses on securing cloud infrastructure by scanning Infrastructure as Code (IaC) configurations **before** they are deployed. Misconfigurations in cloud environments are a leading cause of data breaches.

## Objectives

- ✅ Write secure Terraform configurations
- ✅ Implement IaC security scanners
- ✅ Detect cloud misconfigurations
- ✅ Establish infrastructure security baselines
- ✅ Automate compliance checking

## Common Cloud Misconfigurations

### Critical Security Issues

1. **Public S3 Buckets**
   - Data exposure risk
   - Compliance violations
   - Privacy breaches

2. **Unencrypted Storage**
   - Data at rest exposure
   - Regulatory non-compliance

3. **Overly Permissive Security Groups**
   - Unauthorized access
   - Network exposure

4. **Missing Logging**
   - Audit trail gaps
   - Incident response difficulties

5. **Hardcoded Credentials**
   - Secret exposure
   - Privilege escalation

## Tools Implemented

### 1. Checkov

**Purpose:** Policy-as-code framework for IaC scanning

**Features:**
- 1000+ built-in policies
- Multi-platform support (Terraform, CloudFormation, Kubernetes)
- Custom policy creation
- SARIF output for GitHub Security

**Installation:**
```bash
pip install checkov
```

**Usage:**
```bash
# Scan Terraform directory
checkov -d terraform/

# Specific framework
checkov -f terraform/main.tf --framework terraform

# Output formats
checkov -d terraform/ -o cli
checkov -d terraform/ -o sarif > results.sarif
checkov -d terraform/ -o json
```

**Example Output:**
```
Passed checks: 15, Failed checks: 3, Skipped checks: 0

Check: CKV_AWS_18: "Ensure S3 bucket has access logging enabled"
	FAILED for resource: aws_s3_bucket.assets
	File: /terraform/main.tf:145-150

Check: CKV_AWS_19: "Ensure S3 bucket has server-side encryption enabled"
	PASSED for resource: aws_s3_bucket.assets
```

**Policy Categories:**
- Networking
- Encryption
- Logging
- IAM
- Public exposure
- Backup and recovery

### 2. TFSec

**Purpose:** Terraform-specific security scanner

**Features:**
- Fast static analysis
- AWS, Azure, GCP support
- Custom check creation
- Integration with CI/CD

**Installation:**
```bash
# Using Docker
docker pull aquasec/tfsec

# Using Homebrew
brew install tfsec
```

**Usage:**
```bash
# Scan directory
tfsec terraform/

# JSON output
tfsec terraform/ --format json

# Specific severity
tfsec terraform/ --minimum-severity HIGH

# Ignore specific checks
tfsec terraform/ --exclude aws-s3-enable-versioning
```

**Example Output:**
```
Result #1 HIGH S3 Bucket does not have logging enabled
──────────────────────────────────────────────────────
  terraform/main.tf:145-150
──────────────────────────────────────────────────────
  145 │ resource "aws_s3_bucket" "assets" {
  146 │   bucket = "secureflow-assets-${var.environment}"
  147 │   
  148 │   tags = {
  149 │     Name = "secureflow-assets"
  150 │   }
      │ 
  Impact: No audit trail for bucket access
  Resolution: Enable S3 bucket logging
```

### 3. Terraform Validate

**Purpose:** Syntax and configuration validation

**Usage:**
```bash
cd terraform/
terraform init -backend=false
terraform validate
terraform fmt -check
```

## Secure Terraform Patterns

### ✅ S3 Bucket Security

#### Encryption at Rest
```hcl
resource "aws_s3_bucket" "secure_bucket" {
  bucket = "my-secure-bucket"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "secure_bucket" {
  bucket = aws_s3_bucket.secure_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "AES256"
      # Or use KMS for additional control
      # sse_algorithm     = "aws:kms"
      # kms_master_key_id = aws_kms_key.main.arn
    }
  }
}
```

#### Block Public Access
```hcl
resource "aws_s3_bucket_public_access_block" "secure_bucket" {
  bucket = aws_s3_bucket.secure_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

#### Versioning
```hcl
resource "aws_s3_bucket_versioning" "secure_bucket" {
  bucket = aws_s3_bucket.secure_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}
```

#### Logging
```hcl
resource "aws_s3_bucket_logging" "secure_bucket" {
  bucket = aws_s3_bucket.secure_bucket.id

  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "s3-access-logs/"
}
```

### ✅ Security Group Best Practices

#### Restrictive Ingress
```hcl
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id

  # ✅ GOOD - Specific ports and protocols
  ingress {
    description = "HTTPS from Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP redirect to HTTPS"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # ❌ BAD - Don't do this
  # ingress {
  #   from_port   = 0
  #   to_port     = 65535
  #   protocol    = "-1"
  #   cidr_blocks = ["0.0.0.0/0"]
  # }
}
```

#### Application Security Group
```hcl
resource "aws_security_group" "app" {
  name        = "app-sg"
  description = "Security group for application tier"
  vpc_id      = aws_vpc.main.id

  # Only allow traffic from load balancer
  ingress {
    description     = "Traffic from ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

#### Database Security Group
```hcl
resource "aws_security_group" "database" {
  name        = "database-sg"
  description = "Security group for RDS database"
  vpc_id      = aws_vpc.main.id

  # Only allow traffic from application tier
  ingress {
    description     = "PostgreSQL from application"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  # No public internet access
  egress {
    description = "Internal traffic only"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["10.0.0.0/16"]  # VPC CIDR only
  }
}
```

### ✅ KMS Encryption

```hcl
resource "aws_kms_key" "main" {
  description             = "KMS key for encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Name        = "app-kms-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "main" {
  name          = "alias/app-${var.environment}"
  target_key_id = aws_kms_key.main.key_id
}
```

### ✅ CloudWatch Logging

```hcl
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/app-${var.environment}"
  retention_in_days = 30  # Compliance requirement

  tags = {
    Name        = "app-logs"
    Environment = var.environment
  }
}
```

### ✅ VPC Configuration

```hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "main-vpc"
  }
}

# Public subnet (for load balancers)
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = false  # Security: no auto public IPs

  tags = {
    Name = "public-subnet"
  }
}

# Private subnet (for application)
resource "aws_subnet" "private" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.10.0/24"

  tags = {
    Name = "private-subnet"
  }
}
```

## Anti-Patterns (What NOT to Do)

### ❌ Public S3 Bucket
```hcl
# DON'T DO THIS
resource "aws_s3_bucket" "bad" {
  bucket = "public-bucket"
  acl    = "public-read"  # DANGEROUS!
}
```

### ❌ Hardcoded Secrets
```hcl
# DON'T DO THIS
resource "aws_db_instance" "bad" {
  username = "admin"
  password = "Password123"  # NEVER hardcode passwords!
}
```

**Instead, use variables:**
```hcl
resource "aws_db_instance" "good" {
  username = var.db_username
  password = var.db_password  # Passed via terraform.tfvars (gitignored)
}
```

### ❌ Open Security Group
```hcl
# DON'T DO THIS
resource "aws_security_group" "bad" {
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # SSH open to the world!
  }
}
```

### ❌ No Encryption
```hcl
# DON'T DO THIS
resource "aws_s3_bucket" "bad" {
  bucket = "unencrypted-bucket"
  # No encryption configuration
}
```

## Pipeline Integration

### GitHub Actions Workflow

```yaml
iac-scan:
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Run Checkov
      uses: bridgecrewio/checkov-action@master
      with:
        directory: terraform/
        framework: terraform
        output_format: cli,sarif

    - name: Run TFSec
      uses: aquasecurity/tfsec-action@v1.0.0
      with:
        working_directory: terraform/
        soft_fail: false  # Fail build on issues

    - name: Terraform Validate
      run: |
        cd terraform
        terraform init -backend=false
        terraform validate
```

## Remediation Guide

### Step-by-Step Fix Process

1. **Review Scan Results**
   ```bash
   checkov -d terraform/ -o cli
   ```

2. **Identify Failed Checks**
   - Check ID (e.g., CKV_AWS_18)
   - Resource affected
   - Severity level

3. **Research Fix**
   - Read check description
   - Review AWS best practices
   - Check Terraform documentation

4. **Apply Fix**
   - Update Terraform configuration
   - Add missing resources
   - Adjust security settings

5. **Re-scan**
   ```bash
   checkov -d terraform/
   tfsec terraform/
   ```

6. **Verify**
   - All checks pass
   - No new issues introduced
   - Terraform still validates

7. **Commit**
   ```bash
   git commit -m "security: enable S3 bucket encryption and logging"
   ```

## Example Remediation

### Before (Insecure)
```hcl
resource "aws_s3_bucket" "app_data" {
  bucket = "app-data-bucket"
}
```

**Checkov Output:**
```
❌ CKV_AWS_18: S3 bucket does not have logging enabled
❌ CKV_AWS_19: S3 bucket does not have encryption enabled
❌ CKV_AWS_21: S3 bucket does not have versioning enabled
❌ CKV_AWS_53: S3 bucket public access not blocked
```

### After (Secure)
```hcl
resource "aws_s3_bucket" "app_data" {
  bucket = "app-data-bucket"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_logging" "app_data" {
  bucket = aws_s3_bucket.app_data.id

  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "app-data-logs/"
}
```

**Checkov Output:**
```
✅ All checks passed!
```

## Compliance Frameworks

### CIS AWS Foundations Benchmark

Checkov includes checks for:
- CIS 1.1: Avoid root account usage
- CIS 2.1: Ensure CloudTrail enabled
- CIS 2.3: S3 bucket access logging
- CIS 2.6: CloudTrail log file validation
- CIS 3.1: VPC flow logs enabled

### NIST, PCI-DSS, HIPAA

TFSec and Checkov support:
- Encryption requirements
- Access control policies
- Audit logging
- Network segmentation

## Best Practices Summary

### General
1. ✅ Scan IaC before every deployment
2. ✅ Use policy-as-code frameworks
3. ✅ Enable all security features by default
4. ✅ Regular compliance audits
5. ✅ Document security decisions

### S3 Buckets
1. ✅ Always enable encryption
2. ✅ Block public access by default
3. ✅ Enable versioning
4. ✅ Configure access logging
5. ✅ Use bucket policies carefully

### Security Groups
1. ✅ Principle of least privilege
2. ✅ Specific ports and protocols
3. ✅ Use security group references
4. ✅ Document each rule
5. ✅ Regular rule audits

### Secrets Management
1. ✅ Never hardcode credentials
2. ✅ Use AWS Secrets Manager
3. ✅ Rotate credentials regularly
4. ✅ Use IAM roles
5. ✅ Enable MFA

## Deliverables

- ✅ Secure Terraform configurations
- ✅ IaC scanning in CI/CD
- ✅ Zero critical misconfigurations
- ✅ Compliance documentation
- ✅ Remediation playbooks

## Next Steps

→ **Week 4:** Dynamic Application Security Testing (DAST)
