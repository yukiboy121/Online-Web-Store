"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp, Star, Check } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

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

/* ── Collapsible filter section ── */
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-nexus-border/50 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold uppercase tracking-wider mb-3 hover:text-nexus-blue transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

/* ── Checkbox item ── */
function CheckItem({ label, checked, count, onChange }: { label: string; checked: boolean; count?: number; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
      <span
        className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all ${checked ? "bg-nexus-blue border-nexus-blue" : "border-nexus-border group-hover:border-nexus-blue/50"
          }`}
        onClick={onChange}
      >
        {checked && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
      </span>
      <span className="text-sm flex-1 group-hover:text-nexus-blue transition-colors" onClick={onChange}>{label}</span>
      {count !== undefined && <span className="text-xs text-nexus-muted">{count}</span>}
    </label>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const urlSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState(urlSearch);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false); // mobile filter drawer

  /* active filters */
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyBestSeller, setOnlyBestSeller] = useState(false);

  /* fetch all products (server filters: category + search + sort) */
  useEffect(() => {
    setLoading(true);
    let url = `/api/products?sort=${sort}&limit=200`;
    if (category) url += `&category=${category}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, sort, search]);

  /* sync url search param */
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  /* derived brand list from loaded products */
  const brandList = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach(p => { map[p.brand] = (map[p.brand] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [products]);

  /* client-side filtering */
  const filtered = useMemo(() => {
    return products.filter(p => {
      const price = Number(p.discountPrice || p.price);
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (priceMin && price < Number(priceMin)) return false;
      if (priceMax && price > Number(priceMax)) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (minRating > 0 && Number(p.rating || 0) < minRating) return false;
      if (onlyDeals && !p.discountPrice) return false;
      if (onlyNew && !p.isNewArrival) return false;
      if (onlyBestSeller && !p.isBestSeller) return false;
      return true;
    });
  }, [products, selectedBrands, priceMin, priceMax, inStockOnly, minRating, onlyDeals, onlyNew, onlyBestSeller]);

  const activeFilterCount =
    selectedBrands.length +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (onlyDeals ? 1 : 0) +
    (onlyNew ? 1 : 0) +
    (onlyBestSeller ? 1 : 0);

  const clearAll = () => {
    setSelectedBrands([]);
    setPriceMin("");
    setPriceMax("");
    setInStockOnly(false);
    setMinRating(0);
    setOnlyDeals(false);
    setOnlyNew(false);
    setOnlyBestSeller(false);
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const title = category ? categoryLabels[category] || "Products" : "All Products";

  const FilterPanel = () => (
    <div className="space-y-0">
      {/* Clear all */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full mb-4 py-2 text-xs font-semibold uppercase tracking-wider text-nexus-red border border-nexus-red/30 rounded-lg hover:bg-nexus-red/10 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-3 h-3" /> Clear All Filters ({activeFilterCount})
        </button>
      )}

      {/* Brands */}
      <FilterSection title="Brand">
        <div className="space-y-0.5 max-h-52 overflow-y-auto no-scrollbar pr-1">
          {brandList.map(([brand, count]) => (
            <CheckItem
              key={brand}
              label={brand}
              count={count}
              checked={selectedBrands.includes(brand)}
              onChange={() => toggleBrand(brand)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-nexus-muted uppercase tracking-wider mb-1 block">Min ($)</label>
              <input
                type="number"
                placeholder="0"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm focus:border-nexus-blue/50 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-nexus-muted uppercase tracking-wider mb-1 block">Max ($)</label>
              <input
                type="number"
                placeholder="9999"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm focus:border-nexus-blue/50 outline-none"
              />
            </div>
          </div>
          {/* Quick price chips */}
          <div className="flex flex-wrap gap-1.5">
            {[["Under $100", "", "100"], ["$100–$500", "100", "500"], ["$500–$1000", "500", "1000"], ["$1000+", "1000", ""]].map(([label, min, max]) => {
              const active = priceMin === min && priceMax === max;
              return (
                <button
                  key={label}
                  onClick={() => { setPriceMin(active ? "" : min); setPriceMax(active ? "" : max); }}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all ${active ? "bg-nexus-blue text-black border-nexus-blue" : "border-nexus-border hover:border-nexus-blue/50 text-nexus-muted hover:text-nexus-text"
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Min Rating">
        <div className="space-y-1">
          {[4, 3, 2, 0].map(r => (
            <button
              key={r}
              onClick={() => setMinRating(minRating === r ? 0 : r)}
              className={`flex items-center gap-2 w-full py-1.5 px-2 rounded-lg text-sm transition-all ${minRating === r ? "bg-nexus-blue/10 text-nexus-blue" : "hover:bg-nexus-surface text-nexus-muted hover:text-nexus-text"
                }`}
            >
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= (r || 5) ? "text-nexus-blue fill-nexus-blue" : "text-nexus-border"}`} />
                ))}
              </div>
              <span>{r === 0 ? "All ratings" : `${r}+ stars`}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Quick filters */}
      <FilterSection title="Quick Filters" defaultOpen={true}>
        <div className="space-y-0.5">
          <CheckItem label="In Stock Only" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)} />
          <CheckItem label="On Sale / Deals" checked={onlyDeals} onChange={() => setOnlyDeals(!onlyDeals)} />
          <CheckItem label="New Arrivals" checked={onlyNew} onChange={() => setOnlyNew(!onlyNew)} />
          <CheckItem label="Best Sellers" checked={onlyBestSeller} onChange={() => setOnlyBestSeller(!onlyBestSeller)} />
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-4xl font-bold">{title}</h1>
        <p className="text-nexus-muted mt-1 text-sm">
          {loading ? "Loading..." : `${filtered.length} of ${products.length} products`}
        </p>
      </div>

      {/* Search + sort + mobile filter toggle */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-nexus-card border border-nexus-border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:border-nexus-blue/50 transition-colors outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-nexus-muted hover:text-nexus-text" />
            </button>
          )}
        </div>
        <select
          value={sort} onChange={e => setSort(e.target.value)}
          className="hidden md:block bg-nexus-card border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50 transition-colors outline-none"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="rating">Top Rated</option>
        </select>
        {/* Mobile filter button */}
        <button
          onClick={() => setFilterOpen(true)}
          className="md:hidden relative flex items-center gap-2 px-4 py-2.5 bg-nexus-card border border-nexus-border rounded-lg text-sm font-medium hover:border-nexus-blue/50 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-nexus-blue text-black text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="hidden md:block w-60 shrink-0">
          <div className="sticky top-[150px] bg-nexus-card border border-nexus-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <span className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-nexus-blue" /> Filters
              </span>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="text-xs text-nexus-red hover:underline">
                  Clear ({activeFilterCount})
                </button>
              )}
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* ── PRODUCT GRID ── */}
        <div className="flex-1 min-w-0">
          {/* Mobile sort */}
          <div className="flex justify-between items-center mb-4 md:hidden">
            <span className="text-sm text-nexus-muted">{filtered.length} results</span>
            <select
              value={sort} onChange={e => setSort(e.target.value)}
              className="bg-nexus-card border border-nexus-border rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedBrands.map(b => (
                <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 bg-nexus-blue/15 border border-nexus-blue/30 text-nexus-blue text-xs rounded-full">
                  {b}
                  <button onClick={() => toggleBrand(b)}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {(priceMin || priceMax) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-nexus-blue/15 border border-nexus-blue/30 text-nexus-blue text-xs rounded-full">
                  ${priceMin || "0"} – ${priceMax || "∞"}
                  <button onClick={() => { setPriceMin(""); setPriceMax(""); }}><X className="w-3 h-3" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-nexus-blue/15 border border-nexus-blue/30 text-nexus-blue text-xs rounded-full">
                  In Stock <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {onlyDeals && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-nexus-blue/15 border border-nexus-blue/30 text-nexus-blue text-xs rounded-full">
                  On Sale <button onClick={() => setOnlyDeals(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {onlyNew && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-nexus-blue/15 border border-nexus-blue/30 text-nexus-blue text-xs rounded-full">
                  New <button onClick={() => setOnlyNew(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {onlyBestSeller && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-nexus-blue/15 border border-nexus-blue/30 text-nexus-blue text-xs rounded-full">
                  Best Seller <button onClick={() => setOnlyBestSeller(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-nexus-blue/15 border border-nexus-blue/30 text-nexus-blue text-xs rounded-full">
                  {minRating}+ ★ <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="bg-nexus-card border border-nexus-border rounded-xl h-72 animate-shimmer" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="font-display text-xl font-semibold mb-2">No products found</h3>
              <p className="text-nexus-muted mb-4">Try adjusting your filters</p>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="px-4 py-2 bg-nexus-blue text-black rounded-lg text-sm font-semibold hover:bg-nexus-blue/80 transition-colors">
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] md:hidden rounded-t-2xl"
              style={{ background: "var(--nexus-card)", maxHeight: "85vh", overflowY: "auto", paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-nexus-border rounded-full" />
              </div>

              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-display font-bold text-base flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-nexus-blue" /> Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-nexus-blue text-black text-xs font-bold rounded-full">{activeFilterCount}</span>
                    )}
                  </span>
                  <button onClick={() => setFilterOpen(false)} className="p-1 text-nexus-muted hover:text-nexus-text">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterPanel />
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full py-3 bg-nexus-blue text-black font-bold rounded-xl text-sm mt-4 hover:bg-nexus-blue/80 transition-colors"
                >
                  Show {filtered.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-nexus-card rounded-xl h-72 animate-shimmer" />)}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
