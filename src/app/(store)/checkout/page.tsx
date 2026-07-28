"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Check, AlertTriangle, Lock } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CartItem { id: string; name: string; price: string; qty: number; stock: number; }

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", street: "", city: "", state: "", zip: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try { setCart(JSON.parse(stored)); } catch { router.push("/cart"); }
    } else { router.push("/cart"); }
  }, [router]);

  const subtotal = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 500 ? 0 : 29.99;
  const total = subtotal + tax + (cart.length > 0 ? shipping : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.id, qty: i.qty })),
          shippingAddress: { name: form.name, street: form.street, city: form.city, state: form.state, zip: form.zip },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      router.push(`/orders?success=${data.order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-nexus-card border border-nexus-border rounded-xl p-6">
              <h3 className="font-display text-lg font-bold mb-4">Shipping Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-nexus-muted mb-1 block">Full Name</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" />
                </div>
                <div>
                  <label className="text-sm text-nexus-muted mb-1 block">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" />
                </div>
                <div>
                  <label className="text-sm text-nexus-muted mb-1 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-nexus-muted mb-1 block">Street Address</label>
                  <input required value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" />
                </div>
                <div>
                  <label className="text-sm text-nexus-muted mb-1 block">City</label>
                  <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" />
                </div>
                <div>
                  <label className="text-sm text-nexus-muted mb-1 block">State</label>
                  <input required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" />
                </div>
                <div>
                  <label className="text-sm text-nexus-muted mb-1 block">ZIP Code</label>
                  <input required value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" />
                </div>
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-nexus-card border border-nexus-border rounded-xl p-6">
              <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment</h3>
              <div className="bg-nexus-surface rounded-lg p-4 border border-nexus-blue/20">
                <div className="flex items-center gap-2 text-nexus-blue text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Secure checkout - Payment will be processed via Stripe (demo mode)</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-nexus-card border border-nexus-border rounded-xl p-6 sticky top-40">
              <h3 className="font-display text-lg font-bold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-nexus-muted truncate max-w-[200px]">{item.name} ×{item.qty}</span>
                    <span>{formatPrice(Number(item.price) * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-nexus-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-nexus-muted">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-nexus-muted">Tax (8%)</span><span>{formatPrice(tax)}</span></div>
                <div className="flex justify-between"><span className="text-nexus-muted">Shipping</span><span>{shipping === 0 ? <span className="text-nexus-cyan">FREE</span> : formatPrice(shipping)}</span></div>
                <div className="border-t border-nexus-border pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span><span className="text-nexus-blue">{formatPrice(total)}</span>
                </div>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-nexus-blue text-white font-semibold rounded-xl hover:bg-nexus-blue/80 disabled:opacity-50 transition-colors">
                {loading ? "Processing..." : <><Lock className="w-4 h-4" /> Place Order</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
