"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  FileCheck,
  ExternalLink,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  const navItems = [
    { name: "Invoices", href: "/invoices", icon: FileCheck },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#faf6f0] text-[#140f12] selection:bg-[#e86c54] selection:text-white">
      {/* Top Editorial Navbar */}
      <header className="sticky top-0 z-30 bg-[#faf6f0]/90 backdrop-blur-md border-b border-[#140f12]/[0.07] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo Brand */}
            <div className="flex items-center gap-3">
              <Link
                href="/invoices"
                className="group flex items-center gap-2.5 transition"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-2xl sm:text-3xl font-light italic tracking-tight text-[#140f12] group-hover:text-[#e86c54] transition-colors">
                    Manviie
                  </span>
                  <span className="text-[#e86c54] text-xs font-serif font-bold">✦</span>
                </div>
                <span className="text-[10px] uppercase font-sans tracking-[0.2em] font-medium px-2 py-0.5 rounded-full bg-[#fde9dc] text-[#e86c54] border border-[#e86c54]/20 hidden sm:inline-block">
                  Invoice
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/invoices" && pathname.startsWith("/invoices/"));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative text-[11px] uppercase tracking-[0.2em] font-medium transition-all py-1 ${
                      isActive
                        ? "text-[#140f12] font-semibold"
                        : "text-[#140f12]/55 hover:text-[#140f12]"
                    }`}
                  >
                    <span
                      className={`inline-block text-[9px] text-[#e86c54] mr-1.5 transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                      }`}
                    >
                      ✦
                    </span>
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-3 right-0 h-[1.5px] bg-[#e86c54] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/invoices/new"
                className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#140f12] hover:bg-[#e86c54] text-white text-[11px] uppercase tracking-[0.18em] font-medium shadow-sm transition-colors duration-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Invoice</span>
              </Link>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Log out"
                className="btn-tactile p-2 rounded-full text-[#140f12]/50 hover:text-[#140f12] hover:bg-[#140f12]/05 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile hamburger button */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                href="/invoices/new"
                className="p-2.5 rounded-full bg-[#140f12] text-white"
              >
                <Plus className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#140f12]/70 hover:bg-[#140f12]/05"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#140f12]/10 bg-[#faf6f0] px-5 pt-3 pb-6 space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/invoices" && pathname.startsWith("/invoices/"));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs uppercase tracking-[0.18em] font-medium ${
                    isActive
                      ? "bg-[#140f12] text-white"
                      : "text-[#140f12]/70 hover:bg-[#140f12]/05"
                  }`}
                >
                  <span>{item.name}</span>
                  {isActive && <span className="text-[#e86c54]">✦</span>}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-[#140f12]/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs uppercase tracking-[0.18em] font-medium text-red-600 hover:bg-red-50"
              >
                <span>Logout</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#140f12]/[0.08] bg-[#faf6f0] py-6 text-center text-xs text-[#140f12]/50 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display italic text-sm text-[#140f12]">Manviie</span>
            <span>&bull; Private Invoice &amp; Billing System</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://manviie21.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-[#e86c54] hover:text-[#140f12] transition"
            >
              <span>Portfolio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>&bull;</span>
            <span className="text-[11px] uppercase tracking-[0.15em]">INR Currency</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
