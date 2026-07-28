import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products, inventoryLog } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdm = session.role === "admin" || session.role === "manager";
    const status = req.nextUrl.searchParams.get("status");

    const conditions = [];
    if (!isAdm) conditions.push(eq(orders.userId, session.id));
    if (status) conditions.push(eq(orders.status, status));

    const result = await db.select().from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({ orders: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { items, shippingAddress } = await req.json();
    if (!items || items.length === 0) return NextResponse.json({ error: "No items" }, { status: 400 });

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      if (product.stock < item.qty) return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });

      const price = product.discountPrice || product.price;
      subtotal += Number(price) * item.qty;
      validatedItems.push({ product, qty: item.qty, price: Number(price) });
    }

    const tax = subtotal * 0.08;
    const shipping = subtotal > 500 ? 0 : 29.99;
    const total = subtotal + tax + shipping;

    const [order] = await db.insert(orders).values({
      userId: session.id,
      status: "pending",
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      shippingAddress,
    }).returning();

    for (const item of validatedItems) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.product.id,
        productName: item.product.name,
        price: item.price.toFixed(2),
        quantity: item.qty,
        warranty: item.product.warranty,
      });

      const newStock = item.product.stock - item.qty;
      await db.update(products).set({ stock: newStock }).where(eq(products.id, item.product.id));
      await db.insert(inventoryLog).values({
        productId: item.product.id,
        change: -item.qty,
        reason: `Order #${order.id.substring(0, 8)}`,
        previousStock: item.product.stock,
        newStock,
      });
    }

    return NextResponse.json({ order });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
