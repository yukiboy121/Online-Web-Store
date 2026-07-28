"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Check, Clock, Truck, AlertTriangle, X as XIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Order { id: string; userId: string; status: string; total: string; subtotal: string; tax: string; shipping: string; createdAt: string; shippingAddress: Record<string, string> | null; }

const statuses = ["pending", "processing", "packed", "shipped", "completed", "cancelled"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-900/30 text-yellow-400",
  processing: "bg-blue-900/30 text-blue-400",
  packed: "bg-purple-900/30 text-purple-400",
  shipped: "bg-cyan-900/30 text-cyan-400",
  completed: "bg-green-900/30 text-green-400",
  cancelled: "bg-red-900/30 text-red-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    const url = filter ? `/api/orders?status=${filter}` : "/api/orders";
    const res = await fetch(url).then(r => r.json());
    setOrders(res.orders || []);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    loadOrders();
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter("")} className={`px-4 py-2 rounded-lg text-sm transition-colors ${!filter ? "bg-nexus-blue text-white" : "bg-nexus-surface text-nexus-muted hover:text-white"}`}>All</button>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${filter === s ? "bg-nexus-blue text-white" : "bg-nexus-surface text-nexus-muted hover:text-white"}`}>{s}</button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-nexus-card rounded-xl animate-shimmer" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-nexus-muted mx-auto mb-4" />
          <p className="text-nexus-muted">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-nexus-card border border-nexus-border rounded-xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-nexus-muted">Order #{order.id.substring(0, 8)}</p>
                  <p className="font-display font-bold text-xl mt-1 text-nexus-blue">{formatPrice(order.total)}</p>
                  <p className="text-xs text-nexus-muted mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                  {order.shippingAddress && (
                    <p className="text-xs text-nexus-muted mt-1">Ship to: {order.shippingAddress.name} — {order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    className="bg-nexus-surface border border-nexus-border rounded-lg px-3 py-2 text-sm focus:border-nexus-blue/50 capitalize"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || ""}`}>{order.status}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
