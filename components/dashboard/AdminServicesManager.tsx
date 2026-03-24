"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSiteSettings } from "@/app/providers";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ServiceForm = {
  name: string;
  description: string;
  price: string;
  duration: string;
  sortOrder: string;
  isActive: boolean;
};

const emptyForm: ServiceForm = {
  name: "",
  description: "",
  price: "",
  duration: "",
  sortOrder: "0",
  isActive: true,
};

type Props = {
  initialServices: Service[];
};

// ── Inline TinyMCE wrapper ────────────────────────────────────────────────────

function TinyMCEInline({ value, onChange, apiKey }: { value: string; onChange: (v: string) => void; apiKey: string }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Editor } = require("@tinymce/tinymce-react");
  return (
    <Editor
      apiKey={apiKey}
      value={value}
      onEditorChange={onChange}
      init={{
        height: 150,
        menubar: false,
        plugins: ["lists", "link"],
        toolbar: "bold italic | bullist numlist | link",
        content_style: "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; line-height: 1.5; }",
        statusbar: false,
        branding: false,
      }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminServicesManager({ initialServices }: Props) {
  const router = useRouter();
  const siteSettings = useSiteSettings();
  const TINYMCE_KEY =
    (siteSettings as Record<string, string>).tinymce_api_key?.trim() ||
    process.env.NEXT_PUBLIC_TINYMCE_API_KEY ||
    "";

  const [services, setServices] = useState<Service[]>(initialServices);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<ServiceForm>(emptyForm);
  const [editForm, setEditForm] = useState<ServiceForm>(emptyForm);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      description: service.description ?? "",
      price: service.price,
      duration: String(service.duration),
      sortOrder: String(service.sortOrder),
      isActive: service.isActive,
    });
    setError(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading("add");
    setError(null);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addForm.name,
          description: addForm.description || null,
          price: parseFloat(addForm.price),
          duration: parseInt(addForm.duration, 10),
          sortOrder: parseInt(addForm.sortOrder, 10),
          isActive: addForm.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create service."); return; }
      setServices((prev) => [...prev, { ...data, price: String(data.price) }]);
      setAddForm(emptyForm);
      setShowAddForm(false);
      showToast("Service created.");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setLoading("edit");
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description || null,
          price: parseFloat(editForm.price),
          duration: parseInt(editForm.duration, 10),
          sortOrder: parseInt(editForm.sortOrder, 10),
          isActive: editForm.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to update service."); return; }
      setServices((prev) => prev.map((s) => s.id === editingId ? { ...data, price: String(data.price) } : s));
      setEditingId(null);
      showToast("Service updated.");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function handleToggleActive(service: Service) {
    setLoading(`toggle-${service.id}`);
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Failed to update."); return; }
      setServices((prev) => prev.map((s) => s.id === service.id ? { ...data, price: String(data.price) } : s));
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    setLoading(`delete-${id}`);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); showToast(data.error ?? "Failed to delete."); return; }
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast("Service deleted.");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelCls = "block text-xs font-medium text-gray-700 mb-1";

  function ServiceFormFields({ form, setForm, formId }: { form: ServiceForm; setForm: (f: ServiceForm) => void; formId: string }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className={labelCls}>Name <span className="text-red-500">*</span></label>
          <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Description</label>
          {TINYMCE_KEY ? (
            <TinyMCEInline value={form.description} onChange={(v) => setForm({ ...form, description: v })} apiKey={TINYMCE_KEY} />
          ) : (
            <textarea className={`${inputClass} resize-none`} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          )}
        </div>
        <div>
          <label className={labelCls}>Price (€) <span className="text-red-500">*</span></label>
          <input type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        </div>
        <div>
          <label className={labelCls}>Duration (minutes) <span className="text-red-500">*</span></label>
          <input type="number" min="1" className={inputClass} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
        </div>
        <div>
          <label className={labelCls}>Sort Order</label>
          <input type="number" className={inputClass} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
        </div>
        <div className="flex items-center gap-2 pt-4">
          <input type="checkbox" id={`isActive-${formId}`} checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded accent-indigo-600" />
          <label htmlFor={`isActive-${formId}`} className="text-sm text-gray-700">Active</label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">{toast}</div>
      )}

      <div className="flex justify-end">
        <button onClick={() => { setShowAddForm((v) => !v); setError(null); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          {showAddForm ? "Cancel" : "+ Add Service"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">New Service</h2>
          {error && <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <form onSubmit={handleAdd} className="space-y-4">
            <ServiceFormFields form={addForm} setForm={setAddForm} formId="add" />
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading === "add"} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {loading === "add" ? "Creating…" : "Create Service"}
              </button>
              <button type="button" onClick={() => { setShowAddForm(false); setError(null); }} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {services.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">No services yet. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Duration</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Sort</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Active</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) =>
                  editingId === service.id ? (
                    <tr key={service.id} className="border-b border-gray-100 bg-indigo-50/40">
                      <td colSpan={6} className="px-5 py-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Editing: {service.name}</h3>
                        {error && <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
                        <form onSubmit={handleEdit} className="space-y-4">
                          <ServiceFormFields form={editForm} setForm={setEditForm} formId="edit" />
                          <div className="flex gap-3 pt-1">
                            <button type="submit" disabled={loading === "edit"} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                              {loading === "edit" ? "Saving…" : "Save Changes"}
                            </button>
                            <button type="button" onClick={() => { setEditingId(null); setError(null); }} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={service.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{service.name}</div>
                        {service.description && (
                          <div className="text-xs text-gray-400 truncate max-w-xs">
                            {service.description.replace(/<[^>]*>/g, " ").slice(0, 80)}{service.description.length > 80 ? "…" : ""}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-600">€{service.price}</td>
                      <td className="px-5 py-3 text-gray-600">{service.duration} min</td>
                      <td className="px-5 py-3 text-gray-500">{service.sortOrder}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggleActive(service)}
                          disabled={loading === `toggle-${service.id}`}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${service.isActive ? "bg-indigo-600" : "bg-gray-200"}`}
                          aria-label="Toggle active"
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ${service.isActive ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-3">
                          <button onClick={() => startEdit(service)} className="text-indigo-600 hover:underline text-xs font-medium">Edit</button>
                          <button onClick={() => handleDelete(service.id)} disabled={loading === `delete-${service.id}`} className="text-red-500 hover:underline text-xs font-medium disabled:opacity-50">
                            {loading === `delete-${service.id}` ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
