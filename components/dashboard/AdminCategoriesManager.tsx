"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type Props = {
  initialCategories: Category[];
};

export default function AdminCategoriesManager({ initialCategories }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSlug, setAddSlug] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  function handleAddNameChange(val: string) {
    setAddName(val);
    setAddSlug(toSlug(val));
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
    setError(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading("add");
    setError(null);
    try {
      const res = await fetch("/api/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName, slug: addSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create category.");
        return;
      }
      setCategories((prev) =>
        [...prev, { ...data, postCount: 0 }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setAddName("");
      setAddSlug("");
      setShowAddForm(false);
      showToast("Category created.");
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
      const res = await fetch(`/api/admin/blog-categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, slug: editSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update category.");
        return;
      }
      setCategories((prev) =>
        prev
          .map((c) =>
            c.id === editingId ? { ...c, name: data.name, slug: data.slug } : c
          )
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      showToast("Category updated.");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(category: Category) {
    if (category.postCount > 0) {
      if (
        !confirm(
          `This category has ${category.postCount} post${category.postCount > 1 ? "s" : ""}. Deleting it will unlink those posts. Continue?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Delete category "${category.name}"?`)) return;
    }
    setLoading(`delete-${category.id}`);
    try {
      const res = await fetch(`/api/admin/blog-categories/${category.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error ?? "Failed to delete.");
        return;
      }
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      showToast("Category deleted.");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            setShowAddForm((v) => !v);
            setError(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Category"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">New Category</h2>
          {error && (
            <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={addName}
                onChange={(e) => handleAddNameChange(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={addSlug}
                onChange={(e) => setAddSlug(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading === "add"}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading === "add" ? "Creating…" : "Create Category"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setError(null);
                }}
                className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            No categories yet. Add one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Slug</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Posts</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) =>
                  editingId === category.id ? (
                    <tr key={category.id} className="border-b border-gray-100 bg-blue-50">
                      <td colSpan={4} className="px-5 py-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Editing: {category.name}
                        </h3>
                        {error && (
                          <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {error}
                          </p>
                        )}
                        <form onSubmit={handleEdit} className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                className={inputClass}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Slug <span className="text-red-500">*</span>
                              </label>
                              <input
                                className={inputClass}
                                value={editSlug}
                                onChange={(e) => setEditSlug(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 pt-1">
                            <button
                              type="submit"
                              disabled={loading === "edit"}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              {loading === "edit" ? "Saving…" : "Save Changes"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setError(null);
                              }}
                              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={category.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                        {category.slug}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {category.postCount}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => startEdit(category)}
                            className="text-blue-600 hover:underline text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            disabled={loading === `delete-${category.id}`}
                            className="text-red-500 hover:underline text-xs font-medium disabled:opacity-50"
                          >
                            {loading === `delete-${category.id}` ? "Deleting…" : "Delete"}
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
