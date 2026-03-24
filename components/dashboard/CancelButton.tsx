"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  appointmentId: string;
};

export default function CancelButton({ appointmentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment? This action cannot be undone."
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to cancel appointment.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleCancel}
        disabled={loading}
        className="bg-white text-red-600 border border-red-300 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {loading ? "Cancelling..." : "Cancel"}
      </button>
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </div>
  );
}
