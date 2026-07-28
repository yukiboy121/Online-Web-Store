"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Warehouse, AlertTriangle, Package, Save, History, Search, Plus, Minus, X, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface InventoryProduct { 
  id: string; 
  name: string; 
  sku: string; 
  stock: number; 
  brand: string; 
  price: string; 
  categoryId: number | null;
}

interface LogEntry { 
  id: string; 
  productId: string; 
  change: number; 
  reason: string; 
  previousStock: number; 
  newStock: number; 
  createdAt: string; 
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [lowStock, setLowStock] = useState<InventoryProduct[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");

  // Inline Stock Editing State
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [stockReasons, setStockReasons] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory").then(r => r.json());
      setProducts(res.products || []);
      setLowStock(res.lowStock || []);
      setLogs(res.logs || []);
      setCategories(res.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const handleStepStock = (productId: string, step: number, currentStock: number) => {
    const draftStock = stockChanges[productId] !== undefined ? stockChanges[productId] : currentStock;
    const newStock = Math.max(0, draftStock + step);
    setStockChanges(prev => ({ ...prev, [productId]: newStock }));
  };

  const handleInputChange = (productId: string, val: string, currentStock: number) => {
    if (val === "") {
      setStockChanges(prev => ({ ...prev, [productId]: 0 }));
      return;
    }
    const newStock = Math.max(0, parseInt(val));
    setStockChanges(prev => ({ ...prev, [productId]: newStock }));
  };

  const handleReasonChange = (productId: string, reason: string) => {
    setStockReasons(prev => ({ ...prev, [productId]: reason }));
  };

  const cancelRowChanges = (productId: string) => {
    setStockChanges(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
    setStockReasons(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const saveStockChange = async (productId: string, currentStock: number) => {
    const newStock = stockChanges[productId];
    if (newStock === undefined || newStock === currentStock) return;

    setSubmittingId(productId);
    const reason = stockReasons[productId] || "Manual stock adjustment";

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, newStock, reason }),
      });
      if (res.ok) {
        cancelRowChanges(productId);
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingId(null);
    }
  };

  // Filter products based on search query and category choice
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || 
      p.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-nexus-blue/5 border border-nexus-blue/20 rounded-none p-6"
        >
          <h3 className="font-display font-bold flex items-center gap-2 mb-4 text-nexus-blue">
            <AlertTriangle className="w-5 h-5 text-nexus-blue animate-pulse" /> LOW STOCK ALERTS ({lowStock.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-nexus-card border border-nexus-border p-3 rounded-none">
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px] text-nexus-text">{p.name}</p>
                  <p className="text-xs text-nexus-muted">{p.sku}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-none text-xs font-bold ${p.stock === 0 ? "bg-nexus-red/20 text-nexus-red border border-nexus-red/35" : "bg-nexus-blue/20 text-nexus-blue border border-nexus-blue/35"}`}>
                  {p.stock} Left
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search and Category Filters */}
      <div className="space-y-4 bg-nexus-card border border-nexus-border p-6 rounded-none">
        <h4 className="text-xs font-bold uppercase tracking-widest text-nexus-blue">Inventory Navigation & Filters</h4>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
          <input
            type="text"
            placeholder="Search by product name, brand, SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-nexus-surface border border-nexus-border rounded-none pl-10 pr-4 py-2.5 text-sm focus:border-nexus-blue/60 transition-colors"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-none transition-all ${
              selectedCategory === "all"
                ? "bg-nexus-blue text-black font-bold"
                : "bg-nexus-surface text-nexus-muted border border-nexus-border hover:border-nexus-blue/50 hover:text-nexus-text"
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map(cat => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-none transition-all ${
                  selectedCategory === cat.id
                    ? "bg-nexus-blue text-black font-bold"
                    : "bg-nexus-surface text-nexus-muted border border-nexus-border hover:border-nexus-blue/50 hover:text-nexus-text"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* All products Table */}
      <div className="bg-nexus-card border border-nexus-border rounded-none overflow-hidden">
        <div className="px-6 py-4 border-b border-nexus-border flex justify-between items-center">
          <h3 className="font-display font-bold flex items-center gap-2 uppercase tracking-wide">
            <Warehouse className="w-5 h-5 text-nexus-blue" /> Stock Registry ({filteredProducts.length})
          </h3>
          <button 
            onClick={loadData} 
            className="p-2 hover:bg-nexus-surface text-nexus-muted hover:text-nexus-blue transition-colors" 
            title="Refresh Registry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-nexus-border bg-nexus-surface/50 text-left uppercase text-xs tracking-wider">
                <th className="px-4 py-3 text-nexus-muted font-medium">Product Detail</th>
                <th className="px-4 py-3 text-nexus-muted font-medium">SKU</th>
                <th className="px-4 py-3 text-nexus-muted font-medium w-[240px]">Stock Level</th>
                <th className="px-4 py-3 text-nexus-muted font-medium">Adjustment Logs & Reason</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-4 py-4">
                      <div className="h-6 bg-nexus-surface animate-shimmer" />
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-nexus-muted">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const draftStock = stockChanges[p.id] !== undefined ? stockChanges[p.id] : p.stock;
                  const isModified = stockChanges[p.id] !== undefined && stockChanges[p.id] !== p.stock;

                  return (
                    <tr key={p.id} className="border-b border-nexus-border/50 hover:bg-nexus-surface/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold truncate max-w-[280px] text-nexus-text">{p.name}</p>
                        <p className="text-[10px] text-nexus-muted uppercase tracking-wider">{p.brand}</p>
                      </td>
                      <td className="px-4 py-3 text-nexus-muted font-mono">{p.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 select-none">
                          {/* Decrement Button */}
                          <button
                            type="button"
                            onClick={() => handleStepStock(p.id, -1, p.stock)}
                            className="w-7 h-7 bg-nexus-surface border border-nexus-border hover:border-nexus-blue hover:text-nexus-blue flex items-center justify-center font-bold text-base transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Stock Input Box */}
                          <input
                            type="number"
                            min="0"
                            value={draftStock}
                            onChange={e => handleInputChange(p.id, e.target.value, p.stock)}
                            className={`w-16 h-7 text-center bg-nexus-surface border font-semibold text-sm ${
                              isModified ? "border-nexus-blue text-nexus-blue" : "border-nexus-border text-nexus-text"
                            }`}
                          />

                          {/* Increment Button */}
                          <button
                            type="button"
                            onClick={() => handleStepStock(p.id, 1, p.stock)}
                            className="w-7 h-7 bg-nexus-surface border border-nexus-border hover:border-nexus-blue hover:text-nexus-blue flex items-center justify-center font-bold text-base transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Original Indicator status pill if not currently being changed */}
                          {!isModified && (
                            <span className={`ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold ${
                              p.stock === 0 
                                ? "text-nexus-red bg-nexus-red/10 border border-nexus-red/20" 
                                : p.stock < 10 
                                  ? "text-nexus-pink bg-nexus-pink/10 border border-nexus-pink/20" 
                                  : "text-green-500 bg-green-500/10 border border-green-500/20"
                            }`}>
                              {p.stock === 0 ? "Out" : p.stock < 10 ? "Low" : "Ok"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isModified ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Reason (e.g. Restocked, Damage)"
                              value={stockReasons[p.id] || ""}
                              onChange={e => handleReasonChange(p.id, e.target.value)}
                              className="bg-nexus-surface border border-nexus-blue/60 text-xs px-2.5 py-1 w-44 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => saveStockChange(p.id, p.stock)}
                              disabled={submittingId === p.id}
                              className="px-2.5 py-1 bg-nexus-blue text-black font-bold text-xs uppercase tracking-wider hover:bg-nexus-blue/80 transition-colors flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" /> Save
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelRowChanges(p.id)}
                              className="p-1 hover:bg-nexus-surface text-nexus-muted hover:text-nexus-red transition-colors"
                              title="Discard"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-nexus-muted italic">No pending changes</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock movement log */}
      {logs.length > 0 && (
        <div className="bg-nexus-card border border-nexus-border rounded-none overflow-hidden">
          <div className="px-6 py-4 border-b border-nexus-border">
            <h3 className="font-display font-bold flex items-center gap-2 uppercase tracking-wide">
              <History className="w-5 h-5 text-nexus-blue" /> Stock Log Timeline
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-nexus-border bg-nexus-surface/50 text-left uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-nexus-muted font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-nexus-muted font-medium">Delta</th>
                  <th className="px-4 py-3 text-nexus-muted font-medium">Adjustment Reason</th>
                  <th className="px-4 py-3 text-nexus-muted font-medium">Stock Levels</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 15).map(log => (
                  <tr key={log.id} className="border-b border-nexus-border/50 hover:bg-nexus-surface/10 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-nexus-muted">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-semibold">
                      <span className={log.change > 0 ? "text-green-500" : "text-nexus-red"}>
                        {log.change > 0 ? `+${log.change}` : log.change}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-nexus-text/80">{log.reason}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-nexus-muted">
                      {log.previousStock} → {log.newStock}
                    </td>
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
