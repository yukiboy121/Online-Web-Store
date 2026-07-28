"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart, Zap } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  brand: string;
  slug: string;
  price: string;
  discountPrice: string | null;
  stock: number;
  rating: string | null;
  reviewCount: number | null;
  images: string[] | null;
  specs: Record<string, string> | null;
  isNewArrival: boolean | null;
  isBestSeller: boolean | null;
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const price = Number(product.discountPrice || product.price);
  const originalPrice = product.discountPrice ? Number(product.price) : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const rating = Number(product.rating || 0);
  const outOfStock = product.stock <= 0;

  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setInWishlist(list.some((i: { id: string }) => i.id === product.id));
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i: { id: string }) => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: price.toString(), qty: 1, image: product.images?.[0] || "", stock: product.stock });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Generate icon based on category/brand
  const getProductEmoji = () => {
    const name = product.name.toLowerCase();
    if (name.includes("rtx") || name.includes("radeon") || name.includes("gpu")) return "🎮";
    if (name.includes("core i") || name.includes("ryzen")) return "⚡";
    if (name.includes("motherboard") || name.includes("z790") || name.includes("x670") || name.includes("b650")) return "🔧";
    if (name.includes("ram") || name.includes("ddr") || name.includes("trident") || name.includes("vengeance")) return "💾";
    if (name.includes("ssd") || name.includes("nvme") || name.includes("storage")) return "💿";
    if (name.includes("psu") || name.includes("power") || name.includes("supernova") || name.includes("rm1000")) return "🔌";
    if (name.includes("case") || name.includes("o11") || name.includes("h7")) return "🖥️";
    if (name.includes("cool") || name.includes("kraken") || name.includes("noctua")) return "❄️";
    if (name.includes("mouse") || name.includes("keyboard")) return "🖱️";
    if (name.includes("laptop")) return "💻";
    return "🔲";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/products/${product.id}`} className="group block">
        <div className={`relative bg-nexus-card border border-nexus-border rounded-none overflow-hidden hover:border-nexus-blue/60 transition-all duration-300 hover:shadow-2xl hover:shadow-nexus-blue/10 ${outOfStock ? "opacity-70" : ""}`}>
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="px-2 py-0.5 bg-nexus-red text-white text-[9px] font-bold uppercase tracking-wider rounded-none">
                -{discount}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="px-2 py-0.5 bg-nexus-blue text-black text-[9px] font-bold uppercase tracking-wider rounded-none">NEW</span>
            )}
            {product.isBestSeller && (
              <span className="px-2 py-0.5 bg-nexus-purple text-white text-[9px] font-bold uppercase tracking-wider rounded-none">BEST</span>
            )}
          </div>

          {outOfStock && (
            <div className="absolute top-3 right-3 z-10 px-2 py-0.5 bg-red-900/90 text-red-100 text-[9px] font-bold uppercase tracking-wider rounded-none">
              OUT OF STOCK
            </div>
          )}

          {/* Product Image Area */}
          <div className="relative h-44 bg-gradient-to-br from-nexus-surface to-nexus-bg flex items-center justify-center group-hover:from-nexus-blue/10 group-hover:to-nexus-purple/10 transition-all duration-500 border-b border-nexus-border/50">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{getProductEmoji()}</span>
            
            {/* Quick actions */}
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                type="button"
                onClick={toggleWishlist} 
                className={`p-2 rounded-none transition-all duration-200 ${
                  inWishlist 
                    ? "bg-nexus-red text-white hover:bg-nexus-red/80" 
                    : "bg-nexus-surface border border-nexus-border text-nexus-blue hover:bg-nexus-blue hover:text-black"
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? "fill-white" : ""}`} />
              </button>
              <button onClick={addToCart} disabled={outOfStock} className="p-2 bg-nexus-blue text-black rounded-none hover:bg-nexus-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-[10px] text-nexus-muted font-medium uppercase tracking-wider mb-1">{product.brand}</p>
            <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-nexus-blue transition-colors leading-tight mb-2 h-10">
              {product.name}
            </h3>

            {/* Key spec */}
            {product.specs && Object.entries(product.specs).slice(0, 2).map(([k, v]) => (
              <p key={k} className="text-[11px] text-nexus-muted"><span className="text-nexus-text/60">{k}:</span> {v}</p>
            ))}

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-nexus-blue fill-nexus-blue" : "text-nexus-border"}`} />
                  ))}
                </div>
                <span className="text-[11px] text-nexus-muted">({product.reviewCount})</span>
              </div>
            )}

            {/* Price */}
            <div className="mt-3 flex items-end gap-2">
              <span className="text-lg font-bold text-nexus-blue font-display">{formatPrice(price)}</span>
              {originalPrice && (
                <span className="text-sm text-nexus-muted line-through">{formatPrice(originalPrice)}</span>
              )}
            </div>

            {/* Stock indicator */}
            {!outOfStock && product.stock <= 10 && (
              <p className="text-[11px] text-nexus-pink mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Only {product.stock} left!
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
