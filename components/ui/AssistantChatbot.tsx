"use client";

import { FormEvent, useMemo, useState } from "react";

type ChatRole = "assistant" | "user";
type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi, I am your Horizon financial and goal assistant. Ask me about SIPs, emergency funds, retirement, debt payoff, or monthly budgeting.",
};

const QUICK_PROMPTS = [
  "What SIP should I consider?",
  "How much emergency fund do I need?",
  "How should I split goals?",
];

const CANNED_RESPONSES: Array<{ keywords: string[]; reply: string }> = [
  {
    keywords: ["sip", "mutual fund", "mf"],
    reply:
      "For SIPs, a simple starting mix is: 60% broad index equity fund, 20% flexi-cap, and 20% short-duration debt fund. Increase SIP amount by 10% every year and review once every 6 months.",
  },
  {
    keywords: ["emergency", "buffer", "rainy day"],
    reply:
      "Target an emergency fund of 6 months of expenses in a liquid or overnight fund. If your income is variable, keep 9-12 months instead.",
  },
  {
    keywords: ["retirement", "retire", "pension"],
    reply:
      "For retirement planning, try the 50/30/20 rule first, then route the 20% toward long-horizon equity-heavy assets. Rebalance annually toward safer assets as retirement nears.",
  },
  {
    keywords: ["debt", "loan", "emi", "credit card"],
    reply:
      "Pay high-interest debt first (credit card and personal loan). Keep investing minimum SIPs while aggressively prepaying debt above 12% interest.",
  },
  {
    keywords: ["goal", "house", "wedding", "education", "vacation"],
    reply:
      "Split goals by time horizon: under 3 years in debt/liquid funds, 3-7 years in balanced allocation, and over 7 years in equity-heavy allocation.",
  },
  {
    keywords: ["budget", "expense", "saving", "salary"],
    reply:
      "A practical monthly budget baseline is: needs 55%, wants 25%, investments 20%. If possible, automate investments right after salary credit.",
  },
];

function getAssistantReply(message: string): string {
  const normalized = message.trim().toLowerCase();
  if (!normalized) {
    return "Share your question and I will suggest a quick financial action plan.";
  }

  const match = CANNED_RESPONSES.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  );
  if (match) return match.reply;

  return "I am a frontend demo assistant right now, so I respond with preloaded guidance. Try asking about SIP, emergency fund, retirement, debt, goals, or budgeting.";
}

export function AssistantChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);

  const displayedMessages = useMemo(() => messages.slice(-10), [messages]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    const assistantMessage: ChatMessage = {
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: "assistant",
      text: getAssistantReply(trimmed),
    };
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-4 z-50 sm:bottom-7 sm:right-7">
      {open && (
        <section className="mb-4 w-[min(94vw,420px)] rounded-2xl border-2 border-[var(--color-cyan-dim)] bg-[var(--color-panel)] text-black shadow-xl">
          <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-edge)] bg-[var(--color-grid)]/60 rounded-t-2xl">
            <div>
              <p className="text-base font-semibold text-black">
                Horizon Assistant
              </p>
              <p className="text-xs text-black">
                Ask anything about your finances and goals
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 place-items-center rounded-full text-black hover:bg-[var(--color-grid)]"
              aria-label="Close assistant"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="max-h-[360px] space-y-2.5 overflow-y-auto px-3.5 py-3.5">
            {displayedMessages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-snug ${
                  message.role === "assistant"
                    ? "bg-[var(--color-grid)] text-[var(--color-ink)] border border-[var(--color-edge)]"
                    : "ml-auto bg-[var(--color-lavender-soft)] text-[var(--color-ink)] border border-[var(--color-edge)]"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="px-3.5 pb-2.5 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-[var(--color-edge)] px-2.5 py-1 text-[11px] font-medium text-black hover:bg-[var(--color-grid)]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 p-3.5 pt-2.5">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask your finance question..."
              className="h-10 flex-1 rounded-xl border border-[var(--color-edge)] bg-[var(--color-base)] px-3 text-sm text-black outline-none focus:border-[var(--color-cyan-dim)]"
            />
            <button
              type="submit"
              className="h-10 rounded-xl bg-[var(--color-cyan-dim)] px-4 text-sm font-semibold text-white hover:opacity-90"
            >
              Send
            </button>
          </form>
        </section>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="group relative flex h-14 items-center gap-2.5 rounded-full border-2 border-[var(--color-cyan-dim)] bg-[var(--color-panel)] px-5 text-base font-semibold text-black shadow-lg hover:bg-[var(--color-grid)]"
        aria-label={open ? "Hide assistant" : "Open assistant"}
      >
        <ChatIcon />
        <span>AI Assistant</span>
      </button>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 10h8M8 14h5" />
      <path d="M5 19V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}
