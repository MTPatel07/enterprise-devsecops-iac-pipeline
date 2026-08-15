# Week 1: Static Application Security Testing (SAST)

## Overview

Week 1 focuses on implementing Static Application Security Testing (SAST) to analyze source code for security vulnerabilities before the application is run. This "shift-left" approach catches vulnerabilities early in the development lifecycle.

## Objectives

- ✅ Set up containerized e-commerce application
- ✅ Integrate SAST tools into GitHub Actions pipeline
- ✅ Configure security quality gates
- ✅ Detect and remediate OWASP Top 10 vulnerabilities

## Tools Implemented

### 1. ESLint with Security Plugins

**Purpose:** Linting JavaScript/TypeScript for code quality and security issues

**Configuration:**
```javascript
// eslint.config.mjs
export default [
  // Security-focused linting rules
]
```

**Detects:**
- Unsafe eval() usage
- Weak cryptographic functions
- Insecure random number generation
- Potential XSS vulnerabilities

**Usage:**
```bash
npm run lint
```

### 2. SonarQube

**Purpose:** Comprehensive code quality and security analysis

**Configuration:**
```properties
# sonar-project.properties
sonar.projectKey=secureshop-ecommerce
sonar.sources=src
sonar.security.hotspots.enabled=true
```

**Detects:**
- SQL Injection vulnerabilities
- Cross-Site Scripting (XSS)
- Hardcoded credentials
- Weak cryptography
- Authentication/authorization issues
- Code smells and technical debt

**Setup:**
1. Create SonarQube account at https://sonarcloud.io
2. Generate token: Account → Security → Generate Token
3. Add secrets to GitHub:
   - `SONAR_TOKEN`: Your SonarQube token
   - `SONAR_HOST_URL`: https://sonarcloud.io

**Viewing Results:**
- Dashboard: https://sonarcloud.io/dashboard?id=secureshop-ecommerce
- Security hotspots show potential vulnerabilities
- Reliability, Security, Maintainability ratings

### 3. GitHub CodeQL

**Purpose:** Semantic code analysis using GitHub's native security scanner

**How it Works:**
- Creates database of code structure
- Runs queries to find security patterns
- Automatically integrated with GitHub Security

**Detects:**
- SQL injection
- Command injection  
- Path traversal
- Code injection
- Unsafe deserialization
- Resource leaks

**Viewing Results:**
- Repository → Security → Code scanning alerts
- Detailed explanations and fix recommendations

## Pipeline Configuration

The SAST pipeline runs on every push and pull request:

```yaml
sast-scan:
  steps:
    - Checkout code
    - Setup Node.js
    - Install dependencies
    - Run ESLint
    - Execute SonarQube scan
    - Perform CodeQL analysis
```

## Security Quality Gates

**Build fails if:**
- ESLint reports critical errors
- SonarQube detects critical vulnerabilities
- CodeQL finds high-severity issues

**Warnings for:**
- Code smells
- Maintainability issues
- Low test coverage

## Example Vulnerabilities Detected

### ❌ SQL Injection (Prevented)

**Vulnerable Code:**
```typescript
// BAD - Direct string concatenation
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
await db.execute(query);
```

**Secure Code:**
```typescript
// GOOD - Parameterized query with Drizzle ORM
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.email, userInput));
```

### ❌ Cross-Site Scripting (XSS)

**Vulnerable Code:**
```typescript
// BAD - Unescaped user input
<div dangerouslySetInnerHTML={{ __html: userComment }} />
```

**Secure Code:**
```typescript
// GOOD - React automatically escapes content
<div>{userComment}</div>
```

### ❌ Hardcoded Secrets

**Vulnerable Code:**
```typescript
// BAD - Hardcoded API key
const API_KEY = "sk_live_12345abcdef";
```

**Secure Code:**
```typescript
// GOOD - Environment variable
const API_KEY = process.env.STRIPE_API_KEY;
```

## Remediation Workflow

1. **Identify**: SAST tool flags vulnerability
2. **Analyze**: Review code context and severity
3. **Fix**: Apply secure coding practices
4. **Verify**: Re-run scan to confirm fix
5. **Commit**: Push changes with descriptive message

Example commit:
```bash
git commit -m "security: fix SQL injection in product search endpoint"
```

## Best Practices

### Secure Coding Patterns

**Input Validation:**
```typescript
if (!productId || isNaN(parseInt(productId))) {
  return NextResponse.json(
    { error: 'Invalid product ID' },
    { status: 400 }
  );
}
```

**Error Handling:**
```typescript
try {
  // Database operation
} catch (error) {
  console.error('Error:', error);
  // Don't expose internal errors to users
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

**Environment Variables:**
```typescript
// .env (gitignored)
DATABASE_URL=postgresql://...
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Metrics and Reporting

### Key Metrics
- **Code Coverage:** Target 80%+
- **Security Hotspots:** 0 critical
- **Code Smells:** < 50
- **Technical Debt:** < 2 days

### Weekly Reports
- SonarQube quality gate status
- CodeQL alert trends
- Remediation velocity

## Learning Resources

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [CodeQL Query Help](https://codeql.github.com/codeql-query-help/)
- [Secure Coding Guidelines](https://cheatsheetseries.owasp.org/)

## Deliverables

- ✅ GitHub Actions workflow with SAST integration
- ✅ SonarQube project configuration
- ✅ CodeQL analysis enabled
- ✅ Zero critical vulnerabilities in codebase
- ✅ Documentation of security findings and fixes

## Next Steps

→ **Week 2:** Software Composition Analysis (SCA) and Container Scanning
