"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Monitor, Mail, Lock, ArrowRight, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.user.role === "admin" || data.user.role === "manager") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-nexus-blue to-nexus-purple flex items-center justify-center">
          <Monitor className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold">Welcome Back</h1>
        <p className="text-nexus-muted mt-2">Sign in to your NEXUS PC account</p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit}
        className="bg-nexus-card border border-nexus-border rounded-xl p-6 space-y-4"
      >
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}
        <div>
          <label className="text-sm text-nexus-muted mb-1 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full bg-nexus-surface border border-nexus-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-nexus-blue/50" />
          </div>
        </div>
        <div>
          <label className="text-sm text-nexus-muted mb-1 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-nexus-surface border border-nexus-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-nexus-blue/50" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-nexus-blue text-white font-semibold rounded-xl hover:bg-nexus-blue/80 disabled:opacity-50 transition-colors">
          {loading ? "Signing in..." : <>Sign In <ArrowRight className="w-4 h-4" /></>}
        </button>
        <p className="text-center text-sm text-nexus-muted">
          Don&apos;t have an account?{" "}<Link href="/register" className="text-nexus-blue hover:underline">Register</Link>
        </p>
        <div className="border-t border-nexus-border pt-4 text-center text-xs text-nexus-muted">
          <p>Admin login: admin@nexuspc.com / admin123</p>
        </div>
      </motion.form>
    </div>
  );
}
