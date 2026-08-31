import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

// Force dynamic rendering — prevents Next.js from pre-rendering
// this route at build time (which would require a DB connection).
export const dynamic = 'force-dynamic';

// GET /api/orders - List all orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    let query = db.select().from(orders);
    
    if (userId) {
      const userIdNum = parseInt(userId, 10);
      if (!isNaN(userIdNum)) {
        const userOrders = await db.select().from(orders)
          .where(eq(orders.userId, userIdNum))
          .orderBy(desc(orders.createdAt));
        
        return NextResponse.json({
          success: true,
          data: userOrders,
          count: userOrders.length,
        });
      }
    }

    const allOrders = await query.orderBy(desc(orders.createdAt));

    return NextResponse.json({
      success: true,
      data: allOrders,
      count: allOrders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items, shippingAddress } = body;

    // Input validation
    if (!userId || !items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'userId, items array, and shippingAddress are required' },
        { status: 400 }
      );
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json(
          { success: false, error: 'Each item must have productId and positive quantity' },
          { status: 400 }
        );
      }

      // Fetch product to get current price and check stock
      const [product] = await db.select().from(products).where(eq(products.id, productId));

      if (!product || !product.isActive) {
        return NextResponse.json(
          { success: false, error: `Product ${productId} not found or inactive` },
          { status: 400 }
        );
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for product ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = parseFloat(product.price) * quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: product.id,
        quantity,
        price: product.price,
      });
    }

    // Create order
    const [newOrder] = await db.insert(orders).values({
      userId,
      totalAmount: totalAmount.toString(),
      shippingAddress,
      status: 'pending',
    }).returning();

    // Create order items
    const orderItemsData = validatedItems.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Update product stock
    for (const item of validatedItems) {
      const [currentProduct] = await db.select().from(products).where(eq(products.id, item.productId));
      await db
        .update(products)
        .set({
          stock: currentProduct.stock - item.quantity,
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.productId));
    }

    return NextResponse.json(
      { success: true, data: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
