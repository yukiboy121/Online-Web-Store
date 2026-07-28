"use client";

import Link from "next/link";
import { Monitor, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-nexus-card border-t border-nexus-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-blue to-nexus-purple flex items-center justify-center">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold"><span className="text-nexus-blue">NEXUS</span> PC</span>
            </div>
            <p className="text-sm text-nexus-muted leading-relaxed">Premium gaming PCs and components. Build your dream machine with expert guidance.</p>
            <div className="mt-4 space-y-2 text-sm text-nexus-muted">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@nexuspc.com</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> 075 123 4567</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Horana, Sri Lanka</div>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-nexus-muted">
              <li><Link href="/products" className="hover:text-nexus-blue transition-colors">All Products</Link></li>
              <li><Link href="/build-my-pc" className="hover:text-nexus-blue transition-colors">Build My PC</Link></li>
              <li><Link href="/products?filter=deals" className="hover:text-nexus-blue transition-colors">Deals</Link></li>
              <li><Link href="/products?category=processors" className="hover:text-nexus-blue transition-colors">Processors</Link></li>
              <li><Link href="/products?category=graphics-cards" className="hover:text-nexus-blue transition-colors">Graphics Cards</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-nexus-muted">
              <li><Link href="/login" className="hover:text-nexus-blue transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-nexus-blue transition-colors">Register</Link></li>
              <li><Link href="/orders" className="hover:text-nexus-blue transition-colors">Order History</Link></li>
              <li><Link href="/wishlist" className="hover:text-nexus-blue transition-colors">Wishlist</Link></li>
              <li><Link href="/quotations" className="hover:text-nexus-blue transition-colors">Quotations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-nexus-muted">
              <li><Link href="#" className="hover:text-nexus-blue transition-colors">Warranty</Link></li>
              <li><Link href="#" className="hover:text-nexus-blue transition-colors">Returns</Link></li>
              <li><Link href="#" className="hover:text-nexus-blue transition-colors">Shipping</Link></li>
              <li><Link href="#" className="hover:text-nexus-blue transition-colors">FAQ</Link></li>
              <li><Link href="#" className="hover:text-nexus-blue transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-nexus-border flex flex-col md:flex-row items-center justify-between text-sm text-nexus-muted">
          <p>© 2026 NEXUS PC. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Dev by Yuki Boy</p>
        </div>
      </div>
    </footer>
  );
}
