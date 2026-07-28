"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Warehouse, AlertTriangle, Package, Save, History } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface InventoryProduct { id: string; name: string; sku: string; stock: number; brand: string; price: string; }
interface LogEntry { id: string; productId: string; change: number; reason: string; previousStock: number; newStock: number; createdAt: string; }

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [lowStock, setLowStock] = useState<InventoryProduct[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState("");
  const [editReason, setEditReason] = useState("");

  const loadData = async () => {
    const res = await fetch("/api/admin/inventory").then(r => r.json());
    setProducts(res.products || []);
    setLowStock(res.lowStock || []);
    setLogs(res.logs || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const updateStock = async (productId: string) => {
    await fetch("/api/admin/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, newStock: parseInt(editStock), reason: editReason || "Manual adjustment" }),
    });
    setEditId(null); setEditStock(""); setEditReason("");
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-900/10 border border-yellow-900/30 rounded-xl p-6">
          <h3 className="font-display font-bold flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-yellow-400" /> Low Stock Alerts ({lowStock.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-nexus-card rounded-lg p-3">
                <div><p className="text-sm font-medium truncate max-w-[200px]">{p.name}</p><p className="text-xs text-nexus-muted">{p.sku}</p></div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.stock === 0 ? "bg-red-900/30 text-red-400" : "bg-yellow-900/30 text-yellow-400"}`}>{p.stock}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All products */}
      <div className="bg-nexus-card border border-nexus-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-nexus-border">
          <h3 className="font-display font-bold flex items-center gap-2"><Warehouse className="w-5 h-5" /> All Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-nexus-border">
              <th className="text-left px-4 py-3 text-nexus-muted font-medium">Product</th>
              <th className="text-left px-4 py-3 text-nexus-muted font-medium">SKU</th>
              <th className="text-left px-4 py-3 text-nexus-muted font-medium">Stock</th>
              <th className="text-right px-4 py-3 text-nexus-muted font-medium">Action</th>
            </tr></thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={4} className="px-4 py-4"><div className="h-6 bg-nexus-surface rounded animate-shimmer" /></td></tr>
              )) : products.map(p => (
                <tr key={p.id} className="border-b border-nexus-border/50 hover:bg-nexus-surface/50">
                  <td className="px-4 py-3"><p className="font-medium truncate max-w-[250px]">{p.name}</p><p className="text-xs text-nexus-muted">{p.brand}</p></td>
                  <td className="px-4 py-3 text-nexus-muted">{p.sku}</td>
                  <td className="px-4 py-3">
                    {editId === p.id ? (
                      <div className="flex items-center gap-2">
                        <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} className="w-20 bg-nexus-surface border border-nexus-border rounded px-2 py-1 text-sm" />
                        <input value={editReason} onChange={e => setEditReason(e.target.value)} placeholder="Reason" className="w-32 bg-nexus-surface border border-nexus-border rounded px-2 py-1 text-sm" />
                        <button onClick={() => updateStock(p.id)} className="p-1 text-nexus-cyan hover:bg-nexus-surface rounded"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setEditId(null)} className="p-1 text-nexus-muted hover:bg-nexus-surface rounded text-xs">Cancel</button>
                      </div>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.stock === 0 ? "bg-red-900/30 text-red-400" : p.stock < 10 ? "bg-yellow-900/30 text-yellow-400" : "bg-green-900/30 text-green-400"}`}>{p.stock}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditId(p.id); setEditStock(p.stock.toString()); }} className="text-nexus-blue text-xs hover:underline">Update Stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock movement log */}
      {logs.length > 0 && (
        <div className="bg-nexus-card border border-nexus-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-nexus-border">
            <h3 className="font-display font-bold flex items-center gap-2"><History className="w-5 h-5" /> Stock Movement Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-nexus-border">
                <th className="text-left px-4 py-3 text-nexus-muted font-medium">Date</th>
                <th className="text-left px-4 py-3 text-nexus-muted font-medium">Change</th>
                <th className="text-left px-4 py-3 text-nexus-muted font-medium">Reason</th>
                <th className="text-left px-4 py-3 text-nexus-muted font-medium">Stock</th>
              </tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-nexus-border/50">
                    <td className="px-4 py-2 text-xs text-nexus-muted">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2"><span className={log.change > 0 ? "text-green-400" : "text-red-400"}>{log.change > 0 ? "+" : ""}{log.change}</span></td>
                    <td className="px-4 py-2 text-nexus-muted">{log.reason}</td>
                    <td className="px-4 py-2">{log.previousStock} → {log.newStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
