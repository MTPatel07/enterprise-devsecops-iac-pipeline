import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let query = db.select().from(products).where(eq(products.isActive, true));
    
    const allProducts = await query.orderBy(desc(products.createdAt));

    const filteredProducts = category 
      ? allProducts.filter(p => p.category === category)
      : allProducts;

    return NextResponse.json({
      success: true,
      data: filteredProducts,
      count: filteredProducts.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, stock, category, imageUrl } = body;

    // Input validation
    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400 }
      );
    }

    if (price < 0 || stock < 0) {
      return NextResponse.json(
        { success: false, error: 'Price and stock must be non-negative' },
        { status: 400 }
      );
    }

    const [newProduct] = await db.insert(products).values({
      name,
      description: description || null,
      price: price.toString(),
      stock: stock || 0,
      category: category || null,
      imageUrl: imageUrl || null,
    }).returning();

    return NextResponse.json(
      { success: true, data: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
