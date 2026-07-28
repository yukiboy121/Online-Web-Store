"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string; name: string; brand: string; slug: string; price: string;
  discountPrice: string | null; stock: number; rating: string | null;
  reviewCount: number | null; images: string[] | null;
  specs: Record<string, string> | null; isNewArrival: boolean | null; isBestSeller: boolean | null;
}

const categoryLabels: Record<string, string> = {
  processors: "Processors",
  "graphics-cards": "Graphics Cards",
  motherboards: "Motherboards",
  ram: "RAM",
  storage: "Storage",
  "power-supplies": "Power Supplies",
  "pc-cases": "PC Cases",
  cooling: "Cooling",
  "gaming-accessories": "Gaming Accessories",
  laptops: "Laptops",
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = `/api/products?sort=${sort}&limit=50`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    fetch(url).then(r => r.json()).then(d => {
      setProducts(d.products || []);
      setLoading(false);
    });
  }, [category, sort, search]);

  const title = category ? categoryLabels[category] || "Products" : "All Products";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold">{title}</h1>
        <p className="text-nexus-muted mt-2">{products.length} products found</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full bg-nexus-card border border-nexus-border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:border-nexus-blue/50 transition-colors" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-nexus-muted hover:text-white" /></button>
          )}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="bg-nexus-card border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50 transition-colors">
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-nexus-card border border-nexus-border rounded-xl h-80 animate-shimmer" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
          <p className="text-nexus-muted">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{[...Array(8)].map((_, i) => <div key={i} className="bg-nexus-card rounded-xl h-80 animate-shimmer" />)}</div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
