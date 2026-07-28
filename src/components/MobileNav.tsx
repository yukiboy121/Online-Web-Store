"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Search, Cpu, Heart, ShoppingCart } from "lucide-react";

const tabs = [
  { label: "Home",     href: "/",            icon: Home },
  { label: "Shop",     href: "/products",    icon: Search },
  { label: "Build PC", href: "/build-my-pc", icon: Cpu },
  { label: "Wishlist", href: "/wishlist",    icon: Heart,        badgeKey: "wishlist" },
  { label: "Cart",     href: "/cart",        icon: ShoppingCart, badgeKey: "cart" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<{ cart: number; wishlist: number }>({ cart: 0, wishlist: 0 });

  const updateCounts = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setCounts({
        cart: cart.reduce((s: number, i: { qty: number }) => s + i.qty, 0),
        wishlist: wishlist.length,
      });
    } catch { /* noop */ }
  };

  useEffect(() => {
    updateCounts();
    window.addEventListener("cartUpdated", updateCounts);
    window.addEventListener("wishlistUpdated", updateCounts);
    window.addEventListener("storage", updateCounts);
    return () => {
      window.removeEventListener("cartUpdated", updateCounts);
      window.removeEventListener("wishlistUpdated", updateCounts);
      window.removeEventListener("storage", updateCounts);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const getBadge = (key?: string) => {
    if (!key) return 0;
    return key === "cart" ? counts.cart : counts.wishlist;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* top glow line */}
      <div className="h-px bg-gradient-to-r from-transparent via-nexus-blue/50 to-transparent" />

      <div className="mobile-nav-bar flex items-stretch">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const badge = getBadge(tab.badgeKey);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-[5px] py-3 relative"
              style={{ WebkitTapHighlightColor: "transparent", minHeight: "60px" }}
            >
              {/* active top line */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-nexus-blue rounded-full shadow-[0_0_8px_var(--nexus-blue)]" />
              )}

              {/* icon + badge */}
              <span className="relative flex items-center justify-center">
                <Icon
                  className="transition-all duration-200"
                  style={{
                    width: active ? "23px" : "21px",
                    height: active ? "23px" : "21px",
                    color: active ? "var(--nexus-blue)" : "var(--nexus-muted)",
                    filter: active ? "drop-shadow(0 0 6px var(--nexus-blue))" : "none",
                  }}
                />
                {badge > 0 && (
                  <span
                    className="absolute -top-2 -right-2.5 min-w-[15px] h-[15px] px-0.5 text-[8px] font-bold rounded-full flex items-center justify-center text-black"
                    style={{ background: "var(--nexus-blue)", lineHeight: 1 }}
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>

              {/* label */}
              <span
                className="text-[9px] font-bold tracking-wider uppercase transition-all duration-200"
                style={{
                  color: active ? "var(--nexus-blue)" : "var(--nexus-muted)",
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
