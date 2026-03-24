"use client";

import { useState, useCallback, useEffect } from "react";
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
  knownKeys?: string[];
};

// ── Section definitions ───────────────────────────────────────────────────────

type SectionDef = {
  key: string;
  label: string;
  icon: string;
  defaultSortOrder: number;
};

const SECTION_DEFS: SectionDef[] = [
  { key: "hero",            label: "Hero",             icon: "🏠", defaultSortOrder: 1  },
  { key: "stats",           label: "Stats Bar",        icon: "📊", defaultSortOrder: 2  },
  { key: "features",        label: "How We Can Help",  icon: "🧠", defaultSortOrder: 3  },
  { key: "how_it_works",    label: "How It Works",     icon: "🔢", defaultSortOrder: 4  },
  { key: "services_preview",label: "Services Preview", icon: "📋", defaultSortOrder: 5  },
  { key: "testimonials",    label: "Testimonials",     icon: "💬", defaultSortOrder: 6  },
  { key: "team_preview",    label: "Meet Our Team",    icon: "👥", defaultSortOrder: 7  },
  { key: "blog_preview",    label: "From Our Blog",    icon: "📝", defaultSortOrder: 8  },
  { key: "cta_banner",      label: "CTA Banner",       icon: "🎯", defaultSortOrder: 9  },
];

const GRADIENT_OPTIONS = [
  { label: "Indigo → Indigo",  value: "from-indigo-600 to-indigo-800" },
  { label: "Blue → Indigo",    value: "from-blue-600 to-indigo-700" },
  { label: "Indigo → Purple",  value: "from-indigo-600 to-purple-700" },
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
      <button
        type="button"
        onClick={onRemove}
        className="text-xs text-red-500 hover:text-red-700 font-medium"
      >
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
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${value ? "bg-indigo-600" : "bg-gray-200"}`}
        aria-label="Toggle visibility"
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition duration-200 ${value ? "translate-x-4" : "translate-x-0"}`}
        />
      </button>
      <span className={`text-xs font-medium ${value ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`}>
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
  height = 180,
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

export default function AdminPageSectionsEditor({ initialSections }: Props) {
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

  // Local form state per section key
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

  // Move section up/down by adjusting sortOrder in local state
  function moveSection(key: string, direction: "up" | "down") {
    setSections((prev) => {
      const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = sorted.findIndex((s) => s.sectionKey === key);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const newSorted = [...sorted];
      const tmp = newSorted[idx].sortOrder;
      newSorted[idx] = { ...newSorted[idx], sortOrder: newSorted[swapIdx].sortOrder };
      newSorted[swapIdx] = { ...newSorted[swapIdx], sortOrder: tmp };
      return newSorted;
    });
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
          body: JSON.stringify({ page: "homepage", sectionKey: selectedKey, ...payload }),
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

  // ── Status dots ───────────────────────────────────────────────────────────

  function getSectionStatus(key: string): "configured-visible" | "configured-hidden" | "unconfigured" {
    const s = sections.find((sec) => sec.sectionKey === key);
    if (!s) return "unconfigured";
    return s.isVisible ? "configured-visible" : "configured-hidden";
  }

  // ── Render editor for selected section ───────────────────────────────────

  function renderEditor() {
    switch (selectedKey) {
      case "hero":        return <HeroEditor form={form} setForm={setForm} />;
      case "stats":       return <StatsEditor form={form} setForm={setForm} />;
      case "features":    return <FeaturesEditor form={form} setForm={setForm} tinymceKey={TINYMCE_KEY} />;
      case "how_it_works":return <HowItWorksEditor form={form} setForm={setForm} tinymceKey={TINYMCE_KEY} />;
      case "services_preview": return <ServicesPreviewEditor form={form} setForm={setForm} />;
      case "testimonials":return <TestimonialsEditor form={form} setForm={setForm} />;
      case "team_preview":return <TeamPreviewEditor form={form} setForm={setForm} />;
      case "blog_preview":return <BlogPreviewEditor form={form} setForm={setForm} />;
      case "cta_banner":  return <CtaBannerEditor form={form} setForm={setForm} />;
      default: return null;
    }
  }

  const selectedDef = SECTION_DEFS.find((d) => d.key === selectedKey)!;
  const sortedSections = [...SECTION_DEFS].sort((a, b) => {
    const sa = sections.find((s) => s.sectionKey === a.key)?.sortOrder ?? a.defaultSortOrder;
    const sb = sections.find((s) => s.sectionKey === b.key)?.sortOrder ?? b.defaultSortOrder;
    return sa - sb;
  });

  return (
    <div className="relative">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex gap-6 items-start">
        {/* Left panel: section list */}
        <div className="w-64 shrink-0 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Homepage Sections</p>
          </div>
          <ul className="divide-y divide-gray-100">
            {sortedSections.map((def, idx) => {
              const status = getSectionStatus(def.key);
              const isSelected = selectedKey === def.key;
              return (
                <li key={def.key} className={`group flex items-center gap-2 ${isSelected ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-gray-50"}`}>
                  <button
                    onClick={() => selectSection(def.key)}
                    className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left"
                  >
                    <span className="text-base">{def.icon}</span>
                    <span className={`text-sm font-medium truncate ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-700"}`}>
                      {def.label}
                    </span>
                    <span className={`ml-auto w-2 h-2 rounded-full shrink-0 ${
                      status === "configured-visible" ? "bg-green-500" :
                      status === "configured-hidden" ? "bg-gray-400" : "bg-red-400"
                    }`} />
                  </button>
                  <div className="flex flex-col gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveSection(def.key, "up")}
                      disabled={idx === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveSection(def.key, "down")}
                      disabled={idx === sortedSections.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs leading-none"
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>
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

        {/* Right panel: editor */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Editing Section</p>
              <h2 className="text-base font-semibold text-gray-900">
                {selectedDef.icon} {selectedDef.label}
              </h2>
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

// ── Default metadata factories ─────────────────────────────────────────────

function getDefaultMeta(key: string): Record<string, unknown> {
  switch (key) {
    case "hero":
      return { primaryCta: { text: "Find a Psychologist", href: "/psychologists" }, secondaryCta: { text: "Our Services", href: "/services" } };
    case "stats":
      return { items: [{ value: "500+", label: "Clients Helped" }, { value: "15+", label: "Psychologists" }, { value: "98%", label: "Satisfaction Rate" }, { value: "10+", label: "Years Combined Experience" }] };
    case "features":
      return { items: [
        { imageUrl: "", imageId: "", title: "Individual Therapy", description: "One-on-one sessions tailored to your personal challenges and mental health goals.", readMoreText: "", readMoreHref: "" },
        { imageUrl: "", imageId: "", title: "Couples Therapy", description: "Strengthen your relationship with guided sessions focused on communication and understanding.", readMoreText: "", readMoreHref: "" },
        { imageUrl: "", imageId: "", title: "Family Support", description: "Improve family dynamics and relationships with collaborative therapeutic approaches.", readMoreText: "", readMoreHref: "" },
        { imageUrl: "", imageId: "", title: "Online Sessions", description: "Access professional mental health care from the comfort of your own space.", readMoreText: "", readMoreHref: "" },
      ]};
    case "how_it_works":
      return { steps: [
        { number: "01", title: "Book a Consultation", description: "Browse our directory of qualified psychologists and book a time that works for you — online or in person." },
        { number: "02", title: "Meet Your Psychologist", description: "Your first session is about getting to know each other and discussing what brings you to therapy." },
        { number: "03", title: "Start Your Journey", description: "With a personalised plan in place, work with your psychologist toward lasting positive change." },
      ]};
    case "services_preview":
      return { count: 6 };
    case "testimonials":
      return { selectedIds: [] };
    case "team_preview":
      return { count: 6 };
    case "blog_preview":
      return { count: 3 };
    case "cta_banner":
      return { buttonText: "Create Your Account", buttonHref: "/register", gradient: "from-indigo-600 to-indigo-800" };
    default:
      return {};
  }
}

// ── Section-specific editors ──────────────────────────────────────────────────

type EditorProps = {
  form: { title: string; subtitle: string; isVisible: boolean; sortOrder: number; meta: Record<string, unknown> };
  setForm: React.Dispatch<React.SetStateAction<{ title: string; subtitle: string; isVisible: boolean; sortOrder: number; meta: Record<string, unknown> }>>;
};

type EditorPropsWithTMCE = EditorProps & { tinymceKey: string };

// Hero
function HeroEditor({ form, setForm }: EditorProps) {
  const meta = form.meta as { primaryCta?: { text: string; href: string }; secondaryCta?: { text: string; href: string } };
  const primaryCta = meta.primaryCta ?? { text: "", href: "" };
  const secondaryCta = meta.secondaryCta ?? { text: "", href: "" };

  function updateMeta(update: Partial<typeof meta>) {
    setForm((f) => ({ ...f, meta: { ...f.meta, ...update } }));
  }

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Headline</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Your Mental Health Matters" />
      </div>
      <div>
        <FieldLabel>Subtitle</FieldLabel>
        <textarea className={`${inputClass} resize-none`} rows={2} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Connect with qualified psychologists..." />
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
          <input className={inputClass} value={secondaryCta.text} onChange={(e) => updateMeta({ secondaryCta: { ...secondaryCta, text: e.target.value } })} placeholder="Our Services" />
        </div>
        <div>
          <FieldLabel>Secondary Button Link</FieldLabel>
          <input className={inputClass} value={secondaryCta.href} onChange={(e) => updateMeta({ secondaryCta: { ...secondaryCta, href: e.target.value } })} placeholder="/services" />
        </div>
      </div>
    </div>
  );
}

// Stats
function StatsEditor({ form, setForm }: EditorProps) {
  const items: { value: string; label: string }[] = (form.meta.items as { value: string; label: string }[]) ?? [];

  function setItems(next: { value: string; label: string }[]) {
    setForm((f) => ({ ...f, meta: { ...f.meta, items: next } }));
  }

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Section Title (optional)</FieldLabel>
        <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Leave blank for no title" />
      </div>
      <div>
        <FieldLabel>Stats Items</FieldLabel>
        <div className="space-y-2 mb-3">
          {items.map((item, idx) => (
            <ArrayItemRow key={idx} onRemove={() => setItems(items.filter((_, i) => i !== idx))}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>Value</FieldLabel>
                  <input className={inputClass} value={item.value} onChange={(e) => { const next = [...items]; next[idx] = { ...next[idx], value: e.target.value }; setItems(next); }} placeholder="500+" />
                </div>
                <div>
                  <FieldLabel>Label</FieldLabel>
                  <input className={inputClass} value={item.label} onChange={(e) => { const next = [...items]; next[idx] = { ...next[idx], label: e.target.value }; setItems(next); }} placeholder="Clients Helped" />
                </div>
              </div>
            </ArrayItemRow>
          ))}
        </div>
        {items.length < 6 && <AddItemButton onClick={() => setItems([...items, { value: "", label: "" }])} />}
      </div>
    </div>
  );
}

// Features (How We Can Help) — image upload + TinyMCE + read more
type FeatureItem = {
  icon?: string;
  imageUrl?: string;
  imageId?: string;
  title: string;
  description: string;
  readMoreText?: string;
  readMoreHref?: string;
};

function FeaturesEditor({ form, setForm, tinymceKey }: EditorPropsWithTMCE) {
  const items: FeatureItem[] = (form.meta.items as FeatureItem[]) ?? [];

  function setItems(next: FeatureItem[]) {
    setForm((f) => ({ ...f, meta: { ...f.meta, items: next } }));
  }

  function updateItem(idx: number, patch: Partial<FeatureItem>) {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    setItems(next);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="How We Can Help" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Comprehensive support..." />
        </div>
      </div>

      <div>
        <FieldLabel>Feature Cards (up to 6)</FieldLabel>
        <div className="space-y-4 mb-3">
          {items.map((item, idx) => (
            <ArrayItemRow key={idx} onRemove={() => setItems(items.filter((_, i) => i !== idx))}>
              {/* Image upload */}
              <div>
                <FieldLabel>Card Image</FieldLabel>
                <ImageUpload
                  value={item.imageUrl || undefined}
                  label=""
                  onChange={(url, imageId) => updateItem(idx, { imageUrl: url, imageId })}
                  onClear={() => updateItem(idx, { imageUrl: "", imageId: "" })}
                />
              </div>

              {/* Title */}
              <div>
                <FieldLabel>Title</FieldLabel>
                <input
                  className={inputClass}
                  value={item.title}
                  onChange={(e) => updateItem(idx, { title: e.target.value })}
                  placeholder="Individual Therapy"
                />
              </div>

              {/* Description — TinyMCE or textarea fallback */}
              <div>
                <FieldLabel>Description</FieldLabel>
                {tinymceKey ? (
                  <TinyMCEInline
                    value={item.description}
                    onChange={(v) => updateItem(idx, { description: v })}
                    apiKey={tinymceKey}
                    height={150}
                  />
                ) : (
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={3}
                    value={item.description}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                    placeholder="Short description..."
                  />
                )}
              </div>

              {/* Optional Read More button */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>Read More Button Text (optional)</FieldLabel>
                  <input
                    className={inputClass}
                    value={item.readMoreText ?? ""}
                    onChange={(e) => updateItem(idx, { readMoreText: e.target.value })}
                    placeholder="Learn more"
                  />
                </div>
                <div>
                  <FieldLabel>Read More Link (optional)</FieldLabel>
                  <input
                    className={inputClass}
                    value={item.readMoreHref ?? ""}
                    onChange={(e) => updateItem(idx, { readMoreHref: e.target.value })}
                    placeholder="/services/individual-therapy"
                  />
                </div>
              </div>
            </ArrayItemRow>
          ))}
        </div>
        {items.length < 6 && (
          <AddItemButton
            onClick={() => setItems([...items, { imageUrl: "", imageId: "", title: "", description: "", readMoreText: "", readMoreHref: "" }])}
          />
        )}
      </div>
    </div>
  );
}

// How It Works — TinyMCE for step descriptions
type HowItWorksStep = { number: string; title: string; description: string };

function HowItWorksEditor({ form, setForm, tinymceKey }: EditorPropsWithTMCE) {
  const steps: HowItWorksStep[] = (form.meta.steps as HowItWorksStep[]) ?? [];

  function setSteps(next: HowItWorksStep[]) {
    setForm((f) => ({ ...f, meta: { ...f.meta, steps: next } }));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="How It Works" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Getting started is simple..." />
        </div>
      </div>
      <div>
        <FieldLabel>Steps</FieldLabel>
        <div className="space-y-4 mb-3">
          {steps.map((step, idx) => (
            <ArrayItemRow key={idx} onRemove={() => setSteps(steps.filter((_, i) => i !== idx))}>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <FieldLabel>Number</FieldLabel>
                  <input className={inputClass} value={step.number} onChange={(e) => { const next = [...steps]; next[idx] = { ...next[idx], number: e.target.value }; setSteps(next); }} placeholder={String(idx + 1).padStart(2, "0")} />
                </div>
                <div className="col-span-3">
                  <FieldLabel>Title</FieldLabel>
                  <input className={inputClass} value={step.title} onChange={(e) => { const next = [...steps]; next[idx] = { ...next[idx], title: e.target.value }; setSteps(next); }} placeholder="Book a Consultation" />
                </div>
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                {tinymceKey ? (
                  <TinyMCEInline
                    value={step.description}
                    onChange={(v) => { const next = [...steps]; next[idx] = { ...next[idx], description: v }; setSteps(next); }}
                    apiKey={tinymceKey}
                    height={130}
                  />
                ) : (
                  <input
                    className={inputClass}
                    value={step.description}
                    onChange={(e) => { const next = [...steps]; next[idx] = { ...next[idx], description: e.target.value }; setSteps(next); }}
                    placeholder="Step description..."
                  />
                )}
              </div>
            </ArrayItemRow>
          ))}
        </div>
        {steps.length < 6 && <AddItemButton onClick={() => setSteps([...steps, { number: String(steps.length + 1).padStart(2, "0"), title: "", description: "" }])} label="Add Step" />}
      </div>
    </div>
  );
}

// Services Preview
function ServicesPreviewEditor({ form, setForm }: EditorProps) {
  const count = (form.meta.count as number) ?? 6;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Our Services" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Professional care tailored to your needs" />
        </div>
      </div>
      <div>
        <FieldLabel>Number of Cards to Show (1–8)</FieldLabel>
        <input type="number" min={1} max={8} className={`${inputClass} w-24`} value={count} onChange={(e) => setForm((f) => ({ ...f, meta: { ...f.meta, count: parseInt(e.target.value, 10) || 6 } }))} />
      </div>
      <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        Cards are auto-pulled from your active services in the database. Add or manage services in the Services admin section.
      </p>
    </div>
  );
}

// Testimonials — DB-driven with checkbox selection
type DBTestimonial = {
  id: string;
  clientName: string;
  clientRole: string | null;
  quote: string;
  rating: number;
  isActive: boolean;
};

function TestimonialsEditor({ form, setForm }: EditorProps) {
  const selectedIds: string[] = (form.meta.selectedIds as string[]) ?? [];
  const [allTestimonials, setAllTestimonials] = useState<DBTestimonial[]>([]);
  const [loadingTesti, setLoadingTesti] = useState(true);

  useEffect(() => {
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then((data) => setAllTestimonials(Array.isArray(data) ? data : []))
      .catch(() => setAllTestimonials([]))
      .finally(() => setLoadingTesti(false));
  }, []);

  function toggleId(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setForm((f) => ({ ...f, meta: { ...f.meta, selectedIds: next } }));
  }

  const activeTestimonials = allTestimonials.filter((t) => t.isActive);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="What Our Clients Say" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Real stories from real people" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <FieldLabel>Select Testimonials to Show on Homepage</FieldLabel>
          {selectedIds.length > 0 && (
            <span className="text-xs text-indigo-600 font-medium">{selectedIds.length} selected</span>
          )}
        </div>

        {loadingTesti ? (
          <p className="text-sm text-gray-400 py-4 text-center">Loading testimonials…</p>
        ) : activeTestimonials.length === 0 ? (
          <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            No active testimonials found.{" "}
            <a href="/admin/testimonials" target="_blank" className="text-indigo-600 hover:underline font-medium">
              Add testimonials →
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {activeTestimonials.map((t) => {
              const checked = selectedIds.includes(t.id);
              return (
                <label
                  key={t.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleId(t.id)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{t.clientName}</p>
                    {t.clientRole && <p className="text-xs text-gray-500">{t.clientRole}</p>}
                    <p className="text-xs text-gray-600 mt-1 italic line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <div className="flex gap-0.5 shrink-0 mt-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {allTestimonials.filter((t) => !t.isActive).length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            {allTestimonials.filter((t) => !t.isActive).length} inactive testimonial(s) hidden.
            <a href="/admin/testimonials" target="_blank" className="text-indigo-500 hover:underline ml-1">Manage →</a>
          </p>
        )}
      </div>
    </div>
  );
}

// Team Preview
function TeamPreviewEditor({ form, setForm }: EditorProps) {
  const count = (form.meta.count as number) ?? 6;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Meet Our Psychologists" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Qualified professionals dedicated to your well-being" />
        </div>
      </div>
      <div>
        <FieldLabel>Number of Profiles to Show (1–8)</FieldLabel>
        <input type="number" min={1} max={8} className={`${inputClass} w-24`} value={count} onChange={(e) => setForm((f) => ({ ...f, meta: { ...f.meta, count: parseInt(e.target.value, 10) || 6 } }))} />
      </div>
      <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        Profiles are auto-pulled from approved psychologists with active profiles. Manage psychologists in the Psychologists admin section.
      </p>
    </div>
  );
}

// Blog Preview
function BlogPreviewEditor({ form, setForm }: EditorProps) {
  const count = (form.meta.count as number) ?? 3;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Section Title</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="From Our Blog" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Insights and expert perspectives on mental health" />
        </div>
      </div>
      <div>
        <FieldLabel>Number of Posts to Show (1–6)</FieldLabel>
        <input type="number" min={1} max={6} className={`${inputClass} w-24`} value={count} onChange={(e) => setForm((f) => ({ ...f, meta: { ...f.meta, count: parseInt(e.target.value, 10) || 3 } }))} />
      </div>
      <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        Posts are auto-pulled from published blog posts, ordered by most recent. Manage posts in the Blog admin section.
      </p>
    </div>
  );
}

// CTA Banner
function CtaBannerEditor({ form, setForm }: EditorProps) {
  const meta = form.meta as { buttonText?: string; buttonHref?: string; gradient?: string };
  const buttonText = meta.buttonText ?? "";
  const buttonHref = meta.buttonHref ?? "";
  const gradient = meta.gradient ?? "from-indigo-600 to-indigo-800";

  function updateMeta(update: Partial<typeof meta>) {
    setForm((f) => ({ ...f, meta: { ...f.meta, ...update } }));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Headline</FieldLabel>
          <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ready to Start Your Journey?" />
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <input className={inputClass} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Join thousands..." />
        </div>
        <div>
          <FieldLabel>Button Text</FieldLabel>
          <input className={inputClass} value={buttonText} onChange={(e) => updateMeta({ buttonText: e.target.value })} placeholder="Create Your Account" />
        </div>
        <div>
          <FieldLabel>Button Link</FieldLabel>
          <input className={inputClass} value={buttonHref} onChange={(e) => updateMeta({ buttonHref: e.target.value })} placeholder="/register" />
        </div>
      </div>
      <div>
        <FieldLabel>Background Gradient</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {GRADIENT_OPTIONS.map((opt) => (
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
