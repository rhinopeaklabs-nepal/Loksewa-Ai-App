import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loksewa AI — Nepal's AI Learning Platform",
  description: "AI-powered adaptive learning for Nepal's Loksewa preparation. Master the civil service exam with personalized AI tutoring, daily missions, and verified content.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
