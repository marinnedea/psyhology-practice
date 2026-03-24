"use client";

import { useState } from "react";
import ImageUpload from "@/components/ui/ImageUpload";

type Testimonial = {
  id: string;
  clientName: string;
  clientRole: string | null;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

type Props = {
  initialTestimonials: Testimonial[];
};

const emptyForm = {
  clientName: "",
  clientRole: "",
  quote: "",
  rating: 5,
  avatarUrl: "",
  isActive: true,
  sortOrder: 0,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300 fill-current"}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsAdmin({ initialTestimonials }: Props) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(t: Testimonial) {
    setEditing(t);
    setForm({
      clientName: t.clientName,
      clientRole: t.clientRole ?? "",
      quote: t.quote,
      rating: t.rating,
      avatarUrl: t.avatarUrl ?? "",
      isActive: t.isActive,
      sortOrder: t.sortOrder,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.clientName.trim() || !form.quote.trim()) {
      showToast("Name and quote are required.", "error");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          clientRole: form.clientRole || null,
          avatarUrl: form.avatarUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Save failed.", "error");
        return;
      }
      if (editing) {
        setTestimonials((prev) => prev.map((t) => (t.id === editing.id ? data : t)));
        showToast("Testimonial updated.");
      } else {
        setTestimonials((prev) => [...prev, data]);
        showToast("Testimonial added.");
      }
      cancelForm();
    } catch {
      showToast("Network error.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Delete failed.", "error");
        return;
      }
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      showToast("Testimonial deleted.");
    } catch {
      showToast("Network error.", "error");
    } finally {
      setDeleting(null);
    }
  }

  async function toggleActive(t: Testimonial) {
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...t, clientRole: t.clientRole ?? undefined, avatarUrl: t.avatarUrl ?? undefined, isActive: !t.isActive }),
      });
      if (!res.ok) { showToast("Update failed.", "error"); return; }
      const data = await res.json();
      setTestimonials((prev) => prev.map((x) => (x.id === t.id ? data : x)));
    } catch {
      showToast("Network error.", "error");
    }
  }

  const inputCls = "w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelCls = "block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1";

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header actions */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {testimonials.length} testimonial{testimonials.length !== 1 ? "s" : ""}
        </p>
        {!showForm && (
          <button
            onClick={openNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Add Testimonial
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white text-base">
            {editing ? "Edit Testimonial" : "New Testimonial"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Client Name *</label>
              <input className={inputCls} value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="Sarah M." />
            </div>
            <div>
              <label className={labelCls}>Role / Description</label>
              <input className={inputCls} value={form.clientRole} onChange={(e) => setForm({ ...form, clientRole: e.target.value })} placeholder="Client since 2023" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Quote *</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="What the client said..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Rating (1–5)</label>
              <div className="flex gap-2 items-center mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className={`w-8 h-8 rounded-full text-sm font-bold border-2 transition-colors ${form.rating >= n ? "bg-yellow-400 border-yellow-400 text-white" : "border-gray-300 text-gray-400 hover:border-yellow-300"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input type="number" className={`${inputCls} w-24`} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Avatar Image (optional)</label>
            <ImageUpload
              value={form.avatarUrl || undefined}
              label=""
              onChange={(url) => setForm({ ...form, avatarUrl: url })}
              onClear={() => setForm({ ...form, avatarUrl: "" })}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.isActive ? "bg-indigo-600" : "bg-gray-200"}`}
              aria-label="Toggle active"
            >
              <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition ${form.isActive ? "translate-x-4" : "translate-x-0"}`} />
            </button>
            <span className={`text-xs font-medium ${form.isActive ? "text-indigo-600" : "text-gray-400"}`}>
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : editing ? "Update" : "Add Testimonial"}
            </button>
            <button
              onClick={cancelForm}
              className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {testimonials.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-sm">No testimonials yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex gap-4 items-start transition-opacity ${t.isActive ? "border-gray-200 dark:border-slate-700" : "border-gray-100 dark:border-slate-800 opacity-60"}`}
            >
              {/* Avatar */}
              <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt={t.clientName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-indigo-700 dark:text-indigo-300 font-bold text-base">
                    {t.clientName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.clientName}</p>
                    {t.clientRole && <p className="text-xs text-gray-500 dark:text-slate-400">{t.clientRole}</p>}
                  </div>
                  <StarRating rating={t.rating} />
                </div>
                <p className="text-gray-600 dark:text-slate-300 text-sm italic leading-relaxed line-clamp-2">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(t)}
                  title={t.isActive ? "Set inactive" : "Set active"}
                  className={`text-xs px-2 py-1 rounded-lg font-medium border transition-colors ${t.isActive ? "text-green-700 bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" : "text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"}`}
                >
                  {t.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="text-xs px-2 py-1 rounded-lg font-medium border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting === t.id}
                  className="text-xs px-2 py-1 rounded-lg font-medium border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {deleting === t.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
