import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Commander Points",
  description: "Sistema de pontuacao de Commander",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl">&#9876;</span>
              <span className="text-xl font-bold text-accent">
                Commander Points
              </span>
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/"
                className="text-muted hover:text-foreground transition-colors"
              >
                Ranking
              </Link>
              <Link
                href="/historico"
                className="text-muted hover:text-foreground transition-colors"
              >
                Historico
              </Link>
              <Link
                href="/analise"
                className="text-muted hover:text-foreground transition-colors"
              >
                Analise
              </Link>
              <Link
                href="/admin"
                className="text-muted hover:text-accent transition-colors"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-4 text-center text-muted text-xs">
          Commander Points Tracker
        </footer>
      </body>
    </html>
  );
}
