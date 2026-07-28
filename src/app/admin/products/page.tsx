"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Search, X, Save, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string; name: string; brand: string; sku: string; price: string;
  discountPrice: string | null; stock: number; categoryId: number | null;
  isFeatured: boolean | null; isNewArrival: boolean | null; isBestSeller: boolean | null;
  slug: string; warranty: string | null; description: string | null;
}

interface Category { id: number; name: string; slug: string; }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<Product | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "", sku: "", slug: "", price: "", discountPrice: "", stock: "0", categoryId: "", warranty: "1 Year", description: "", isFeatured: false, isNewArrival: false, isBestSeller: false });

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=100").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([p, c]) => {
      setProducts(p.products || []);
      setCategories(c.categories || []);
      setLoading(false);
    });
  }, []);

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, brand: p.brand, sku: p.sku, slug: p.slug,
      price: p.price, discountPrice: p.discountPrice || "", stock: p.stock.toString(),
      categoryId: p.categoryId?.toString() || "", warranty: p.warranty || "1 Year",
      description: p.description || "", isFeatured: !!p.isFeatured, isNewArrival: !!p.isNewArrival, isBestSeller: !!p.isBestSeller,
    });
    setEditModal(p);
  };

  const openAdd = () => {
    setForm({ name: "", brand: "", sku: "", slug: "", price: "", discountPrice: "", stock: "0", categoryId: "", warranty: "1 Year", description: "", isFeatured: false, isNewArrival: false, isBestSeller: false });
    setAddModal(true);
  };

  const handleSave = async () => {
    const body = {
      ...form,
      price: form.price,
      discountPrice: form.discountPrice || null,
      stock: parseInt(form.stock),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      slug: form.slug || form.name.toLowerCase().replace(/[^\w]+/g, "-"),
      sku: form.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
    };
    if (editModal) {
      await fetch(`/api/products/${editModal.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setEditModal(null); setAddModal(false);
    const res = await fetch("/api/products?limit=100").then(r => r.json());
    setProducts(res.products || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts(products.filter(p => p.id !== id));
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full bg-nexus-surface border border-nexus-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-nexus-blue/50" />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-nexus-blue text-white rounded-lg text-sm font-medium hover:bg-nexus-blue/80 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-nexus-card border border-nexus-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-nexus-border">
                <th className="text-left px-4 py-3 text-nexus-muted font-medium">Product</th>
                <th className="text-left px-4 py-3 text-nexus-muted font-medium">SKU</th>
                <th className="text-left px-4 py-3 text-nexus-muted font-medium">Price</th>
                <th className="text-left px-4 py-3 text-nexus-muted font-medium">Stock</th>
                <th className="text-right px-4 py-3 text-nexus-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-6 bg-nexus-surface rounded animate-shimmer" /></td></tr>
                ))
              ) : filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-nexus-border/50 hover:bg-nexus-surface/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium truncate max-w-[250px]">{p.name}</p>
                    <p className="text-xs text-nexus-muted">{p.brand}</p>
                  </td>
                  <td className="px-4 py-3 text-nexus-muted">{p.sku}</td>
                  <td className="px-4 py-3">
                    <span className="text-nexus-blue font-medium">{formatPrice(p.price)}</span>
                    {p.discountPrice && <span className="text-xs text-nexus-cyan ml-1">Sale: {formatPrice(p.discountPrice)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.stock === 0 ? "bg-red-900/30 text-red-400" : p.stock < 10 ? "bg-yellow-900/30 text-yellow-400" : "bg-green-900/30 text-green-400"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-nexus-surface rounded-lg text-nexus-muted hover:text-nexus-blue transition-colors mr-1">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-nexus-surface rounded-lg text-nexus-muted hover:text-nexus-red transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {(editModal || addModal) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setEditModal(null); setAddModal(false); }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-nexus-card border border-nexus-border rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold">{editModal ? "Edit Product" : "Add Product"}</h3>
                <button onClick={() => { setEditModal(null); setAddModal(false); }} className="p-2 hover:bg-nexus-surface rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm text-nexus-muted mb-1 block">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-nexus-muted mb-1 block">Brand</label><input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                  <div><label className="text-sm text-nexus-muted mb-1 block">SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                </div>
                <div><label className="text-sm text-nexus-muted mb-1 block">Category</label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="text-sm text-nexus-muted mb-1 block">Price</label><input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                  <div><label className="text-sm text-nexus-muted mb-1 block">Discount</label><input value={form.discountPrice} onChange={e => setForm({ ...form, discountPrice: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                  <div><label className="text-sm text-nexus-muted mb-1 block">Stock</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                </div>
                <div><label className="text-sm text-nexus-muted mb-1 block">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="rounded" /> Featured</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isNewArrival} onChange={e => setForm({ ...form, isNewArrival: e.target.checked })} className="rounded" /> New</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isBestSeller} onChange={e => setForm({ ...form, isBestSeller: e.target.checked })} className="rounded" /> Best Seller</label>
                </div>
                <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-nexus-blue text-white font-semibold rounded-xl hover:bg-nexus-blue/80 transition-colors">
                  <Save className="w-4 h-4" /> Save Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
