"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Monitor, LayoutDashboard, Package, ShoppingCart, Warehouse,
  FileText, Users, LogOut, Menu, X, ChevronRight
} from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/admin/quotations", icon: FileText, label: "Quotations" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (!d?.user || (d.user.role !== "admin" && d.user.role !== "manager")) {
        router.push("/login");
        return;
      }
      setUser(d.user);
      setLoading(false);
    }).catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-nexus-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-nexus-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-nexus-bg flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-nexus-card border-r border-nexus-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-nexus-border">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-blue to-nexus-purple flex items-center justify-center">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold"><span className="text-nexus-blue">NEXUS</span> Admin</span>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${active ? "bg-nexus-blue/10 text-nexus-blue font-medium" : "text-nexus-muted hover:text-nexus-text hover:bg-nexus-surface"}`}
                >
                  <item.icon className="w-5 h-5" /> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-nexus-border">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-nexus-surface flex items-center justify-center">
                <Users className="w-4 h-4 text-nexus-muted" />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-nexus-muted capitalize">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-nexus-muted hover:text-nexus-red hover:bg-nexus-surface transition-colors w-full">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
            <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-nexus-muted hover:text-nexus-blue hover:bg-nexus-surface transition-colors mt-1">
              <ChevronRight className="w-5 h-5" /> Back to Store
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="h-16 border-b border-nexus-border flex items-center px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-nexus-surface rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-display font-semibold text-lg capitalize">
            {pathname === "/admin" ? "Dashboard" : pathname.split("/").pop()?.replace(/-/g, " ")}
          </h2>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
