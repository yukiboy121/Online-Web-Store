"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalRevenue: string;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalUsers: number;
  lowStockProducts: Array<{ id: string; name: string; stock: number; sku: string }>;
  recentOrders: Array<{ id: string; total: string; status: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-nexus-card rounded-xl animate-shimmer" />)}
    </div>
  );

  const cards = [
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: DollarSign, color: "text-nexus-cyan", bg: "bg-nexus-cyan/10" },
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingCart, color: "text-nexus-blue", bg: "bg-nexus-blue/10" },
    { label: "Pending Orders", value: stats.pendingOrders.toString(), icon: Package, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "Products", value: stats.totalProducts.toString(), icon: TrendingUp, color: "text-nexus-purple", bg: "bg-nexus-purple/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-nexus-card border border-nexus-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-nexus-muted">{card.label}</span>
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="font-display text-3xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-nexus-card border border-nexus-border rounded-xl p-6"
        >
          <h3 className="font-display text-lg font-bold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="text-nexus-muted text-sm">No orders yet</p>
            ) : stats.recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-nexus-border last:border-0">
                <div>
                  <p className="text-sm font-medium">#{order.id.substring(0, 8)}</p>
                  <p className="text-xs text-nexus-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-nexus-blue">{formatPrice(order.total)}</p>
                  <span className={`text-xs capitalize ${order.status === "pending" ? "text-yellow-400" : order.status === "completed" ? "text-green-400" : "text-nexus-muted"}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-nexus-card border border-nexus-border rounded-xl p-6"
        >
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" /> Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-nexus-muted text-sm">All products well stocked</p>
            ) : stats.lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-nexus-border last:border-0">
                <div>
                  <p className="text-sm font-medium truncate max-w-[250px]">{p.name}</p>
                  <p className="text-xs text-nexus-muted">{p.sku}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock === 0 ? "bg-red-900/30 text-red-400" : "bg-yellow-900/30 text-yellow-400"}`}>
                  {p.stock === 0 ? "OUT OF STOCK" : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
