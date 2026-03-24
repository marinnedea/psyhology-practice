"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminUserFormModal from "./AdminUserFormModal";

type Props = {
  userId: string;
  userName: string;
  userEmail: string;
  currentRole: string;
  isApproved: boolean;
};

export default function AdminUserActions({ userId, userName, userEmail, currentRole, isApproved }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }

  async function callAction(action: string) {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Something went wrong.", "error");
        return;
      }
      if (action === "reset_password") {
        showToast(`Password reset. Temporary password: ${data.tempPassword}`, "success");
      } else {
        showToast("User updated successfully.", "success");
      }
      router.refresh();
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(null);
    }
  }

  const isAdmin = currentRole === "ADMIN";

  return (
    <>
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {showEdit && (
        <AdminUserFormModal
          mode="edit"
          user={{ id: userId, name: userName, email: userEmail, role: currentRole, isApproved }}
          onClose={() => setShowEdit(false)}
        />
      )}

      <div className="flex flex-wrap gap-2">
        {/* Edit button — all users */}
        <button
          onClick={() => setShowEdit(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          Edit
        </button>

        {/* Approve button — only for unapproved psychologists */}
        {currentRole === "PSYCHOLOGIST" && !isApproved && (
          <button
            onClick={() => callAction("approve")}
            disabled={loading !== null}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading === "approve" ? "Approving…" : "Approve"}
          </button>
        )}

        {/* Disable / Enable toggle — not for admins */}
        {!isAdmin && (
          <button
            onClick={() => callAction("toggle_approved")}
            disabled={loading !== null}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors ${
              isApproved
                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {loading === "toggle_approved"
              ? "Updating…"
              : isApproved
              ? "Disable"
              : "Enable"}
          </button>
        )}

        {/* Reset password — not for admins */}
        {!isAdmin && (
          <button
            onClick={() => callAction("reset_password")}
            disabled={loading !== null}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loading === "reset_password" ? "Resetting…" : "Reset Pwd"}
          </button>
        )}
      </div>
    </>
  );
}
