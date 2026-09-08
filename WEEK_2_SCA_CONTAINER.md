# Week 2: Software Composition Analysis (SCA) & Container Security

## Overview

Week 2 introduces supply chain security through Software Composition Analysis (SCA) and container vulnerability scanning. Modern applications depend on hundreds of third-party packages, each potentially containing known vulnerabilities (CVEs).

## Objectives

- ✅ Scan dependencies for known vulnerabilities
- ✅ Implement automated dependency updates
- ✅ Build secure Docker containers
- ✅ Scan container images for CVEs
- ✅ Establish security baseline for dependencies

## Part 1: Software Composition Analysis (SCA)

### Tools Implemented

#### 1. npm audit

**Purpose:** Native Node.js dependency vulnerability scanner

**Usage:**
```bash
# Run security audit
npm audit

# Show detailed report
npm audit --json > audit-report.json

# Auto-fix vulnerabilities
npm audit fix

# Fix including breaking changes
npm audit fix --force
```

**Example Output:**
```
found 3 vulnerabilities (1 moderate, 2 high)
  run `npm audit fix` to fix them, or `npm audit` for details
```

**Severity Levels:**
- **Critical**: Immediate fix required
- **High**: Fix ASAP
- **Moderate**: Schedule fix
- **Low**: Consider fixing

#### 2. OWASP Dependency-Check

**Purpose:** Multi-language SCA tool checking against NVD

**Features:**
- CVE database integration
- License analysis
- HTML/JSON/XML reports
- CI/CD integration

**Pipeline Integration:**
```yaml
- name: OWASP Dependency Check
  uses: dependency-check/Dependency-Check_Action@main
  with:
    project: 'SecureFlow'
    path: '.'
    format: 'HTML'
```

**Report Contents:**
- Dependency name and version
- CVE identifiers
- CVSS scores
- Remediation guidance

#### 3. Snyk

**Purpose:** Advanced dependency and license scanning

**Setup:**
1. Sign up at https://snyk.io
2. Generate API token
3. Add `SNYK_TOKEN` to GitHub Secrets

**Features:**
- Real-time vulnerability database
- Automated fix PRs
- License compliance checking
- Container and IaC scanning

**Usage:**
```bash
# Test for vulnerabilities
npx snyk test

# Fix vulnerabilities
npx snyk fix

# Monitor project
npx snyk monitor
```

**Viewing Results:**
- Snyk Dashboard: https://app.snyk.io
- GitHub Security Advisories
- Pull Request comments

### Common Vulnerabilities

#### Example: Vulnerable Dependency

```json
{
  "name": "lodash",
  "version": "4.17.15",
  "vulnerability": {
    "title": "Prototype Pollution",
    "severity": "high",
    "cve": "CVE-2020-8203",
    "fixedIn": "4.17.21"
  }
}
```

**Remediation:**
```bash
npm install lodash@4.17.21
npm audit
```

### Dependency Security Best Practices

1. **Regular Updates**
   ```bash
   # Check outdated packages
   npm outdated
   
   # Update packages
   npm update
   ```

2. **Lock File Security**
   - Commit `package-lock.json`
   - Use `npm ci` in CI/CD
   - Regular lock file audits

3. **Minimal Dependencies**
   - Audit necessity of each package
   - Prefer standard library
   - Avoid deprecated packages

4. **Automated Monitoring**
   - Dependabot alerts
   - Snyk monitoring
   - Weekly audit runs

## Part 2: Container Security

### Docker Security Principles

#### 1. Multi-Stage Builds

**Purpose:** Reduce attack surface and image size

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner (production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

**Benefits:**
- Smaller final image (no build tools)
- No source code in production image
- Reduced attack surface

#### 2. Base Image Selection

**Security Considerations:**
```dockerfile
# ❌ BAD - Latest tag, large image
FROM node:latest

# ✅ GOOD - Specific version, minimal image
FROM node:20-alpine
```

**Alpine Benefits:**
- Minimal size (~5MB base)
- Fewer packages = fewer vulnerabilities
- Regular security updates

#### 3. Non-Root User

**Why it matters:** Containers should not run as root

```dockerfile
# Create dedicated user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root
USER nextjs
```

#### 4. Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/api/health')"
```

### Container Scanning Tools

#### 1. Trivy

**Purpose:** Comprehensive vulnerability scanner

**Features:**
- OS packages
- Application dependencies
- Container images
- IaC files

**Usage:**
```bash
# Scan image
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image secureflow:latest

# Output formats
trivy image --format sarif -o results.sarif secureflow:latest
trivy image --format json secureflow:latest
```

**Example Output:**
```
secureflow:latest (alpine 3.19)
==================================
Total: 5 (CRITICAL: 1, HIGH: 2, MEDIUM: 2)

┌─────────────┬────────────────┬──────────┬───────────┐
│  Package    │ Vulnerability  │ Severity │ Fix Ver   │
├─────────────┼────────────────┼──────────┼───────────┤
│ openssl     │ CVE-2024-1234  │ CRITICAL │ 3.1.4-r1  │
│ libcrypto   │ CVE-2024-5678  │ HIGH     │ 3.1.4-r1  │
└─────────────┴────────────────┴──────────┴───────────┘
```

**Severity Levels:**
- **CRITICAL**: CVSS 9.0-10.0
- **HIGH**: CVSS 7.0-8.9
- **MEDIUM**: CVSS 4.0-6.9
- **LOW**: CVSS 0.1-3.9

#### 2. Docker Scout

**Purpose:** Docker's native security platform

**Features:**
- CVE analysis
- Base image recommendations
- Supply chain view
- Policy compliance

**Usage:**
```bash
# Quick scan
docker scout cves secureflow:latest

# Recommendations
docker scout recommendations secureflow:latest
```

### Container Security Checklist

- ✅ Multi-stage builds
- ✅ Minimal base image (Alpine)
- ✅ Non-root user
- ✅ No secrets in layers
- ✅ Health checks configured
- ✅ Resource limits set
- ✅ Read-only filesystem where possible
- ✅ Dropped capabilities
- ✅ Security scanning in CI/CD

### Pipeline Integration

```yaml
container-scan:
  steps:
    - Build Docker image
    - Run Trivy scanner
    - Upload SARIF to GitHub Security
    - Execute Docker Scout
    - Fail on critical vulnerabilities
```

### Remediation Workflow

**When vulnerabilities are found:**

1. **Identify Root Cause**
   - Base image vulnerability? → Update base image
   - Dependency issue? → Update package
   - Configuration problem? → Fix Dockerfile

2. **Apply Fix**
   ```bash
   # Update base image
   sed -i 's/node:20-alpine/node:20-alpine3.19/' Dockerfile
   
   # Rebuild
   docker build -t secureflow:latest .
   
   # Re-scan
   trivy image secureflow:latest
   ```

3. **Verify**
   - Scan shows no critical issues
   - Application still functions
   - Image size acceptable

4. **Deploy**
   ```bash
   git commit -m "security: update base image to patch CVE-2024-1234"
   git push
   ```

## Example Vulnerabilities and Fixes

### Scenario 1: Outdated Base Image

**Problem:**
```
CRITICAL: OpenSSL vulnerability in node:20-alpine
CVE-2024-1234: Remote code execution
```

**Fix:**
```dockerfile
# Before
FROM node:20-alpine

# After
FROM node:20-alpine3.19  # Specific patched version
```

### Scenario 2: Vulnerable npm Package

**Problem:**
```
HIGH: Prototype pollution in lodash@4.17.15
CVE-2020-8203
```

**Fix:**
```bash
npm update lodash@latest
npm audit
```

### Scenario 3: Running as Root

**Problem:**
```
Container running as root (uid 0)
Security risk: privilege escalation
```

**Fix:**
```dockerfile
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
```

## Metrics and Monitoring

### Key Metrics
- Total vulnerabilities: 0 critical, < 5 high
- Image size: < 150MB
- Build time: < 5 minutes
- Scan time: < 2 minutes

### Dashboard
- GitHub Security → Dependabot alerts
- Snyk dashboard → Vulnerability trends
- Container registry → Scan results

## Best Practices Summary

### Dependencies
1. Run `npm audit` before every commit
2. Enable Dependabot alerts
3. Review dependency updates weekly
4. Pin versions in package.json
5. Use lock files

### Containers
1. Always use specific image tags
2. Scan images before push
3. Update base images monthly
4. Remove unnecessary packages
5. Never store secrets in images

## Deliverables

- ✅ SCA scanning in CI/CD pipeline
- ✅ Container security scanning
- ✅ Zero critical vulnerabilities
- ✅ Automated scan reports
- ✅ Remediation documentation

## Next Steps

→ **Week 3:** Infrastructure as Code (IaC) Security Scanning
