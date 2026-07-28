"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, ShoppingCart, User, Menu, X, Search, Heart,
  Cpu, Layers, HardDrive, MemoryStick, Zap, Box, Wind, Gamepad2, Laptop, ChevronDown, Sun, Moon
} from "lucide-react";

const categories = [
  { name: "Processors", slug: "processors", icon: Cpu },
  { name: "Graphics Cards", slug: "graphics-cards", icon: Monitor },
  { name: "Motherboards", slug: "motherboards", icon: Layers },
  { name: "RAM", slug: "ram", icon: MemoryStick },
  { name: "Storage", slug: "storage", icon: HardDrive },
  { name: "Power Supplies", slug: "power-supplies", icon: Zap },
  { name: "PC Cases", slug: "pc-cases", icon: Box },
  { name: "Cooling", slug: "cooling", icon: Wind },
  { name: "Gaming Accessories", slug: "gaming-accessories", icon: Gamepad2 },
  { name: "Laptops", slug: "laptops", icon: Laptop },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const t = localStorage.getItem("theme") || "dark";
    setTheme(t);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const items = JSON.parse(stored);
        setCartCount(items.reduce((s: number, i: { qty: number }) => s + i.qty, 0));
      } catch { setCartCount(0); }
    }
    const storedWishlist = localStorage.getItem("wishlist");
    if (storedWishlist) {
      try {
        const items = JSON.parse(storedWishlist);
        setWishlistCount(items.length);
      } catch { setWishlistCount(0); }
    }
    const handleStorage = () => {
      const c = localStorage.getItem("cart");
      if (c) {
        try { setCartCount(JSON.parse(c).reduce((s: number, i: { qty: number }) => s + i.qty, 0)); }
        catch { setCartCount(0); }
      } else setCartCount(0);
    };
    const handleWishlistStorage = () => {
      const w = localStorage.getItem("wishlist");
      if (w) {
        try { setWishlistCount(JSON.parse(w).length); }
        catch { setWishlistCount(0); }
      } else setWishlistCount(0);
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("cartUpdated", handleStorage);
    window.addEventListener("storage", handleWishlistStorage);
    window.addEventListener("wishlistUpdated", handleWishlistStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", handleStorage);
      window.removeEventListener("storage", handleWishlistStorage);
      window.removeEventListener("wishlistUpdated", handleWishlistStorage);
    };
  }, []);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.user) setUser(d.user);
    }).catch(() => {});
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-strong shadow-lg shadow-black/30" : "bg-transparent"}`}>
      {/* Top bar */}
      <div className="hidden md:block border-b border-nexus-border/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8 text-xs text-nexus-muted">
          <span>🔥 Free shipping on orders over $500 | 30-Day Returns</span>
          <div className="flex items-center gap-4">
            <Link href="/quotations" className="hover:text-nexus-blue transition-colors">Quotations</Link>
            <Link href="/orders" className="hover:text-nexus-blue transition-colors">Track Order</Link>
            {user && (user.role === "admin" || user.role === "manager") && (
              <Link href="/admin" className="hover:text-nexus-purple transition-colors font-medium">Admin</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-nexus-blue to-nexus-purple flex items-center justify-center group-hover:shadow-lg group-hover:shadow-nexus-blue/20 transition-all">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight hidden sm:block">
            <span className="text-nexus-blue">NEXUS</span> PC
          </span>
        </Link>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
            <input
              type="text"
              placeholder="Search components, builds, brands..."
              className="w-full bg-nexus-surface border border-nexus-border rounded-lg pl-10 pr-4 py-2 text-sm focus:border-nexus-blue/50 focus:ring-1 focus:ring-nexus-blue/20 transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 hover:bg-nexus-surface rounded-lg transition-colors text-nexus-blue" aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link href="/wishlist" className="hidden sm:flex relative p-2 hover:bg-nexus-surface rounded-lg transition-colors text-nexus-blue">
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-nexus-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative p-2 hover:bg-nexus-surface rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-nexus-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link href="/profile" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-nexus-surface border border-nexus-border rounded-lg hover:border-nexus-blue/30 transition-colors">
              <User className="w-4 h-4 text-nexus-blue" />
              <span className="text-sm">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-nexus-surface border border-nexus-border rounded-lg hover:border-nexus-blue/30 transition-colors">
              <User className="w-4 h-4" />
              <span className="text-sm">Sign In</span>
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Categories bar */}
      <div className="hidden md:block border-t border-nexus-border/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-10">
          <div className="relative">
            <button onClick={() => setCatOpen(!catOpen)} className="flex items-center gap-1 px-3 py-1 text-sm font-medium hover:text-nexus-blue transition-colors">
              <Menu className="w-4 h-4" /> All Categories <ChevronDown className="w-3 h-3" />
            </button>
            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-64 glass-strong rounded-lg shadow-2xl shadow-black/50 py-2 z-50"
                >
                  {categories.map(c => (
                    <Link key={c.slug} href={`/products?category=${c.slug}`}
                      onClick={() => setCatOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-nexus-blue/10 hover:text-nexus-blue transition-colors text-sm"
                    >
                      <c.icon className="w-4 h-4" /> {c.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link href="/products" className="px-3 py-1 text-sm hover:text-nexus-blue transition-colors">Shop All</Link>
          <Link href="/build-my-pc" className="px-3 py-1 text-sm font-semibold text-nexus-purple hover:text-nexus-blue transition-colors">Build My PC</Link>
          <Link href="/products?filter=deals" className="px-3 py-1 text-sm text-nexus-pink hover:text-nexus-blue transition-colors">🔥 Deals</Link>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-nexus-border overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-nexus-muted">Theme Mode</span>
                <button onClick={toggleTheme} className="p-2 bg-nexus-surface border border-nexus-border rounded-lg text-nexus-blue" aria-label="Toggle theme">
                  {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                <input type="text" placeholder="Search..." className="w-full bg-nexus-surface border border-nexus-border rounded-lg pl-10 pr-4 py-2 text-sm" />
              </div>
              <Link href="/products" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-nexus-surface rounded-lg text-sm">Shop All</Link>
              <Link href="/build-my-pc" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-nexus-surface rounded-lg text-sm text-nexus-purple font-semibold">Build My PC</Link>
              {categories.map(c => (
                <Link key={c.slug} href={`/products?category=${c.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-nexus-surface rounded-lg text-sm">
                  <c.icon className="w-4 h-4 text-nexus-muted" /> {c.name}
                </Link>
              ))}
              <div className="pt-2 border-t border-nexus-border space-y-2">
                {user ? (
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-nexus-surface rounded-lg text-sm">My Account</Link>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-nexus-surface rounded-lg text-sm">Sign In</Link>
                )}
                <Link href="/cart" onClick={() => setMobileOpen(false)} className="block px-3 py-2 hover:bg-nexus-surface rounded-lg text-sm">Cart ({cartCount})</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
