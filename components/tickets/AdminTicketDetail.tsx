"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

type Sender = {
  id: string;
  name: string;
  role: string;
  image: string | null;
};

type Message = {
  id: string;
  body: string;
  senderId: string;
  sender: Sender;
  isInternal: boolean;
  createdAt: string;
};

type TicketOwner = {
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
  user: TicketOwner;
  messages: Message[];
};

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const PRIORITY_OPTIONS = ["NORMAL", "HIGH", "URGENT"] as const;

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

type Props = {
  ticketId: string;
  adminId: string;
};

export default function AdminTicketDetail({ ticketId, adminId }: Props) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchTicket = useCallback(async () => {
    const res = await fetch(`/api/admin/tickets/${ticketId}`);
    if (res.ok) setTicket(await res.json());
    setLoading(false);
  }, [ticketId]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages.length]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSendError("");
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply, isInternal }),
      });
      const data = await res.json();
      if (!res.ok) { setSendError(data.error ?? "Failed to send"); return; }
      setReply("");
      setIsInternal(false);
      await fetchTicket();
    } catch {
      setSendError("Network error");
    } finally {
      setSending(false);
    }
  }

  async function updateField(field: "status" | "priority", value: string) {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) await fetchTicket();
    } finally {
      setStatusUpdating(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>;
  if (!ticket) return <div className="text-center py-12 text-gray-500">Ticket not found.</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
      {/* Left: conversation */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Link href="/admin/tickets" className="mt-1 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{ticket.subject}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-500">
              <span>#{ticket.id.slice(-8).toUpperCase()}</span>
              <span>·</span>
              <span>{ticket.category}</span>
              <span>·</span>
              <span>Opened {new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {ticket.messages.map((msg) => {
            const isAdmin = msg.sender.role === "ADMIN";
            const isOwn = msg.senderId === adminId;
            return (
              <div
                key={msg.id}
                className={`rounded-2xl px-4 py-3 ${
                  msg.isInternal
                    ? "bg-amber-50 border border-amber-200"
                    : isAdmin
                    ? "bg-indigo-50 border border-indigo-200 ml-8"
                    : "bg-white border border-gray-200 mr-8"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${isAdmin ? "bg-indigo-200 text-indigo-800" : "bg-gray-200 text-gray-700"}`}>
                      {msg.sender.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{msg.sender.name}</span>
                    <span className="text-xs text-gray-400">{msg.sender.role}</span>
                    {msg.isInternal && (
                      <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium">Internal note</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.body}</p>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Reply form */}
        <form onSubmit={handleReply} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-medium text-gray-700">Reply as:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="replyType"
                checked={!isInternal}
                onChange={() => setIsInternal(false)}
                className="text-indigo-600"
              />
              <span className="text-sm text-gray-700">Public reply</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="replyType"
                checked={isInternal}
                onChange={() => setIsInternal(true)}
                className="text-amber-500"
              />
              <span className="text-sm text-amber-700">Internal note</span>
            </label>
          </div>
          <textarea
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none ${isInternal ? "border-amber-300 focus:ring-amber-400 bg-amber-50" : "border-gray-300 focus:ring-indigo-500"}`}
            rows={4}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={isInternal ? "Add an internal note (not visible to user)…" : "Write your reply…"}
          />
          {sendError && <p className="text-sm text-red-600">{sendError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className={`px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors text-white ${isInternal ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {sending ? "Sending…" : isInternal ? "Add Note" : "Send Reply"}
            </button>
          </div>
        </form>
      </div>

      {/* Right: metadata sidebar */}
      <div className="space-y-4">
        {/* Status + priority */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ticket Info</h3>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={ticket.status}
              onChange={(e) => updateField("status", e.target.value)}
              disabled={statusUpdating}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={ticket.priority}
              onChange={(e) => updateField("priority", e.target.value)}
              disabled={statusUpdating}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <p className="text-sm text-gray-700">{ticket.category}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Last Updated</label>
            <p className="text-sm text-gray-700">{new Date(ticket.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Submitter */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Submitted By</h3>
          <p className="text-sm font-medium text-gray-900">{ticket.user.name}</p>
          <p className="text-xs text-gray-500">{ticket.user.email}</p>
          <p className="text-xs text-gray-400">{ticket.user.role}</p>
        </div>
      </div>
    </div>
  );
}
