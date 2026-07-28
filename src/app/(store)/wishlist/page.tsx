"use client";

import { useEffect, useState } from "react";
import { Heart, Trash2, ShoppingCart, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  discountPrice: string | null;
  images: string[] | null;
  stock: number;
  rating: string | null;
  reviewCount: number | null;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setItems(list);
    setLoading(false);
  }, []);

  const removeFromWishlist = (id: string) => {
    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const updated = list.filter((item: WishlistItem) => item.id !== id);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setItems(updated);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const addToCart = (product: WishlistItem) => {
    if (product.stock <= 0) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i: { id: string }) => i.id === product.id);
    const price = Number(product.discountPrice || product.price);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: product.id, name: product.name, price: price.toString(), qty: 1, image: product.images?.[0] || "", stock: product.stock });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    
    // Optionally remove from wishlist once added to cart
    removeFromWishlist(product.id);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8 uppercase tracking-wide">My Wishlist</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-nexus-card border border-nexus-border animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-nexus-blue">My Wishlist ({items.length})</h1>
        <Link href="/products" className="text-xs uppercase tracking-wider font-semibold text-nexus-muted hover:text-nexus-blue flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-nexus-card border border-nexus-border">
          <Heart className="w-16 h-16 text-nexus-muted mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Your Wishlist is Empty</h2>
          <p className="text-nexus-muted mb-6">Save your favorite components and tech gear here.</p>
          <Link href="/products" className="px-6 py-3 bg-nexus-blue text-black font-bold uppercase tracking-wider hover:bg-nexus-blue/80 transition-colors">
            Browse Products
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const price = Number(item.discountPrice || item.price);
            const originalPrice = item.discountPrice ? Number(item.price) : null;
            const outOfStock = item.stock <= 0;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col sm:flex-row items-center justify-between p-4 bg-nexus-card border border-nexus-border gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 bg-nexus-surface border border-nexus-border flex items-center justify-center text-3xl shrink-0">
                    💻
                  </div>
                  <div>
                    <span className="text-[10px] text-nexus-muted font-bold uppercase tracking-wider">{item.brand}</span>
                    <h3 className="font-semibold text-sm hover:text-nexus-blue transition-colors line-clamp-1">
                      <Link href={`/products/${item.id}`}>{item.name}</Link>
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-nexus-blue font-bold text-sm">{formatPrice(price)}</span>
                      {originalPrice && (
                        <span className="text-nexus-muted line-through text-xs">{formatPrice(originalPrice)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 border border-nexus-border text-nexus-muted hover:text-nexus-red hover:border-nexus-red/40 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={outOfStock}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-nexus-blue text-black font-bold text-xs uppercase tracking-wider hover:bg-nexus-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {outOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
