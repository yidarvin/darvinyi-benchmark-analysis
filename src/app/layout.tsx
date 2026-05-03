import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "benchmark.darvinyi.com — AI Benchmark Explorer",
    template: "%s | benchmark.darvinyi.com",
  },
  description:
    "Deep-dives into every major LLM benchmark — what they test, how they work, real task examples, and compiled model results.",
  metadataBase: new URL("https://benchmark.darvinyi.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
