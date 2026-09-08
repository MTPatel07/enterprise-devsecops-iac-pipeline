# Week 4: Dynamic Application Security Testing (DAST)

## Overview

Week 4 completes the security testing lifecycle with Dynamic Application Security Testing (DAST). Unlike SAST which analyzes code, DAST tests the **running application** to find runtime vulnerabilities that only appear when the application is deployed.

## Objectives

- ✅ Deploy application to testing environment
- ✅ Implement OWASP ZAP DAST scanning
- ✅ Detect runtime security vulnerabilities
- ✅ Test authentication and authorization
- ✅ Validate security headers
- ✅ Generate comprehensive security reports

## SAST vs DAST Comparison

| Aspect | SAST (Week 1) | DAST (Week 4) |
|--------|---------------|---------------|
| **Testing Method** | Source code analysis | Running application testing |
| **When** | During development | After deployment |
| **Finds** | Code-level vulnerabilities | Runtime vulnerabilities |
| **Examples** | SQL injection in code | Actual SQL injection exploit |
| **Speed** | Fast | Slower (requires running app) |
| **False Positives** | Higher | Lower |

**Best Practice:** Use **both** SAST and DAST for comprehensive coverage.

## OWASP ZAP Overview

### What is OWASP ZAP?

The **Zed Attack Proxy (ZAP)** is the world's most popular free web application security scanner maintained by OWASP.

**Key Features:**
- Automated scanner
- Manual testing tools
- Passive and active scanning
- API testing
- Authentication testing
- CI/CD integration

### Scan Types

#### 1. Baseline Scan
- Quick security check
- Passive scanning only
- Minimal impact on target
- Good for frequent scans

#### 2. Full Scan
- Comprehensive testing
- Active attack simulation
- Longer scan time
- More thorough results

#### 3. API Scan
- REST/GraphQL API testing
- Authentication testing
- OpenAPI/Swagger support

## Vulnerabilities Detected by DAST

### 1. Cross-Site Scripting (XSS)

**What it is:** Injection of malicious scripts into web pages

**Example Attack:**
```javascript
// Malicious URL
https://secureflow.com/search?q=<script>alert('XSS')</script>

// If not properly escaped, this executes in victim's browser
```

**Impact:**
- Session hijacking
- Credential theft
- Malware distribution

**Detection by ZAP:**
```
Alert: Cross Site Scripting (Reflected)
Risk: High
URL: https://secureflow.com/search
Parameter: q
Attack: <script>alert(1)</script>
```

**Fix:**
```typescript
// ❌ Vulnerable
<div dangerouslySetInnerHTML={{ __html: searchQuery }} />

// ✅ Secure (React auto-escapes)
<div>{searchQuery}</div>
```

### 2. SQL Injection

**What it is:** Malicious SQL code injected into queries

**Example Attack:**
```sql
-- Input: ' OR '1'='1
SELECT * FROM users WHERE username = '' OR '1'='1' AND password = ''
-- Returns all users!
```

**Impact:**
- Data breach
- Database corruption
- Unauthorized access

**Detection by ZAP:**
```
Alert: SQL Injection
Risk: Critical
URL: https://secureflow.com/api/products?id=1
Parameter: id
Attack: 1' OR '1'='1
```

**Fix:**
```typescript
// ❌ Vulnerable
const query = `SELECT * FROM products WHERE id = ${req.query.id}`;

// ✅ Secure (Drizzle ORM with parameterized queries)
const [product] = await db
  .select()
  .from(products)
  .where(eq(products.id, productId));
```

### 3. Authentication Bypass

**What it is:** Circumventing authentication mechanisms

**Example Issues:**
- Weak session management
- Predictable session tokens
- Missing authentication checks

**Detection by ZAP:**
```
Alert: Session Management Response Identified
Risk: Medium
Description: Session token in URL parameter (insecure)
```

**Fix:**
```typescript
// ✅ Secure session management
- Use HTTP-only cookies
- Implement CSRF protection
- Set secure and SameSite flags
- Use strong session IDs
```

### 4. Security Headers Missing

**What it is:** Lack of protective HTTP headers

**Headers to Implement:**

```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'  // Prevent clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'  // Prevent MIME sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'"
          }
        ]
      }
    ]
  }
}
```

### 5. Insecure Direct Object References (IDOR)

**What it is:** Accessing resources without proper authorization

**Example Attack:**
```
GET /api/orders/123  → Shows order 123
GET /api/orders/124  → Shows someone else's order! (IDOR)
```

**Detection by ZAP:**
```
Alert: Insecure Direct Object Reference
Risk: High
Description: Resource accessible without authorization
```

**Fix:**
```typescript
// ✅ Verify ownership
export async function GET(req: NextRequest, { params }: Context) {
  const { id } = await params;
  const userId = getCurrentUserId(req);  // From session
  
  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, parseInt(id)),
        eq(orders.userId, userId)  // Verify ownership
      )
    );
    
  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json({ data: order });
}
```

## Setting Up OWASP ZAP

### Local Installation

**Using Docker (Recommended):**
```bash
docker pull owasp/zap2docker-stable
```

**Using Package Manager:**
```bash
# macOS
brew install zaproxy

# Ubuntu/Debian
sudo snap install zaproxy

# Windows
# Download from https://www.zaproxy.org/download/
```

### Running ZAP Scans

#### Baseline Scan
```bash
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -r baseline-report.html
```

#### Full Scan
```bash
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:3000 \
  -r full-scan-report.html \
  -m 5  # 5 minute max scan time
```

#### API Scan
```bash
docker run -t owasp/zap2docker-stable zap-api-scan.py \
  -t http://localhost:3000/api/openapi.json \
  -f openapi \
  -r api-scan-report.html
```

## GitHub Actions Integration

### Pipeline Configuration

```yaml
dast-scan:
  steps:
    # Start application
    - name: Build and start app
      run: |
        npm run build
        npm start &
        sleep 10
        curl http://localhost:3000/api/health

    # Run baseline scan
    - name: OWASP ZAP Baseline Scan
      uses: zaproxy/action-baseline@v0.12.0
      with:
        target: 'http://localhost:3000'
        rules_file_name: '.zap/rules.tsv'
        cmd_options: '-a'

    # Run full scan
    - name: OWASP ZAP Full Scan
      uses: zaproxy/action-full-scan@v0.10.0
      with:
        target: 'http://localhost:3000'
        rules_file_name: '.zap/rules.tsv'
        cmd_options: '-j'
      continue-on-error: true

    # Upload results
    - name: Upload ZAP Reports
      uses: actions/upload-artifact@v4
      with:
        name: zap-scan-report
        path: report_html.html
```

## ZAP Configuration

### Rules Configuration (.zap/rules.tsv)

```tsv
# Rule ID    Action    Comment
10096        IGNORE    Timestamp Disclosure (false positive in dev)
10049        INFO      Cacheable Content
10020        WARN      X-Frame-Options Missing
10021        WARN      X-Content-Type-Options Missing
40012        FAIL      Cross Site Scripting (Reflected)
40014        FAIL      Cross Site Scripting (Persistent)
40018        FAIL      SQL Injection
90019        FAIL      Server Side Code Injection
```

**Actions:**
- `IGNORE`: Don't report
- `INFO`: Informational only
- `WARN`: Warning (doesn't fail build)
- `FAIL`: Critical (fails build)

## Interpreting ZAP Reports

### HTML Report Structure

```
OWASP ZAP Scanning Report
├── Summary
│   ├── High: 0
│   ├── Medium: 2
│   ├── Low: 5
│   └── Info: 12
├── Alerts
│   ├── High Risk
│   ├── Medium Risk
│   ├── Low Risk
│   └── Informational
└── Alert Details
    ├── Description
    ├── URL
    ├── Risk
    ├── CWE ID
    ├── Solution
    └── References
```

### Example Alert

```json
{
  "alert": "Cross Site Scripting (Reflected)",
  "risk": "High",
  "confidence": "Medium",
  "url": "http://localhost:3000/search?q=test",
  "param": "q",
  "attack": "<script>alert(1)</script>",
  "evidence": "<script>alert(1)</script>",
  "cweId": 79,
  "wascId": 8,
  "solution": "Encode user input before displaying"
}
```

## Testing Specific Scenarios

### Authentication Testing

**Setup authentication context:**
```javascript
// ZAP script to login
function authenticate(helper, paramsValues, credentials) {
  const loginUrl = "http://localhost:3000/api/auth/login";
  const postData = JSON.stringify({
    email: credentials.getParam("email"),
    password: credentials.getParam("password")
  });
  
  const msg = helper.prepareMessage();
  msg.setRequestHeader("POST " + loginUrl + " HTTP/1.1");
  msg.setRequestBody(postData);
  
  helper.sendAndReceive(msg);
  return msg;
}
```

### Testing for CSRF

**Verify CSRF protection:**
```bash
# ZAP will test state-changing operations
POST /api/orders
POST /api/products
DELETE /api/products/1

# Should fail without valid CSRF token
```

### Testing Authorization

**Test different user roles:**
```bash
# As regular user
GET /api/orders  → Only own orders

# As admin
GET /api/orders  → All orders

# As unauthenticated
GET /api/orders  → 401 Unauthorized
```

## Remediation Workflow

### 1. Review Findings
```bash
# Open HTML report
open report_html.html

# Check severity
- High/Critical → Immediate fix
- Medium → Fix in current sprint
- Low → Backlog
```

### 2. Reproduce Locally
```bash
# Test the attack manually
curl "http://localhost:3000/api/products?id=1'%20OR%20'1'='1"
```

### 3. Apply Fix
```typescript
// Fix the vulnerability
// Add input validation
// Implement proper escaping
// Add authentication checks
```

### 4. Re-test
```bash
# Run ZAP scan again
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000

# Verify issue is resolved
```

### 5. Document
```markdown
## Fixed: SQL Injection in Product Search
- **Issue**: Unparameterized query
- **Fix**: Switched to Drizzle ORM parameterized queries
- **Verification**: ZAP scan clean
- **Commit**: abc123
```

## Best Practices

### Pre-Deployment Checklist

- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Input validation on all endpoints
- [ ] Authentication implemented
- [ ] Authorization checks in place
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Error messages sanitized
- [ ] Logging enabled
- [ ] ZAP scan passed

### DAST Schedule

**Development:**
- Baseline scan on every PR

**Staging:**
- Full scan weekly
- API scan on API changes

**Production:**
- Baseline scan daily
- Full scan monthly
- After major releases

## Common Pitfalls

### ❌ Testing Production
```
DON'T scan production without permission
- Can trigger security alerts
- May impact performance
- Legal/ethical issues
```

### ❌ Ignoring Low Severity
```
Low severity issues can combine to create high impact
Review all findings, even informational
```

### ❌ One-Time Scan
```
Security is continuous
Schedule regular DAST scans
Automate in CI/CD
```

### ❌ No Authentication Testing
```
Many vulnerabilities only visible when authenticated
Test all user roles
Test privilege escalation
```

## Integration with Other Tools

### Complete Security Pipeline

```
Week 1: SAST (SonarQube, CodeQL)
   ↓
Week 2: SCA (npm audit, Snyk)
   ↓
Week 2: Container (Trivy, Docker Scout)
   ↓
Week 3: IaC (Checkov, TFSec)
   ↓
Week 4: DAST (OWASP ZAP) ← You are here
   ↓
Production Deployment
```

## Metrics and KPIs

### Track Over Time
- Total vulnerabilities found
- Mean time to remediation (MTTR)
- Vulnerability by severity
- False positive rate
- Scan coverage percentage

### Dashboard Example
```
🔴 Critical: 0
🟠 High: 0
🟡 Medium: 2
🟢 Low: 5
ℹ️  Info: 12

Scan Date: 2024-01-15
Duration: 5m 32s
Coverage: 47 URLs tested
```

## Advanced Topics

### Custom ZAP Scripts

```python
# Custom detection script
def scan(ps, msg, src):
    # Parse response
    body = msg.getResponseBody().toString()
    
    # Check for sensitive data
    if "credit_card" in body:
        ps.raiseAlert(
            risk=3,  # High
            confidence=2,  # Medium
            name="Sensitive Data Exposure",
            description="Credit card data in response"
        )
```

### API Testing with OpenAPI

```yaml
# openapi.yaml
openapi: 3.0.0
paths:
  /api/products:
    get:
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Success
        '401':
          description: Unauthorized
```

```bash
# Scan API with spec
zap-api-scan.py \
  -t http://localhost:3000/api/openapi.json \
  -f openapi
```

## Deliverables

- ✅ DAST integrated in CI/CD
- ✅ OWASP ZAP configuration
- ✅ Automated security scanning
- ✅ Security reports and artifacts
- ✅ Remediation documentation
- ✅ Complete DevSecOps pipeline

## Final Security Summary

### Multi-Layer Defense

```
Application Layer
├── SAST: Code vulnerabilities
├── SCA: Dependency issues
└── DAST: Runtime flaws

Container Layer
├── Image scanning
└── Base image security

Infrastructure Layer
├── IaC misconfigurations
└── Cloud security

Runtime Layer
├── DAST testing
└── Penetration testing
```

## Next Steps: Production Deployment

1. ✅ All security scans passing
2. ✅ Remediate remaining medium/low issues
3. ✅ Set up production monitoring
4. ✅ Configure WAF (Web Application Firewall)
5. ✅ Enable DDoS protection
6. ✅ Set up incident response plan
7. ✅ Schedule regular security audits

---

**Congratulations! You've completed the 4-week DevSecOps pipeline implementation.**

The e-commerce platform now has:
- ✅ Automated security testing
- ✅ Multi-layer vulnerability detection
- ✅ Infrastructure security
- ✅ Runtime protection
- ✅ Continuous security monitoring

## Resources

- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [DAST Best Practices](https://owasp.org/www-community/Vulnerability_Scanning_Tools)
