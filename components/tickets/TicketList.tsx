"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
  messages: { body: string; createdAt: string }[];
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

const PRIORITY_COLORS: Record<string, string> = {
  NORMAL: "bg-gray-100 text-gray-600",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  TECHNICAL: "Technical",
  APPOINTMENT: "Appointment",
  BILLING: "Billing",
  GENERAL: "General",
  OTHER: "Other",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "NORMAL") return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[priority] ?? ""}`}>
      {priority}
    </span>
  );
}

type Props = {
  basePath: string; // e.g. "/client/support" or "/psychologist/support"
};

export default function TicketList({ basePath }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) setTickets(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Support Tickets</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage your support requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          + New Ticket
        </button>
      </div>

      {showForm && (
        <NewTicketForm
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); fetchTickets(); }}
        />
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🎫</div>
          <p className="text-gray-600 font-medium">No tickets yet</p>
          <p className="text-gray-400 text-sm mt-1">Open a ticket whenever you need help</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`${basePath}/${ticket.id}`}
              className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</span>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-gray-400">{CATEGORY_LABELS[ticket.category] ?? ticket.category}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">{ticket._count.messages} message{ticket._count.messages !== 1 ? "s" : ""}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">Updated {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NewTicketForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, body }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create ticket"); return; }
      onCreated();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">New Support Ticket</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of your issue"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="GENERAL">General</option>
            <option value="TECHNICAL">Technical</option>
            <option value="APPOINTMENT">Appointment</option>
            <option value="BILLING">Billing</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe your issue in detail…"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Submitting…" : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
