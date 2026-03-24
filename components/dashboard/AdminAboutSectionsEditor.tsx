"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSiteSettings } from "@/app/providers";
import ImageUpload from "@/components/ui/ImageUpload";

// ── Types ─────────────────────────────────────────────────────────────────────

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

type Props = {
  initialSections: PageSection[];
};

// ── Section definitions ───────────────────────────────────────────────────────

const SECTION_DEFS = [
  { key: "hero",         label: "Hero Banner",    icon: "🏠", defaultSortOrder: 1 },
  { key: "our_story",    label: "Our Story",      icon: "📖", defaultSortOrder: 2 },
  { key: "our_mission",  label: "Our Mission",    icon: "🎯", defaultSortOrder: 3 },
  { key: "core_values",  label: "Core Values",    icon: "💎", defaultSortOrder: 4 },
  { key: "team",         label: "Meet the Team",  icon: "👥", defaultSortOrder: 5 },
  { key: "cta",          label: "CTA Banner",     icon: "✨", defaultSortOrder: 6 },
];

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
const labelClass = "block text-xs font-medium text-gray-700 mb-1";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={labelClass}>{children}</label>;
}

function ArrayItemRow({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
      {children}
      <button type="button" onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-medium">
        Remove
      </button>
    </div>
  );
}

function AddItemButton({ onClick, label = "Add Item" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-300 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors"
    >
      + {label}
    </button>
  );
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

// ── Inline TinyMCE wrapper ────────────────────────────────────────────────────

function TinyMCEInline({
  value,
  onChange,
  apiKey,
  height = 160,
  toolbar = "bold italic | bullist numlist | link",
}: {
  value: string;
  onChange: (v: string) => void;
  apiKey: string;
  height?: number;
  toolbar?: string;
}) {
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
        toolbar,
        content_style: "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 13px; line-height: 1.5; }",
        statusbar: false,
        branding: false,
      }}
    />
  );
}

// ── CTA gradient options ──────────────────────────────────────────────────────

const CTA_GRADIENTS = [
  { label: "Indigo → Indigo", value: "from-indigo-600 to-indigo-800" },
  { label: "Blue → Indigo",   value: "from-blue-600 to-indigo-700" },
  { label: "Indigo → Purple", value: "from-indigo-600 to-purple-700" },
];

// ── Default metadata ───────────────────────────────────────────────────────────

function getDefaultMeta(key: string): Record<string, unknown> {
  switch (key) {
    case "cta":
      return {
        button1: { text: "Find a Psychologist", href: "/psychologists" },
        button2: { text: "Get in Touch", href: "/contact" },
        gradient: "from-indigo-600 to-indigo-800",
      };
    case "core_values":
      return {
        items: [
          { title: "Trust & Safety",      description: "Every psychologist on our platform is fully vetted and approved. Your safety and privacy are non-negotiable." },
          { title: "Compassion First",    description: "We approach every interaction with empathy, understanding that seeking help takes courage." },
          { title: "Proven Methods",      description: "Our professionals use evidence-based, clinically validated therapeutic approaches." },
          { title: "Confidentiality",     description: "Everything shared between you and your psychologist stays between you and your psychologist." },
          { title: "Accessibility",       description: "Online and in-person options ensure that quality care is never out of reach." },
          { title: "Continuous Growth",   description: "We invest in ongoing professional development for all practitioners on our platform." },
        ],
      };
    case "our_story":
    case "our_mission":
      return { imageUrl: "", imageId: "" };
    default:
      return {};
  }
}

// ── FormState ─────────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  subtitle: string;
  content: string;
  isVisible: boolean;
  sortOrder: number;
  meta: Record<string, unknown>;
};

type EditorProps = {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  tinymceKey: string;
};

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminAboutSectionsEditor({ initialSections }: Props) {
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
        title:     form.title     || null,
        subtitle:  form.subtitle  || null,
        content:   form.content   || null,
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
          body: JSON.stringify({ page: "about", sectionKey: selectedKey, ...payload }),
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
    const props: EditorProps = { form, setForm, tinymceKey: TINYMCE_KEY };
    switch (selectedKey) {
      case "hero":        return <HeroEditor {...props} />;
      case "our_story":   return <StoryEditor {...props} />;
      case "our_mission": return <MissionEditor {...props} />;
      case "core_values": return <ValuesEditor {...props} />;
      case "team":        return <TeamEditor {...props} />;
      case "cta":         return <CtaEditor {...props} />;
      default: return null;
    }
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
                    <span className={`text-sm font-medium truncate flex-1 ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>
                      {def.label}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      status === "configured-visible" ? "bg-green-500" :
                      status === "configured-hidden"  ? "bg-gray-400" : "bg-red-400"
                    }`} />
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

// ── HeroEditor ────────────────────────────────────────────────────────────────

function HeroEditor({ form, setForm, tinymceKey }: EditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Headline</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="About Us" />
      </div>
      <div>
        <FieldLabel>Subtitle</FieldLabel>
        {tinymceKey ? (
          <TinyMCEInline value={form.subtitle} onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))} apiKey={tinymceKey} height={120} />
        ) : (
          <textarea className={`${inputClass} resize-none`} rows={2} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="We connect people with qualified, compassionate psychologists…" />
        )}
      </div>
    </div>
  );
}

// ── StoryEditor ───────────────────────────────────────────────────────────────

function StoryEditor({ form, setForm, tinymceKey }: EditorProps) {
  const meta = form.meta as { imageUrl?: string; imageId?: string };
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Section Title</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="How We Began" />
      </div>
      <div>
        <FieldLabel>Body Text</FieldLabel>
        {tinymceKey ? (
          <TinyMCEInline value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} apiKey={tinymceKey} height={180} />
        ) : (
          <textarea className={`${inputClass} resize-none`} rows={5} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Tell the story of how this practice began…" />
        )}
      </div>
      <ImageUpload
        label="Section Image (optional)"
        value={meta.imageUrl || undefined}
        imageId={meta.imageId || undefined}
        onChange={(url, imageId) => setForm((f) => ({ ...f, meta: { ...f.meta, imageUrl: url, imageId } }))}
        onClear={() => setForm((f) => ({ ...f, meta: { ...f.meta, imageUrl: "", imageId: "" } }))}
      />
    </div>
  );
}

// ── MissionEditor ─────────────────────────────────────────────────────────────

function MissionEditor({ form, setForm, tinymceKey }: EditorProps) {
  const meta = form.meta as { imageUrl?: string; imageId?: string };
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Section Title</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Making quality mental health care accessible to all" />
      </div>
      <div>
        <FieldLabel>Body Text</FieldLabel>
        {tinymceKey ? (
          <TinyMCEInline value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} apiKey={tinymceKey} height={180} />
        ) : (
          <textarea className={`${inputClass} resize-none`} rows={5} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Describe the mission…" />
        )}
      </div>
      <ImageUpload
        label="Section Image (optional)"
        value={meta.imageUrl || undefined}
        imageId={meta.imageId || undefined}
        onChange={(url, imageId) => setForm((f) => ({ ...f, meta: { ...f.meta, imageUrl: url, imageId } }))}
        onClear={() => setForm((f) => ({ ...f, meta: { ...f.meta, imageUrl: "", imageId: "" } }))}
      />
    </div>
  );
}

// ── ValuesEditor ──────────────────────────────────────────────────────────────

type ValueItem = { title: string; description: string };

function ValuesEditor({ form, setForm }: EditorProps) {
  const items: ValueItem[] = (form.meta.items as ValueItem[]) ?? [];

  function setItems(next: ValueItem[]) {
    setForm((f) => ({ ...f, meta: { ...f.meta, items: next } }));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="What guides everything we do" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Our core beliefs and commitments" />
        </div>
      </div>
      <div>
        <FieldLabel>Value Cards (up to 6)</FieldLabel>
        <div className="space-y-3 mb-3">
          {items.map((item, idx) => (
            <ArrayItemRow key={idx} onRemove={() => setItems(items.filter((_, i) => i !== idx))}>
              <div>
                <FieldLabel>Title</FieldLabel>
                <input className={inputClass} value={item.title} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], title: e.target.value }; setItems(n); }} placeholder="Trust & Safety" />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea className={`${inputClass} resize-none`} rows={2} value={item.description} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], description: e.target.value }; setItems(n); }} placeholder="What this value means…" />
              </div>
            </ArrayItemRow>
          ))}
        </div>
        {items.length < 6 && (
          <AddItemButton onClick={() => setItems([...items, { title: "", description: "" }])} label="Add Value" />
        )}
      </div>
    </div>
  );
}

// ── TeamEditor ────────────────────────────────────────────────────────────────

function TeamEditor({ form, setForm }: EditorProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
        Team members are pulled automatically from approved psychologist profiles. Manage psychologists under <strong>Users</strong>.
      </div>
      <div>
        <FieldLabel>Section Title</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Meet Our Psychologists" />
      </div>
      <div>
        <FieldLabel>Intro Text</FieldLabel>
        <textarea className={`${inputClass} resize-none`} rows={3} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Qualified, experienced, and passionate professionals dedicated to your well-being…" />
      </div>
    </div>
  );
}

// ── CtaEditor ─────────────────────────────────────────────────────────────────

function CtaEditor({ form, setForm, tinymceKey }: EditorProps) {
  const meta = form.meta as {
    button1?: { text: string; href: string };
    button2?: { text: string; href: string };
    gradient?: string;
  };
  const button1 = meta.button1 ?? { text: "", href: "" };
  const button2 = meta.button2 ?? { text: "", href: "" };
  const gradient = meta.gradient ?? "from-indigo-600 to-indigo-800";

  function updateMeta(patch: Partial<typeof meta>) {
    setForm((f) => ({ ...f, meta: { ...f.meta, ...patch } }));
  }

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Headline</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ready to start your journey?" />
      </div>
      <div>
        <FieldLabel>Subtitle</FieldLabel>
        {tinymceKey ? (
          <TinyMCEInline value={form.subtitle} onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))} apiKey={tinymceKey} height={120} />
        ) : (
          <textarea className={`${inputClass} resize-none`} rows={2} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Join our community and take the first step toward better mental health." />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Button 1 Text</FieldLabel>
          <input className={inputClass} value={button1.text} onChange={(e) => updateMeta({ button1: { ...button1, text: e.target.value } })} placeholder="Find a Psychologist" />
        </div>
        <div>
          <FieldLabel>Button 1 Link</FieldLabel>
          <input className={inputClass} value={button1.href} onChange={(e) => updateMeta({ button1: { ...button1, href: e.target.value } })} placeholder="/psychologists" />
        </div>
        <div>
          <FieldLabel>Button 2 Text</FieldLabel>
          <input className={inputClass} value={button2.text} onChange={(e) => updateMeta({ button2: { ...button2, text: e.target.value } })} placeholder="Get in Touch" />
        </div>
        <div>
          <FieldLabel>Button 2 Link</FieldLabel>
          <input className={inputClass} value={button2.href} onChange={(e) => updateMeta({ button2: { ...button2, href: e.target.value } })} placeholder="/contact" />
        </div>
      </div>
      <div>
        <FieldLabel>Background Gradient</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {CTA_GRADIENTS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateMeta({ gradient: opt.value })}
              className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all bg-gradient-to-r ${opt.value} text-white ${gradient === opt.value ? "border-gray-900 scale-105" : "border-transparent"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
