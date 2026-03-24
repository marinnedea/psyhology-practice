"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type TicketUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Ticket = {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  user: TicketUser;
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

const ROLE_COLORS: Record<string, string> = {
  CLIENT: "bg-sky-100 text-sky-700",
  PSYCHOLOGIST: "bg-violet-100 text-violet-700",
  ADMIN: "bg-rose-100 text-rose-700",
};

export default function AdminTicketQueue() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (priorityFilter) params.set("priority", priorityFilter);
    try {
      const res = await fetch(`/api/admin/tickets?${params.toString()}`);
      if (res.ok) setTickets(await res.json());
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, priorityFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const urgentCount = tickets.filter((t) => t.priority === "URGENT").length;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Open", value: openCount, color: "text-blue-600" },
          { label: "Urgent", value: urgentCount, color: "text-red-600" },
          { label: "Total", value: tickets.length, color: "text-gray-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="NORMAL">Normal</option>
        </select>
        <select
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          <option value="TECHNICAL">Technical</option>
          <option value="APPOINTMENT">Appointment</option>
          <option value="BILLING">Billing</option>
          <option value="GENERAL">General</option>
          <option value="OTHER">Other</option>
        </select>
        {(statusFilter || categoryFilter || priorityFilter) && (
          <button
            onClick={() => { setStatusFilter(""); setCategoryFilter(""); setPriorityFilter(""); }}
            className="text-sm text-indigo-600 hover:underline px-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🎫</div>
          <p className="text-gray-500">No tickets found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 overflow-hidden">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/admin/tickets/${ticket.id}`}
              className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              {/* Priority indicator */}
              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${ticket.priority === "URGENT" ? "bg-red-500" : ticket.priority === "HIGH" ? "bg-orange-400" : "bg-gray-300"}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status] ?? ""}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                  {ticket.priority !== "NORMAL" && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority] ?? ""}`}>
                      {ticket.priority}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[ticket.user.role] ?? "bg-gray-100 text-gray-600"}`}>
                    {ticket.user.role}
                  </span>
                  <span className="font-medium text-gray-600">{ticket.user.name}</span>
                  <span>·</span>
                  <span>{CATEGORY_LABELS[ticket.category] ?? ticket.category}</span>
                  <span>·</span>
                  <span>{ticket._count.messages} msg{ticket._count.messages !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
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
