"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart, Shield, Truck, ArrowLeft, Check, AlertTriangle, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string; name: string; brand: string; slug: string; sku: string; price: string;
  discountPrice: string | null; stock: number; rating: string | null;
  reviewCount: number | null; images: string[] | null; warranty: string | null;
  specs: Record<string, string> | null; compatibility: Record<string, string> | null;
  description: string | null; isNewArrival: boolean | null; isBestSeller: boolean | null;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.product ?? data ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Sync wishlist state whenever product loads
  useEffect(() => {
    if (!product) return;
    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setInWishlist(list.some((i: { id: string }) => i.id === product.id));
  }, [product]);

  const toggleWishlist = () => {
    if (!product) return;
    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const existingIndex = list.findIndex((i: { id: string }) => i.id === product.id);
    if (existingIndex > -1) {
      list.splice(existingIndex, 1);
      setInWishlist(false);
    } else {
      list.push({ 
        id: product.id, 
        name: product.name, 
        brand: product.brand,
        price: product.price, 
        discountPrice: product.discountPrice,
        images: product.images,
        stock: product.stock,
        rating: product.rating,
        reviewCount: product.reviewCount
      });
      setInWishlist(true);
    }
    localStorage.setItem("wishlist", JSON.stringify(list));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-nexus-card rounded-none h-96 animate-shimmer" />
        <div className="space-y-4">
          <div className="bg-nexus-card rounded-none h-8 w-48 animate-shimmer" />
          <div className="bg-nexus-card rounded-none h-12 animate-shimmer" />
          <div className="bg-nexus-card rounded-none h-6 w-32 animate-shimmer" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-4xl mb-4">😕</p>
      <h2 className="font-display text-2xl font-bold mb-2">Product Not Found</h2>
      <Link href="/products" className="text-nexus-blue hover:underline">Back to products</Link>
    </div>
  );

  const price = Number(product.discountPrice || product.price);
  const originalPrice = product.discountPrice ? Number(product.price) : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const outOfStock = product.stock <= 0;
  const rating = Number(product.rating || 0);

  const getEmoji = () => {
    const n = product.name.toLowerCase();
    if (n.includes("rtx") || n.includes("radeon")) return "🎮";
    if (n.includes("core i") || n.includes("ryzen")) return "⚡";
    if (n.includes("z790") || n.includes("x670") || n.includes("b650")) return "🔧";
    if (n.includes("ddr") || n.includes("trident") || n.includes("vengeance")) return "💾";
    if (n.includes("ssd") || n.includes("nvme")) return "💿";
    if (n.includes("psu") || n.includes("rm1000") || n.includes("supernova")) return "🔌";
    if (n.includes("o11") || n.includes("h7")) return "🖥️";
    if (n.includes("kraken") || n.includes("noctua")) return "❄️";
    if (n.includes("mouse") || n.includes("keyboard")) return "🖱️";
    if (n.includes("laptop")) return "💻";
    return "🔲";
  };

  const addToCart = () => {
    if (outOfStock) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i: { id: string }) => i.id === product.id);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, product.stock);
    } else {
      cart.push({ id: product.id, name: product.name, price: price.toString(), qty, image: "", stock: product.stock });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-nexus-muted hover:text-nexus-blue mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image area */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative">
          <div className="bg-nexus-card border border-nexus-border rounded-none flex items-center justify-center min-h-[400px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-nexus-blue/5 to-nexus-purple/5" />
            {product.images && product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="relative z-10 max-h-80 w-full object-contain p-6"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const emoji = e.currentTarget.nextElementSibling as HTMLElement;
                  if (emoji) emoji.style.display = "block";
                }}
              />
            ) : null}
            <span
              className="text-[120px] relative z-10"
              style={{ display: product.images && product.images[0] ? "none" : "block" }}
            >
              {getEmoji()}
            </span>
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
              {discount > 0 && <span className="px-3 py-1 bg-nexus-red text-white text-xs font-bold rounded-none">-{discount}% OFF</span>}
              {product.isNewArrival && <span className="px-3 py-1 bg-nexus-blue text-black text-xs font-bold rounded-none">NEW</span>}
              {product.isBestSeller && <span className="px-3 py-1 bg-nexus-purple text-white text-xs font-bold rounded-none">BEST SELLER</span>}
            </div>
            {outOfStock && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-red-900/80 text-red-300 text-xs font-bold rounded-none z-20">OUT OF STOCK</div>
            )}
          </div>

        </motion.div>

        {/* Product Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <p className="text-sm text-nexus-muted uppercase tracking-wider mb-1">{product.brand}</p>
            <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
            <p className="text-xs text-nexus-muted mt-2">SKU: {product.sku}</p>
          </div>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= Math.round(rating) ? "text-nexus-blue fill-nexus-blue" : "text-nexus-border"}`} />)}</div>
              <span className="text-sm text-nexus-muted">{rating} ({product.reviewCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="font-display text-4xl font-bold text-nexus-blue">{formatPrice(price)}</span>
            {originalPrice && <span className="text-xl text-nexus-muted line-through">{formatPrice(originalPrice)}</span>}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {outOfStock ? (
              <span className="flex items-center gap-1 text-red-400 text-sm"><AlertTriangle className="w-4 h-4" /> Out of Stock</span>
            ) : product.stock <= 10 ? (
              <span className="flex items-center gap-1 text-nexus-pink text-sm"><AlertTriangle className="w-4 h-4" /> Only {product.stock} left!</span>
            ) : (
              <span className="flex items-center gap-1 text-nexus-blue text-sm"><Check className="w-4 h-4" /> In Stock ({product.stock} available)</span>
            )}
          </div>

          {/* Description */}
          {product.description && <p className="text-nexus-muted leading-relaxed">{product.description}</p>}

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-nexus-border rounded-none">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-nexus-surface transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="px-4 font-medium">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 hover:bg-nexus-surface transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
            <button
              onClick={addToCart}
              disabled={outOfStock}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-nexus-blue text-black font-semibold rounded-none hover:bg-nexus-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {addedToCart ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
            </button>
            <button
              onClick={toggleWishlist}
              className={`p-3.5 border transition-all flex items-center justify-center rounded-none ${
                inWishlist 
                  ? "bg-nexus-red border-nexus-red text-white hover:bg-nexus-red/80" 
                  : "bg-nexus-surface border-nexus-border text-nexus-blue hover:bg-nexus-blue hover:text-black"
              }`}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? "fill-white" : ""}`} />
            </button>
          </div>

          {/* Warranty + shipping */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-nexus-surface rounded-lg p-3">
              <Shield className="w-5 h-5 text-nexus-blue" />
              <div><p className="text-xs text-nexus-muted">Warranty</p><p className="text-sm font-medium">{product.warranty || "1 Year"}</p></div>
            </div>
            <div className="flex items-center gap-2 bg-nexus-surface rounded-lg p-3">
              <Truck className="w-5 h-5 text-nexus-cyan" />
              <div><p className="text-xs text-nexus-muted">Shipping</p><p className="text-sm font-medium">{price >= 500 ? "Free" : "$29.99"}</p></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Specs */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4">Specifications</h2>
          <div className="bg-nexus-card border border-nexus-border rounded-xl overflow-hidden">
            {Object.entries(product.specs).map(([key, value], i) => (
              <div key={key} className={`flex items-center justify-between px-6 py-3 ${i % 2 === 0 ? "bg-nexus-surface/50" : ""}`}>
                <span className="text-sm text-nexus-muted">{key}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
