"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function WishlistPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-8">My Wishlist</h1>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
        <Heart className="w-16 h-16 text-nexus-muted mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Your Wishlist is Empty</h2>
        <p className="text-nexus-muted mb-6">Save your favorite items to come back to them later.</p>
        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-nexus-blue text-white rounded-xl font-semibold">Browse Products</Link>
      </motion.div>
    </div>
  );
}
