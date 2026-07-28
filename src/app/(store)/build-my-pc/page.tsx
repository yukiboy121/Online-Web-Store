"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Monitor, Layers, MemoryStick, HardDrive, Zap, Box, Wind,
  X, Search, Check, AlertTriangle, ShoppingCart, Save, FileText, ChevronRight
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string; name: string; brand: string; price: string; discountPrice: string | null;
  stock: number; specs: Record<string, string> | null; compatibility: Record<string, string> | null;
}

interface SelectedComponent { productId: string; name: string; price: string; brand: string; specs: Record<string, string> | null; }

const slots = [
  { key: "cpu", label: "Processor", icon: Cpu, category: "processors", color: "from-blue-500 to-cyan-500" },
  { key: "gpu", label: "Graphics Card", icon: Monitor, category: "graphics-cards", color: "from-green-500 to-emerald-500" },
  { key: "motherboard", label: "Motherboard", icon: Layers, category: "motherboards", color: "from-purple-500 to-violet-500" },
  { key: "ram", label: "RAM", icon: MemoryStick, category: "ram", color: "from-orange-500 to-amber-500" },
  { key: "storage", label: "Storage", icon: HardDrive, category: "storage", color: "from-pink-500 to-rose-500" },
  { key: "psu", label: "Power Supply", icon: Zap, category: "power-supplies", color: "from-yellow-500 to-orange-500" },
  { key: "case", label: "PC Case", icon: Box, category: "pc-cases", color: "from-indigo-500 to-blue-500" },
  { key: "cooling", label: "Cooling", icon: Wind, category: "cooling", color: "from-cyan-500 to-teal-500" },
];

export default function BuildMyPCPage() {
  const [selected, setSelected] = useState<Record<string, SelectedComponent>>({});
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const loadProducts = useCallback(async (category: string) => {
    setLoadingProducts(true);
    const res = await fetch(`/api/products?buildCategory=${category}&limit=20`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoadingProducts(false);
  }, []);

  useEffect(() => {
    if (activeSlot) {
      const slot = slots.find(s => s.key === activeSlot);
      if (slot) loadProducts(slot.category);
    }
  }, [activeSlot, loadProducts]);

  // Compatibility checking
  useEffect(() => {
    const w: string[] = [];
    const cpu = selected.cpu;
    const mb = selected.motherboard;
    const ram = selected.ram;
    const gpu = selected.gpu;
    const psu = selected.psu;
    const caseComp = selected.case;

    if (cpu && mb) {
      const cpuSocket = cpu.specs?.Socket || "";
      const mbSocket = mb.specs?.Socket || "";
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        w.push(`⚠️ CPU socket (${cpuSocket}) does not match motherboard socket (${mbSocket})`);
      }
    }
    if (ram && mb) {
      const ramType = ram.specs?.Type || "";
      const mbRamSlots = mb.specs?.["RAM Slots"] || "";
      if (ramType && mbRamSlots && !mbRamSlots.toLowerCase().includes(ramType.toLowerCase())) {
        w.push(`⚠️ RAM type (${ramType}) may not be compatible with motherboard`);
      }
    }
    if (gpu && psu) {
      const gpuTdp = parseInt(gpu.specs?.TDP || "0");
      const psuWattage = parseInt(psu.specs?.Wattage || "0");
      if (gpuTdp > 0 && psuWattage > 0 && psuWattage < gpuTdp + 200) {
        w.push(`⚠️ PSU wattage (${psuWattage}W) may be insufficient for GPU (${gpuTdp}W TDP + system)`);
      }
    }
    if (gpu && caseComp) {
      const gpuLen = parseInt(gpu.specs?.Length || "0");
      const maxGpuLen = parseInt(caseComp.specs?.["Max GPU Length"] || "999");
      if (gpuLen > 0 && maxGpuLen > 0 && gpuLen > maxGpuLen) {
        w.push(`⚠️ GPU length (${gpuLen}mm) exceeds case max GPU length (${maxGpuLen}mm)`);
      }
    }
    setWarnings(w);
  }, [selected]);

  const totalPrice = Object.values(selected).reduce((s, c) => s + Number(c.price), 0);

  const selectComponent = (product: Product) => {
    if (!activeSlot) return;
    const price = product.discountPrice || product.price;
    setSelected(prev => ({
      ...prev,
      [activeSlot]: { productId: product.id, name: product.name, price, brand: product.brand, specs: product.specs },
    }));
    setActiveSlot(null);
  };

  const removeComponent = (key: string) => {
    setSelected(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const addAllToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    Object.values(selected).forEach(comp => {
      const existing = cart.find((i: { id: string }) => i.id === comp.productId);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id: comp.productId, name: comp.name, price: comp.price, qty: 1, image: "", stock: 99 });
      }
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          <span className="bg-gradient-to-r from-nexus-blue to-nexus-purple bg-clip-text text-transparent">Build My PC</span>
        </h1>
        <p className="text-nexus-muted mt-2">Select your components and build your dream machine</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Component Slots */}
        <div className="lg:col-span-2 space-y-4">
          {/* Compatibility status */}
          {Object.keys(selected).length >= 2 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl border ${warnings.length === 0 ? "bg-nexus-cyan/10 border-nexus-cyan/30" : "bg-yellow-900/10 border-yellow-900/30"}`}>
              {warnings.length === 0 ? (
                <p className="flex items-center gap-2 text-nexus-cyan text-sm font-medium"><Check className="w-4 h-4" /> Compatible Build — All selected components are compatible</p>
              ) : (
                <div>
                  <p className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-2"><AlertTriangle className="w-4 h-4" /> Compatibility Warnings</p>
                  {warnings.map((w, i) => <p key={i} className="text-xs text-yellow-300/70 ml-6">{w}</p>)}
                </div>
              )}
            </motion.div>
          )}

          {/* Slots grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slots.map(slot => {
              const comp = selected[slot.key];
              return (
                <motion.button
                  key={slot.key}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => setActiveSlot(slot.key)}
                  className={`relative text-left bg-nexus-card border rounded-xl p-5 transition-all duration-300 hover:shadow-lg group ${
                    comp ? "border-nexus-blue/30 hover:border-nexus-blue/50" : "border-nexus-border hover:border-nexus-blue/30"
                  } ${activeSlot === slot.key ? "ring-2 ring-nexus-blue/50" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${slot.color} flex items-center justify-center shrink-0`}>
                      <slot.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-nexus-muted uppercase tracking-wider mb-1">{slot.label}</p>
                      {comp ? (
                        <>
                          <p className="text-sm font-semibold truncate">{comp.name}</p>
                          <p className="text-nexus-blue font-display font-bold mt-1">{formatPrice(comp.price)}</p>
                        </>
                      ) : (
                        <p className="text-sm text-nexus-muted">Click to select {slot.label.toLowerCase()}</p>
                      )}
                    </div>
                    {comp && (
                      <button onClick={(e) => { e.stopPropagation(); removeComponent(slot.key); }} className="p-1 text-nexus-muted hover:text-nexus-red transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted group-hover:text-nexus-blue transition-colors" />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Build Summary */}
        <div className="lg:col-span-1">
          <div className="bg-nexus-card border border-nexus-border rounded-xl p-6 sticky top-40">
            <h3 className="font-display text-lg font-bold mb-4">Build Summary</h3>
            <div className="space-y-3 mb-4">
              {slots.map(slot => {
                const comp = selected[slot.key];
                return (
                  <div key={slot.key} className="flex justify-between text-sm">
                    <span className="text-nexus-muted">{slot.label}</span>
                    <span className={comp ? "text-nexus-text" : "text-nexus-border"}>
                      {comp ? formatPrice(comp.price) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-nexus-border pt-3 flex justify-between font-bold text-lg mb-6">
              <span>Total</span><span className="text-nexus-blue">{formatPrice(totalPrice)}</span>
            </div>
            <div className="space-y-3">
              <button
                onClick={addAllToCart}
                disabled={Object.keys(selected).length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-nexus-blue text-white font-semibold rounded-xl hover:bg-nexus-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saved ? <><Check className="w-4 h-4" /> Added to Cart!</> : <><ShoppingCart className="w-4 h-4" /> Add All to Cart</>}
              </button>
              <button
                disabled={Object.keys(selected).length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-nexus-border text-nexus-muted font-medium rounded-xl hover:border-nexus-blue/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <FileText className="w-4 h-4" /> Generate Quote
              </button>
            </div>
            <p className="text-center text-xs text-nexus-muted mt-4">{Object.keys(selected).length}/8 components selected</p>
          </div>
        </div>
      </div>

      {/* Component Selection Panel */}
      <AnimatePresence>
        {activeSlot && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActiveSlot(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-nexus-card border border-nexus-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-nexus-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-bold">Select {slots.find(s => s.key === activeSlot)?.label}</h3>
                  <button onClick={() => setActiveSlot(null)} className="p-2 hover:bg-nexus-surface rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={`Search ${slots.find(s => s.key === activeSlot)?.label.toLowerCase()}...`}
                    className="w-full bg-nexus-surface border border-nexus-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-nexus-blue/50"
                  />
                </div>
              </div>

              {/* Products list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingProducts ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-nexus-surface rounded-xl animate-shimmer" />)}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-nexus-muted">No products found</p>
                  </div>
                ) : (
                  filteredProducts.map(product => {
                    const price = Number(product.discountPrice || product.price);
                    const outOfStock = product.stock <= 0;
                    return (
                      <button
                        key={product.id}
                        onClick={() => !outOfStock && selectComponent(product)}
                        disabled={outOfStock}
                        className={`w-full text-left bg-nexus-surface border border-nexus-border rounded-xl p-4 hover:border-nexus-blue/30 transition-all ${outOfStock ? "opacity-50 cursor-not-allowed" : ""} ${selected[activeSlot]?.productId === product.id ? "border-nexus-blue ring-1 ring-nexus-blue/30" : ""}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-nexus-muted uppercase">{product.brand}</p>
                            <p className="text-sm font-semibold mt-0.5">{product.name}</p>
                            {product.specs && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
                                  <span key={k} className="px-2 py-0.5 bg-nexus-card rounded text-[11px] text-nexus-muted">{k}: {v}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-display font-bold text-nexus-blue">{formatPrice(price)}</p>
                            {outOfStock ? (
                              <p className="text-xs text-nexus-red mt-1">Out of Stock</p>
                            ) : product.stock <= 10 ? (
                              <p className="text-xs text-nexus-pink mt-1">{product.stock} left</p>
                            ) : (
                              <p className="text-xs text-nexus-cyan mt-1">In Stock</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
