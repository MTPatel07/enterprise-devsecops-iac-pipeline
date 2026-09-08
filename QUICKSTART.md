# Quick Start Guide

Get SecureFlow running locally in 5 minutes!

## Prerequisites

- Node.js 20 or higher
- Docker Desktop
- Git

## Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/secureflow.git
cd secureflow
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Start Database

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run -d \
  --name secureflow-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app_db \
  -p 5432:5432 \
  postgres:16-alpine

# Wait for database to be ready (10 seconds)
sleep 10
```

### Option B: Using Docker Compose

```bash
docker-compose up -d postgres
```

## Step 4: Configure Environment

```bash
# Create .env file
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_db" > .env
```

## Step 5: Set Up Database

```bash
# Apply schema
npx drizzle-kit push

# Seed sample data (optional)
npx tsx src/db/seed.ts
```

## Step 6: Start Application

```bash
npm run dev
```

## Step 7: Access Application

Open your browser to:
- **Application:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

## Sample Data

If you ran the seed script, you'll see 8 products available:
- Wireless Headphones ($199.99)
- Smart Watch ($299.99)
- Laptop Stand ($49.99)
- Mechanical Keyboard ($129.99)
- Wireless Mouse ($39.99)
- USB-C Hub ($59.99)
- Portable SSD ($149.99)
- Webcam 4K ($89.99)

## Testing the E-commerce Flow

1. **Browse Products** - View product catalog on homepage
2. **Add to Cart** - Click "Add to Cart" on any product
3. **View Cart** - Click "Cart" button in header
4. **Update Quantity** - Use +/- buttons to adjust quantities
5. **Checkout** - Click "Checkout" to place order

## Running Security Scans Locally

### SAST (Static Analysis)

```bash
# ESLint
npm run lint

# TypeScript check
npm run typecheck
```

### SCA (Dependency Check)

```bash
# npm audit
npm audit

# Fix vulnerabilities
npm audit fix
```

### Container Scan

```bash
# Build image
docker build -t secureflow:test .

# Scan with Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image secureflow:test
```

### IaC Scan

```bash
# Using Docker (no installation needed)
docker run --rm -v $(pwd)/terraform:/src bridgecrew/checkov -d /src

# Or install and run
pip install checkov
checkov -d terraform/
```

## Common Issues

### Database Connection Error

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker restart secureflow-db
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Database Schema Mismatch

**Problem:** `Error: relation "products" does not exist`

**Solution:**
```bash
# Re-apply schema
npx drizzle-kit push
```

## Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Using Docker Compose (Full Stack)

```bash
# Start all services (database + app)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products?category=Electronics` - Filter by category
- `GET /api/products/[id]` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product (soft delete)

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders?userId=1` - Get user's orders
- `POST /api/orders` - Create order

### Health
- `GET /api/health` - Health check

## Example API Calls

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Get Product by ID
```bash
curl http://localhost:3000/api/products/1
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Test product",
    "price": 99.99,
    "stock": 50,
    "category": "Electronics"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "items": [
      {"productId": 1, "quantity": 2}
    ],
    "shippingAddress": "123 Main St, City, Country"
  }'
```

## Next Steps

1. **Explore the Code** - Review `src/app/api/` for API routes
2. **Run Security Scans** - Try each security tool
3. **Modify the UI** - Customize `src/app/page.tsx`
4. **Add Features** - User authentication, payment processing
5. **Deploy** - Follow `DEPLOYMENT.md` for production setup

## Learning Path

- **Week 1:** Focus on SAST (read `WEEK_1_SAST.md`)
- **Week 2:** Implement SCA and container security (`WEEK_2_SCA_CONTAINER.md`)
- **Week 3:** Set up IaC security (`WEEK_3_IAC.md`)
- **Week 4:** Configure DAST (`WEEK_4_DAST.md`)

## Documentation

- **README.md** - Full project overview
- **SECURITY.md** - Security policy and reporting
- **CONTRIBUTING.md** - How to contribute
- **DEPLOYMENT.md** - Production deployment guide
- **INTERNSHIP_GUIDE.md** - 4-week implementation roadmap

## Support

- **Issues:** https://github.com/yourorg/secureflow/issues
- **Discussions:** https://github.com/yourorg/secureflow/discussions
- **Security:** security@secureflow.example.com

---

**You're all set! Start building secure applications! 🔒🚀**
