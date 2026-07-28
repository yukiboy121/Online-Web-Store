"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Cpu, Monitor, Layers, MemoryStick, HardDrive, Zap, Box, Wind, Gamepad2, Laptop,
  ArrowRight, Sparkles, Shield, Truck, Clock, ChevronRight
} from "lucide-react";
import ProductCard from "@/components/ProductCard";

const categories = [
  { name: "Processors", slug: "processors", icon: Cpu, color: "from-blue-500 to-cyan-500" },
  { name: "Graphics Cards", slug: "graphics-cards", icon: Monitor, color: "from-green-500 to-emerald-500" },
  { name: "Motherboards", slug: "motherboards", icon: Layers, color: "from-purple-500 to-violet-500" },
  { name: "RAM", slug: "ram", icon: MemoryStick, color: "from-orange-500 to-amber-500" },
  { name: "Storage", slug: "storage", icon: HardDrive, color: "from-pink-500 to-rose-500" },
  { name: "Power Supplies", slug: "power-supplies", icon: Zap, color: "from-yellow-500 to-orange-500" },
  { name: "PC Cases", slug: "pc-cases", icon: Box, color: "from-indigo-500 to-blue-500" },
  { name: "Cooling", slug: "cooling", icon: Wind, color: "from-cyan-500 to-teal-500" },
  { name: "Gaming Accessories", slug: "gaming-accessories", icon: Gamepad2, color: "from-red-500 to-pink-500" },
  { name: "Laptops", slug: "laptops", icon: Laptop, color: "from-violet-500 to-purple-500" },
];

interface Product {
  id: string; name: string; brand: string; slug: string; price: string;
  discountPrice: string | null; stock: number; rating: string | null;
  reviewCount: number | null; images: string[] | null;
  specs: Record<string, string> | null; isNewArrival: boolean | null; isBestSeller: boolean | null;
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!seeded) {
        await fetch("/api/seed", { method: "POST" });
        setSeeded(true);
      }
      const [f, n, b] = await Promise.all([
        fetch("/api/products?featured=true&limit=8").then(r => r.json()),
        fetch("/api/products?new=true&limit=8").then(r => r.json()),
        fetch("/api/products?best=true&limit=8").then(r => r.json()),
      ]);
      setFeatured(f.products || []);
      setNewArrivals(n.products || []);
      setBestSellers(b.products || []);
    };
    init();
  }, [seeded]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden -mt-[140px] pt-[140px]">
        <div className="absolute inset-0 bg-gradient-to-br from-nexus-blue/10 via-nexus-bg to-nexus-purple/10" />
        <div className="absolute inset-0 carbon-fiber opacity-50" />
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nexus-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nexus-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-nexus-blue/10 border border-nexus-blue/20 rounded-full text-nexus-blue text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" /> Next-Gen Hardware Available
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
            >
              BUILD YOUR{" "}
              <span className="bg-gradient-to-r from-nexus-blue to-nexus-purple bg-clip-text text-transparent">
                DREAM MACHINE
              </span>
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
              <p className="text-xl md:text-2xl text-nexus-muted font-light leading-relaxed mb-2 font-tech">
                Premium Gaming PCs.
              </p>
              <p className="text-xl md:text-2xl text-nexus-muted font-light leading-relaxed mb-2 font-tech">
                High Performance Components.
              </p>
              <p className="text-xl md:text-2xl text-nexus-muted font-light leading-relaxed mb-8 font-tech">
                Expert Builds.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/products" className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-nexus-blue to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-nexus-blue/25 transition-all duration-300">
                SHOP COMPONENTS <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/build-my-pc" className="group inline-flex items-center gap-2 px-8 py-4 border-2 border-nexus-purple text-nexus-purple font-semibold rounded-xl hover:bg-nexus-purple hover:text-white transition-all duration-300">
                BUILD MY PC <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Hero stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {[
              { label: "Products", value: "500+", icon: Box },
              { label: "Brands", value: "50+", icon: Shield },
              { label: "Fast Delivery", value: "24h", icon: Truck },
              { label: "Support", value: "24/7", icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 text-nexus-blue mx-auto mb-2" />
                <p className="font-display text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-nexus-muted">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Shop by Category</h2>
            <p className="text-nexus-muted mt-1">Find exactly what you need</p>
          </div>
          <Link href="/products" className="text-nexus-blue hover:text-nexus-blue/80 text-sm flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/products?category=${cat.slug}`} className="group block">
                <div className="relative bg-nexus-card border border-nexus-border rounded-xl p-6 text-center hover:border-nexus-blue/30 transition-all duration-300 hover:shadow-lg hover:shadow-nexus-blue/5 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${cat.color} bg-opacity-10 flex items-center justify-center`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium group-hover:text-nexus-blue transition-colors">{cat.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Featured Products</h2>
              <p className="text-nexus-muted mt-1">Hand-picked premium hardware</p>
            </div>
            <Link href="/products?featured=true" className="text-nexus-blue hover:text-nexus-blue/80 text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Build CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-nexus-blue/20 via-nexus-purple/20 to-nexus-pink/20 p-8 md:p-12">
          <div className="absolute inset-0 carbon-fiber opacity-30" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                PC Configuration <span className="text-nexus-purple">Builder</span>
              </h2>
              <p className="text-nexus-muted text-lg mb-6 max-w-md">
                Select your components, check compatibility, and build your perfect gaming rig with our interactive builder.
              </p>
              <Link href="/build-my-pc" className="inline-flex items-center gap-2 px-6 py-3 bg-nexus-purple text-white font-semibold rounded-xl hover:bg-nexus-purple/80 transition-all">
                Start Building <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="text-8xl"></div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Best Sellers</h2>
              <p className="text-nexus-muted mt-1">Most popular with our community</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">New Arrivals</h2>
              <p className="text-nexus-muted mt-1">Latest additions to our store</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: "Warranty Protection", desc: "All products come with manufacturer warranty. Extended options available." },
            { icon: Truck, title: "Free Shipping", desc: "Free shipping on orders over $500. Express delivery available." },
            { icon: Clock, title: "Expert Support", desc: "Our PC experts are available 24/7 to help with your build." },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="glass rounded-xl p-6 text-center">
              <item.icon className="w-8 h-8 text-nexus-blue mx-auto mb-3" />
              <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-nexus-muted">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
