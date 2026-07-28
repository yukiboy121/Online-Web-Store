"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, LogOut, Package, Heart, FileText, Settings } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (!d?.user) { router.push("/login"); return; }
      setUser(d.user);
    }).catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-nexus-card border border-nexus-border rounded-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-nexus-blue to-nexus-purple flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{user.name}</h1>
              <p className="text-nexus-muted flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</p>
              <span className="inline-block mt-2 px-3 py-0.5 bg-nexus-blue/10 text-nexus-blue text-xs font-medium rounded-full uppercase">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { href: "/orders", icon: Package, label: "My Orders", desc: "View and track your orders" },
            { href: "/wishlist", icon: Heart, label: "Wishlist", desc: "Your saved items" },
            { href: "/quotations", icon: FileText, label: "Quotations", desc: "View your quotations" },
            { href: "/build-my-pc", icon: Settings, label: "PC Builder", desc: "Build a custom PC" },
          ].map(item => (
            <Link key={item.href} href={item.href} className="bg-nexus-card border border-nexus-border rounded-xl p-6 hover:border-nexus-blue/30 transition-all group">
              <item.icon className="w-8 h-8 text-nexus-blue mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-semibold">{item.label}</h3>
              <p className="text-sm text-nexus-muted mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>

        <button onClick={handleLogout} className="mt-8 flex items-center gap-2 px-6 py-3 border border-nexus-red/30 text-nexus-red rounded-xl hover:bg-nexus-red/10 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </motion.div>
    </div>
  );
}
