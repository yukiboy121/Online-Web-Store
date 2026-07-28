import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, ilike, and, sql, desc, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const featured = url.searchParams.get("featured");
    const newArrivals = url.searchParams.get("new");
    const bestSellers = url.searchParams.get("best");
    const sort = url.searchParams.get("sort");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const buildCategory = url.searchParams.get("buildCategory");

    const conditions = [];
    if (category) {
      const [cat] = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
      if (cat) conditions.push(eq(products.categoryId, cat.id));
    }
    if (buildCategory) {
      const [cat] = await db.select().from(categories).where(eq(categories.slug, buildCategory)).limit(1);
      if (cat) conditions.push(eq(products.categoryId, cat.id));
    }
    if (search) conditions.push(ilike(products.name, `%${search}%`));
    if (featured === "true") conditions.push(eq(products.isFeatured, true));
    if (newArrivals === "true") conditions.push(eq(products.isNewArrival, true));
    if (bestSellers === "true") conditions.push(eq(products.isBestSeller, true));

    let orderBy;
    switch (sort) {
      case "price_asc": orderBy = asc(products.price); break;
      case "price_desc": orderBy = desc(products.price); break;
      case "newest": orderBy = desc(products.createdAt); break;
      case "rating": orderBy = desc(products.rating); break;
      default: orderBy = desc(products.createdAt);
    }

    const result = await db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit);

    return NextResponse.json({ products: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "manager")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const [product] = await db.insert(products).values({
      name: body.name,
      slug: body.slug,
      brand: body.brand,
      sku: body.sku,
      categoryId: body.categoryId,
      price: body.price,
      discountPrice: body.discountPrice || null,
      stock: body.stock || 0,
      warranty: body.warranty || "1 Year",
      description: body.description || "",
      images: body.images || [],
      specs: body.specs || {},
      compatibility: body.compatibility || {},
      isFeatured: body.isFeatured || false,
      isNewArrival: body.isNewArrival || false,
      isBestSeller: body.isBestSeller || false,
    }).returning();
    return NextResponse.json({ product });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
