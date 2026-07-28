import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, inventoryLog } from "@/db/schema";
import { eq, lt, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allProducts = await db.select({ id: products.id, name: products.name, sku: products.sku, stock: products.stock, brand: products.brand, price: products.price }).from(products).orderBy(products.stock);
    const lowStock = allProducts.filter(p => p.stock < 10);
    const outOfStock = allProducts.filter(p => p.stock === 0);
    const logs = await db.select().from(inventoryLog).orderBy(desc(inventoryLog.createdAt)).limit(50);
    return NextResponse.json({ products: allProducts, lowStock, outOfStock, logs });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { productId, newStock, reason } = await req.json();
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const change = newStock - product.stock;
    await db.update(products).set({ stock: newStock }).where(eq(products.id, productId));
    await db.insert(inventoryLog).values({
      productId,
      change,
      reason: reason || "Manual adjustment",
      previousStock: product.stock,
      newStock,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
