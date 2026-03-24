"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  repliedAt: string | null;
  replyBody: string | null;
  createdAt: string;
};

type Props = {
  initialMessages: Message[];
  smtpEnabled: boolean;
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function ReplyForm({
  messageId,
  recipientName,
  onReplied,
}: {
  messageId: string;
  recipientName: string;
  onReplied: (repliedAt: string, replyBody: string) => void;
}) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    if (!body.trim()) return;
    setError("");
    setSending(true);
    try {
      const res = await fetch(`/api/admin/contact/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send reply");
        return;
      }
      onReplied(data.repliedAt, data.replyBody);
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Reply to {recipientName}
      </div>
      <textarea
        className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
        rows={5}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your reply…"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={sending || !body.trim()}
          onClick={handleSend}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          {sending ? (
            "Sending…"
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Reply
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function AdminContactMessages({ initialMessages, smtpEnabled }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: "success" | "info" } | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  function showToast(text: string, type: "success" | "info" = "success") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function markRead(id: string) {
    setLoading(`read-${id}`);
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (!res.ok) return;
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleExpand(message: Message) {
    if (expandedId === message.id) {
      setExpandedId(null);
      setReplyingId(null);
      return;
    }
    setExpandedId(message.id);
    setReplyingId(null);
    if (!message.isRead) {
      await markRead(message.id);
    }
  }

  async function markAllRead() {
    const unread = messages.filter((m) => !m.isRead);
    if (unread.length === 0) return;
    setLoading("mark-all");
    try {
      await Promise.all(
        unread.map((m) =>
          fetch(`/api/admin/contact/${m.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: true }),
          })
        )
      );
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      showToast("All messages marked as read.", "info");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  function handleReplied(id: string, repliedAt: string, replyBody: string) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true, repliedAt, replyBody } : m))
    );
    setReplyingId(null);
    showToast("Reply sent successfully.");
    router.refresh();
  }

  const displayed = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "read") return m.isRead;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-indigo-600"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
                filter === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {!smtpEnabled && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              ⚠ SMTP not configured — replies disabled
            </span>
          )}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={loading === "mark-all"}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {loading === "mark-all" ? "Marking…" : "Mark All as Read"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {displayed.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            No messages match the current filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayed.map((msg) => (
              <div key={msg.id}>
                <button
                  onClick={() => handleExpand(msg)}
                  className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${
                    !msg.isRead ? "bg-blue-50 hover:bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium text-sm ${!msg.isRead ? "text-gray-900" : "text-gray-700"}`}>
                          {msg.name}
                        </span>
                        <span className="text-gray-400 text-xs">{msg.email}</span>
                        {!msg.isRead && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            Unread
                          </span>
                        )}
                        {msg.repliedAt && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Replied
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-0.5 ${!msg.isRead ? "font-medium text-gray-800" : "text-gray-600"}`}>
                        {msg.subject ?? "(no subject)"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {msg.message.slice(0, 100)}{msg.message.length > 100 ? "…" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
                      <span className="text-gray-400 text-xs">{expandedId === msg.id ? "▲" : "▼"}</span>
                    </div>
                  </div>
                </button>

                {expandedId === msg.id && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-gray-50">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</span>
                          <p className="mt-1 text-gray-900">{msg.name}</p>
                          <p className="text-gray-500 text-xs">{msg.email}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</span>
                          <p className="mt-1 text-gray-900">{msg.subject ?? "(no subject)"}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Message</span>
                        <p className="mt-2 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed bg-white border border-gray-200 rounded-lg p-4">
                          {msg.message}
                        </p>
                      </div>

                      {/* Previous reply preview */}
                      {msg.repliedAt && msg.replyBody && (
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Your Reply · {formatDate(msg.repliedAt)}
                          </span>
                          <p className="mt-2 text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            {msg.replyBody}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-1 flex-wrap">
                        {!msg.isRead && (
                          <button
                            onClick={() => markRead(msg.id)}
                            disabled={loading === `read-${msg.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {loading === `read-${msg.id}` ? "Marking…" : "Mark as Read"}
                          </button>
                        )}
                        {smtpEnabled && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplyingId(replyingId === msg.id ? null : msg.id);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5 ${
                              replyingId === msg.id
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            {msg.repliedAt ? "Reply Again" : "Reply"}
                          </button>
                        )}
                      </div>

                      {/* Inline reply form */}
                      {smtpEnabled && replyingId === msg.id && (
                        <ReplyForm
                          messageId={msg.id}
                          recipientName={msg.name}
                          onReplied={(repliedAt, replyBody) =>
                            handleReplied(msg.id, repliedAt, replyBody)
                          }
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
