"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Check, Clock, Truck, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string; status: string; total: string; createdAt: string;
}

const statusConfig: Record<string, { color: string; icon: typeof Check; label: string }> = {
  pending: { color: "text-yellow-400", icon: Clock, label: "Pending" },
  processing: { color: "text-blue-400", icon: Package, label: "Processing" },
  packed: { color: "text-purple-400", icon: Package, label: "Packed" },
  shipped: { color: "text-cyan-400", icon: Truck, label: "Shipped" },
  completed: { color: "text-green-400", icon: Check, label: "Completed" },
  cancelled: { color: "text-red-400", icon: AlertTriangle, label: "Cancelled" },
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const successId = searchParams.get("success");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders").then(r => r.ok ? r.json() : { orders: [] }).then(d => {
      setOrders(d.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {successId && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-nexus-cyan/10 border border-nexus-cyan/30 rounded-xl">
          <p className="flex items-center gap-2 text-nexus-cyan font-medium"><Check className="w-5 h-5" /> Order placed successfully! Order #{successId.substring(0, 8)}</p>
        </motion.div>
      )}

      <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-nexus-card rounded-xl animate-shimmer" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-nexus-muted mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-nexus-muted mb-6">Start shopping to see your orders here.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-nexus-blue text-white rounded-xl font-semibold">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-nexus-card border border-nexus-border rounded-xl p-5 hover:border-nexus-blue/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-nexus-muted">Order #{order.id.substring(0, 8)}</p>
                    <p className="font-display font-bold text-lg mt-1">{formatPrice(order.total)}</p>
                    <div className={`flex items-center gap-1 mt-2 text-sm ${status.color}`}>
                      <StatusIcon className="w-4 h-4" /> {status.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-nexus-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8"><div className="h-24 bg-nexus-card rounded-xl animate-shimmer" /></div>}>
      <OrdersContent />
    </Suspense>
  );
}
