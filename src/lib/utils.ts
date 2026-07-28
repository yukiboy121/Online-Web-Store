import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(price));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateSKU(brand: string, category: string): string {
  const b = brand.substring(0, 3).toUpperCase();
  const c = category.substring(0, 3).toUpperCase();
  const r = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${b}-${c}-${r}`;
}
