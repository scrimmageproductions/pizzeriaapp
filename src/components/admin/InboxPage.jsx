import { useEffect, useRef, useState } from "react";
import { MessageSquareText, Send } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { useTicker } from "../../utils/useTicker";
import { useSound } from "../../utils/useSound";
import { getOrderTiming } from "../../utils/helpers";

const QUICK_REPLIES = ["Yes, we can do that!", "Your driver is 5 mins away.", "Sorry, we are out of that item."];
const STAGE_LABELS = ["Received", "Cooking", "Ready"];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function InboxPage() {
  const { conversations, orders } = useShopState();
  const { sendMessage, markConversationRead } = useShopActions();
  const now = useTicker(1000);
  const { playTick } = useSound();
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  const sorted = [...conversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  const active = sorted.find((c) => c.id === activeId) || sorted[0] || null;

  useEffect(() => {
    if (!activeId && sorted.length > 0) setActiveId(sorted[0].id);
  }, [sorted, activeId]);

  useEffect(() => {
    if (active?.unread) markConversationRead(active.id);
  }, [active, markConversationRead]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length]);

  const activeOrder = active?.orderId ? orders.find((o) => o.id === active.orderId) : null;
  const orderStatusLabel = activeOrder
    ? activeOrder.completedAt
      ? "Completed"
      : STAGE_LABELS[getOrderTiming(activeOrder, now).stageIndex]
    : null;

  const handleSend = (text) => {
    const trimmed = text.trim();
    if (!trimmed || !active) return;
    playTick();
    sendMessage(active.id, trimmed);
    setDraft("");
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Inbox</h1>
        <p className="text-sm text-gray-500 dark:text-white/40">Every customer text, in one place.</p>
      </div>

      <div
        className="grid overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#141414] lg:grid-cols-[280px_1fr]"
        style={{ height: "calc(100vh - 220px)", minHeight: 480 }}
      >
        <div className="overflow-y-auto border-b border-gray-100 lg:border-b-0 lg:border-r dark:border-white/10">
          {sorted.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-gray-400 dark:text-white/30">
              <MessageSquareText size={28} />
              <p className="text-sm">No conversations yet.</p>
            </div>
          ) : (
            sorted.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition dark:border-white/5 ${
                  active?.id === c.id ? "bg-gray-50 dark:bg-white/[0.06]" : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-white/10 dark:text-white/60">
                  {c.customerName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{c.customerName}</p>
                    <span className="shrink-0 text-[10px] text-gray-400 dark:text-white/30">{formatTime(c.lastMessageAt)}</span>
                  </div>
                  <p className="truncate text-xs text-gray-500 dark:text-white/40">{c.messages[c.messages.length - 1]?.text}</p>
                </div>
                {c.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E31837]" />}
              </button>
            ))
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400 dark:text-white/30">
              <MessageSquareText size={32} />
              <p className="text-sm">Select a conversation</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-3.5 dark:border-white/10">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 dark:bg-white/10 dark:text-white/60">
                  {active.customerName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-gray-900 dark:text-white">
                    {active.customerName}
                    {activeOrder && (
                      <span className="ml-1.5 font-semibold text-gray-500 dark:text-white/40">
                        — Order #{activeOrder.id.replace("DD-", "")} ({orderStatusLabel})
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-gray-400 dark:text-white/30">{active.customerPhone}</p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {active.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "shop" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                        m.sender === "shop"
                          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                          : "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-white/80"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 px-4 py-3 dark:border-white/10">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-gray-900 hover:text-gray-900 dark:border-white/15 dark:text-white/60 dark:hover:border-white dark:hover:text-white"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend(draft)}
                    placeholder="Type a message…"
                    className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#E31837] focus:ring-2 focus:ring-[#E31837]/20 dark:border-white/15 dark:bg-white/5 dark:text-white"
                  />
                  <button
                    onClick={() => handleSend(draft)}
                    disabled={!draft.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E31837] text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
