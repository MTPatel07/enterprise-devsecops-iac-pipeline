# Deployment Guide

This guide covers deploying SecureShop to production with security best practices.

## Pre-Deployment Checklist

### Security Scans
- [ ] All SAST scans passing (SonarQube, CodeQL)
- [ ] No critical/high SCA vulnerabilities (npm audit, Snyk)
- [ ] Container scans clean (Trivy)
- [ ] IaC scans passing (Checkov, TFSec)
- [ ] DAST scans completed (OWASP ZAP)

### Code Quality
- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] TypeScript compilation successful
- [ ] No ESLint errors
- [ ] Documentation updated

### Infrastructure
- [ ] Terraform configurations validated
- [ ] Environment variables configured
- [ ] Secrets stored securely (AWS Secrets Manager)
- [ ] Database backups configured
- [ ] Monitoring and alerting set up

## Deployment Options

### Option 1: AWS ECS (Recommended)

#### Prerequisites
- AWS account with appropriate permissions
- AWS CLI configured
- Terraform installed
- Docker installed

#### Steps

1. **Configure AWS Credentials**
   ```bash
   aws configure
   # Enter AWS Access Key ID
   # Enter AWS Secret Access Key
   # Default region: us-east-1
   ```

2. **Set Up Environment Variables**
   ```bash
   # Create terraform.tfvars
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   
   # Edit with your values
   vim terraform.tfvars
   ```

3. **Deploy Infrastructure**
   ```bash
   # Initialize Terraform
   terraform init
   
   # Review changes
   terraform plan
   
   # Apply infrastructure
   terraform apply
   ```

4. **Build and Push Container**
   ```bash
   # Build production image
   docker build -t secureshop:latest .
   
   # Tag for ECR
   aws ecr get-login-password --region us-east-1 | \
     docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   docker tag secureshop:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/secureshop:latest
   
   # Push to ECR
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/secureshop:latest
   ```

5. **Deploy to ECS**
   ```bash
   # Update ECS service
   aws ecs update-service \
     --cluster secureshop-cluster \
     --service secureshop-service \
     --force-new-deployment
   ```

6. **Verify Deployment**
   ```bash
   # Check health endpoint
   curl https://your-domain.com/api/health
   
   # Expected: {"status":"healthy"}
   ```

### Option 2: Docker Compose (Development/Staging)

1. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start Services**
   ```bash
   docker-compose up -d
   ```

3. **Apply Database Schema**
   ```bash
   docker-compose exec app npx drizzle-kit push
   ```

4. **Seed Database (Optional)**
   ```bash
   docker-compose exec app npx tsx src/db/seed.ts
   ```

5. **Verify**
   ```bash
   curl http://localhost:3000/api/health
   ```

### Option 3: Vercel (Frontend Only)

**Note:** Vercel deployment requires external database hosting.

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment**
   ```bash
   vercel env add DATABASE_URL
   # Enter your database connection string
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## Post-Deployment Steps

### 1. Database Setup

```bash
# Connect to production database
psql $DATABASE_URL

# Verify schema
\dt

# Check tables
SELECT * FROM products LIMIT 5;
```

### 2. SSL/TLS Configuration

```bash
# Using AWS Certificate Manager (ACM)
aws acm request-certificate \
  --domain-name secureshop.example.com \
  --validation-method DNS

# Configure ALB listener for HTTPS
# (Done via Terraform or AWS Console)
```

### 3. DNS Configuration

```bash
# Point domain to load balancer
# Example Route 53 record:
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://dns-change.json
```

### 4. Enable Monitoring

**CloudWatch Alarms:**
```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name secureshop-high-cpu \
  --alarm-description "CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

**Application Monitoring:**
- Set up logging aggregation (CloudWatch Logs)
- Configure error tracking (Sentry, Rollbar)
- Enable APM (New Relic, DataDog)

### 5. Security Hardening

**WAF Configuration:**
```bash
# Create WAF web ACL
aws wafv2 create-web-acl \
  --name secureshop-waf \
  --scope REGIONAL \
  --default-action Block={} \
  --rules file://waf-rules.json
```

**Enable GuardDuty:**
```bash
aws guardduty create-detector --enable
```

**Configure Security Groups:**
```hcl
# Ensure security groups follow least privilege
# (Already configured in Terraform)
```

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Application
NODE_ENV=production
PORT=3000

# Optional: External Services
STRIPE_API_KEY=sk_live_...
SENDGRID_API_KEY=SG...
```

### Storing Secrets Securely

**AWS Secrets Manager:**
```bash
# Create secret
aws secretsmanager create-secret \
  --name secureshop/database \
  --secret-string '{"username":"dbuser","password":"securepass"}'

# Retrieve in application
aws secretsmanager get-secret-value \
  --secret-id secureshop/database
```

**GitHub Secrets (CI/CD):**
1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `SONAR_TOKEN`
   - `SNYK_TOKEN`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

## Rollback Procedure

### Quick Rollback (ECS)

```bash
# List task definitions
aws ecs list-task-definitions --family-prefix secureshop

# Rollback to previous version
aws ecs update-service \
  --cluster secureshop-cluster \
  --service secureshop-service \
  --task-definition secureshop:previous-version
```

### Database Rollback

```bash
# Restore from backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier secureshop-restored \
  --db-snapshot-identifier secureshop-backup-2024-01-15
```

## Monitoring and Alerting

### Health Checks

```bash
# API health check
curl https://secureshop.com/api/health

# Database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Container health
docker ps --filter "health=healthy"
```

### Log Monitoring

```bash
# View application logs
aws logs tail /ecs/secureshop-production --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /ecs/secureshop-production \
  --filter-pattern "ERROR"
```

### Performance Monitoring

```bash
# ECS service metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=secureshop-service \
  --start-time 2024-01-15T00:00:00Z \
  --end-time 2024-01-15T23:59:59Z \
  --period 3600 \
  --statistics Average
```

## Scaling

### Horizontal Scaling (ECS)

```bash
# Update desired count
aws ecs update-service \
  --cluster secureshop-cluster \
  --service secureshop-service \
  --desired-count 5
```

### Auto Scaling

```hcl
# Configure in Terraform
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}
```

### Database Scaling

```bash
# Increase RDS instance size
aws rds modify-db-instance \
  --db-instance-identifier secureshop-db \
  --db-instance-class db.t3.large \
  --apply-immediately
```

## Backup and Recovery

### Database Backups

```bash
# Manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier secureshop-db \
  --db-snapshot-identifier secureshop-manual-$(date +%Y%m%d)

# Automated backups (configured in Terraform)
# Retention period: 7 days
```

### Application Backups

```bash
# Export environment configuration
aws ecs describe-task-definition \
  --task-definition secureshop:latest > task-definition-backup.json

# Export Terraform state
terraform state pull > terraform-state-backup.json
```

## Disaster Recovery

### Recovery Time Objective (RTO)
- **Critical services:** < 1 hour
- **Full system recovery:** < 4 hours

### Recovery Point Objective (RPO)
- **Database:** < 5 minutes (automated backups)
- **Configuration:** < 1 minute (version controlled)

### DR Procedure

1. **Assess Impact**
   - Identify affected services
   - Determine root cause

2. **Activate DR Plan**
   - Notify stakeholders
   - Assemble incident response team

3. **Restore Services**
   ```bash
   # Restore from snapshot
   terraform apply -var="db_snapshot_id=snap-12345"
   
   # Deploy last known good version
   aws ecs update-service --task-definition secureshop:stable
   ```

4. **Verify Recovery**
   - Run health checks
   - Verify data integrity
   - Test critical user flows

5. **Post-Mortem**
   - Document incident
   - Identify preventive measures
   - Update runbooks

## Maintenance Windows

### Scheduled Maintenance

```bash
# 1. Notify users
# 2. Enable maintenance mode
# 3. Perform updates
aws ecs update-service --service secureshop-service --desired-count 0

# Apply database migrations
npx drizzle-kit push

# Deploy new version
aws ecs update-service --service secureshop-service --desired-count 3

# 4. Verify functionality
# 5. Disable maintenance mode
```

### Zero-Downtime Deployment

```bash
# Blue-green deployment
# 1. Deploy new version alongside current
# 2. Run health checks on new version
# 3. Switch traffic to new version
# 4. Monitor for issues
# 5. Decommission old version
```

## Security Compliance

### Regular Security Tasks

**Daily:**
- Review CloudWatch logs for anomalies
- Check security alerts

**Weekly:**
- Run DAST scans
- Review dependency updates
- Patch management

**Monthly:**
- Full security audit
- Penetration testing
- Compliance review

**Quarterly:**
- Disaster recovery drill
- Security training
- Infrastructure review

## Troubleshooting

### Common Issues

**Issue: Application won't start**
```bash
# Check logs
aws logs tail /ecs/secureshop-production --follow

# Common causes:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

**Issue: High CPU usage**
```bash
# Scale up
aws ecs update-service --desired-count 5

# Investigate
# - Check for slow queries
# - Review application metrics
# - Check for memory leaks
```

**Issue: Database connection errors**
```bash
# Verify connection
psql $DATABASE_URL -c "SELECT 1"

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Verify credentials
aws secretsmanager get-secret-value --secret-id database-creds
```

## Support and Resources

- **Documentation:** https://github.com/yourorg/secureshop/wiki
- **Issue Tracker:** https://github.com/yourorg/secureshop/issues
- **Security:** security@secureshop.example.com
- **On-Call:** Use PagerDuty escalation policy

---

**Last Updated:** 2026-01-15  
**Next Review:** 2026-02-15
