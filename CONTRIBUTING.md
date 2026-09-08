# Contributing to SecureFlow

Thank you for your interest in contributing to SecureFlow! This document provides guidelines and best practices for contributing to this DevSecOps e-commerce platform.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Security vulnerabilities should be reported privately
- Follow the established coding standards

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/secureflow.git
   cd secureflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

## Git Workflow

### Branching Strategy

We follow a feature branch workflow:

```
main (production-ready code)
  ↓
develop (integration branch)
  ↓
feature/your-feature-name (your work)
```

### Creating a Feature Branch

```bash
# Update your local repository
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feat/add-payment-integration

# Make changes...

# Commit with semantic message
git add .
git commit -m "feat: integrate Stripe payment gateway"

# Push to remote
git push origin feat/add-payment-integration
```

## Commit Message Convention

We use **semantic commit messages** for clear changelog generation:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code restructuring (no functional changes)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security improvements
- `perf`: Performance improvements

### Examples

**Feature:**
```
feat(products): add product search functionality

Implement full-text search for products using PostgreSQL
text search capabilities. Includes search by name, description,
and category.

Closes #42
```

**Security Fix:**
```
security(auth): prevent SQL injection in login endpoint

Replace string concatenation with parameterized queries using
Drizzle ORM to prevent SQL injection attacks.

CVE: N/A
Severity: High
```

**Bug Fix:**
```
fix(cart): correct total price calculation

Fix floating-point arithmetic issue causing incorrect cart
totals when products have prices with 3+ decimal places.

Fixes #123
```

## Pull Request Process

### Before Submitting

1. **Run all checks locally**
   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

2. **Run security scans**
   ```bash
   npm audit
   ```

3. **Update documentation**
   - Update README.md if adding features
   - Add/update JSDoc comments
   - Update CHANGELOG.md

4. **Write tests** (when applicable)
   ```bash
   npm test
   ```

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Security fix
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Local testing completed
- [ ] All CI checks passing
- [ ] Security scans clean

## Screenshots (if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Security implications considered
```

### Review Process

1. Automated checks must pass:
   - ✅ SAST (SonarQube, CodeQL)
   - ✅ SCA (npm audit, Snyk)
   - ✅ Linting (ESLint)
   - ✅ Type checking (TypeScript)
   - ✅ Build succeeds

2. Code review by maintainer
3. Security review for sensitive changes
4. Merge to develop (squash merge)

## Security Guidelines

### Critical Rules

1. **Never commit secrets**
   ```bash
   # ❌ BAD
   const API_KEY = "sk_live_abc123";
   
   # ✅ GOOD
   const API_KEY = process.env.STRIPE_API_KEY;
   ```

2. **Validate all inputs**
   ```typescript
   // ✅ Validate before use
   if (!productId || isNaN(parseInt(productId))) {
     return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
   }
   ```

3. **Use parameterized queries**
   ```typescript
   // ✅ Drizzle ORM (safe)
   await db.select().from(users).where(eq(users.email, email));
   
   // ❌ Never do this
   await db.execute(`SELECT * FROM users WHERE email = '${email}'`);
   ```

4. **Sanitize error messages**
   ```typescript
   // ❌ Exposes internals
   return NextResponse.json({ error: error.message }, { status: 500 });
   
   // ✅ Generic message
   return NextResponse.json({ error: 'Internal error' }, { status: 500 });
   ```

### Security Checklist

Before submitting security-related PRs:

- [ ] No hardcoded credentials
- [ ] Environment variables used for secrets
- [ ] Input validation implemented
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevention (proper escaping)
- [ ] CSRF protection (where needed)
- [ ] Authentication/authorization checks
- [ ] Secure HTTP headers configured
- [ ] Error messages don't leak info
- [ ] Logging doesn't include sensitive data

## Code Style

### TypeScript

```typescript
// Use explicit types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Use const for immutable values
const MAX_CART_ITEMS = 100;

// Use async/await over promises
async function fetchProducts(): Promise<Product[]> {
  const products = await db.select().from(productsTable);
  return products;
}
```

### React Components

```typescript
// Use functional components
export default function ProductCard({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
}
```

### API Routes

```typescript
// Consistent error handling
export async function GET(request: NextRequest) {
  try {
    // Business logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

## Testing Guidelines

### Unit Tests
```typescript
describe('calculateTotal', () => {
  it('should calculate correct total', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 }
    ];
    expect(calculateTotal(items)).toBe(35);
  });
});
```

### Integration Tests
```typescript
describe('POST /api/orders', () => {
  it('should create order successfully', async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ userId: 1, items: [...] })
    });
    expect(response.status).toBe(201);
  });
});
```

## Documentation Standards

### Code Comments

```typescript
/**
 * Calculate order total including tax and shipping
 * @param items - Array of order items
 * @param shippingCost - Shipping cost in dollars
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total cost including all fees
 */
function calculateOrderTotal(
  items: OrderItem[],
  shippingCost: number,
  taxRate: number
): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  return subtotal + tax + shippingCost;
}
```

### README Updates

When adding features, update README.md:

```markdown
## New Feature

### Usage
\`\`\`typescript
// Example code
\`\`\`

### Configuration
- Environment variable: `FEATURE_API_KEY`
- Default behavior: disabled
```

## Infrastructure Changes

### Terraform

```hcl
# Always include comments
resource "aws_s3_bucket" "assets" {
  # Store user-uploaded images and static assets
  bucket = "secureflow-assets-${var.environment}"
  
  tags = {
    Name        = "secureflow-assets"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
```

### Security Scanning

Before deploying infrastructure:

```bash
# Run Checkov
checkov -d terraform/

# Run TFSec
docker run --rm -v $(pwd)/terraform:/src aquasec/tfsec /src

# Terraform validate
cd terraform && terraform validate
```

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Creating a Release

1. Update CHANGELOG.md
2. Update version in package.json
3. Create release branch
4. Final security scan
5. Tag release: `git tag -a v1.2.0 -m "Release version 1.2.0"`
6. Push tag: `git push origin v1.2.0`

## Questions?

- **General questions**: Open a GitHub Discussion
- **Bug reports**: Open a GitHub Issue
- **Security vulnerabilities**: Email security@secureflow.example.com
- **Feature requests**: Open a GitHub Issue with "enhancement" label

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- GitHub contributors page

Thank you for contributing to SecureFlow! 🔒🛒
