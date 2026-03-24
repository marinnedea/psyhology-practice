"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSiteSettings } from "@/app/providers";

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

type SectionDef = {
  key: string;
  label: string;
  icon: string;
  defaultSortOrder: number;
};

const SECTION_DEFS: SectionDef[] = [
  { key: "hero",          label: "Hero",            icon: "🏠", defaultSortOrder: 1 },
  { key: "motto",         label: "Motto Strip",     icon: "💬", defaultSortOrder: 2 },
  { key: "how_it_works",  label: "How We Work",     icon: "🔢", defaultSortOrder: 3 },
  { key: "why_us",        label: "Why Choose Us",   icon: "⭐", defaultSortOrder: 4 },
  { key: "cta",           label: "CTA Banner",      icon: "🎯", defaultSortOrder: 5 },
];

// ── Available icon names ──────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { name: "heart",      label: "❤️ Heart" },
  { name: "users",      label: "👥 People" },
  { name: "shield",     label: "🛡️ Shield" },
  { name: "star",       label: "⭐ Star" },
  { name: "bolt",       label: "⚡ Bolt" },
  { name: "chart",      label: "📊 Chart" },
  { name: "lightbulb",  label: "💡 Idea" },
  { name: "lifebuoy",   label: "🆘 Support" },
  { name: "building",   label: "🏢 Building" },
  { name: "check",      label: "✅ Check" },
];

// ── Sub-component helpers ─────────────────────────────────────────────────────

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

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <FieldLabel>Icon</FieldLabel>
      <select
        className={`${inputClass} w-48`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {ICON_OPTIONS.map((opt) => (
          <option key={opt.name} value={opt.name}>{opt.label}</option>
        ))}
      </select>
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

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminServiceSectionsEditor({ initialSections }: Props) {
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

  type FormState = {
    title: string;
    subtitle: string;
    isVisible: boolean;
    sortOrder: number;
    meta: Record<string, unknown>;
  };

  function buildInitialForm(key: string): FormState {
    const section = sections.find((s) => s.sectionKey === key);
    const def = SECTION_DEFS.find((d) => d.key === key)!;
    return {
      title: section?.title ?? "",
      subtitle: section?.subtitle ?? "",
      isVisible: section?.isVisible ?? true,
      sortOrder: section?.sortOrder ?? def.defaultSortOrder,
      meta: (section?.metadata as Record<string, unknown>) ?? getDefaultMeta(key),
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
        title: form.title || null,
        subtitle: form.subtitle || null,
        content: null,
        isVisible: form.isVisible,
        sortOrder: form.sortOrder,
        metadata: form.meta,
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
          body: JSON.stringify({ page: "services", sectionKey: selectedKey, ...payload }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to save.", "error");
        return;
      }
      setSections((prev) => {
        const next = prev.filter((s) => s.sectionKey !== selectedKey);
        return [...next, {
          id: data.id,
          page: data.page,
          sectionKey: data.sectionKey,
          title: data.title,
          subtitle: data.subtitle,
          content: data.content,
          sortOrder: data.sortOrder,
          isVisible: data.isVisible,
          metadata: data.metadata,
          updatedAt: data.updatedAt,
        }];
      });
      showToast("Section saved successfully.");
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
    const props = { form, setForm, tinymceKey: TINYMCE_KEY };
    switch (selectedKey) {
      case "hero":          return <HeroEditor {...props} />;
      case "motto":         return <MottoEditor {...props} />;
      case "how_it_works":  return <HowItWorksEditor {...props} />;
      case "why_us":        return <WhyUsEditor {...props} />;
      case "cta":           return <CtaEditor {...props} />;
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
                      status === "configured-hidden" ? "bg-gray-400" : "bg-red-400"
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
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Saved in DB</span>
            ) : (
              <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">New — not saved yet</span>
            )}
          </div>

          <div className="p-6 space-y-6">
            {renderEditor()}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <VisibilityToggle value={form.isVisible} onChange={(v) => setForm({ ...form, isVisible: v })} />
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

// ── Default metadata ───────────────────────────────────────────────────────────

function getDefaultMeta(key: string): Record<string, unknown> {
  switch (key) {
    case "hero":
      return {
        primaryCta: { text: "Find a Psychologist", href: "/psychologists" },
        secondaryCta: { text: "Contact Us", href: "/contact" },
      };
    case "motto":
      return {
        quote: "The greatest wealth is health — and the first step toward change is the courage to seek help.",
        attribution: "Psychology Practice Philosophy",
      };
    case "how_it_works":
      return {
        steps: [
          { number: "01", title: "Book a Consultation", description: "Choose a psychologist and pick a time that suits you. Online or in-person — your choice." },
          { number: "02", title: "Meet Your Specialist", description: "In your first session you discuss your situation openly. We listen without judgement." },
          { number: "03", title: "Agree a Plan", description: "Together we create a personalised plan with clear goals and a realistic timeline." },
          { number: "04", title: "Progress Together", description: "Regular sessions, continuous feedback, and adjustments along the way — you are never alone." },
        ],
      };
    case "why_us":
      return {
        items: [
          { iconName: "shield",    title: "Qualified & Vetted",        description: "All our psychologists hold recognised professional qualifications and undergo rigorous vetting before joining." },
          { iconName: "heart",     title: "Person-Centred Care",       description: "Every care plan is built around you — your needs, your pace, and your goals." },
          { iconName: "star",      title: "Evidence-Based Practice",   description: "We use only approaches with strong clinical evidence: CBT, EMDR, ACT, Schema Therapy, and more." },
          { iconName: "users",     title: "Multi-Disciplinary Team",   description: "From individual therapy to couples, family, and workplace — our broad team covers the full spectrum." },
          { iconName: "bolt",      title: "Flexible & Accessible",     description: "In-person and online sessions, daytime and evening availability — mental health support that fits your life." },
          { iconName: "chart",     title: "Measurable Progress",       description: "We track outcomes at every stage so you can see the difference and stay motivated on your journey." },
        ],
      };
    case "cta":
      return {
        badge: "Take the First Step",
        button1: { text: "Schedule a Meeting", href: "/psychologists" },
        button2: { text: "Find a Psychologist", href: "/psychologists" },
        button3: { text: "Contact Us", href: "/contact" },
        gradient: "from-indigo-600 to-indigo-800",
      };
    default:
      return {};
  }
}

// ── Editor props type ─────────────────────────────────────────────────────────

type EditorProps = {
  form: { title: string; subtitle: string; isVisible: boolean; sortOrder: number; meta: Record<string, unknown> };
  setForm: React.Dispatch<React.SetStateAction<{ title: string; subtitle: string; isVisible: boolean; sortOrder: number; meta: Record<string, unknown> }>>;
  tinymceKey: string;
};

// ── HeroEditor ────────────────────────────────────────────────────────────────

function HeroEditor({ form, setForm, tinymceKey }: EditorProps) {
  const meta = form.meta as {
    primaryCta?: { text: string; href: string };
    secondaryCta?: { text: string; href: string };
  };
  const primaryCta = meta.primaryCta ?? { text: "", href: "" };
  const secondaryCta = meta.secondaryCta ?? { text: "", href: "" };

  function updateMeta(patch: Partial<typeof meta>) {
    setForm((f) => ({ ...f, meta: { ...f.meta, ...patch } }));
  }

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Headline</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Services for Your Wellbeing" />
      </div>
      <div>
        <FieldLabel>Subtitle</FieldLabel>
        {tinymceKey ? (
          <TinyMCEInline value={form.subtitle} onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))} apiKey={tinymceKey} height={120} />
        ) : (
          <textarea className={`${inputClass} resize-none`} rows={2} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Qualified psychologists, evidence-based approaches..." />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Primary Button Text</FieldLabel>
          <input className={inputClass} value={primaryCta.text} onChange={(e) => updateMeta({ primaryCta: { ...primaryCta, text: e.target.value } })} placeholder="Find a Psychologist" />
        </div>
        <div>
          <FieldLabel>Primary Button Link</FieldLabel>
          <input className={inputClass} value={primaryCta.href} onChange={(e) => updateMeta({ primaryCta: { ...primaryCta, href: e.target.value } })} placeholder="/psychologists" />
        </div>
        <div>
          <FieldLabel>Secondary Button Text</FieldLabel>
          <input className={inputClass} value={secondaryCta.text} onChange={(e) => updateMeta({ secondaryCta: { ...secondaryCta, text: e.target.value } })} placeholder="Contact Us" />
        </div>
        <div>
          <FieldLabel>Secondary Button Link</FieldLabel>
          <input className={inputClass} value={secondaryCta.href} onChange={(e) => updateMeta({ secondaryCta: { ...secondaryCta, href: e.target.value } })} placeholder="/contact" />
        </div>
      </div>
    </div>
  );
}

// ── MottoEditor ───────────────────────────────────────────────────────────────

function MottoEditor({ form, setForm, tinymceKey }: EditorProps) {
  const meta = form.meta as { quote?: string; attribution?: string };
  const quote = meta.quote ?? "";
  const attribution = meta.attribution ?? "";

  function updateMeta(patch: Partial<typeof meta>) {
    setForm((f) => ({ ...f, meta: { ...f.meta, ...patch } }));
  }

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Quote</FieldLabel>
        {tinymceKey ? (
          <TinyMCEInline value={quote} onChange={(v) => updateMeta({ quote: v })} apiKey={tinymceKey} height={130} toolbar="bold italic" />
        ) : (
          <textarea className={`${inputClass} resize-none`} rows={3} value={quote} onChange={(e) => updateMeta({ quote: e.target.value })} placeholder="The greatest wealth is health..." />
        )}
      </div>
      <div>
        <FieldLabel>Attribution</FieldLabel>
        <input className={inputClass} value={attribution} onChange={(e) => updateMeta({ attribution: e.target.value })} placeholder="Psychology Practice Philosophy" />
      </div>
    </div>
  );
}

// ── HowItWorksEditor ──────────────────────────────────────────────────────────

type WorkStep = { number: string; title: string; description: string };

function HowItWorksEditor({ form, setForm, tinymceKey }: EditorProps) {
  const steps: WorkStep[] = (form.meta.steps as WorkStep[]) ?? [];

  function setSteps(next: WorkStep[]) {
    setForm((f) => ({ ...f, meta: { ...f.meta, steps: next } }));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="How We Work" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Getting started is simpler than you think." />
        </div>
      </div>
      <div>
        <FieldLabel>Steps (up to 6)</FieldLabel>
        <div className="space-y-4 mb-3">
          {steps.map((step, idx) => (
            <ArrayItemRow key={idx} onRemove={() => setSteps(steps.filter((_, i) => i !== idx))}>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <FieldLabel>Number</FieldLabel>
                  <input className={inputClass} value={step.number} onChange={(e) => { const n = [...steps]; n[idx] = { ...n[idx], number: e.target.value }; setSteps(n); }} placeholder="01" />
                </div>
                <div className="col-span-3">
                  <FieldLabel>Title</FieldLabel>
                  <input className={inputClass} value={step.title} onChange={(e) => { const n = [...steps]; n[idx] = { ...n[idx], title: e.target.value }; setSteps(n); }} placeholder="Book a Consultation" />
                </div>
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                {tinymceKey ? (
                  <TinyMCEInline
                    value={step.description}
                    onChange={(v) => { const n = [...steps]; n[idx] = { ...n[idx], description: v }; setSteps(n); }}
                    apiKey={tinymceKey}
                    height={120}
                  />
                ) : (
                  <input className={inputClass} value={step.description} onChange={(e) => { const n = [...steps]; n[idx] = { ...n[idx], description: e.target.value }; setSteps(n); }} placeholder="Step description..." />
                )}
              </div>
            </ArrayItemRow>
          ))}
        </div>
        {steps.length < 6 && (
          <AddItemButton
            onClick={() => setSteps([...steps, { number: String(steps.length + 1).padStart(2, "0"), title: "", description: "" }])}
            label="Add Step"
          />
        )}
      </div>
    </div>
  );
}

// ── WhyUsEditor ───────────────────────────────────────────────────────────────

type WhyUsItem = { iconName: string; title: string; description: string };

function WhyUsEditor({ form, setForm }: EditorProps) {
  const items: WhyUsItem[] = (form.meta.items as WhyUsItem[]) ?? [];

  function setItems(next: WhyUsItem[]) {
    setForm((f) => ({ ...f, meta: { ...f.meta, items: next } }));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="What Sets Us Apart" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="We believe access to quality mental health care should be straightforward..." />
        </div>
      </div>
      <div>
        <FieldLabel>Cards (up to 6)</FieldLabel>
        <div className="space-y-3 mb-3">
          {items.map((item, idx) => (
            <ArrayItemRow key={idx} onRemove={() => setItems(items.filter((_, i) => i !== idx))}>
              <div className="grid grid-cols-3 gap-2">
                <IconPicker value={item.iconName} onChange={(v) => { const n = [...items]; n[idx] = { ...n[idx], iconName: v }; setItems(n); }} />
                <div className="col-span-2">
                  <FieldLabel>Title</FieldLabel>
                  <input className={inputClass} value={item.title} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], title: e.target.value }; setItems(n); }} placeholder="Qualified & Vetted" />
                </div>
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <input className={inputClass} value={item.description} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], description: e.target.value }; setItems(n); }} placeholder="Short description..." />
              </div>
            </ArrayItemRow>
          ))}
        </div>
        {items.length < 6 && (
          <AddItemButton onClick={() => setItems([...items, { iconName: "star", title: "", description: "" }])} />
        )}
      </div>
    </div>
  );
}

// ── CtaEditor ─────────────────────────────────────────────────────────────────

const CTA_GRADIENTS = [
  { label: "Indigo → Indigo", value: "from-indigo-600 to-indigo-800" },
  { label: "Blue → Indigo",   value: "from-blue-600 to-indigo-700" },
  { label: "Indigo → Purple", value: "from-indigo-600 to-purple-700" },
];

function CtaEditor({ form, setForm, tinymceKey }: EditorProps) {
  const meta = form.meta as {
    badge?: string;
    button1?: { text: string; href: string };
    button2?: { text: string; href: string };
    button3?: { text: string; href: string };
    gradient?: string;
  };
  const button1 = meta.button1 ?? { text: "", href: "" };
  const button2 = meta.button2 ?? { text: "", href: "" };
  const button3 = meta.button3 ?? { text: "", href: "" };
  const gradient = meta.gradient ?? "from-indigo-600 to-indigo-800";

  function updateMeta(patch: Partial<typeof meta>) {
    setForm((f) => ({ ...f, meta: { ...f.meta, ...patch } }));
  }

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Badge Text (small label above headline)</FieldLabel>
        <input className={inputClass} value={meta.badge ?? ""} onChange={(e) => updateMeta({ badge: e.target.value })} placeholder="Take the First Step" />
      </div>
      <div>
        <FieldLabel>Headline</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="The First Step Is the Most Important One" />
      </div>
      <div>
        <FieldLabel>Subtitle</FieldLabel>
        {tinymceKey ? (
          <TinyMCEInline value={form.subtitle} onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))} apiKey={tinymceKey} height={120} />
        ) : (
          <textarea className={`${inputClass} resize-none`} rows={2} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="You don't need to have it all figured out..." />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Button 1 Text</FieldLabel>
          <input className={inputClass} value={button1.text} onChange={(e) => updateMeta({ button1: { ...button1, text: e.target.value } })} placeholder="Schedule a Meeting" />
        </div>
        <div>
          <FieldLabel>Button 1 Link</FieldLabel>
          <input className={inputClass} value={button1.href} onChange={(e) => updateMeta({ button1: { ...button1, href: e.target.value } })} placeholder="/psychologists" />
        </div>
        <div>
          <FieldLabel>Button 2 Text</FieldLabel>
          <input className={inputClass} value={button2.text} onChange={(e) => updateMeta({ button2: { ...button2, text: e.target.value } })} placeholder="Find a Psychologist" />
        </div>
        <div>
          <FieldLabel>Button 2 Link</FieldLabel>
          <input className={inputClass} value={button2.href} onChange={(e) => updateMeta({ button2: { ...button2, href: e.target.value } })} placeholder="/psychologists" />
        </div>
        <div>
          <FieldLabel>Button 3 Text (optional)</FieldLabel>
          <input className={inputClass} value={button3.text} onChange={(e) => updateMeta({ button3: { ...button3, text: e.target.value } })} placeholder="Contact Us" />
        </div>
        <div>
          <FieldLabel>Button 3 Link</FieldLabel>
          <input className={inputClass} value={button3.href} onChange={(e) => updateMeta({ button3: { ...button3, href: e.target.value } })} placeholder="/contact" />
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
