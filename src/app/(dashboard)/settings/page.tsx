"use client";

import React, { useEffect, useState } from "react";
import {
  Building,
  CreditCard,
  PenTool,
  Save,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Trash2,
  Sparkles,
} from "lucide-react";
import type { SenderDetails } from "@/lib/types";

export default function SettingsPage() {
  const [form, setForm] = useState<SenderDetails>({
    name: "Manvi Sharma",
    address: "A-429, A Block Sector 47\nNoida, Uttar Pradesh 201303\nIndia",
    pan: "OVFPS5255B",
    bankAccountName: "Manvi Sharma",
    bankAccountNumber: "50100634081448",
    ifsc: "HDFC0002674",
    bankName: "HDFC Bank",
    upiId: "manvi@okhdfcbank",
    signatureImageUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    // Load from local storage first for instant load
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("manviie_sender_settings");
        if (cached) {
          const parsed = JSON.parse(cached);
          setForm((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // ignore cache parse errors
      }
    }

    fetch("/api/settings")
      .then(async (res) => {
        if (res.status === 401) {
          window.location.href = "/login?from=/settings";
          return;
        }
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (data && !data.error) {
          setForm({
            name: data.name || "Manvi Sharma",
            address: data.address || "A-429, A Block Sector 47\nNoida, Uttar Pradesh 201303\nIndia",
            pan: data.pan || "OVFPS5255B",
            bankAccountName: data.bankAccountName || "Manvi Sharma",
            bankAccountNumber: data.bankAccountNumber || "50100634081448",
            ifsc: data.ifsc || "HDFC0002674",
            bankName: data.bankName || "HDFC Bank",
            upiId: data.upiId || "manvi@okhdfcbank",
            signatureImageUrl: data.signatureImageUrl || "",
          });
          if (typeof window !== "undefined") {
            localStorage.setItem("manviie_sender_settings", JSON.stringify(data));
          }
        }
      })
      .catch((err) => {
        console.warn("Using default settings profile:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 400;
        let width = img.width;
        let height = img.height;

        // Scale down to max 400px width while preserving aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);

        // Retain PNG format if PNG (for transparent signatures), otherwise JPEG at 80% quality
        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const compressedDataUrl = canvas.toDataURL(mimeType, 0.8);

        setForm((prev) => ({
          ...prev,
          signatureImageUrl: compressedDataUrl,
        }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeSignature = () => {
    setForm((prev) => ({ ...prev, signatureImageUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // 1. Immediately save to browser localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("manviie_sender_settings", JSON.stringify(form));
    }

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        window.location.href = "/login?from=/settings";
        return;
      }

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // response was not JSON
      }

      if (!res.ok) {
        setMessage({
          type: "success",
          text: "Saved to browser memory! (To save permanently to cloud DB, connect Turso in Vercel)",
        });
      } else {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      }
    } catch {
      // If network offline or serverless cold start, local storage already succeeded
      setMessage({
        type: "success",
        text: "Settings saved locally in browser! (To sync cloud DB, connect Turso in Vercel)",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#140f12]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-10">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-[#140f12]/[0.08]">
        <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#e86c54] font-medium block mb-1">
          Profile &amp; Bank Settings &bull; Manvi Sharma
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-light italic tracking-tight text-[#140f12]">
          Sender &amp; Payout Profile
        </h1>
        <p className="text-xs text-[#140f12]/55 mt-2 font-sans tracking-wide">
          Manage your creator business details, bank account credentials, and digital signature.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs tracking-wide ${
            message.type === "success"
              ? "bg-[#d7efe6]/70 text-[#1e523f] border border-[#d7efe6]"
              : "bg-[#fde9dc] text-[#8a4a25] border border-[#fde9dc]"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#1e523f]" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#8a4a25]" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business / Personal Profile */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#140f12]/[0.08] shadow-soft">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#140f12]/05">
            <div className="p-2.5 bg-[#fde9dc] text-[#e86c54] rounded-2xl">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-light italic text-[#140f12]">
                Creator Profile
              </h2>
              <p className="text-[10px] uppercase font-sans tracking-[0.18em] text-[#140f12]/45">
                Printed in the &quot;FROM&quot; section of all invoices
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Manvi Sharma"
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                Registered Address *
              </label>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="A-429, A Block Sector 47&#10;Noida, Uttar Pradesh 201303&#10;India"
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                PAN Number
              </label>
              <input
                type="text"
                value={form.pan || ""}
                onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                placeholder="OVFPS5255B"
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm uppercase font-mono text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Bank & Payout Details */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#140f12]/[0.08] shadow-soft">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#140f12]/05">
            <div className="p-2.5 bg-[#d7efe6] text-[#1e523f] rounded-2xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-light italic text-[#140f12]">
                Bank &amp; Payment Details
              </h2>
              <p className="text-[10px] uppercase font-sans tracking-[0.18em] text-[#140f12]/45">
                Printed in the Payment Details table for direct wire transfers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                Account Holder Name *
              </label>
              <input
                type="text"
                required
                value={form.bankAccountName}
                onChange={(e) =>
                  setForm({ ...form, bankAccountName: e.target.value })
                }
                placeholder="Manvi Sharma"
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                Bank Name *
              </label>
              <input
                type="text"
                required
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                placeholder="HDFC Bank"
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                Account Number *
              </label>
              <input
                type="text"
                required
                value={form.bankAccountNumber}
                onChange={(e) =>
                  setForm({ ...form, bankAccountNumber: e.target.value })
                }
                placeholder="50100634081448"
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm font-mono text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                IFSC Code *
              </label>
              <input
                type="text"
                required
                value={form.ifsc}
                onChange={(e) =>
                  setForm({ ...form, ifsc: e.target.value.toUpperCase() })
                }
                placeholder="HDFC0002674"
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm font-mono uppercase text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                UPI ID (Optional)
              </label>
              <input
                type="text"
                value={form.upiId || ""}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                placeholder="e.g. manvi@okhdfcbank"
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Digital Signature */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#140f12]/[0.08] shadow-soft">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#140f12]/05">
            <div className="p-2.5 bg-[#ece3f4] text-[#4a3b5c] rounded-2xl">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-light italic text-[#140f12]">
                Authorised Signature
              </h2>
              <p className="text-[10px] uppercase font-sans tracking-[0.18em] text-[#140f12]/45">
                Auto-scaled &amp; compressed client-side to ensure lightweight storage
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-56 h-28 rounded-2xl border-2 border-dashed border-[#140f12]/15 bg-[#faf6f0]/60 flex items-center justify-center relative overflow-hidden">
              {form.signatureImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.signatureImageUrl}
                  alt="Signature"
                  className="max-h-24 max-w-48 object-contain"
                />
              ) : (
                <div className="text-center p-2 text-[#140f12]/30">
                  <PenTool className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  <span className="text-[10px] uppercase tracking-wider block">No signature</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 bg-[#140f12] hover:bg-[#e86c54] text-white text-[11px] uppercase tracking-[0.18em] font-medium rounded-full cursor-pointer transition-colors duration-200">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload New Signature</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {form.signatureImageUrl && (
                <button
                  type="button"
                  onClick={removeSignature}
                  className="block text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  Remove signature
                </button>
              )}
              <p className="text-xs text-[#140f12]/45">
                Transparent PNG with dark ink matches the PDF layout best.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-tactile inline-flex items-center gap-2 px-8 py-3.5 bg-[#140f12] hover:bg-[#e86c54] text-white font-medium text-[11px] uppercase tracking-[0.2em] rounded-full shadow-soft transition-colors duration-200 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
