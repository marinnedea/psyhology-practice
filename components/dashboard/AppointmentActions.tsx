"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  appointmentId: string;
  status: string;
};

export default function AppointmentActions({ appointmentId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    setError(null);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update appointment.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(null);
    }
  }

  if (status !== "PENDING" && status !== "CONFIRMED") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && (
        <span className="text-red-600 text-xs">{error}</span>
      )}
      {status === "PENDING" && (
        <button
          onClick={() => updateStatus("CONFIRMED")}
          disabled={loading !== null}
          className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading === "CONFIRMED" ? "..." : "Confirm"}
        </button>
      )}
      {status === "CONFIRMED" && (
        <button
          onClick={() => updateStatus("COMPLETED")}
          disabled={loading !== null}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading === "COMPLETED" ? "..." : "Complete"}
        </button>
      )}
      <button
        onClick={() => updateStatus("CANCELLED")}
        disabled={loading !== null}
        className="bg-white text-red-600 border border-red-300 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {loading === "CANCELLED" ? "..." : "Cancel"}
      </button>
    </div>
  );
}
