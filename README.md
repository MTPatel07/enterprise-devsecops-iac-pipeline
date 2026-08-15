# 🔒 SecureShop - Enterprise DevSecOps E-commerce Platform

![DevSecOps Pipeline](https://img.shields.io/badge/DevSecOps-Enabled-green)
![Security Scanning](https://img.shields.io/badge/Security-Multi--Layer-blue)
![IaC](https://img.shields.io/badge/IaC-Terraform-purple)

## 📋 Executive Summary

SecureShop is a comprehensive e-commerce platform built with **security-first principles** and automated DevSecOps practices. This project demonstrates enterprise-grade security integration across the entire software development lifecycle (SDLC), from code commit to cloud deployment.

The platform implements a **multi-layered security approach** integrating:
- ✅ **SAST** - Static Application Security Testing
- ✅ **SCA** - Software Composition Analysis  
- ✅ **Container Security** - Docker image vulnerability scanning
- ✅ **IaC Security** - Infrastructure as Code misconfiguration detection
- ✅ **DAST** - Dynamic Application Security Testing

## 🎯 Business Objectives

In the highly competitive e-commerce sector, security breaches can result in:
- Loss of customer trust and brand reputation
- Financial penalties and compliance violations
- Exposure of sensitive customer data (PII, payment information)

**SecureShop addresses these risks by:**
1. **Shifting security left** - catching vulnerabilities before production
2. **Automating security gates** - blocking insecure code from deployment
3. **Continuous monitoring** - ongoing vulnerability assessment
4. **Infrastructure hardening** - secure-by-default cloud configurations

## 🏗️ Architecture Overview

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Next.js 16 (App Router) | Modern React framework with SSR |
| Backend API | Next.js API Routes | Serverless API endpoints |
| Database | PostgreSQL 16 | Relational database with Drizzle ORM |
| Containerization | Docker | Multi-stage builds for security |
| IaC | Terraform | Cloud infrastructure provisioning |
| CI/CD | GitHub Actions | Automated DevSecOps pipeline |

### Security Tools Integration

| Tool | Type | Week | Purpose |
|------|------|------|---------|
| **SonarQube** | SAST | 1 | Code quality and security analysis |
| **CodeQL** | SAST | 1 | GitHub's semantic code analysis |
| **npm audit** | SCA | 2 | JavaScript dependency vulnerabilities |
| **Snyk** | SCA | 2 | Advanced dependency scanning |
| **Trivy** | Container | 2 | Docker image CVE scanning |
| **Docker Scout** | Container | 2 | Container security insights |
| **Checkov** | IaC | 3 | Terraform misconfiguration detection |
| **TFSec** | IaC | 3 | Terraform security scanner |
| **OWASP ZAP** | DAST | 4 | Runtime vulnerability testing |

## 📂 Project Structure

```
secureshop/
├── .github/
│   └── workflows/
│       └── devsecops-pipeline.yml    # Main CI/CD pipeline
├── .zap/
│   └── rules.tsv                      # DAST scanning rules
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.ts        # Health check endpoint
│   │   │   ├── products/route.ts      # Product CRUD operations
│   │   │   └── orders/route.ts        # Order management
│   │   ├── page.tsx                   # E-commerce storefront UI
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Global styles
│   └── db/
│       ├── index.ts                   # Database connection
│       ├── schema.ts                  # Database schema (Drizzle)
│       └── seed.ts                    # Sample data seeding
├── terraform/
│   ├── main.tf                        # Main infrastructure config
│   ├── variables.tf                   # Terraform variables
│   └── terraform.tfvars.example       # Example configuration
├── Dockerfile                         # Multi-stage Docker build
├── .dockerignore                      # Docker build exclusions
├── sonar-project.properties           # SonarQube configuration
├── package.json                       # Node.js dependencies
└── README.md                          # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose
- PostgreSQL 16 (or use Docker)
- Git

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/secureshop.git
cd secureshop
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Start PostgreSQL (using Docker)**
```bash
docker run -d \
  --name postgres-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app_db \
  -p 5432:5432 \
  postgres:16-alpine
```

5. **Apply database schema**
```bash
npm run db:push
```

6. **Seed the database (optional)**
```bash
npx tsx src/db/seed.ts
```

7. **Run the development server**
```bash
npm run dev
```

8. **Access the application**
- Frontend: http://localhost:3000
- Health API: http://localhost:3000/api/health

## 🔐 Security Features

### 1. Application Security

**Input Validation**
- All API endpoints validate input data
- Type safety with TypeScript
- SQL injection prevention via parameterized queries (Drizzle ORM)

**Authentication & Authorization** (Future Enhancement)
- Password hashing with bcrypt
- Role-based access control (RBAC)
- JWT token authentication

**Secure Headers**
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options

### 2. Infrastructure Security

**Terraform Best Practices**
- ✅ S3 buckets with encryption enabled
- ✅ S3 public access blocked
- ✅ VPC with public/private subnet separation
- ✅ Security groups with least privilege
- ✅ KMS encryption with key rotation
- ✅ CloudWatch logging enabled
- ✅ No hardcoded credentials

**Common Misconfigurations Prevented**
- ❌ Public S3 buckets
- ❌ Unencrypted storage
- ❌ Open security groups (0.0.0.0/0 SSH)
- ❌ Disabled logging
- ❌ Missing encryption at rest

### 3. Container Security

**Dockerfile Security**
- Multi-stage builds to minimize image size
- Non-root user execution
- Alpine base images for smaller attack surface
- Health checks configured
- No secrets in layers

## 📊 DevSecOps Pipeline

### Week 1: SAST (Static Application Security Testing)

**Objective:** Analyze source code for security vulnerabilities

**Tools Implemented:**
- **SonarQube** - Comprehensive code quality and security analysis
- **CodeQL** - GitHub's semantic analysis for security patterns
- **ESLint** - JavaScript/TypeScript linting with security rules

**Detects:**
- SQL Injection vulnerabilities
- Cross-Site Scripting (XSS)
- Hardcoded secrets
- Insecure cryptographic functions
- OWASP Top 10 vulnerabilities

**Pipeline Stage:**
```yaml
sast-scan:
  - Checkout code
  - Install dependencies
  - Run ESLint
  - Execute SonarQube scan
  - Perform CodeQL analysis
```

### Week 2: SCA (Software Composition Analysis)

**Objective:** Identify vulnerabilities in third-party dependencies

**Tools Implemented:**
- **npm audit** - Native Node.js dependency scanner
- **OWASP Dependency-Check** - Cross-language SCA tool
- **Snyk** - Advanced dependency and license scanning

**Detects:**
- Known CVEs in npm packages
- Outdated dependencies
- License compliance issues
- Transitive dependency vulnerabilities

**Pipeline Stage:**
```yaml
sca-scan:
  - Run npm audit
  - Execute OWASP Dependency-Check
  - Perform Snyk security scan
  - Upload vulnerability reports
```

### Week 2: Container Security Scanning

**Objective:** Scan Docker images for vulnerabilities

**Tools Implemented:**
- **Trivy** - Comprehensive container vulnerability scanner
- **Docker Scout** - Docker's native security scanning

**Detects:**
- OS package vulnerabilities
- Application dependency CVEs
- Misconfigurations in container
- Exposed secrets in layers

**Pipeline Stage:**
```yaml
container-scan:
  - Build Docker image
  - Run Trivy scanner
  - Execute Docker Scout
  - Upload SARIF reports to GitHub Security
```

### Week 3: IaC Security Scanning

**Objective:** Detect misconfigurations in infrastructure code

**Tools Implemented:**
- **Checkov** - Policy-as-code framework for IaC
- **TFSec** - Terraform-specific security scanner

**Detects:**
- Unencrypted S3 buckets
- Public cloud resources
- Missing logging configurations
- Overly permissive IAM policies
- Insecure network configurations

**Pipeline Stage:**
```yaml
iac-scan:
  - Checkout code
  - Run Checkov on Terraform files
  - Execute TFSec scanner
  - Validate Terraform syntax
  - Upload findings to GitHub Security
```

**Example Findings:**

✅ **PASS:** S3 bucket has encryption enabled
```hcl
resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

❌ **FAIL:** S3 bucket without public access block (Checkov would catch this)
```hcl
# Missing aws_s3_bucket_public_access_block
```

### Week 4: DAST (Dynamic Application Security Testing)

**Objective:** Test running application for runtime vulnerabilities

**Tools Implemented:**
- **OWASP ZAP** - Industry-standard DAST tool

**Detects:**
- Authentication/authorization flaws
- Session management issues
- Server misconfigurations
- Runtime injection attacks
- Security header misconfigurations

**Pipeline Stage:**
```yaml
dast-scan:
  - Start PostgreSQL database
  - Build and deploy application
  - Run OWASP ZAP baseline scan
  - Execute OWASP ZAP full scan
  - Upload vulnerability reports
```

## 🔄 CI/CD Workflow

### Automated Pipeline Triggers

```
Developer Push → GitHub Actions → Security Gates → Build → Deploy
```

**On Every Push/PR:**
1. ✅ SAST - Code analysis
2. ✅ SCA - Dependency check
3. ✅ Container scan - Docker image
4. ✅ IaC scan - Terraform validation
5. ✅ Build & Tests
6. ✅ DAST - Runtime testing
7. ✅ Security summary report

**Failure Gates:**
- Critical CVEs → ❌ Block deployment
- High severity misconfigurations → ⚠️ Warning
- Failed unit tests → ❌ Block deployment

### Viewing Security Reports

**GitHub Security Tab:**
- Navigate to repository → Security → Code scanning alerts
- View SARIF uploads from Trivy, Checkov, CodeQL

**Pipeline Artifacts:**
- Each scan generates downloadable reports
- Available in Actions → Workflow run → Artifacts

**Example Reports:**
- `npm-audit-report.json` - Dependency vulnerabilities
- `trivy-results.sarif` - Container scan findings
- `checkov-results.sarif` - IaC misconfigurations
- `report_html.html` - OWASP ZAP DAST results

## 🛠️ Manual Security Testing

### Running Security Scans Locally

**1. SAST with ESLint**
```bash
npm run lint
```

**2. SCA with npm audit**
```bash
npm audit
npm audit fix  # Auto-fix vulnerabilities
```

**3. Container scan with Trivy**
```bash
# Build image
docker build -t secureshop:test .

# Scan image
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image secureshop:test
```

**4. IaC scan with Checkov**
```bash
# Install Checkov
pip install checkov

# Scan Terraform
checkov -d terraform/
```

**5. IaC scan with TFSec**
```bash
# Using Docker
docker run --rm -v $(pwd)/terraform:/src aquasec/tfsec /src
```

**6. DAST with OWASP ZAP (Docker)**
```bash
# Start application
npm run build && npm start

# Run ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000
```

## 🔒 Security Hardening Checklist

### Application Level
- [ ] Input validation on all endpoints
- [ ] Parameterized database queries
- [ ] Rate limiting on APIs
- [ ] HTTPS enforcement
- [ ] Security headers configured
- [ ] Error messages sanitized
- [ ] Authentication implemented
- [ ] Authorization checks

### Database Level
- [ ] Strong passwords
- [ ] Encrypted connections
- [ ] Least privilege access
- [ ] Regular backups
- [ ] Audit logging enabled

### Container Level
- [ ] Non-root user
- [ ] Minimal base image
- [ ] No secrets in image
- [ ] Regular image updates
- [ ] Health checks configured

### Infrastructure Level
- [ ] VPC network isolation
- [ ] Security groups configured
- [ ] Encryption at rest
- [ ] Encryption in transit
- [ ] Logging enabled
- [ ] MFA for admin access
- [ ] Regular security audits

## 📈 Continuous Improvement

### Weekly Security Tasks

**Week 1: Code Security**
- Review SonarQube dashboard
- Fix critical code smells
- Update security rules

**Week 2: Dependency Management**
- Run `npm audit`
- Update vulnerable dependencies
- Review Snyk recommendations

**Week 3: Infrastructure Review**
- Scan Terraform changes
- Review security group rules
- Update encryption policies

**Week 4: Penetration Testing**
- Run OWASP ZAP scans
- Test authentication flows
- Verify security headers

### Metrics to Track

- Number of critical vulnerabilities detected
- Mean time to remediation (MTTR)
- Pipeline success rate
- Code coverage percentage
- Dependency update frequency

## 🐛 Troubleshooting

### Common Issues

**Issue: Database connection error**
```
Solution: Ensure PostgreSQL is running and DATABASE_URL is correct
docker ps | grep postgres
```

**Issue: Build fails with type errors**
```
Solution: Run type generation
npm run typecheck
npx next typegen
```

**Issue: Container scan fails**
```
Solution: Update base image in Dockerfile
FROM node:20-alpine  # Use latest secure version
```

**Issue: IaC scan shows S3 bucket errors**
```
Solution: Ensure all buckets have encryption and public access blocks
```

## 🤝 Contributing

### Git Workflow

```bash
# Create feature branch
git checkout -b feat/add-payment-gateway

# Make changes and commit
git add .
git commit -m "feat: integrate Stripe payment processing"

# Push to remote
git push origin feat/add-payment-gateway

# Create Pull Request
```

### Commit Message Convention

Follow semantic commit messages:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks
- `security:` Security improvements

### Security Contribution Guidelines

1. **Never commit secrets** - Use environment variables
2. **Test security changes** - Run relevant scanners
3. **Document security decisions** - Explain security choices
4. **Follow least privilege** - Minimize permissions
5. **Keep dependencies updated** - Regular security patches

## 📚 Learning Resources

### DevSecOps
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP DevSecOps Guideline](https://owasp.org/www-project-devsecops-guideline/)
- [DevSecOps Manifesto](https://www.devsecops.org/)

### Security Tools
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Checkov Policies](https://www.checkov.io/5.Policy%20Index/all.html)
- [OWASP ZAP User Guide](https://www.zaproxy.org/docs/)
- [Snyk Learning](https://learn.snyk.io/)

### Infrastructure as Code
- [Terraform Security Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)

## 📞 Support

For security vulnerabilities, please email: security@secureshop.example.com

**Do not create public GitHub issues for security vulnerabilities.**

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- OWASP Foundation for security tools and guidelines
- Aqua Security for Trivy and TFSec
- Bridgecrew for Checkov
- GitHub Security Lab for CodeQL
- The open-source security community

---

**Built with ❤️ and 🔒 by the SecureShop Team**

*Last Updated: 2026*
