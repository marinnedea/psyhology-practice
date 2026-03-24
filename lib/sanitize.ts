/**
 * HTML sanitization helpers for CMS content rendered via dangerouslySetInnerHTML.
 *
 * Two levels:
 *  - sanitizeText(str)  — strips ALL tags; use for titles, subtitles, labels.
 *  - sanitizeHtml(str)  — allows a safe subset of tags; use for rich-text content
 *                         and full blog post bodies.
 *
 * Uses `sanitize-html` (runs on the server in React Server Components).
 */

import sanitizeHtmlLib from "sanitize-html";

// ── Plain text ────────────────────────────────────────────────
// Remove every HTML tag, decode entities. Safe for any text field.
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  return sanitizeHtmlLib(input, { allowedTags: [], allowedAttributes: {} });
}

// ── Safe HTML subset ──────────────────────────────────────────
// Permit formatting tags used by TinyMCE output; block everything dangerous.
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  return sanitizeHtmlLib(input, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr",
      "strong", "b", "em", "i", "u", "s", "del", "ins",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a",
      "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
      "sup", "sub",
    ],
    // Only keep safe attributes; no inline event handlers (onclick, onerror, etc.)
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "width", "height", "loading"],
      table: ["border", "cellpadding", "cellspacing"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
      "*": ["class"],
    },
    // Block javascript: URIs
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: {
      img: ["https", "http", "/"],
    },
  });
}
