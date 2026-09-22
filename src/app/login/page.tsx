"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/invoices";

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/95 rounded-3xl p-8 sm:p-10 border border-[#140f12]/[0.08] shadow-2xl backdrop-blur-xl">
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#fde9dc] border border-[#e86c54]/30 text-[#8a4a25] text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#e86c54]" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-medium uppercase tracking-[0.22em] text-[#140f12]/60 mb-2">
            Access ID
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#140f12]/30">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter Access ID"
              className="w-full pl-10 pr-4 py-3 bg-[#faf6f0]/80 border border-[#140f12]/10 rounded-2xl text-[#140f12] placeholder-[#140f12]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-medium uppercase tracking-[0.22em] text-[#140f12]/60 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#140f12]/30">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-3 bg-[#faf6f0]/80 border border-[#140f12]/10 rounded-2xl text-[#140f12] placeholder-[#140f12]/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-tactile w-full mt-3 py-3.5 px-6 rounded-full bg-[#140f12] hover:bg-[#e86c54] text-white font-medium text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-soft transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block animate-pulse">Authenticating...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-[#140f12]/[0.06] text-center">
        <p className="text-[11px] text-[#140f12]/40 font-sans tracking-wide">
          Private access portal &bull; Controlled via environment variables
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#faf6f0] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Subtle decorative background shapes matching Manvi's portfolio */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#fde9dc]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#ece3f4]/70 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#d7efe6]/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="font-display text-4xl sm:text-5xl font-light italic tracking-tight text-[#140f12]">
              Manviie
            </span>
            <span className="text-[#e86c54] text-lg font-serif">✦</span>
          </div>
          <p className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#e86c54] font-medium block">
            Studio Billing &amp; Invoice Portal
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-3xl p-10 text-center text-[#140f12]/40 text-sm">
              Loading portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
