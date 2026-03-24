"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSiteSettings } from "@/app/providers";

export type PageSection = {
  id: string;
  page: string;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  sortOrder: number;
  isVisible: boolean;
  metadata: Record<string, unknown> | null;
  updatedAt: string;
};

type Props = { initialSections: PageSection[] };

const SECTION_DEFS = [
  { key: "hero",         label: "Hero Banner",     icon: "🏠", defaultSortOrder: 1 },
  { key: "contact_info", label: "Contact Info",    icon: "📞", defaultSortOrder: 2 },
  { key: "newsletter",   label: "Newsletter Strip", icon: "📧", defaultSortOrder: 3 },
];

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
const labelClass = "block text-xs font-medium text-gray-700 mb-1";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={labelClass}>{children}</label>;
}

function VisibilityToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <FieldLabel>Visibility</FieldLabel>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? "bg-indigo-600" : "bg-gray-200"}`}
        aria-label="Toggle visibility"
      >
        <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition ${value ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      <span className={`text-xs font-medium ${value ? "text-indigo-600" : "text-gray-400"}`}>
        {value ? "Visible" : "Hidden"}
      </span>
    </div>
  );
}

function TinyMCEInline({ value, onChange, apiKey, height = 120 }: { value: string; onChange: (v: string) => void; apiKey: string; height?: number }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Editor } = require("@tinymce/tinymce-react");
  return (
    <Editor
      apiKey={apiKey}
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: false,
        plugins: ["lists", "link"],
        toolbar: "bold italic | bullist | link",
        content_style: "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; line-height: 1.5; }",
        statusbar: false,
        branding: false,
      }}
    />
  );
}

type FormState = {
  title: string;
  subtitle: string;
  content: string;
  isVisible: boolean;
  sortOrder: number;
  meta: Record<string, unknown>;
};

function getDefaultMeta(key: string): Record<string, unknown> {
  if (key === "contact_info") {
    return {
      email: "hello@example.com",
      phone: "",
      responseTime: "We aim to reply within 1–2 business days.",
    };
  }
  return {};
}

export default function AdminContactPageEditor({ initialSections }: Props) {
  const router = useRouter();
  const siteSettings = useSiteSettings();
  const TINYMCE_KEY =
    (siteSettings as Record<string, string>).tinymce_api_key?.trim() ||
    process.env.NEXT_PUBLIC_TINYMCE_API_KEY ||
    "";

  const [sections, setSections] = useState<PageSection[]>(initialSections);
  const [selectedKey, setSelectedKey] = useState<string>(SECTION_DEFS[0].key);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function buildInitialForm(key: string): FormState {
    const section = sections.find((s) => s.sectionKey === key);
    const def = SECTION_DEFS.find((d) => d.key === key)!;
    return {
      title:     section?.title     ?? "",
      subtitle:  section?.subtitle  ?? "",
      content:   section?.content   ?? "",
      isVisible: section?.isVisible ?? true,
      sortOrder: section?.sortOrder ?? def.defaultSortOrder,
      meta:      (section?.metadata as Record<string, unknown>) ?? getDefaultMeta(key),
    };
  }

  const [form, setForm] = useState<FormState>(() => buildInitialForm(SECTION_DEFS[0].key));

  function selectSection(key: string) {
    setSelectedKey(key);
    setForm(buildInitialForm(key));
  }

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const handleSave = useCallback(async () => {
    const existing = sections.find((s) => s.sectionKey === selectedKey);
    setLoading(true);
    try {
      let res: Response;
      const payload = {
        title:     form.title    || null,
        subtitle:  form.subtitle || null,
        content:   form.content  || null,
        isVisible: form.isVisible,
        sortOrder: form.sortOrder,
        metadata:  form.meta,
      };
      if (existing) {
        res = await fetch(`/api/admin/page-sections/${existing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/page-sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page: "contact", sectionKey: selectedKey, ...payload }),
        });
      }
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Failed to save.", "error"); return; }
      setSections((prev) => {
        const next = prev.filter((s) => s.sectionKey !== selectedKey);
        return [...next, {
          id: data.id, page: data.page, sectionKey: data.sectionKey,
          title: data.title, subtitle: data.subtitle, content: data.content,
          sortOrder: data.sortOrder, isVisible: data.isVisible,
          metadata: data.metadata, updatedAt: data.updatedAt,
        }];
      });
      showToast("Section saved.");
      router.refresh();
    } catch {
      showToast("Network error.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedKey, form, sections, router]);

  function getSectionStatus(key: string): "configured-visible" | "configured-hidden" | "unconfigured" {
    const s = sections.find((sec) => sec.sectionKey === key);
    if (!s) return "unconfigured";
    return s.isVisible ? "configured-visible" : "configured-hidden";
  }

  function renderEditor() {
    if (selectedKey === "hero") {
      return (
        <div className="space-y-4">
          <div>
            <FieldLabel>Headline</FieldLabel>
            <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Get in Touch" />
          </div>
          <div>
            <FieldLabel>Subtitle</FieldLabel>
            {TINYMCE_KEY ? (
              <TinyMCEInline value={form.subtitle} onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))} apiKey={TINYMCE_KEY} />
            ) : (
              <textarea className={`${inputClass} resize-none`} rows={3} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Whether you're an individual or an organisation — we'd love to hear from you." />
            )}
          </div>
        </div>
      );
    }

    if (selectedKey === "contact_info") {
      const meta = form.meta as { email?: string; phone?: string; responseTime?: string };
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
            These details appear in the sidebar of the contact form. The main contact email is also configurable under <strong>Settings → Branding</strong>.
          </div>
          <div>
            <FieldLabel>Display Email</FieldLabel>
            <input className={inputClass} value={meta.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, meta: { ...f.meta, email: e.target.value } }))} placeholder="hello@example.com" />
          </div>
          <div>
            <FieldLabel>Display Phone <span className="font-normal text-gray-400">(optional)</span></FieldLabel>
            <input className={inputClass} value={meta.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, meta: { ...f.meta, phone: e.target.value } }))} placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <FieldLabel>Response Time Message</FieldLabel>
            <input className={inputClass} value={meta.responseTime ?? ""} onChange={(e) => setForm((f) => ({ ...f, meta: { ...f.meta, responseTime: e.target.value } }))} placeholder="We aim to reply within 1–2 business days." />
          </div>
        </div>
      );
    }

    if (selectedKey === "newsletter") {
      return (
        <div className="space-y-4">
          <div>
            <FieldLabel>Headline</FieldLabel>
            <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Subscribe to our newsletter" />
          </div>
          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea className={`${inputClass} resize-none`} rows={2} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Get mental health tips, expert articles, and platform updates." />
          </div>
        </div>
      );
    }

    return null;
  }

  const selectedDef = SECTION_DEFS.find((d) => d.key === selectedKey)!;

  return (
    <div className="relative">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex gap-6 items-start">
        {/* Left: section list */}
        <div className="w-56 shrink-0 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Page Sections</p>
          </div>
          <ul className="divide-y divide-gray-100">
            {SECTION_DEFS.map((def) => {
              const status = getSectionStatus(def.key);
              const isSelected = selectedKey === def.key;
              return (
                <li key={def.key}>
                  <button
                    onClick={() => selectSection(def.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left ${isSelected ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                  >
                    <span className="text-base">{def.icon}</span>
                    <span className={`text-sm font-medium truncate flex-1 ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>{def.label}</span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${status === "configured-visible" ? "bg-green-500" : status === "configured-hidden" ? "bg-gray-400" : "bg-red-400"}`} />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />visible
              <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mx-1 ml-2" />hidden
              <span className="inline-block w-2 h-2 rounded-full bg-red-400 mx-1 ml-2" />new
            </p>
          </div>
        </div>

        {/* Right: editor */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Editing</p>
              <h2 className="text-base font-semibold text-gray-900">{selectedDef.icon} {selectedDef.label}</h2>
            </div>
            {sections.find((s) => s.sectionKey === selectedKey) ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Saved in DB</span>
            ) : (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">New — not saved yet</span>
            )}
          </div>
          <div className="p-6 space-y-6">
            {renderEditor()}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <VisibilityToggle value={form.isVisible} onChange={(v) => setForm((f) => ({ ...f, isVisible: v }))} />
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors font-semibold text-sm"
              >
                {loading ? "Saving…" : "Save Section"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
