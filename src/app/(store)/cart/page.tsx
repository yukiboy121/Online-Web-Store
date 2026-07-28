"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: string; name: string; price: string; qty: number; image: string; stock: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try { setCart(JSON.parse(stored)); } catch { setCart([]); }
    }
  }, []);

  const updateCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQty = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, Math.min(item.stock, item.qty + delta));
        return { ...item, qty: newQty };
      }
      return item;
    });
    updateCart(updated);
  };

  const removeItem = (id: string) => updateCart(cart.filter(i => i.id !== id));

  const subtotal = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 500 ? 0 : 29.99;
  const total = subtotal + tax + (cart.length > 0 ? shipping : 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ShoppingBag className="w-16 h-16 text-nexus-muted mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-nexus-muted mb-6">Discover premium PC components and build your dream machine.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-nexus-blue text-white rounded-xl font-semibold hover:bg-nexus-blue/80 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Shop Now
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart ({cart.length})</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-nexus-card border border-nexus-border rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-20 h-20 bg-nexus-surface rounded-lg flex items-center justify-center text-3xl shrink-0">🔲</div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.id}`} className="text-sm font-semibold hover:text-nexus-blue transition-colors line-clamp-2">{item.name}</Link>
                <p className="text-nexus-blue font-display font-bold mt-1">{formatPrice(Number(item.price) * item.qty)}</p>
                <p className="text-xs text-nexus-muted">{formatPrice(item.price)} each</p>
              </div>
              <div className="flex items-center border border-nexus-border rounded-lg">
                <button onClick={() => updateQty(item.id, -1)} className="p-2 hover:bg-nexus-surface transition-colors"><Minus className="w-3 h-3" /></button>
                <span className="px-3 text-sm font-medium">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="p-2 hover:bg-nexus-surface transition-colors"><Plus className="w-3 h-3" /></button>
              </div>
              <button onClick={() => removeItem(item.id)} className="p-2 text-nexus-muted hover:text-nexus-red transition-colors"><Trash2 className="w-4 h-4" /></button>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-nexus-card border border-nexus-border rounded-xl p-6 sticky top-40">
            <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-nexus-muted">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-nexus-muted">Tax (8%)</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between"><span className="text-nexus-muted">Shipping</span><span>{shipping === 0 ? <span className="text-nexus-cyan">FREE</span> : formatPrice(shipping)}</span></div>
              <div className="border-t border-nexus-border pt-3 flex justify-between font-bold text-lg">
                <span>Total</span><span className="text-nexus-blue">{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout" className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-nexus-blue text-white font-semibold rounded-xl hover:bg-nexus-blue/80 transition-colors">
              Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/products" className="mt-3 w-full flex items-center justify-center gap-2 px-6 py-3 border border-nexus-border text-nexus-muted font-medium rounded-xl hover:border-nexus-blue/30 transition-colors text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
