import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXUS PC — Build Your Dream Machine",
  description: "Premium Gaming PCs, High Performance Components, Expert Builds. Your ultimate PC hardware destination.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-nexus-bg text-nexus-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
