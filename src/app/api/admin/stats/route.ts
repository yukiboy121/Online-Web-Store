import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, users } from "@/db/schema";
import { eq, sql, lt, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ total: totalRevenue }] = await db.select({ total: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)` }).from(orders);
    const [{ count: totalOrders }] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders);
    const [{ count: pendingOrders }] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(eq(orders.status, "pending"));
    const [{ count: totalProducts }] = await db.select({ count: sql<number>`COUNT(*)` }).from(products);
    const [{ count: totalUsers }] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const lowStockProducts = await db.select().from(products).where(lt(products.stock, 10)).orderBy(products.stock).limit(10);
    const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10);
    const topProducts = await db.select().from(products).orderBy(desc(products.isBestSeller)).limit(5);

    return NextResponse.json({
      totalRevenue,
      totalOrders: Number(totalOrders),
      pendingOrders: Number(pendingOrders),
      totalProducts: Number(totalProducts),
      totalUsers: Number(totalUsers),
      lowStockProducts,
      recentOrders,
      topProducts,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
