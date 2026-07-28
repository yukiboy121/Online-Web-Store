"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Search, X, Save } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string; 
  name: string; 
  brand: string; 
  sku: string; 
  price: string;
  discountPrice: string | null; 
  stock: number; 
  categoryId: number | null;
  isFeatured: boolean | null; 
  isNewArrival: boolean | null; 
  isBestSeller: boolean | null;
  slug: string; 
  warranty: string | null; 
  description: string | null;
  images?: string[] | null;
  specs?: Record<string, string> | null;
  compatibility?: Record<string, string> | null;
}

interface Category { 
  id: number; 
  name: string; 
  slug: string; 
}

const parseKeyValue = (text: string) => {
  const obj: Record<string, string> = {};
  text.split("\n").forEach(line => {
    const idx = line.indexOf(":");
    if (idx > -1) {
      const key = line.substring(0, idx).trim();
      const value = line.substring(idx + 1).trim();
      if (key) obj[key] = value;
    }
  });
  return obj;
};

const formatKeyValue = (obj: Record<string, string> | null | undefined) => {
  if (!obj) return "";
  return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join("\n");
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<Product | null>(null);
  const [addModal, setAddModal] = useState(false);
  
  const [form, setForm] = useState({ 
    name: "", 
    brand: "", 
    sku: "", 
    slug: "", 
    price: "", 
    discountPrice: "", 
    stock: "0", 
    categoryId: "", 
    warranty: "1 Year", 
    description: "", 
    isFeatured: false, 
    isNewArrival: false, 
    isBestSeller: false,
    images: "",
    specs: "",
    compatibility: ""
  });

  const loadProducts = () => {
    Promise.all([
      fetch("/api/products?limit=100").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([p, c]) => {
      setProducts(p.products || []);
      setCategories(c.categories || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, 
      brand: p.brand, 
      sku: p.sku, 
      slug: p.slug,
      price: p.price, 
      discountPrice: p.discountPrice || "", 
      stock: p.stock.toString(),
      categoryId: p.categoryId?.toString() || "", 
      warranty: p.warranty || "1 Year",
      description: p.description || "", 
      isFeatured: !!p.isFeatured, 
      isNewArrival: !!p.isNewArrival, 
      isBestSeller: !!p.isBestSeller,
      images: p.images ? p.images.join(", ") : "",
      specs: formatKeyValue(p.specs),
      compatibility: formatKeyValue(p.compatibility)
    });
    setEditModal(p);
  };

  const openAdd = () => {
    setForm({ 
      name: "", 
      brand: "", 
      sku: "", 
      slug: "", 
      price: "", 
      discountPrice: "", 
      stock: "0", 
      categoryId: "", 
      warranty: "1 Year", 
      description: "", 
      isFeatured: false, 
      isNewArrival: false, 
      isBestSeller: false,
      images: "",
      specs: "",
      compatibility: ""
    });
    setAddModal(true);
  };

  const handleSave = async () => {
    const imagesArray = form.images
      ? form.images.split(",").map(i => i.trim()).filter(Boolean)
      : [];

    const specsObj = parseKeyValue(form.specs);
    const compatibilityObj = parseKeyValue(form.compatibility);

    const body = {
      name: form.name,
      brand: form.brand,
      price: form.price,
      discountPrice: form.discountPrice || null,
      stock: parseInt(form.stock),
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      slug: form.slug || form.name.toLowerCase().replace(/[^\w]+/g, "-"),
      sku: form.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
      warranty: form.warranty,
      description: form.description,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      isBestSeller: form.isBestSeller,
      images: imagesArray,
      specs: specsObj,
      compatibility: compatibilityObj
    };

    if (editModal) {
      await fetch(`/api/products/${editModal.id}`, { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body) 
      });
    } else {
      await fetch("/api/products", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body) 
      });
    }
    setEditModal(null); 
    setAddModal(false);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts(products.filter(p => p.id !== id));
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search products..."
            className="w-full bg-nexus-surface border border-nexus-border rounded-none pl-10 pr-4 py-2.5 text-sm focus:border-nexus-blue/60" 
          />
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 px-4 py-2.5 bg-nexus-blue text-black rounded-none text-sm font-semibold hover:bg-nexus-blue/80 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-nexus-card border border-nexus-border rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-nexus-border bg-nexus-surface/50 text-left uppercase text-xs tracking-wider">
                <th className="px-4 py-3 text-nexus-muted font-medium">Product</th>
                <th className="px-4 py-3 text-nexus-muted font-medium">SKU</th>
                <th className="px-4 py-3 text-nexus-muted font-medium">Price</th>
                <th className="px-4 py-3 text-nexus-muted font-medium">Stock</th>
                <th className="px-4 py-3 text-right text-nexus-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-4">
                      <div className="h-6 bg-nexus-surface animate-shimmer" />
                    </td>
                  </tr>
                ))
              ) : filtered.map((p, i) => (
                <motion.tr 
                  key={p.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-nexus-border/50 hover:bg-nexus-surface/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold truncate max-w-[250px] text-nexus-text">{p.name}</p>
                    <p className="text-xs text-nexus-muted uppercase tracking-wider">{p.brand}</p>
                  </td>
                  <td className="px-4 py-3 text-nexus-muted font-mono">{p.sku}</td>
                  <td className="px-4 py-3">
                    <span className="text-nexus-blue font-bold">{formatPrice(p.price)}</span>
                    {p.discountPrice && (
                      <span className="text-xs text-nexus-pink ml-2">Sale: {formatPrice(p.discountPrice)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-none text-xs font-bold ${
                      p.stock === 0 
                        ? "bg-nexus-red/10 text-nexus-red border border-nexus-red/20" 
                        : p.stock < 10 
                          ? "bg-nexus-pink/10 text-nexus-pink border border-nexus-pink/20" 
                          : "bg-green-500/10 text-green-500 border border-green-500/20"
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => openEdit(p)} 
                      className="p-1.5 hover:bg-nexus-surface rounded-none text-nexus-muted hover:text-nexus-blue transition-colors mr-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      className="p-1.5 hover:bg-nexus-surface rounded-none text-nexus-muted hover:text-nexus-red transition-colors"
                    >
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
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setEditModal(null); setAddModal(false); }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-nexus-card border border-nexus-border rounded-none w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6 border-b border-nexus-border pb-4">
                <h3 className="font-display text-xl font-bold uppercase tracking-wider text-nexus-blue">
                  {editModal ? "Edit Product Registry" : "Add New Product"}
                </h3>
                <button 
                  onClick={() => { setEditModal(null); setAddModal(false); }} 
                  className="p-2 hover:bg-nexus-surface text-nexus-muted hover:text-nexus-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Product Name</label>
                  <input 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Brand</label>
                    <input 
                      value={form.brand} 
                      onChange={e => setForm({ ...form, brand: e.target.value })} 
                      className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60" 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">SKU Code</label>
                    <input 
                      value={form.sku} 
                      onChange={e => setForm({ ...form, sku: e.target.value })} 
                      className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Category</label>
                    <select 
                      value={form.categoryId} 
                      onChange={e => setForm({ ...form, categoryId: e.target.value })} 
                      className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60"
                    >
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Warranty Details</label>
                    <input 
                      value={form.warranty} 
                      onChange={e => setForm({ ...form, warranty: e.target.value })} 
                      placeholder="e.g. 3 Years, 10 Months"
                      className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Price</label>
                    <input 
                      value={form.price} 
                      onChange={e => setForm({ ...form, price: e.target.value })} 
                      className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60" 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Discount Price</label>
                    <input 
                      value={form.discountPrice} 
                      onChange={e => setForm({ ...form, discountPrice: e.target.value })} 
                      className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60" 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Stock Level</label>
                    <input 
                      type="number" 
                      value={form.stock} 
                      onChange={e => setForm({ ...form, stock: e.target.value })} 
                      className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Images (Comma separated URLs)</label>
                  <textarea 
                    value={form.images} 
                    onChange={e => setForm({ ...form, images: e.target.value })} 
                    rows={2} 
                    placeholder="https://image1.png, https://image2.png"
                    className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Specifications (Key: Value per line)</label>
                    <textarea 
                      value={form.specs} 
                      onChange={e => setForm({ ...form, specs: e.target.value })} 
                      rows={4} 
                      placeholder="GPU: RTX 4080&#10;VRAM: 16GB GDDR6X&#10;Interface: PCIe 4.0"
                      className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60 font-mono" 
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Compatibility (Key: Value per line)</label>
                    <textarea 
                      value={form.compatibility} 
                      onChange={e => setForm({ ...form, compatibility: e.target.value })} 
                      rows={4} 
                      placeholder="Socket: AM5&#10;RAM Type: DDR5&#10;Chipset: X670"
                      className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60 font-mono" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-nexus-muted mb-1 block">Description</label>
                  <textarea 
                    value={form.description} 
                    onChange={e => setForm({ ...form, description: e.target.value })} 
                    rows={3} 
                    className="w-full bg-nexus-surface border border-nexus-border rounded-none px-4 py-2.5 text-sm focus:border-nexus-blue/60" 
                  />
                </div>
                <div className="flex gap-6 py-2 border-t border-nexus-border">
                  <label className="flex items-center gap-2 text-sm text-nexus-text cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={form.isFeatured} 
                      onChange={e => setForm({ ...form, isFeatured: e.target.checked })} 
                      className="accent-nexus-blue" 
                    /> Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-nexus-text cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={form.isNewArrival} 
                      onChange={e => setForm({ ...form, isNewArrival: e.target.checked })} 
                      className="accent-nexus-blue" 
                    /> New Arrival
                  </label>
                  <label className="flex items-center gap-2 text-sm text-nexus-text cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={form.isBestSeller} 
                      onChange={e => setForm({ ...form, isBestSeller: e.target.checked })} 
                      className="accent-nexus-blue" 
                    /> Best Seller
                  </label>
                </div>
                <button 
                  onClick={handleSave} 
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-nexus-blue text-black font-bold uppercase tracking-wider hover:bg-nexus-blue/80 transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Product Registry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
