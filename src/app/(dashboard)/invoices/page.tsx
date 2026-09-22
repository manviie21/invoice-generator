"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
  Send,
  TrendingUp,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { InvoiceStatus } from "@/lib/types";

interface InvoiceListItem {
  id: number;
  invoiceNumber: string;
  clientId: number;
  clientName: string | null;
  issueDate: string;
  reference: string | null;
  total: number;
  status: InvoiceStatus;
  createdAt: string;
}

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const loadInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvoices(data);
      }
    } catch {
      console.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleStatusChange = async (id: number, newStatus: InvoiceStatus) => {
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
      );
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDeleteInvoice = async (id: number, invoiceNumber: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete invoice "${invoiceNumber}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to delete invoice");
        return;
      }
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch {
      alert("Network error while deleting invoice");
    }
  };

  // Metrics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, inv) => acc + (inv.total || 0), 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((acc, inv) => acc + (inv.total || 0), 0);

  // Filtered list
  const filtered = invoices.filter((inv) => {
    const matchesStatus =
      filterStatus === "all" ? true : inv.status === filterStatus;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.clientName &&
        inv.clientName.toLowerCase().includes(search.toLowerCase())) ||
      (inv.reference &&
        inv.reference.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-10">
      {/* Editorial Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 pb-6 border-b border-[#140f12]/[0.08]">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#e86c54] font-medium block mb-1">
            Studio Billing &bull; Manvi Sharma
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-light italic tracking-tight text-[#140f12]">
            Invoices &amp; Deliverables
          </h1>
          <p className="text-xs text-[#140f12]/55 mt-2 font-sans tracking-wide">
            Track collaborations, manage campaign billings, and generate client PDFs.
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="btn-tactile inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#140f12] hover:bg-[#e86c54] text-white text-[11px] uppercase tracking-[0.2em] font-medium shadow-soft transition-colors duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Draft Invoice</span>
        </Link>
      </div>

      {/* Metrics Cards in Manvi Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced - Butter tint */}
        <div className="card-hover bg-[#fef2ce]/60 rounded-2xl p-6 border border-[#140f12]/08 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#140f12]/60 font-medium">
              Total Invoiced
            </span>
            <span className="text-[#140f12]/30 text-xs">✦</span>
          </div>
          <div className="mt-4">
            <p className="font-display text-3xl font-light italic text-[#140f12]">
              ₹{" "}
              {totalInvoiced.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#140f12]/50 mt-1 block">
              Across {invoices.length} campaigns
            </span>
          </div>
        </div>

        {/* Paid Amount - Mint tint */}
        <div className="card-hover bg-[#d7efe6]/60 rounded-2xl p-6 border border-[#140f12]/08 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#1e523f] font-medium">
              Received / Paid
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#1e523f]/50" />
          </div>
          <div className="mt-4">
            <p className="font-display text-3xl font-light italic text-[#1e523f]">
              ₹{" "}
              {paidAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#1e523f]/60 mt-1 block">
              Settled payments
            </span>
          </div>
        </div>

        {/* Pending Amount - Peach/Coral tint */}
        <div className="card-hover bg-[#fde9dc]/70 rounded-2xl p-6 border border-[#e86c54]/15 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#8a4a25] font-medium">
              Pending Payouts
            </span>
            <Clock className="w-4 h-4 text-[#8a4a25]/50" />
          </div>
          <div className="mt-4">
            <p className="font-display text-3xl font-light italic text-[#e86c54]">
              ₹{" "}
              {pendingAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#8a4a25]/60 mt-1 block">
              Awaiting settlement
            </span>
          </div>
        </div>

        {/* Campaign Count - Lilac tint */}
        <div className="card-hover bg-[#ece3f4]/70 rounded-2xl p-6 border border-[#140f12]/08 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#4a3b5c] font-medium">
              Total Invoices
            </span>
            <FileText className="w-4 h-4 text-[#4a3b5c]/50" />
          </div>
          <div className="mt-4">
            <p className="font-display text-3xl font-light italic text-[#4a3b5c]">
              {invoices.length}
            </p>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#4a3b5c]/60 mt-1 block">
              Recorded in system
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#140f12]/08 shadow-card">
          {[
            { id: "all", label: "All" },
            { id: "draft", label: "Drafts" },
            { id: "sent", label: "Sent" },
            { id: "paid", label: "Paid" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`btn-tactile px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] font-medium rounded-full transition-colors ${
                filterStatus === tab.id
                  ? "bg-[#140f12] text-white shadow-xs"
                  : "text-[#140f12]/60 hover:text-[#140f12] hover:bg-[#faf6f0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#140f12]/40">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice #, client, or campaign..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#140f12]/10 rounded-full text-xs placeholder-[#140f12]/40 focus:outline-none focus:ring-2 focus:ring-[#e86c54] shadow-card transition"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-3xl border border-[#140f12]/08 shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#140f12]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-12 h-12 rounded-full bg-[#fde9dc] text-[#e86c54] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-display text-2xl font-light italic text-[#140f12]">
              {search || filterStatus !== "all"
                ? "No matching invoices found"
                : "No invoices created yet"}
            </h3>
            <p className="text-xs text-[#140f12]/50 mt-2 max-w-sm mx-auto mb-6 font-sans">
              {search || filterStatus !== "all"
                ? "Try adjusting your filters or search term."
                : "Create your first brand collaboration invoice for Manvi Sharma."}
            </p>
            {filterStatus === "all" && !search && (
              <Link
                href="/invoices/new"
                className="btn-tactile inline-flex items-center gap-2 px-6 py-2.5 bg-[#140f12] hover:bg-[#e86c54] text-white rounded-full text-[11px] uppercase tracking-[0.18em] font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Draft First Invoice</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-[#faf6f0]/60 border-b border-[#140f12]/08 text-[10px] font-medium text-[#140f12]/50 uppercase tracking-[0.22em]">
                  <th className="py-4 px-5">Invoice #</th>
                  <th className="py-4 px-5">Client / Brand</th>
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5 text-right">Amount (INR)</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#140f12]/05 text-sm">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-[#faf6f0]/40 transition-colors"
                  >
                    <td className="py-4 px-5 font-semibold text-[#140f12] font-mono text-xs">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="hover:text-[#e86c54] transition-colors"
                      >
                        {inv.invoiceNumber}
                      </Link>
                      {inv.reference && (
                        <span className="block font-sans text-[11px] font-normal text-[#140f12]/50 truncate max-w-xs mt-0.5">
                          {inv.reference}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-[#140f12] font-medium">
                      {inv.clientName || "—"}
                    </td>

                    <td className="py-4 px-5 text-[#140f12]/60 text-xs font-mono">
                      {inv.issueDate}
                    </td>

                    <td className="py-4 px-5 text-right font-display italic text-lg text-[#140f12]">
                      ₹{" "}
                      {inv.total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <select
                        value={inv.status}
                        onChange={(e) =>
                          handleStatusChange(
                            inv.id,
                            e.target.value as InvoiceStatus
                          )
                        }
                        className={`text-[10px] uppercase tracking-[0.16em] font-medium py-1 px-3 rounded-full border border-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e86c54] transition ${
                          inv.status === "paid"
                            ? "bg-[#d7efe6] text-[#1e523f]"
                            : inv.status === "sent"
                            ? "bg-[#fde9dc] text-[#8a4a25]"
                            : "bg-[#ece3f4] text-[#4a3b5c]"
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === "draft" && (
                          <Link
                            href={`/invoices/new?edit=${inv.id}`}
                            title="Edit Draft Invoice"
                            className="btn-tactile p-2 rounded-full text-[#140f12]/50 hover:text-[#e86c54] hover:bg-[#faf6f0] transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <Link
                          href={`/invoices/${inv.id}`}
                          title="View Details"
                          className="btn-tactile p-2 rounded-full text-[#140f12]/50 hover:text-[#140f12] hover:bg-[#faf6f0] transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        <a
                          href={`/api/invoices/${inv.id}/pdf?download=true`}
                          download
                          title="Download PDF"
                          className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#140f12] hover:bg-[#e86c54] text-white text-[10px] uppercase tracking-[0.15em] font-medium shadow-xs transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                          title="Delete Invoice"
                          className="btn-tactile p-2 rounded-full text-[#140f12]/40 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
