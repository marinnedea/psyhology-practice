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
  { key: "hero",          label: "Hero",               icon: "🏠", defaultSortOrder: 1 },
  { key: "intro",         label: "Introduction",        icon: "📝", defaultSortOrder: 2 },
  { key: "services_list", label: "Services List",       icon: "🏢", defaultSortOrder: 3 },
  { key: "why_partner",   label: "Why Partner With Us", icon: "⭐", defaultSortOrder: 4 },
  { key: "cta",           label: "CTA Banner",          icon: "🎯", defaultSortOrder: 5 },
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

export default function AdminOrganisationsPageEditor({ initialSections }: Props) {
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
    content: string;
    isVisible: boolean;
    sortOrder: number;
    meta: Record<string, unknown>;
  };

  function buildInitialForm(key: string): FormState {
    const section = sections.find((s) => s.sectionKey === key);
    const def = SECTION_DEFS.find((d) => d.key === key)!;
    return {
      title:     section?.title     ?? "",
      subtitle:  section?.subtitle  ?? "",
      content:   section?.content   ?? "",
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
          body: JSON.stringify({ page: "services_organisations", sectionKey: selectedKey, ...payload }),
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
          id:          data.id,
          page:        data.page,
          sectionKey:  data.sectionKey,
          title:       data.title,
          subtitle:    data.subtitle,
          content:     data.content,
          sortOrder:   data.sortOrder,
          isVisible:   data.isVisible,
          metadata:    data.metadata,
          updatedAt:   data.updatedAt,
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
      case "intro":         return <IntroEditor {...props} />;
      case "services_list": return <ServicesListEditor {...props} />;
      case "why_partner":   return <WhyPartnerEditor {...props} />;
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
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Saved in DB</span>
            ) : (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">New — not saved yet</span>
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
        primaryCta:   { text: "Request a Proposal", href: "/contact" },
        secondaryCta: { text: "View All Services",  href: "/services" },
      };
    case "intro":
      return {};
    case "services_list":
      return {
        items: [
          { iconName: "chart",     title: "Workplace Psychological Assessment",  description: "Structured evaluations of individual and team wellbeing, identifying risk factors, burnout indicators, and opportunities for organisational growth." },
          { iconName: "heart",     title: "Employee Psychotherapy",              description: "Confidential one-on-one therapy sessions for staff, available as part of an Employee Assistance Programme (EAP) or direct referral scheme." },
          { iconName: "users",     title: "Resilience & Wellbeing Workshops",    description: "Interactive group sessions covering stress management, emotional regulation, communication skills, and burnout prevention." },
          { iconName: "lightbulb", title: "Team Building with Specialists",      description: "Purposeful team experiences built around psychological safety, trust, and healthy communication." },
          { iconName: "star",      title: "Leadership & Executive Coaching",     description: "Individual coaching for managers and senior leaders on emotional intelligence, decision-making under pressure, and sustainable high performance." },
          { iconName: "lifebuoy",  title: "Crisis & Critical Incident Support",  description: "Rapid-response psychological support for teams following traumatic events, major organisational change, or acute workplace stress situations." },
        ],
      };
    case "why_partner":
      return {
        items: [
          { iconName: "shield",    title: "Qualified & Vetted Clinicians",      description: "All our psychologists hold recognised professional qualifications and undergo rigorous vetting." },
          { iconName: "users",     title: "Tailored to Your Organisation",      description: "No off-the-shelf packages. Every engagement is scoped to your organisation's specific context and goals." },
          { iconName: "chart",     title: "Measurable Outcomes",                description: "Pre and post assessments, anonymised reporting, and actionable recommendations delivered after every programme." },
          { iconName: "bolt",      title: "Flexible Delivery",                  description: "On-site, online, or hybrid delivery. We work around your team's schedule." },
          { iconName: "heart",     title: "Confidential & GDPR Compliant",      description: "Full data protection, clinical confidentiality, and GDPR compliance built in from day one." },
          { iconName: "star",      title: "Scalable from 5 to 500+",            description: "Whether you have a small management team or a large enterprise, our programmes scale to fit your needs." },
        ],
      };
    case "cta":
      return {
        badge:   "Let's Talk",
        button1: { text: "Request a Proposal", href: "/contact" },
        button2: { text: "Contact Us",          href: "/contact" },
        button3: { text: "View Our Services",   href: "/services" },
        gradient: "from-indigo-600 to-indigo-800",
      };
    default:
      return {};
  }
}

// ── Editor props type ─────────────────────────────────────────────────────────

type EditorProps = {
  form: { title: string; subtitle: string; content: string; isVisible: boolean; sortOrder: number; meta: Record<string, unknown> };
  setForm: React.Dispatch<React.SetStateAction<{ title: string; subtitle: string; content: string; isVisible: boolean; sortOrder: number; meta: Record<string, unknown> }>>;
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
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Psychological Services for Organisations" />
      </div>
      <div>
        <FieldLabel>Subtitle</FieldLabel>
        {tinymceKey ? (
          <TinyMCEInline value={form.subtitle} onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))} apiKey={tinymceKey} height={120} />
        ) : (
          <textarea className={`${inputClass} resize-none`} rows={2} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Investing in your people's mental health..." />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Primary Button Text</FieldLabel>
          <input className={inputClass} value={primaryCta.text} onChange={(e) => updateMeta({ primaryCta: { ...primaryCta, text: e.target.value } })} placeholder="Request a Proposal" />
        </div>
        <div>
          <FieldLabel>Primary Button Link</FieldLabel>
          <input className={inputClass} value={primaryCta.href} onChange={(e) => updateMeta({ primaryCta: { ...primaryCta, href: e.target.value } })} placeholder="/contact" />
        </div>
        <div>
          <FieldLabel>Secondary Button Text</FieldLabel>
          <input className={inputClass} value={secondaryCta.text} onChange={(e) => updateMeta({ secondaryCta: { ...secondaryCta, text: e.target.value } })} placeholder="View All Services" />
        </div>
        <div>
          <FieldLabel>Secondary Button Link</FieldLabel>
          <input className={inputClass} value={secondaryCta.href} onChange={(e) => updateMeta({ secondaryCta: { ...secondaryCta, href: e.target.value } })} placeholder="/services" />
        </div>
      </div>
    </div>
  );
}

// ── IntroEditor ───────────────────────────────────────────────────────────────

function IntroEditor({ form, setForm, tinymceKey }: EditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Section Title</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Why Organisational Psychology?" />
      </div>
      <div>
        <FieldLabel>Subtitle (accent line)</FieldLabel>
        <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Organisations that prioritise wellbeing see measurable improvements..." />
      </div>
      <div>
        <FieldLabel>Body Content</FieldLabel>
        {tinymceKey ? (
          <TinyMCEInline value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} apiKey={tinymceKey} height={180} />
        ) : (
          <textarea className={`${inputClass} resize-none`} rows={5} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Mental health challenges cost organisations billions annually..." />
        )}
      </div>
    </div>
  );
}

// ── ServicesListEditor ────────────────────────────────────────────────────────

type ServiceItem = { iconName: string; title: string; description: string };

function ServicesListEditor({ form, setForm }: EditorProps) {
  const items: ServiceItem[] = (form.meta.items as ServiceItem[]) ?? [];

  function setItems(next: ServiceItem[]) {
    setForm((f) => ({ ...f, meta: { ...f.meta, items: next } }));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Our Corporate Services" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="A full range of organisation-focused services..." />
        </div>
      </div>
      <div>
        <FieldLabel>Service Cards (up to 6)</FieldLabel>
        <div className="space-y-3 mb-3">
          {items.map((item, idx) => (
            <ArrayItemRow key={idx} onRemove={() => setItems(items.filter((_, i) => i !== idx))}>
              <div className="grid grid-cols-3 gap-2">
                <IconPicker value={item.iconName} onChange={(v) => { const n = [...items]; n[idx] = { ...n[idx], iconName: v }; setItems(n); }} />
                <div className="col-span-2">
                  <FieldLabel>Title</FieldLabel>
                  <input className={inputClass} value={item.title} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], title: e.target.value }; setItems(n); }} placeholder="Service title" />
                </div>
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea className={`${inputClass} resize-none`} rows={2} value={item.description} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], description: e.target.value }; setItems(n); }} placeholder="Service description..." />
              </div>
            </ArrayItemRow>
          ))}
        </div>
        {items.length < 6 && (
          <AddItemButton onClick={() => setItems([...items, { iconName: "star", title: "", description: "" }])} label="Add Service" />
        )}
      </div>
    </div>
  );
}

// ── WhyPartnerEditor ──────────────────────────────────────────────────────────

type WhyItem = { iconName: string; title: string; description: string };

function WhyPartnerEditor({ form, setForm }: EditorProps) {
  const items: WhyItem[] = (form.meta.items as WhyItem[]) ?? [];

  function setItems(next: WhyItem[]) {
    setForm((f) => ({ ...f, meta: { ...f.meta, items: next } }));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Why Partner with MindBridge?" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="We are not a box-ticking exercise..." />
        </div>
      </div>
      <div>
        <FieldLabel>Feature Cards (up to 6)</FieldLabel>
        <div className="space-y-3 mb-3">
          {items.map((item, idx) => (
            <ArrayItemRow key={idx} onRemove={() => setItems(items.filter((_, i) => i !== idx))}>
              <div className="grid grid-cols-3 gap-2">
                <IconPicker value={item.iconName} onChange={(v) => { const n = [...items]; n[idx] = { ...n[idx], iconName: v }; setItems(n); }} />
                <div className="col-span-2">
                  <FieldLabel>Title</FieldLabel>
                  <input className={inputClass} value={item.title} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], title: e.target.value }; setItems(n); }} placeholder="Qualified & Vetted Clinicians" />
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
        <input className={inputClass} value={meta.badge ?? ""} onChange={(e) => updateMeta({ badge: e.target.value })} placeholder="Let's Talk" />
      </div>
      <div>
        <FieldLabel>Headline</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ready to Invest in Your People?" />
      </div>
      <div>
        <FieldLabel>Subtitle</FieldLabel>
        {tinymceKey ? (
          <TinyMCEInline value={form.subtitle} onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))} apiKey={tinymceKey} height={120} />
        ) : (
          <textarea className={`${inputClass} resize-none`} rows={2} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Book a no-obligation call with our team..." />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Button 1 Text</FieldLabel>
          <input className={inputClass} value={button1.text} onChange={(e) => updateMeta({ button1: { ...button1, text: e.target.value } })} placeholder="Request a Proposal" />
        </div>
        <div>
          <FieldLabel>Button 1 Link</FieldLabel>
          <input className={inputClass} value={button1.href} onChange={(e) => updateMeta({ button1: { ...button1, href: e.target.value } })} placeholder="/contact" />
        </div>
        <div>
          <FieldLabel>Button 2 Text</FieldLabel>
          <input className={inputClass} value={button2.text} onChange={(e) => updateMeta({ button2: { ...button2, text: e.target.value } })} placeholder="Contact Us" />
        </div>
        <div>
          <FieldLabel>Button 2 Link</FieldLabel>
          <input className={inputClass} value={button2.href} onChange={(e) => updateMeta({ button2: { ...button2, href: e.target.value } })} placeholder="/contact" />
        </div>
        <div>
          <FieldLabel>Button 3 Text (optional)</FieldLabel>
          <input className={inputClass} value={button3.text} onChange={(e) => updateMeta({ button3: { ...button3, text: e.target.value } })} placeholder="View Our Services" />
        </div>
        <div>
          <FieldLabel>Button 3 Link</FieldLabel>
          <input className={inputClass} value={button3.href} onChange={(e) => updateMeta({ button3: { ...button3, href: e.target.value } })} placeholder="/services" />
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
