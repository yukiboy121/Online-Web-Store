"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, X, Save, Calendar, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Quotation {
  id: string; customerName: string; customerEmail: string | null; total: string;
  subtotal: string; discount: string | null; status: string | null; createdAt: string;
  validUntil: string | null; notes: string | null;
  items: Array<{ name: string; qty: number; price: string; specs: string }> | null;
}

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", notes: "", subtotal: "0", discount: "0", total: "0" });

  useEffect(() => {
    fetch("/api/quotations").then(r => r.json()).then(d => {
      setQuotations(d.quotations || []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    const total = (parseFloat(form.subtotal || "0") - parseFloat(form.discount || "0")).toFixed(2);
    await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, total, items: [] }),
    });
    setShowCreate(false);
    const res = await fetch("/api/quotations").then(r => r.json());
    setQuotations(res.quotations || []);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-nexus-muted">{quotations.length} quotations</p>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-nexus-purple text-white rounded-lg text-sm font-medium hover:bg-nexus-purple/80 transition-colors">
          <Plus className="w-4 h-4" /> New Quotation
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-nexus-card rounded-xl animate-shimmer" />)}</div>
      ) : quotations.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-nexus-muted mx-auto mb-4" />
          <p className="text-nexus-muted">No quotations yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-nexus-card border border-nexus-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-muted">Quote #{q.id.substring(0, 8)}</p>
                  <p className="font-semibold mt-1">{q.customerName}</p>
                  {q.customerEmail && <p className="text-xs text-nexus-muted">{q.customerEmail}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-nexus-blue"><DollarSign className="w-3 h-3" /> {formatPrice(q.total)}</span>
                    <span className="flex items-center gap-1 text-nexus-muted"><Calendar className="w-3 h-3" /> {new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${q.status === "sent" ? "bg-blue-900/30 text-blue-400" : q.status === "accepted" ? "bg-green-900/30 text-green-400" : "bg-nexus-surface text-nexus-muted"}`}>
                  {q.status || "Draft"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-nexus-card border border-nexus-border rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-bold">New Quotation</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-nexus-surface rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-sm text-nexus-muted mb-1 block">Customer Name</label><input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                <div><label className="text-sm text-nexus-muted mb-1 block">Email</label><input type="email" value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm text-nexus-muted mb-1 block">Subtotal</label><input value={form.subtotal} onChange={e => setForm({ ...form, subtotal: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                  <div><label className="text-sm text-nexus-muted mb-1 block">Discount</label><input value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                </div>
                <div><label className="text-sm text-nexus-muted mb-1 block">Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full bg-nexus-surface border border-nexus-border rounded-lg px-4 py-2.5 text-sm focus:border-nexus-blue/50" /></div>
                <button onClick={handleCreate} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-nexus-purple text-white font-semibold rounded-xl hover:bg-nexus-purple/80 transition-colors">
                  <Save className="w-4 h-4" /> Create Quotation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
