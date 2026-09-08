# Project File Index

Complete index of all files in the SecureFlow DevSecOps E-commerce Platform.

## 📚 Documentation (10 files)

### Getting Started
- **README.md** - Main project documentation and overview
- **QUICKSTART.md** - 5-minute quick start guide
- **PROJECT_SUMMARY.md** - Executive summary and technical achievements

### Implementation Guides
- **INTERNSHIP_GUIDE.md** - Complete 4-week internship program guide
- **WEEK_1_SAST.md** - Week 1: Static Application Security Testing
- **WEEK_2_SCA_CONTAINER.md** - Week 2: SCA and Container Security
- **WEEK_3_IAC.md** - Week 3: Infrastructure as Code Security
- **WEEK_4_DAST.md** - Week 4: Dynamic Application Security Testing

### Operations
- **DEPLOYMENT.md** - Production deployment guide
- **SECURITY.md** - Security policy and vulnerability reporting
- **CONTRIBUTING.md** - Contribution guidelines and Git workflow
- **CHANGELOG.md** - Version history and release notes

## 🔧 Configuration Files (11 files)

### Core Configuration
- **package.json** - Node.js dependencies and scripts
- **package-lock.json** - Locked dependency versions
- **tsconfig.json** - TypeScript compiler configuration
- **next.config.ts** - Next.js configuration with security headers
- **next-env.d.ts** - Next.js TypeScript definitions

### Build Tools
- **eslint.config.mjs** - ESLint linting configuration
- **postcss.config.mjs** - PostCSS configuration
- **drizzle.config.json** - Drizzle ORM configuration
- **tsconfig.tsbuildinfo** - TypeScript build info (generated)

### Environment
- **.env** - Environment variables (gitignored, contains secrets)
- **.gitignore** - Git ignore patterns

## 🐳 Container & Deployment (3 files)

- **Dockerfile** - Multi-stage Docker build with security best practices
- **.dockerignore** - Docker build exclusions
- **docker-compose.yml** - Local development stack (app + database)

## 🔐 Security Configuration (2 files)

- **sonar-project.properties** - SonarQube SAST configuration
- **.zap/rules.tsv** - OWASP ZAP DAST scanning rules

## ⚙️ CI/CD Workflows (2 files)

### GitHub Actions
- **.github/workflows/devsecops-pipeline.yml** - Main DevSecOps security pipeline
  - SAST (SonarQube, CodeQL, ESLint)
  - SCA (npm audit, Snyk, OWASP Dependency-Check)
  - Container (Trivy, Docker Scout)
  - IaC (Checkov, TFSec)
  - DAST (OWASP ZAP)

- **.github/workflows/dependency-update.yml** - Automated weekly dependency updates

## 🏗️ Infrastructure as Code (3 files)

### Terraform
- **terraform/main.tf** - AWS infrastructure configuration
  - VPC with public/private subnets
  - Security groups (ALB, ECS, RDS)
  - S3 buckets with encryption
  - CloudWatch logging
  - KMS encryption keys

- **terraform/variables.tf** - Terraform input variables
- **terraform/terraform.tfvars.example** - Example variable values

## 💻 Application Source Code (9 files)

### Database
- **src/db/index.ts** - Database connection setup
- **src/db/schema.ts** - Drizzle ORM schema definitions
  - users table
  - products table
  - orders table
  - order_items table
- **src/db/seed.ts** - Database seeding script (sample data)

### API Routes
- **src/app/api/health/route.ts** - Health check endpoint
- **src/app/api/products/route.ts** - Product CRUD (GET, POST)
- **src/app/api/products/[id]/route.ts** - Single product operations (GET, PUT, DELETE)
- **src/app/api/orders/route.ts** - Order management (GET, POST)

### Frontend
- **src/app/page.tsx** - E-commerce storefront UI
  - Product catalog
  - Shopping cart
  - Checkout flow

- **src/app/layout.tsx** - Root layout component
- **src/app/globals.css** - Global styles and Tailwind CSS

## 📊 File Statistics

### By Type
| Type | Count | Lines of Code |
|------|-------|---------------|
| Documentation | 12 | ~15,000 words |
| TypeScript/TSX | 9 | ~2,000 |
| Configuration | 11 | ~500 |
| Infrastructure (Terraform) | 3 | ~400 |
| CI/CD (YAML) | 2 | ~500 |
| Docker | 3 | ~100 |
| **Total** | **40** | **~3,500 LOC** |

### Lines of Documentation
- README.md: ~500 lines
- INTERNSHIP_GUIDE.md: ~800 lines
- WEEK guides (4): ~1,500 lines
- Other docs: ~1,000 lines
- **Total: ~3,800 lines of documentation**

## 🔍 Key Features by File

### Security Implementations

**Input Validation** (`src/app/api/products/route.ts`, `src/app/api/orders/route.ts`)
```typescript
if (!name || !price) {
  return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
}
```

**SQL Injection Prevention** (`src/db/schema.ts`, all API routes)
- Using Drizzle ORM with parameterized queries
- No string concatenation in SQL

**XSS Prevention** (`src/app/page.tsx`)
- React auto-escaping
- No dangerouslySetInnerHTML usage

**Security Headers** (`next.config.ts`)
```typescript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // ... more headers
]
```

**Container Security** (`Dockerfile`)
- Multi-stage builds
- Non-root user execution
- Health checks
- Alpine base image

**Infrastructure Security** (`terraform/main.tf`)
- S3 encryption enabled
- Public access blocked
- VPC network isolation
- Security groups with least privilege
- CloudWatch logging
- KMS key rotation

### DevSecOps Pipeline Stages

1. **SAST** - Analyze source code
   - SonarQube, CodeQL, ESLint

2. **SCA** - Check dependencies
   - npm audit, Snyk, OWASP Dependency-Check

3. **Container** - Scan Docker images
   - Trivy, Docker Scout

4. **IaC** - Validate infrastructure
   - Checkov, TFSec

5. **DAST** - Test running app
   - OWASP ZAP

## 📦 Dependencies

### Production Dependencies (6)
- next (16.2.6) - React framework
- react (19.2.6) - UI library
- react-dom (19.2.6) - React DOM
- drizzle-orm (0.45.2) - Database ORM
- pg (8.20.0) - PostgreSQL client
- dotenv (17.3.1) - Environment variables

### Development Dependencies (10)
- typescript (5.9.3)
- eslint (9.39.4)
- @tailwindcss/postcss (4.1.17)
- tailwindcss (4.1.17)
- drizzle-kit (0.31.10)
- And more...

## 🚀 Quick Access

### Run Commands
```bash
# Development
npm run dev                 # Start dev server

# Security
npm run security:audit      # Run security audit
npm run lint               # Run linter
npm run typecheck          # Type check

# Database
npm run db:push            # Apply schema
npm run db:seed            # Seed data

# Docker
npm run docker:build       # Build image
npm run docker:compose     # Start stack

# Validation
npm run validate           # Full validation
```

### Important URLs
- Application: http://localhost:3000
- Health: http://localhost:3000/api/health
- API Products: http://localhost:3000/api/products
- API Orders: http://localhost:3000/api/orders

## 🎯 File Purpose Summary

### For Learning
- **INTERNSHIP_GUIDE.md** - Start here for 4-week program
- **QUICKSTART.md** - Get running in 5 minutes
- **WEEK_*.md** - Detailed weekly guides

### For Development
- **src/** - All application code
- **package.json** - Dependencies and scripts
- **next.config.ts** - Framework configuration

### For Security
- **.github/workflows/** - Automated security scanning
- **terraform/** - Secure infrastructure
- **Dockerfile** - Secure container build

### For Deployment
- **DEPLOYMENT.md** - Production deployment
- **docker-compose.yml** - Local stack
- **terraform/** - Cloud infrastructure

### For Contribution
- **CONTRIBUTING.md** - How to contribute
- **SECURITY.md** - Report vulnerabilities
- **.gitignore** - What not to commit

## 🔗 Navigation

- **New to project?** → Start with README.md
- **Want to run it?** → See QUICKSTART.md
- **Learning DevSecOps?** → Follow INTERNSHIP_GUIDE.md
- **Adding features?** → Read CONTRIBUTING.md
- **Deploying to production?** → Use DEPLOYMENT.md
- **Found a vulnerability?** → Check SECURITY.md

---

**Last Updated:** 2026-01-15  
**Total Files:** 40  
**Total Size:** ~3,500 lines of code + 15,000 words of documentation
