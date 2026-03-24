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

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

type Props = {
  ticketId: string;
  currentUserId: string;
  backPath: string;
};

export default function TicketThread({ ticketId, currentUserId, backPath }: Props) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchTicket = useCallback(async () => {
    const res = await fetch(`/api/tickets/${ticketId}`);
    if (res.ok) {
      const data = await res.json();
      setTicket(data);
    }
    setLoading(false);
  }, [ticketId]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages.length]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setError("");
    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send"); return; }
      setReply("");
      await fetchTicket();
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>;
  if (!ticket) return <div className="text-center py-12 text-gray-500">Ticket not found.</div>;

  const isClosed = ticket.status === "CLOSED";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href={backPath} className="mt-1 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{ticket.subject}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status] ?? "bg-gray-100 text-gray-600"}`}>
              {ticket.status.replace("_", " ")}
            </span>
            <span className="text-xs text-gray-400">{ticket.category}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400">Opened {new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {ticket.messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          const isStaff = msg.sender.role === "ADMIN";
          return (
            <div key={msg.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${isStaff ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-600"}`}>
                {msg.sender.name.charAt(0).toUpperCase()}
              </div>
              {/* Bubble */}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isOwn ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"}`}>
                <div className={`text-xs mb-1 font-medium ${isOwn ? "text-indigo-200" : "text-gray-500"}`}>
                  {msg.sender.name} {isStaff && !isOwn && "· Support"}
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <div className={`text-xs mt-1 ${isOwn ? "text-indigo-300" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply */}
      {isClosed ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-center text-sm text-gray-500">
          This ticket is closed. <Link href={backPath} className="text-indigo-600 hover:underline">Open a new ticket</Link> if you need further help.
        </div>
      ) : (
        <form onSubmit={handleReply} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={4}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write your reply…"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {sending ? "Sending…" : "Send Reply"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
