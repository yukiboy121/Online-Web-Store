import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quotations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const isAdm = session.role === "admin" || session.role === "manager";
    const result = await db.select().from(quotations)
      .where(isAdm ? undefined : eq(quotations.userId, session.id))
      .orderBy(desc(quotations.createdAt));
    return NextResponse.json({ quotations: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const [quotation] = await db.insert(quotations).values({
      userId: session?.id || null,
      customerName: body.customerName,
      customerEmail: body.customerEmail || null,
      customerPhone: body.customerPhone || null,
      items: body.items || [],
      subtotal: body.subtotal,
      discount: body.discount || "0",
      total: body.total,
      validUntil: body.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 30 * 86400000),
      status: "draft",
      notes: body.notes || null,
    }).returning();
    return NextResponse.json({ quotation });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
