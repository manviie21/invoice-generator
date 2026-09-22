"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Mail,
  MapPin,
  Building2,
  X,
  Sparkles,
  Trash2,
  Pencil,
  Tag,
  Info,
} from "lucide-react";
import type { Client, ClientCustomField } from "@/lib/types";

interface CustomFieldRow {
  label: string;
  value: string;
}

const PRESET_CUSTOM_FIELDS = [
  "Contact Person",
  "Phone / Mobile",
  "Vendor Code",
  "Place of Supply",
  "PO Number",
  "Website",
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    email: string;
    gstin: string;
    pan: string;
    customFields: CustomFieldRow[];
  }>({
    name: "",
    address: "",
    email: "",
    gstin: "",
    pan: "",
    customFields: [],
  });

  const loadClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
      }
    } catch {
      console.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      address: "",
      email: "",
      gstin: "",
      pan: "",
      customFields: [],
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    let parsed: CustomFieldRow[] = [];
    if (Array.isArray(client.customFields)) {
      parsed = client.customFields.map((cf) => ({
        label: cf.label,
        value: cf.value,
      }));
    } else if (typeof client.customFields === "string") {
      try {
        const json = JSON.parse(client.customFields);
        if (Array.isArray(json)) {
          parsed = json.map((cf) => ({
            label: cf.label || "",
            value: cf.value || "",
          }));
        }
      } catch {
        parsed = [];
      }
    }

    setFormData({
      name: client.name,
      address: client.address,
      email: client.email || "",
      gstin: client.gstin || "",
      pan: client.pan || "",
      customFields: parsed,
    });
    setError("");
    setIsModalOpen(true);
  };

  const addCustomField = (label = "", value = "") => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { label, value }],
    }));
  };

  const updateCustomField = (
    index: number,
    field: "label" | "value",
    val: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.customFields];
      updated[index][field] = val;
      return { ...prev, customFields: updated };
    });
  };

  const removeCustomField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...formData,
      customFields: formData.customFields.filter(
        (cf) => cf.label.trim() && cf.value.trim()
      ),
    };

    try {
      const url = editingClient
        ? `/api/clients/${editingClient.id}`
        : "/api/clients";
      const method = editingClient ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        window.location.href = "/login?from=/clients";
        return;
      }

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        setError(`Server error (${res.status}): ${res.statusText}`);
        setSaving(false);
        return;
      }

      if (!res.ok) {
        setError(data?.error || `Failed to save client (${res.status})`);
        setSaving(false);
        return;
      }

      setIsModalOpen(false);
      loadClients();
    } catch (err: any) {
      setError(`Network error: ${err?.message || "Could not connect to server"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (id: number, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"? This cannot be undone.`
      )
    )
      return;

    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete client");
        return;
      }
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Network error while deleting client");
    }
  };

  // Helper to parse custom fields from client object
  const getParsedCustomFields = (client: Client): ClientCustomField[] => {
    if (!client.customFields) return [];
    if (Array.isArray(client.customFields)) return client.customFields;
    if (typeof client.customFields === "string") {
      try {
        const parsed = JSON.parse(client.customFields);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const filteredClients = clients.filter((c) => {
    const q = search.toLowerCase();
    const inName = c.name.toLowerCase().includes(q);
    const inAddress = c.address.toLowerCase().includes(q);
    const inGstin = Boolean(c.gstin && c.gstin.toLowerCase().includes(q));
    const inCustom = getParsedCustomFields(c).some(
      (cf) =>
        cf.label.toLowerCase().includes(q) || cf.value.toLowerCase().includes(q)
    );
    return inName || inAddress || inGstin || inCustom;
  });

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-10">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5 pb-6 border-b border-[#140f12]/[0.08]">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#e86c54] font-medium block mb-1">
            Partners &bull; Agencies &bull; Brands
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-light italic tracking-tight text-[#140f12]">
            Client Directory
          </h1>
          <p className="text-xs text-[#140f12]/55 mt-2 font-sans tracking-wide">
            Save brands and corporate entities once with custom billing details; reuse seamlessly across future invoices.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-tactile inline-flex items-center gap-2 px-6 py-3 bg-[#140f12] hover:bg-[#e86c54] text-white font-medium text-[11px] uppercase tracking-[0.18em] rounded-full shadow-soft transition-colors duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#140f12]/40">
          <Search className="w-3.5 h-3.5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brand name, city, GSTIN, vendor code..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#140f12]/10 rounded-full text-xs placeholder-[#140f12]/40 focus:outline-none focus:ring-2 focus:ring-[#e86c54] shadow-card transition"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#140f12]"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-[#140f12]/[0.08] shadow-soft max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#fde9dc] text-[#e86c54] flex items-center justify-center mx-auto mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-display text-2xl font-light italic text-[#140f12]">
            {search ? "No clients match your query" : "No saved clients"}
          </h3>
          <p className="text-xs text-[#140f12]/50 mt-2 mb-6 font-sans">
            {search
              ? "Try searching for a different keyword or clear the search field."
              : "Add your corporate or brand partner to start generating invoices."}
          </p>
          {!search && (
            <button
              onClick={openAddModal}
              className="btn-tactile inline-flex items-center gap-2 px-6 py-2.5 bg-[#140f12] hover:bg-[#e86c54] text-white text-[11px] uppercase tracking-[0.18em] font-medium rounded-full transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Client</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const customFields = getParsedCustomFields(client);

            return (
              <div
                key={client.id}
                className="card-hover bg-white rounded-3xl p-6 border border-[#140f12]/[0.08] shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#fde9dc] text-[#e86c54] flex items-center justify-center font-display italic text-lg font-bold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-semibold text-[#140f12] text-base leading-snug">
                        {client.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(client)}
                        title="Edit Client & Details"
                        className="btn-tactile p-1.5 rounded-full text-[#140f12]/40 hover:text-[#140f12] hover:bg-[#faf6f0] transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteClient(client.id, client.name)
                        }
                        title="Delete Client"
                        className="btn-tactile p-1.5 rounded-full text-[#140f12]/40 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 text-xs text-[#140f12]/65 font-sans">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#e86c54] mt-0.5 flex-shrink-0" />
                      <span className="whitespace-pre-line leading-relaxed">
                        {client.address}
                      </span>
                    </div>

                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#140f12]/40 flex-shrink-0" />
                        <span>{client.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Custom Fields list if present */}
                  {customFields.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-[#140f12]/05 space-y-1.5">
                      {customFields.map((cf, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-baseline text-[11px] font-sans"
                        >
                          <span className="text-[#140f12]/50 font-medium">
                            {cf.label}:
                          </span>
                          <span
                            className="text-[#140f12] font-semibold text-right max-w-[65%] truncate"
                            title={cf.value}
                          >
                            {cf.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Badges for GSTIN / PAN */}
                {(client.gstin || client.pan) && (
                  <div className="mt-5 pt-3.5 border-t border-[#140f12]/05 flex flex-wrap gap-2">
                    {client.gstin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#faf6f0] text-[#140f12]/70 text-[10px] font-mono border border-[#140f12]/08">
                        GST: {client.gstin}
                      </span>
                    )}
                    {client.pan && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#faf6f0] text-[#140f12]/70 text-[10px] font-mono border border-[#140f12]/08">
                        PAN: {client.pan}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140f12]/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#faf6f0] rounded-3xl max-w-xl w-full p-7 sm:p-9 shadow-2xl relative border border-[#140f12]/10 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn-tactile absolute top-6 right-6 text-[#140f12]/40 hover:text-[#140f12] p-1.5 rounded-full hover:bg-black/05"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-[#fde9dc] text-[#e86c54] rounded-2xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-light italic text-[#140f12]">
                  {editingClient ? "Edit Client Profile" : "Add Client / Brand"}
                </h2>
                <p className="text-[10px] uppercase font-sans tracking-[0.18em] text-[#140f12]/45">
                  Corporate billing &amp; customizable details
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveClient} className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1">
                  Client / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. SSW EXIM INTERNATIONAL"
                  className="w-full px-4 py-2.5 bg-white border border-[#140f12]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e86c54]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1">
                  Billing Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="16 Bhudargad CHS, RTO Lane&#10;Andheri West, Mumbai 400053"
                  className="w-full px-4 py-2.5 bg-white border border-[#140f12]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e86c54]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gstin: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="27ADKPW8785H1ZJ"
                    className="w-full px-4 py-2 bg-white border border-[#140f12]/10 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#e86c54]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1">
                    PAN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pan: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ADKPW8785H"
                    className="w-full px-4 py-2 bg-white border border-[#140f12]/10 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#e86c54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/60 mb-1">
                  Accounts Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="billing@brand.com"
                  className="w-full px-4 py-2 bg-white border border-[#140f12]/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e86c54]"
                />
              </div>

              {/* Customizable Extra Information Section */}
              <div className="pt-4 border-t border-[#140f12]/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#e86c54]" />
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#140f12]/70">
                      Customizable Client Details
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addCustomField("", "")}
                    className="btn-tactile inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#e86c54] hover:text-[#140f12] font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Custom Field</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#140f12]/50 font-sans mb-3">
                  Add any extra details required by the brand (e.g., Contact Person, Vendor Code, Phone, Place of Supply, PO #). These will automatically appear on the invoice PDF.
                </p>

                {/* Preset Suggestions Quick Add */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {PRESET_CUSTOM_FIELDS.map((preset) => {
                    const alreadyExists = formData.customFields.some(
                      (cf) => cf.label.toLowerCase() === preset.toLowerCase()
                    );
                    if (alreadyExists) return null;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => addCustomField(preset, "")}
                        className="btn-tactile text-[10px] px-2.5 py-1 rounded-full bg-white border border-[#140f12]/10 hover:border-[#e86c54] text-[#140f12]/70 hover:text-[#e86c54] transition"
                      >
                        + {preset}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Fields Dynamic Rows */}
                {formData.customFields.length > 0 ? (
                  <div className="space-y-2.5 bg-white/60 p-3 rounded-2xl border border-[#140f12]/08">
                    {formData.customFields.map((cf, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={cf.label}
                          onChange={(e) =>
                            updateCustomField(idx, "label", e.target.value)
                          }
                          placeholder="Field Name (e.g. Contact Person)"
                          className="w-5/12 px-3 py-1.5 bg-white border border-[#140f12]/10 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#e86c54]"
                        />
                        <input
                          type="text"
                          required
                          value={cf.value}
                          onChange={(e) =>
                            updateCustomField(idx, "value", e.target.value)
                          }
                          placeholder="Field Value (e.g. Rahul Verma)"
                          className="w-6/12 px-3 py-1.5 bg-white border border-[#140f12]/10 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#e86c54]"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomField(idx)}
                          title="Remove custom field"
                          className="btn-tactile p-1 text-[#140f12]/40 hover:text-red-600 rounded-md transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="pt-4 flex justify-end gap-3 items-center border-t border-[#140f12]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs uppercase tracking-[0.16em] text-[#140f12]/60 hover:text-[#140f12]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-tactile px-6 py-2.5 bg-[#140f12] hover:bg-[#e86c54] text-white rounded-full text-[11px] uppercase tracking-[0.18em] font-medium transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingClient
                    ? "Update Client"
                    : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
