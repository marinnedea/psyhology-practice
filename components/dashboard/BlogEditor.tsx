"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSiteSettings } from "@/app/providers";
import ImageUpload from "@/components/ui/ImageUpload";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  categoryId: string | null;
  status: string;
  featuredImageId: string | null;
  featuredImage?: { localPath: string } | null;
} | null;

type Props = {
  categories: Category[];
  post: Post;
  userRole: "ADMIN" | "PSYCHOLOGIST";
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
    DRAFT: "bg-gray-100 text-gray-600",
  };
  const labels: Record<string, string> = {
    PUBLISHED: "Published",
    PENDING: "Pending Review",
    REJECTED: "Rejected",
    DRAFT: "Draft",
  };
  const cls = styles[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function BlogEditor({ categories: initialCategories, post, userRole }: Props) {
  const router = useRouter();
  const siteSettings = useSiteSettings();
  const TINYMCE_KEY =
    siteSettings.tinymce_api_key.trim() ||
    process.env.NEXT_PUBLIC_TINYMCE_API_KEY ||
    "";
  const editorRef = useRef<unknown>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!post?.slug);
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");

  // Determine initial status state
  const initialStatus = post?.status ?? "DRAFT";
  // For admin: boolean toggle (published/draft)
  const [adminPublished, setAdminPublished] = useState(initialStatus === "PUBLISHED");
  // For psychologist: submit for review checkbox
  const [submitForReview, setSubmitForReview] = useState(initialStatus === "PENDING");

  // Featured image
  const [featuredImageId, setFeaturedImageId] = useState(post?.featuredImageId ?? "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    post?.featuredImage?.localPath ?? ""
  );

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategoryLoading, setAddingCategoryLoading] = useState(false);
  const [addingCategoryError, setAddingCategoryError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tinymceLoaded, setTinymceLoaded] = useState(false);

  useEffect(() => {
    if (!TINYMCE_KEY) return;
    setTinymceLoaded(true);
  }, [TINYMCE_KEY]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(value);
  }

  function getStatus(): string {
    if (userRole === "ADMIN") {
      return adminPublished ? "PUBLISHED" : "DRAFT";
    } else {
      return submitForReview ? "PENDING" : "DRAFT";
    }
  }

  function getApiUrl(): string {
    if (userRole === "ADMIN") {
      return post ? `/api/admin/blog/${post.id}` : "/api/admin/blog";
    } else {
      return post ? `/api/psychologist/blog/${post.id}` : "/api/psychologist/blog";
    }
  }

  function getRedirectUrl(): string {
    return userRole === "ADMIN" ? "/admin/blog" : "/psychologist/blog";
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    setAddingCategoryLoading(true);
    setAddingCategoryError(null);
    try {
      const res = await fetch("/api/psychologist/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAddingCategoryError(data.error ?? "Failed to create category.");
      } else {
        const created: Category = await res.json();
        setCategories((prev) => [...prev, created]);
        setCategoryId(created.id);
        setAddingCategory(false);
        setNewCategoryName("");
      }
    } catch {
      setAddingCategoryError("Network error.");
    } finally {
      setAddingCategoryLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let finalContent = content;
    if (TINYMCE_KEY && editorRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      finalContent = (editorRef.current as any).getContent();
    }

    const body: Record<string, unknown> = {
      title,
      slug,
      content: finalContent,
      excerpt: excerpt || null,
      categoryId: categoryId || null,
      status: getStatus(),
      featuredImageId: featuredImageId || null,
    };

    try {
      const url = getApiUrl();
      const method = post ? "PUT" : "POST";

      const res = await fetch(url, {
        method: userRole === "ADMIN" && post ? "PATCH" : method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save post.");
      } else {
        router.push(getRedirectUrl());
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Status badge for existing post */}
      {post && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Current status:</span>
          <StatusBadge status={post.status} />
        </div>
      )}

      {/* Title */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Post title..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
            placeholder="post-slug"
          />
          {slug && (
            <p className="text-xs text-gray-400 mt-1">
              URL: <span className="font-mono">/blog/{slug}</span>
            </p>
          )}
        </div>

        {/* Featured Image */}
        <ImageUpload
          value={featuredImageUrl}
          imageId={featuredImageId}
          label="Featured Image (optional)"
          onChange={(url, id) => {
            setFeaturedImageUrl(url);
            setFeaturedImageId(id);
          }}
          onClear={() => {
            setFeaturedImageUrl("");
            setFeaturedImageId("");
          }}
        />
      </div>

      {/* Category */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          value={addingCategory ? "__new__" : categoryId}
          onChange={(e) => {
            if (e.target.value === "__new__") {
              setAddingCategory(true);
              setCategoryId("");
            } else {
              setAddingCategory(false);
              setCategoryId(e.target.value);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="">— No category —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          <option value="__new__">+ Add new category</option>
        </select>

        {addingCategory && (
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Category name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              {addingCategoryError && (
                <p className="text-xs text-red-600 mt-1">{addingCategoryError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={addingCategoryLoading}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {addingCategoryLoading ? "..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingCategory(false);
                setNewCategoryName("");
              }}
              className="bg-white text-gray-600 border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Content <span className="text-red-500">*</span>
        </label>
        {TINYMCE_KEY && tinymceLoaded ? (
          <TinyMCEEditorWrapper
            value={content}
            onChange={setContent}
            editorRef={editorRef}
            apiKey={TINYMCE_KEY}
          />
        ) : (
          <>
            <textarea
              required={!TINYMCE_KEY}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y font-mono"
              placeholder="Write your post content here..."
            />
            {!TINYMCE_KEY && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                TinyMCE API key not configured. Set{" "}
                <code className="font-mono">NEXT_PUBLIC_TINYMCE_API_KEY</code>{" "}
                in your environment to enable the rich text editor.
              </p>
            )}
          </>
        )}
      </div>

      {/* Excerpt */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Excerpt{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          placeholder="Short summary shown in listings..."
        />
      </div>

      {/* Publish toggle / submit for review */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-5">
        <div>
          {userRole === "ADMIN" ? (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={adminPublished}
                onChange={(e) => setAdminPublished(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Publish this post
              </span>
            </label>
          ) : (
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={submitForReview}
                  onChange={(e) => setSubmitForReview(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Submit for Review
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Posts must be approved by admin before publishing.
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push(getRedirectUrl())}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : post ? "Update Post" : "Create Post"}
          </button>
        </div>
      </div>
    </form>
  );
}

// Lazy TinyMCE wrapper — only rendered client side when key is available
function TinyMCEEditorWrapper({
  value,
  onChange,
  editorRef,
  apiKey,
}: {
  value: string;
  onChange: (v: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorRef: React.MutableRefObject<any>;
  apiKey: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Editor } = require("@tinymce/tinymce-react");

  return (
    <Editor
      apiKey={apiKey}
      onInit={(_evt: unknown, editor: unknown) => {
        editorRef.current = editor;
      }}
      initialValue={value}
      init={{
        height: 400,
        menubar: false,
        plugins: ["lists", "link", "image", "code", "fullscreen"],
        toolbar:
          "bold italic underline strikethrough | bullist numlist | link image blockquote | h2 h3 | code fullscreen",
        content_style:
          "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; }",
        images_upload_handler: async (
          blobInfo: { blob: () => Blob; filename: () => string },
          progress: (n: number) => void
        ) => {
          progress(0);
          const formData = new FormData();
          formData.append("file", blobInfo.blob(), blobInfo.filename());
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error ?? "Upload failed");
          }
          const data = await res.json();
          progress(100);
          return data.url;
        },
      }}
    />
  );
}
