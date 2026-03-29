import { useMemo, useState } from "react";
import api from "../api/client";

const QUICK_PROMPTS = [
  "How does bidding work?",
  "Show me trending auctions",
  "What are the live auctions right now?",
  "Explain payment after winning"
];

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([
    {
      role: "AI",
      text: "Welcome back. I can help with live auctions, bidding rules, payments, watchlists, and trending lots."
    }
  ]);

  const hasConversation = useMemo(() => log.length > 1, [log]);

  const ask = async (presetMessage) => {
    const userMsg = (presetMessage ?? message).trim();
    if (!userMsg || loading) return;

    setLog((prev) => [...prev, { role: "You", text: userMsg }]);
    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chatbot", { message: userMsg });
      setLog((prev) => [...prev, { role: "AI", text: data.reply }]);
    } catch (error) {
      const fallback =
        error?.response?.data?.message ||
        "I could not answer that right now. Please try again in a moment.";
      setLog((prev) => [...prev, { role: "AI", text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="group fixed bottom-4 right-4 z-50 sm:bottom-5 sm:right-5">
        <div className="pointer-events-none absolute -top-20 right-0 hidden w-72 translate-y-2 rounded-2xl border border-emerald-300/20 bg-slate-950/92 p-4 text-sm text-slate-100 opacity-0 shadow-[0_20px_60px_rgba(15,23,42,0.32)] backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/75">
            Auction concierge
          </p>
          <p className="mt-2 text-base font-medium text-white">
            Hello sir, how can I help you today?
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            I can guide you through bidding, trending lots, payments, and seller actions.
          </p>
          <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r border-emerald-300/20 bg-slate-950/92" />
        </div>

        <button
          className="relative overflow-hidden rounded-[22px] border border-emerald-300/25 bg-[linear-gradient(135deg,_rgba(16,185,129,0.96),_rgba(6,95,70,0.96))] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(5,150,105,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(5,150,105,0.45)]"
          onClick={() => setOpen(true)}
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_40%)]" />
          <span className="relative flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg">
              AI
            </span>
            <span className="text-left">
              <span className="block text-[11px] uppercase tracking-[0.28em] text-emerald-50/70">
                Live support
              </span>
              <span className="block text-base">Auction Chatbot</span>
            </span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 shadow-[0_24px_80px_rgba(15,23,42,0.42)] backdrop-blur sm:bottom-5 sm:left-auto sm:right-5 sm:w-[420px]">
      <div className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.28),_transparent_35%),linear-gradient(135deg,_rgba(6,78,59,0.95),_rgba(15,23,42,0.98))] p-5 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_40%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/75">
              Auction concierge
            </p>
            <div>
              <h4 className="text-xl font-semibold">Premium AI assistance</h4>
              <p className="mt-1 text-sm leading-6 text-emerald-50/80">
                Ask about live lots, bidding tactics, payments, or which listings are trending.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Close
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4 md:p-5">
        {!hasConversation && (
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => ask(prompt)}
                className="rounded-full border border-emerald-300/15 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 transition hover:border-emerald-300/35 hover:bg-emerald-500/15"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="h-[320px] space-y-3 overflow-y-auto rounded-[22px] border border-white/10 bg-slate-900/75 p-4">
          {log.map((item, idx) => (
            <div
              key={`${item.role}-${idx}`}
              className={`flex ${item.role === "You" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                  item.role === "You"
                    ? "bg-emerald-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-100"
                }`}
              >
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] opacity-70">
                  {item.role}
                </p>
                <p>{item.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] opacity-70">
                  AI
                </p>
                <p>Thinking through the best answer for you...</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/30"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                ask();
              }
            }}
            placeholder="Ask about auctions, bidding, or payments"
          />
          <button
            className="rounded-2xl bg-[linear-gradient(135deg,_rgba(16,185,129,0.96),_rgba(6,95,70,0.96))] px-5 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(5,150,105,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => ask()}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotWidget;
