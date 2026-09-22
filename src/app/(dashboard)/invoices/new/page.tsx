"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Trash2,
  FileCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Settings,
  AlertCircle,
  Lock,
} from "lucide-react";
import type { Client, SenderDetails, InvoiceItem } from "@/lib/types";
import { numberToWordsIndian } from "@/lib/numberToWords";

function InvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  // Data sources
  const [clients, setClients] = useState<Client[]>([]);
  const [sender, setSender] = useState<SenderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  // Invoice form fields
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientId, setClientId] = useState<number | "">("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reference, setReference] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", qty: "", rate: "", amount: 0 },
  ]);
  const [notes, setNotes] = useState(
    "Payment is requested via NEFT/IMPS/RTGS or UPI to the account specified above. Please share payment confirmation."
  );
  const [status, setStatus] = useState<"draft" | "sent" | "paid">("draft");

  useEffect(() => {
    async function initData() {
      try {
        const [settingsRes, clientsRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/clients"),
        ]);

        const settingsData = await settingsRes.json();
        const clientsData = await clientsRes.json();

        if (settingsData && !settingsData.error) {
          setSender(settingsData);
        }
        if (Array.isArray(clientsData)) {
          setClients(clientsData);
        }

        // If editing an existing invoice
        if (isEditMode && editId) {
          const invRes = await fetch(`/api/invoices/${editId}`);
          const invData = await invRes.json();

          if (!invRes.ok || invData.error) {
            setError(invData.error || "Failed to load invoice for editing.");
            setLoading(false);
            return;
          }

          const { invoice } = invData;

          // If invoice is NOT in draft status, lock editing
          if (invoice.status !== "draft") {
            setIsLocked(true);
            setError(
              `This invoice is marked as "${invoice.status.toUpperCase()}" and cannot be edited. Only invoices in Draft status can be edited.`
            );
          }

          setInvoiceNumber(invoice.invoiceNumber || "");
          setClientId(invoice.clientId || "");
          setIssueDate(invoice.issueDate || "");
          setReference(invoice.reference || "");
          setNotes(invoice.notes || "");
          setStatus(invoice.status || "draft");

          let parsedItems: InvoiceItem[] = [];
          if (typeof invoice.items === "string") {
            try {
              parsedItems = JSON.parse(invoice.items);
            } catch {
              parsedItems = [];
            }
          } else if (Array.isArray(invoice.items)) {
            parsedItems = invoice.items;
          }

          if (parsedItems.length > 0) {
            setItems(parsedItems);
          }
        } else {
          // New Invoice Mode: Set default client & fetch auto-suggested invoice number
          if (Array.isArray(clientsData) && clientsData.length > 0) {
            setClientId(clientsData[0].id);
          }

          const nextNumRes = await fetch("/api/invoices?nextNumber=true");
          const nextNumData = await nextNumRes.json();
          if (nextNumData?.nextInvoiceNumber) {
            setInvoiceNumber(nextNumData.nextInvoiceNumber);
          }
        }
      } catch {
        setError("Failed to load setup data");
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [editId, isEditMode]);

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    val: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: val };

      if (field === "qty" || field === "rate") {
        const q = Number(field === "qty" ? val : item.qty);
        const r = Number(field === "rate" ? val : item.rate);
        if (!isNaN(q) && !isNaN(r) && q > 0 && r > 0) {
          item.amount = q * r;
        }
      } else if (field === "amount") {
        item.amount = Number(val) || 0;
      }

      updated[index] = item;
      return updated;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { description: "", qty: "", rate: "", amount: 0 },
    ]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const amountInWords = numberToWordsIndian(totalAmount);

  const selectedClient = clients.find((c) => c.id === Number(clientId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setError("");

    if (!clientId) {
      setError("Please select or add a client.");
      return;
    }

    if (!invoiceNumber.trim()) {
      setError("Invoice number is required.");
      return;
    }

    const validItems = items.filter((it) => it.description.trim() !== "");
    if (validItems.length === 0) {
      setError("Please add at least one line item with a description.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        invoiceNumber: invoiceNumber.trim(),
        clientId: Number(clientId),
        issueDate,
        reference: reference.trim() || null,
        items: validItems,
        notes: notes.trim() || null,
        status,
      };

      const url = isEditMode ? `/api/invoices/${editId}` : "/api/invoices";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save invoice.");
        setSubmitting(false);
        return;
      }

      const targetId = isEditMode ? editId : data.id;
      router.push(`/invoices/${targetId}`);
    } catch {
      setError("Network error occurred.");
      setSubmitting(false);
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
    <div className="max-w-5xl mx-auto pb-16 space-y-10">
      {/* Editorial Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 pb-6 border-b border-[#140f12]/[0.08]">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#e86c54] font-medium block mb-1">
            {isEditMode ? "Edit Existing Draft" : "New Brand Invoice"} &bull; Manvi Sharma
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-light italic tracking-tight text-[#140f12]">
            {isEditMode ? `Edit: ${invoiceNumber}` : "Draft New Invoice"}
          </h1>
          <p className="text-xs text-[#140f12]/55 mt-2 font-sans tracking-wide">
            {isEditMode
              ? "Modify deliverables, campaign references, or pricing for this draft."
              : "Auto-suggested invoice numbering with real-time Indian Rupee words conversion."}
          </p>
        </div>

        <Link
          href={isEditMode ? `/invoices/${editId}` : "/invoices"}
          className="text-xs uppercase tracking-[0.18em] text-[#140f12]/60 hover:text-[#140f12] font-medium"
        >
          &larr; Cancel &amp; Return
        </Link>
      </div>

      {isLocked && (
        <div className="p-4 rounded-2xl bg-[#fde9dc] border border-[#e86c54]/30 text-[#8a4a25] text-xs flex items-center gap-3">
          <Lock className="w-4 h-4 flex-shrink-0 text-[#e86c54]" />
          <span>{error}</span>
        </div>
      )}

      {error && !isLocked && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Meta Bar: Invoice #, Date, Campaign Reference */}
        <div className="bg-white rounded-3xl p-7 border border-[#140f12]/[0.08] shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                Invoice Number *
              </label>
              <input
                type="text"
                required
                disabled={isLocked}
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-DLF-SEP26-001"
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm font-semibold font-mono tracking-wide text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white disabled:opacity-60 transition"
              />
              <span className="text-[10px] text-[#140f12]/40 mt-1 block">
                Pattern: INV-{new Date().getFullYear()}-XXX (Editable)
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                Issue Date *
              </label>
              <input
                type="date"
                required
                disabled={isLocked}
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white disabled:opacity-60 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
                Campaign / Project Reference
              </label>
              <input
                type="text"
                disabled={isLocked}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. Campaign: DLF"
                className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white disabled:opacity-60 transition"
              />
              <span className="text-[10px] text-[#140f12]/40 mt-1 block">
                Printed as highlight banner on the PDF
              </span>
            </div>
          </div>
        </div>

        {/* Parties Grid: FROM (Manvi) & BILL TO (Client) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FROM: Manvi Sharma */}
          <div className="bg-white rounded-3xl p-7 border border-[#140f12]/[0.08] shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-sans tracking-[0.22em] text-[#140f12]/45 font-medium">
                  From &bull; Creator Details
                </span>
                <Link
                  href="/settings"
                  className="text-[10px] uppercase tracking-[0.16em] text-[#e86c54] hover:text-[#140f12] flex items-center gap-1 font-medium transition"
                >
                  <Settings className="w-3 h-3" />
                  <span>Edit in Settings</span>
                </Link>
              </div>

              {sender?.name ? (
                <div className="space-y-1.5">
                  <p className="font-display italic text-2xl text-[#140f12] font-normal">
                    {sender.name}
                  </p>
                  <p className="text-xs text-[#140f12]/65 whitespace-pre-line leading-relaxed font-sans">
                    {sender.address}
                  </p>
                  {sender.pan && (
                    <p className="text-xs text-[#140f12]/60 font-mono pt-1">
                      PAN: <span className="font-semibold text-[#140f12]">{sender.pan}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#fde9dc] text-[#8a4a25] text-xs">
                  Creator profile not found.
                  <Link href="/settings" className="block font-semibold underline mt-1">
                    Setup Settings &rarr;
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#140f12]/05 text-[10px] uppercase tracking-[0.15em] text-[#140f12]/40 font-mono">
              Bank: {sender?.bankName || "HDFC Bank"} &bull; A/C: {sender?.bankAccountNumber || "—"}
            </div>
          </div>

          {/* BILL TO: Client */}
          <div className="bg-white rounded-3xl p-7 border border-[#140f12]/[0.08] shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-sans tracking-[0.22em] text-[#140f12]/45 font-medium">
                  Bill To &bull; Client / Brand
                </span>
                <Link
                  href="/clients"
                  className="text-[10px] uppercase tracking-[0.16em] text-[#e86c54] hover:text-[#140f12] flex items-center gap-1 font-medium transition"
                >
                  <Building2 className="w-3 h-3" />
                  <span>Directory</span>
                </Link>
              </div>

              {clients.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#140f12]/10 text-center">
                  <p className="text-xs text-[#140f12]/60 mb-2 font-sans">
                    No client saved yet.
                  </p>
                  <Link
                    href="/clients"
                    className="btn-tactile inline-flex items-center gap-1 px-4 py-1.5 bg-[#140f12] text-white rounded-full text-[10px] uppercase tracking-[0.15em] font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Client</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    disabled={isLocked}
                    value={clientId}
                    onChange={(e) => setClientId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm font-medium text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white disabled:opacity-60 transition"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {selectedClient && (
                    <div className="p-3.5 bg-[#faf6f0]/60 rounded-2xl text-xs text-[#140f12]/70 space-y-1 font-sans">
                      <p className="whitespace-pre-line leading-relaxed">
                        {selectedClient.address}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] text-[#140f12]/60">
                        {selectedClient.gstin && <span>GSTIN: {selectedClient.gstin}</span>}
                        {selectedClient.pan && <span>PAN: {selectedClient.pan}</span>}
                      </div>

                      {(() => {
                        const cfs = (() => {
                          if (!selectedClient.customFields) return [];
                          if (Array.isArray(selectedClient.customFields)) return selectedClient.customFields;
                          try {
                            const parsed = JSON.parse(selectedClient.customFields);
                            return Array.isArray(parsed) ? parsed : [];
                          } catch {
                            return [];
                          }
                        })();
                        if (cfs.length === 0) return null;
                        return (
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {cfs.map((cf, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-full bg-white text-[#140f12]/80 text-[10px] border border-[#140f12]/10"
                              >
                                <strong className="font-medium mr-1 text-[#140f12]/60">
                                  {cf.label}:
                                </strong>{" "}
                                {cf.value}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deliverables Table */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#140f12]/[0.08] shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl font-light italic text-[#140f12]">
                Deliverables &amp; Campaign Items
              </h2>
              <p className="text-[10px] uppercase font-sans tracking-[0.18em] text-[#140f12]/45">
                Reels, store visits, ad usages, and collaborations
              </p>
            </div>

            {!isLocked && (
              <button
                type="button"
                onClick={addItemRow}
                className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 bg-[#faf6f0] hover:bg-[#fde9dc] text-[#140f12] text-[10px] uppercase tracking-[0.18em] font-medium rounded-full border border-[#140f12]/10 transition"
              >
                <Plus className="w-3.5 h-3.5 text-[#e86c54]" />
                <span>Add Item</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-[#140f12]/08 text-[10px] font-medium text-[#140f12]/50 uppercase tracking-[0.22em]">
                  <th className="py-3 px-2 w-10 text-center">#</th>
                  <th className="py-3 px-3">Deliverable Description *</th>
                  <th className="py-3 px-2 w-24 text-right">Qty</th>
                  <th className="py-3 px-2 w-28 text-right">Rate (₹)</th>
                  <th className="py-3 px-3 w-36 text-right">Amount (₹) *</th>
                  {!isLocked && <th className="py-3 px-2 w-12 text-center"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#140f12]/05 text-sm">
                {items.map((item, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-3.5 px-2 text-center text-[#140f12]/40 text-xs font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-3">
                      <input
                        type="text"
                        required
                        disabled={isLocked}
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(idx, "description", e.target.value)
                        }
                        placeholder="e.g. Collab Reel / Store Visit Reel with 1 Month Ads"
                        className="w-full px-3.5 py-2 bg-[#faf6f0]/60 border border-[#140f12]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white disabled:opacity-60 transition"
                      />
                    </td>
                    <td className="py-3.5 px-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        disabled={isLocked}
                        value={item.qty ?? ""}
                        onChange={(e) =>
                          handleItemChange(idx, "qty", e.target.value)
                        }
                        placeholder="Qty"
                        className="w-full px-2.5 py-2 text-right bg-[#faf6f0]/60 border border-[#140f12]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white disabled:opacity-60 transition"
                      />
                    </td>
                    <td className="py-3.5 px-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        disabled={isLocked}
                        value={item.rate ?? ""}
                        onChange={(e) =>
                          handleItemChange(idx, "rate", e.target.value)
                        }
                        placeholder="Rate"
                        className="w-full px-2.5 py-2 text-right bg-[#faf6f0]/60 border border-[#140f12]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white disabled:opacity-60 transition"
                      />
                    </td>
                    <td className="py-3.5 px-3">
                      <input
                        type="number"
                        required
                        min="0"
                        step="any"
                        disabled={isLocked}
                        value={item.amount || ""}
                        onChange={(e) =>
                          handleItemChange(idx, "amount", e.target.value)
                        }
                        placeholder="0.00"
                        className="w-full px-3.5 py-2 text-right bg-[#faf6f0]/60 border border-[#140f12]/10 rounded-xl font-display italic text-lg text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white disabled:opacity-60 transition"
                      />
                    </td>
                    {!isLocked && (
                      <td className="py-3.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={items.length <= 1}
                          className="text-[#140f12]/30 hover:text-red-600 disabled:opacity-10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 pt-5 border-t border-[#140f12]/08 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {!isLocked ? (
              <button
                type="button"
                onClick={addItemRow}
                className="btn-tactile inline-flex items-center gap-1.5 text-[#e86c54] hover:text-[#140f12] text-xs font-semibold tracking-wide transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add another deliverable line</span>
              </button>
            ) : <div />}

            <div className="text-right">
              <span className="text-[10px] uppercase font-sans tracking-[0.22em] text-[#140f12]/50 mr-4 font-medium">
                Grand Total:
              </span>
              <span className="font-display text-3xl sm:text-4xl font-light italic text-[#140f12]">
                ₹{" "}
                {totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Live Amount in Words Banner */}
        <div className="bg-[#140f12] rounded-3xl p-6 text-white shadow-soft flex items-center gap-5 border border-[#140f12]">
          <div className="p-3 bg-white/10 text-[#e86c54] rounded-2xl flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-medium uppercase tracking-[0.22em] text-[#e86c54] block mb-0.5">
              Auto-Generated Amount in Words
            </span>
            <p className="font-display italic text-lg sm:text-xl text-white font-light tracking-wide">
              {amountInWords}
            </p>
          </div>
        </div>

        {/* Terms & Status */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#140f12]/[0.08] shadow-soft grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
              Notes / Terms of Payment
            </label>
            <textarea
              rows={3}
              disabled={isLocked}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-xs text-[#140f12] focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white disabled:opacity-60 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1.5">
              Invoice Status
            </label>
            <select
              disabled={isLocked}
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "sent" | "paid")
              }
              className="w-full px-4 py-2.5 bg-[#faf6f0]/70 border border-[#140f12]/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e86c54] focus:bg-white disabled:opacity-60 transition"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </select>
            <p className="text-[10px] text-[#140f12]/45 mt-2">
              {isEditMode
                ? "Once changed from Draft to Sent or Paid, deliverables will be locked."
                : "You can update the status any time after saving."}
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center gap-4">
          <div>
            {isEditMode && (
              <button
                type="button"
                onClick={async () => {
                  if (
                    !window.confirm(
                      `Are you sure you want to delete invoice "${invoiceNumber}"? This cannot be undone.`
                    )
                  )
                    return;
                  try {
                    const res = await fetch(`/api/invoices/${editId}`, {
                      method: "DELETE",
                    });
                    if (res.ok) {
                      router.push("/invoices");
                    } else {
                      const data = await res.json();
                      alert(data.error || "Failed to delete invoice");
                    }
                  } catch {
                    alert("Failed to delete invoice");
                  }
                }}
                className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50 text-[10px] uppercase tracking-[0.18em] font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Invoice</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={isEditMode ? `/invoices/${editId}` : "/invoices"}
              className="text-xs uppercase tracking-[0.16em] text-[#140f12]/60 hover:text-[#140f12] font-medium"
            >
              Cancel
            </Link>

            {!isLocked && (
              <button
                type="submit"
                disabled={submitting}
                className="btn-tactile inline-flex items-center gap-2 px-8 py-3.5 bg-[#140f12] hover:bg-[#e86c54] text-white font-medium text-[11px] uppercase tracking-[0.2em] rounded-full shadow-soft transition-colors duration-200 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>{isEditMode ? "Update Invoice" : "Generate Invoice"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#140f12]"></div>
        </div>
      }
    >
      <InvoiceForm />
    </Suspense>
  );
}
