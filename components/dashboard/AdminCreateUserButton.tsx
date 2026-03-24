"use client";

import { useState } from "react";
import AdminUserFormModal from "./AdminUserFormModal";

export default function AdminCreateUserButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add User
      </button>

      {showModal && (
        <AdminUserFormModal
          mode="create"
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
