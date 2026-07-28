"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Calendar, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface Quotation {
  id: string; customerName: string; total: string; status: string | null; createdAt: string; validUntil: string | null;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quotations").then(r => r.ok ? r.json() : { quotations: [] }).then(d => {
      setQuotations(d.quotations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Quotations</h1>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-nexus-card rounded-xl animate-shimmer" />)}</div>
      ) : quotations.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-nexus-muted mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">No Quotations Yet</h2>
          <p className="text-nexus-muted mb-6">Build a PC and generate a quotation.</p>
          <Link href="/build-my-pc" className="inline-flex items-center gap-2 px-6 py-3 bg-nexus-purple text-white rounded-xl font-semibold">Build a PC</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotations.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-nexus-card border border-nexus-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-nexus-muted">Quote #{q.id.substring(0, 8)}</p>
                  <p className="font-semibold mt-1">{q.customerName}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-nexus-muted">
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {formatPrice(q.total)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${q.status === "sent" ? "bg-blue-900/30 text-blue-400" : q.status === "accepted" ? "bg-green-900/30 text-green-400" : "bg-nexus-surface text-nexus-muted"}`}>
                  {q.status || "Draft"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
