"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  ArrowLeft,
  Trash2,
  Building2,
  CreditCard,
  ExternalLink,
  Edit,
} from "lucide-react";
import type { Invoice, Client, SenderDetails, InvoiceStatus } from "@/lib/types";

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [data, setData] = useState<{
    invoice: Invoice;
    client: Client | null;
    sender: SenderDetails | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const resData = await res.json();
      if (!res.ok || resData.error) {
        setError(resData.error || "Failed to load invoice");
      } else {
        setData(resData);
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setUpdating(true);
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              invoice: { ...prev.invoice, status: newStatus },
            }
          : null
      );
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !data ||
      !window.confirm(
        `Are you sure you want to delete invoice "${data.invoice.invoiceNumber}"? This action cannot be undone.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to delete invoice");
        return;
      }
      router.push("/invoices");
    } catch {
      alert("Failed to delete invoice");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#140f12]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-[#140f12]/10 text-center shadow-soft">
        <p className="text-red-600 font-semibold mb-3">{error || "Invoice not found"}</p>
        <Link
          href="/invoices"
          className="text-xs uppercase tracking-[0.18em] text-[#e86c54] hover:underline font-medium"
        >
          &larr; Back to Invoices
        </Link>
      </div>
    );
  }

  const { invoice, client, sender } = data;
  const pdfUrl = `/api/invoices/${id}/pdf`;

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#140f12]/[0.08] shadow-soft">
        <div className="flex items-center gap-4">
          <Link
            href="/invoices"
            className="btn-tactile p-2 rounded-full text-[#140f12]/50 hover:text-[#140f12] hover:bg-[#faf6f0] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-light italic text-[#140f12] tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <select
                value={invoice.status}
                disabled={updating}
                onChange={(e) =>
                  handleStatusChange(e.target.value as InvoiceStatus)
                }
                className={`text-[10px] uppercase tracking-[0.16em] font-medium py-1 px-3 rounded-full border border-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e86c54] transition ${
                  invoice.status === "paid"
                    ? "bg-[#d7efe6] text-[#1e523f]"
                    : invoice.status === "sent"
                    ? "bg-[#fde9dc] text-[#8a4a25]"
                    : "bg-[#ece3f4] text-[#4a3b5c]"
                }`}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <p className="text-xs text-[#140f12]/50 mt-1 font-sans">
              Issued {invoice.issueDate} &bull; Client: {client?.name || "—"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleDelete}
            title="Delete Invoice"
            className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50 text-[10px] uppercase tracking-[0.18em] font-medium transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {invoice.status === "draft" && (
            <Link
              href={`/invoices/new?edit=${invoice.id}`}
              className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#faf6f0] hover:bg-[#fde9dc] text-[#140f12] text-[10px] uppercase tracking-[0.18em] font-medium border border-[#140f12]/10 transition"
            >
              <Edit className="w-3.5 h-3.5 text-[#e86c54]" />
              <span>Edit Draft</span>
            </Link>
          )}

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#140f12]/10 hover:bg-[#faf6f0] text-[#140f12] text-[10px] uppercase tracking-[0.18em] font-medium transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Tab</span>
          </a>

          <a
            href={`${pdfUrl}?download=true`}
            download={`${invoice.invoiceNumber}.pdf`}
            className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 bg-[#140f12] hover:bg-[#e86c54] text-white rounded-full text-[10px] uppercase tracking-[0.2em] font-medium shadow-soft transition-colors duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Main Grid: PDF Preview Frame + Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PDF Preview Frame (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#140f12]/[0.08] shadow-soft overflow-hidden flex flex-col min-h-[750px]">
          <div className="bg-[#faf6f0]/70 px-5 py-3 border-b border-[#140f12]/[0.06] flex items-center justify-between text-xs text-[#140f12]/60">
            <span className="font-medium uppercase tracking-[0.2em] text-[10px] text-[#140f12]/50">
              Generated PDF &bull; A4 Preview
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#e86c54]">
              Manvi Sharma
            </span>
          </div>

          <div className="flex-1 w-full bg-[#faf6f0]/40 p-3 sm:p-5">
            <iframe
              src={pdfUrl}
              title={`PDF Preview ${invoice.invoiceNumber}`}
              className="w-full h-full min-h-[700px] rounded-2xl border border-[#140f12]/10 bg-white shadow-soft"
            />
          </div>
        </div>

        {/* Invoice Summary Details (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Bill To Info */}
          <div className="bg-white rounded-3xl p-6 border border-[#140f12]/[0.08] shadow-card">
            <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.22em] text-[#140f12]/45 mb-3">
              <Building2 className="w-3.5 h-3.5 text-[#e86c54]" />
              <span>Billed Client</span>
            </div>
            <h3 className="font-semibold text-[#140f12] text-base">{client?.name}</h3>
            <p className="text-xs text-[#140f12]/65 whitespace-pre-line mt-2 leading-relaxed font-sans">
              {client?.address}
            </p>
            {(() => {
              const cfs = (() => {
                if (!client?.customFields) return [];
                if (Array.isArray(client.customFields)) return client.customFields;
                try {
                  const parsed = JSON.parse(client.customFields);
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  return [];
                }
              })();

              const hasDetails = client?.gstin || client?.pan || cfs.length > 0;
              if (!hasDetails) return null;

              return (
                <div className="mt-4 pt-3 border-t border-[#140f12]/05 flex flex-wrap gap-2 text-[10px] font-mono">
                  {client?.gstin && (
                    <span className="bg-[#faf6f0] px-2.5 py-0.5 rounded-full text-[#140f12]/70 border border-[#140f12]/08">
                      GST: {client.gstin}
                    </span>
                  )}
                  {client?.pan && (
                    <span className="bg-[#faf6f0] px-2.5 py-0.5 rounded-full text-[#140f12]/70 border border-[#140f12]/08">
                      PAN: {client.pan}
                    </span>
                  )}
                  {cfs.map((cf, idx) => (
                    <span
                      key={idx}
                      className="bg-[#faf6f0] px-2.5 py-0.5 rounded-full text-[#140f12]/80 border border-[#140f12]/08 font-sans"
                    >
                      <strong className="font-medium text-[#140f12]/60">
                        {cf.label}:
                      </strong>{" "}
                      {cf.value}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Amount & Items Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-[#140f12]/[0.08] shadow-card">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#140f12]/45 block mb-3">
              Deliverables Summary
            </span>

            {invoice.reference && (
              <div className="mb-4 pb-3 border-b border-[#140f12]/05">
                <span className="text-[10px] text-[#140f12]/45 uppercase font-medium tracking-wider">
                  Reference:
                </span>
                <p className="text-xs font-semibold text-[#140f12] mt-0.5">
                  {invoice.reference}
                </p>
              </div>
            )}

            <div className="space-y-2.5 mb-4">
              {invoice.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-start text-xs py-1.5 border-b border-[#140f12]/05"
                >
                  <span className="text-[#140f12]/80 pr-2">
                    {item.description}
                  </span>
                  <span className="font-display italic text-base text-[#140f12] flex-shrink-0">
                    ₹ {Number(item.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#140f12]/10 flex justify-between items-baseline">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60">
                Total:
              </span>
              <span className="font-display text-2xl font-light italic text-[#140f12]">
                ₹{" "}
                {invoice.total.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="mt-4 p-3.5 bg-[#faf6f0]/70 rounded-2xl text-xs text-[#140f12]/70">
              <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#e86c54] block mb-1">
                Amount in Words
              </span>
              <p className="font-display italic text-sm text-[#140f12] leading-snug">
                {invoice.amountInWords}
              </p>
            </div>
          </div>

          {/* Receiving Bank Details */}
          <div className="bg-white rounded-3xl p-6 border border-[#140f12]/[0.08] shadow-card text-xs">
            <div className="flex items-center gap-2 font-medium uppercase tracking-[0.22em] text-[#140f12]/45 mb-3">
              <CreditCard className="w-3.5 h-3.5 text-[#1e523f]" />
              <span>Receiving Bank Account</span>
            </div>

            <div className="space-y-2 text-[#140f12]/70 font-sans">
              <div className="flex justify-between">
                <span className="text-[#140f12]/40">Account Name:</span>
                <span className="font-medium text-[#140f12]">
                  {sender?.bankAccountName || "Manvi Sharma"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#140f12]/40">Bank:</span>
                <span className="font-medium text-[#140f12]">
                  {sender?.bankName || "HDFC Bank"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#140f12]/40">Account No:</span>
                <span className="font-mono font-medium text-[#140f12]">
                  {sender?.bankAccountNumber || "50100634081448"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#140f12]/40">IFSC Code:</span>
                <span className="font-mono font-medium text-[#140f12]">
                  {sender?.ifsc || "HDFC0002674"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
