import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXUS PC — Build Your Dream Machine",
  description: "Premium Gaming PCs, High Performance Components, Expert Builds. Your ultimate PC hardware destination.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })()
            `
          }}
        />
      </head>
      <body className="bg-nexus-bg text-nexus-text antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
