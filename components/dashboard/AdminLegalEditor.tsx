"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useSiteSettings } from "@/app/providers";

// Lazy-load TinyMCE to avoid SSR issues
const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((m) => m.Editor),
  { ssr: false, loading: () => <div className="h-[500px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400">Loading editor…</div> }
);

type LegalPage = {
  key: string;
  label: string;
  id: string | null;
  content: string | null;
  updatedAt: string | null;
};

type Props = { pages: LegalPage[] };

type Status = "idle" | "saving" | "saved" | "error";

// Default starter content shown when a page has no custom content yet
const STARTERS: Record<string, string> = {
  privacy: `<h2>Privacy Policy</h2>
<p>This privacy policy describes how [Your Organisation] collects, uses, and protects your personal information.</p>
<h3>What We Collect</h3>
<ul>
  <li>Account information (name, email)</li>
  <li>Appointment and booking data</li>
  <li>Usage data and cookies</li>
</ul>
<h3>Your Rights</h3>
<p>You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:privacy@example.com">privacy@example.com</a>.</p>`,
  cookies: `<h2>Cookie Policy</h2>
<p>We use cookies to improve your experience on our platform. This policy explains what cookies we use and how you can control them.</p>
<h3>Essential Cookies</h3>
<p>These are necessary for the platform to function and cannot be disabled.</p>
<h3>Analytics Cookies</h3>
<p>We use Google Analytics to understand how visitors use our site. You can opt out at any time.</p>`,
  terms: `<h2>Terms of Service</h2>
<p>By using [Your Platform Name], you agree to these terms. Please read them carefully.</p>
<h3>Use of Service</h3>
<p>You agree to use the platform in accordance with applicable laws and these terms.</p>
<h3>Accounts</h3>
<p>You are responsible for maintaining the security of your account.</p>`,
};

function StatusBadge({ page }: { page: LegalPage }) {
  if (page.content) {
    return (
      <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
        Custom content
      </span>
    );
  }
  return (
    <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
      Using template
    </span>
  );
}

function PageEditor({
  page,
  apiKey,
  onSaved,
}: {
  page: LegalPage;
  apiKey: string;
  onSaved: (updated: LegalPage) => void;
}) {
  const [content, setContent] = useState<string>(page.content ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const editorRef = useRef<{ getContent: () => string } | null>(null);

  const hasCustomContent = !!page.content;
  const isDirty = content !== (page.content ?? "");

  async function handleSave() {
    const html = editorRef.current?.getContent() ?? content;
    setStatus("saving");
    setErrorMsg("");
    try {
      let res: Response;
      if (page.id) {
        // Update existing
        res = await fetch(`/api/admin/page-sections/${page.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: html, title: page.label }),
        });
      } else {
        // Create new
        res = await fetch("/api/admin/page-sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: "legal",
            sectionKey: page.key,
            title: page.label,
            content: html,
            isVisible: true,
          }),
        });
      }
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setStatus("saved");
      onSaved({
        ...page,
        id: data.id ?? page.id,
        content: html,
        updatedAt: new Date().toISOString(),
      });
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setErrorMsg("Failed to save. Please try again.");
    }
  }

  async function handleReset() {
    if (!page.id) return;
    if (!confirm("Remove custom content and revert to the auto-generated template? This cannot be undone.")) return;
    setStatus("saving");
    try {
      const res = await fetch(`/api/admin/page-sections/${page.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setContent("");
      setStatus("idle");
      onSaved({ ...page, id: null, content: null, updatedAt: null });
    } catch {
      setStatus("error");
      setErrorMsg("Failed to reset. Please try again.");
    }
  }

  function handleLoadStarter() {
    const starter = STARTERS[page.key] ?? "";
    setContent(starter);
  }

  return (
    <div className="space-y-4">
      {/* Info bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <StatusBadge page={{ ...page, content: hasCustomContent ? page.content : content || null }} />
          {page.updatedAt && (
            <span className="text-xs text-gray-400">
              Last saved {new Date(page.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/${page.key}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            Preview page
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Editor */}
      {!content && !hasCustomContent ? (
        <div className="border border-dashed border-gray-300 rounded-xl p-10 text-center bg-gray-50">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Using auto-generated template</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            The public page currently shows the default template based on your region setting.
            You can write your own content below, or load our starter text to edit from.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleLoadStarter}
              className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Starter Text
            </button>
            <button
              onClick={() => setContent("<p></p>")}
              className="bg-white border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start from Scratch
            </button>
          </div>
        </div>
      ) : (
        <>
          {apiKey ? (
            <Editor
              apiKey={apiKey}
              onInit={(_evt, editor) => {
                editorRef.current = editor;
              }}
              initialValue={content || "<p></p>"}
              onEditorChange={(val) => setContent(val)}
              init={{
                height: 520,
                menubar: "edit view insert format tools",
                plugins: [
                  "lists", "link", "table", "code", "fullscreen",
                  "searchreplace", "wordcount", "anchor", "visualblocks",
                ],
                toolbar:
                  "undo redo | styles | bold italic underline | " +
                  "bullist numlist | link table | blockquote code | fullscreen",
                style_formats: [
                  { title: "Heading 2", block: "h2" },
                  { title: "Heading 3", block: "h3" },
                  { title: "Heading 4", block: "h4" },
                  { title: "Paragraph", block: "p" },
                ],
                content_style: `
                  body { font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #374151; max-width: 720px; margin: 0 auto; padding: 16px; }
                  h2 { font-size: 1.4em; font-weight: 700; margin-top: 2em; }
                  h3 { font-size: 1.15em; font-weight: 600; margin-top: 1.5em; }
                  table { border-collapse: collapse; width: 100%; }
                  td, th { border: 1px solid #e5e7eb; padding: 8px 12px; }
                  th { background: #f9fafb; font-weight: 600; }
                `,
              }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              className="w-full border border-gray-300 rounded-lg p-4 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Enter HTML content…"
            />
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {status === "saved" && (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              )}
              {status === "error" && (
                <span className="text-sm text-red-600">{errorMsg}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {hasCustomContent && (
                <button
                  onClick={handleReset}
                  disabled={status === "saving"}
                  className="text-sm text-red-500 hover:text-red-700 hover:underline disabled:opacity-50 transition-colors"
                >
                  Reset to Template
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={status === "saving" || (!isDirty && status !== "idle")}
                className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {status === "saving" ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Saving…
                  </>
                ) : "Save Custom Content"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminLegalEditor({ pages }: Props) {
  const { tinymce_api_key } = useSiteSettings();
  const [activeTab, setActiveTab] = useState(pages[0]?.key ?? "privacy");
  const [pageState, setPageState] = useState<LegalPage[]>(pages);

  const activePage = pageState.find((p) => p.key === activeTab)!;

  function handleSaved(updated: LegalPage) {
    setPageState((prev) => prev.map((p) => (p.key === updated.key ? updated : p)));
  }

  return (
    <div className="space-y-6">
      {/* Tip */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-3 text-sm text-blue-800">
        <svg className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Custom content overrides the auto-generated template. Leave a page empty to use the
          region-based template (configured in{" "}
          <a href="/admin/settings" className="underline hover:text-blue-600">Site Settings → Privacy &amp; Legal</a>).
          Content is rendered as HTML — you can use the rich text editor or write HTML directly.
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {pageState.map((p) => (
            <button
              key={p.key}
              onClick={() => setActiveTab(p.key)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === p.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {p.label}
              {p.content ? (
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Custom content saved" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Using template" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Active page editor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{activePage.label}</h2>
            <p className="text-xs text-gray-500">
              Public URL:{" "}
              <a href={`/${activePage.key}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                /{activePage.key}
              </a>
            </p>
          </div>
        </div>

        <PageEditor
          key={activePage.key}
          page={activePage}
          apiKey={tinymce_api_key}
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}
