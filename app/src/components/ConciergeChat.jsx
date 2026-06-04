import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "../lib/lang";
import { FLOW, LINE_URL, AI_ENDPOINT } from "../lib/conciergeFlow";
import { localChatReply } from "../lib/localChat";

const INPUT_PLACEHOLDER = {
  ja: "気になることをそのまま入力",
  en: "Type your question",
};
const AI_ERROR = {
  ja: "申し訳ありません\n一時的に応答できませんでした\n少し時間をおいて再度お試しください",
  en: "Sorry\nWe're unable to respond right now\nPlease try again in a moment",
};
const AI_BANNER = {
  ja: "自由入力にも対応しています",
  en: "Free-form questions welcome",
};

/**
 * TSC Concierge — a bilingual chat widget that lives in the lower-right
 * corner. Floating button → expanding glass panel. Conversation is driven
 * by a finite state machine in conciergeFlow.js; no LLM, no backend, no
 * tracking — just a curated luxury concierge.
 *
 *   • JP / EN toggle in the header (defaults to the page language).
 *   • Quick-reply chips advance through nodes or trigger side-effects
 *     (scroll to #apply, open LINE).
 *   • Typing indicator between user pick and bot reply for natural rhythm.
 *   • All copy multiline; bubbles use `whitespace-pre-line`.
 */

const HEADER_LABEL = { ja: "TSC コンシェルジュ", en: "TSC Concierge" };
const STATUS_LABEL = { ja: "Online", en: "Online" };
const CTA_LABEL    = { ja: "コンシェルジュに相談", en: "Talk to the concierge" };

export default function ConciergeChat({ show = true }) {
  const { lang: pageLang } = useLang();
  const [open, setOpen] = useState(false);
  const [chatLang, setChatLang] = useState(pageLang);
  const [messages, setMessages] = useState([]);
  const [nodeKey, setNodeKey] = useState("intro");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  // When the page language switches and the chat is closed, follow along.
  useEffect(() => {
    if (!open) setChatLang(pageLang);
  }, [pageLang, open]);

  // Seed the intro the first time the panel opens, and after a language flip.
  useEffect(() => {
    if (!open) return;
    setMessages([{ role: "bot", text: FLOW.intro.botText[chatLang] }]);
    setNodeKey("intro");
  }, [open, chatLang]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  // Free-text submit — routes through the Cloudflare Worker AI proxy.
  // Hidden when AI_ENDPOINT is empty (curated chips drive the whole flow).
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const text = draft.trim();
    if (!text || thinking) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setDraft("");
    setThinking(true);

    // When the Worker isn't deployed yet, answer locally. The visitor
    // gets a real-feeling reply immediately; once AI_ENDPOINT is set, the
    // remote AI takes over and falls back to localChat only on network
    // failures.
    const useRemote = !!AI_ENDPOINT;

    // Brief perceived-typing delay so even the local reply doesn't feel
    // robotic-instant.
    const pause = (ms) => new Promise((r) => window.setTimeout(r, ms));

    if (!useRemote) {
      await pause(550);
      const { reply } = localChatReply(text, chatLang);
      setMessages((m) => [...m, { role: "bot", text: reply }]);
      setThinking(false);
      return;
    }

    // Build the Anthropic-shaped history. Trim to the first user message
    // and map bot→assistant. Append the new user message we just enqueued.
    const history = messages.map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.text,
    }));
    const firstUser = history.findIndex((h) => h.role === "user");
    const trimmed = firstUser >= 0 ? history.slice(firstUser) : [];
    trimmed.push({ role: "user", content: text });

    try {
      const res = await fetch(`${AI_ENDPOINT.replace(/\/$/, "")}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: trimmed, lang: chatLang }),
      });
      if (!res.ok) throw new Error("upstream");
      const data = await res.json();
      const reply = (data && data.reply) || "";
      if (!reply) throw new Error("empty");
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    } catch {
      // Remote failed — gracefully fall back to the local responder.
      const { reply } = localChatReply(text, chatLang);
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    } finally {
      setThinking(false);
    }
  };

  const handleChip = (chip) => {
    const userText = chip.label[chatLang];
    setMessages((m) => [...m, { role: "user", text: userText }]);

    // Side-effect actions take precedence over node navigation.
    if (chip.action === "apply") {
      setThinking(true);
      window.setTimeout(() => {
        setMessages((m) => [...m, { role: "bot", text: (chip.confirm || {})[chatLang] || "" }]);
        setThinking(false);
        // Scroll the page to the application form.
        const apply = document.getElementById("apply");
        if (apply) apply.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600);
      return;
    }
    if (chip.action === "line") {
      setThinking(true);
      window.setTimeout(() => {
        if (LINE_URL) {
          window.open(LINE_URL, "_blank", "noopener,noreferrer");
        }
        setMessages((m) => [...m, { role: "bot", text: (chip.confirm || {})[chatLang] || "" }]);
        setThinking(false);
      }, 600);
      return;
    }

    // Default: advance to the next node.
    if (chip.next && FLOW[chip.next]) {
      setThinking(true);
      window.setTimeout(() => {
        setMessages((m) => [...m, { role: "bot", text: FLOW[chip.next].botText[chatLang] }]);
        setNodeKey(chip.next);
        setThinking(false);
      }, 800);
    }
  };

  const node = FLOW[nodeKey];

  return (
    <>
      {/* Floating CTA — shown when the chat is closed and the loader is done. */}
      <AnimatePresence>
        {show && !open && (
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            data-cursor
            data-cursor-label="Chat"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 right-5 z-[55] flex items-center gap-2.5 rounded-full border border-gold/45 bg-void/85 px-4 py-3 backdrop-blur-xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7),0_0_50px_-12px_rgba(216,184,106,0.45)] md:bottom-7 md:right-7 md:px-5 md:py-3.5"
            aria-label={CTA_LABEL[pageLang]}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-bright opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-bright" />
            </span>
            <span className="font-sans text-[0.76rem] tracking-[0.08em] text-gold-bright md:text-[0.82rem]">
              {CTA_LABEL[pageLang]}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded panel. */}
      <AnimatePresence>
        {show && open && (
          <motion.div
            role="dialog"
            aria-label={HEADER_LABEL[chatLang]}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 right-4 z-[55] flex max-h-[min(82vh,640px)] w-[min(94vw,400px)] flex-col overflow-hidden rounded-[24px] border border-white/15 bg-void/92 backdrop-blur-lg shadow-[0_60px_140px_-30px_rgba(0,0,0,0.85),0_0_60px_-20px_rgba(216,184,106,0.25)] md:bottom-7 md:right-7"
          >
            {/* Header */}
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-void" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </span>
                <div>
                  <div className="font-display text-base leading-tight text-ivory">
                    {HEADER_LABEL[chatLang]}
                  </div>
                  <div className="flex items-center gap-1.5 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ivory/45">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-bright" />
                    {STATUS_LABEL[chatLang]}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex overflow-hidden rounded-full border border-white/15">
                  <button
                    type="button"
                    onClick={() => setChatLang("ja")}
                    data-cursor
                    className={`px-2.5 py-1 font-sans text-[0.66rem] tracking-[0.18em] transition-colors duration-200 ${
                      chatLang === "ja"
                        ? "bg-gold/15 text-gold-bright"
                        : "text-ivory/40 hover:text-ivory"
                    }`}
                  >
                    JP
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatLang("en")}
                    data-cursor
                    className={`px-2.5 py-1 font-sans text-[0.66rem] tracking-[0.18em] transition-colors duration-200 ${
                      chatLang === "en"
                        ? "bg-gold/15 text-gold-bright"
                        : "text-ivory/40 hover:text-ivory"
                    }`}
                  >
                    EN
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  data-cursor
                  data-cursor-label="Close"
                  aria-label="Close concierge"
                  className="grid h-8 w-8 place-items-center rounded-full text-ivory/55 transition-colors duration-200 hover:text-ivory"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="m6 6 12 12M6 18 18 6" />
                  </svg>
                </button>
              </div>
            </header>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-5 py-5"
              style={{ scrollbarColor: "rgba(216,184,106,0.3) transparent" }}
            >
              {messages.map((m, i) => (
                <motion.div
                  key={`${i}-${m.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[0.9rem] leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-gold-bright/22 to-gold/8 text-ivory ring-1 ring-gold/25"
                        : "border border-white/10 bg-white/[0.04] text-ivory/92"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {thinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <span className="flex gap-1.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold/70" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold/70" style={{ animationDelay: "180ms" }} />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold/70" style={{ animationDelay: "360ms" }} />
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick replies */}
            {node && node.chips && !thinking && (
              <div className="border-t border-white/10 bg-void/40 px-4 pt-4">
                <div className="flex flex-wrap gap-2">
                  {node.chips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleChip(chip)}
                      data-cursor
                      data-cursor-label="Pick"
                      className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 font-sans text-[0.76rem] tracking-wide text-ivory/80 transition-all duration-200 hover:border-gold/45 hover:bg-gold/[0.06] hover:text-ivory"
                    >
                      {chip.label[chatLang]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Free-text input — always shown. When AI_ENDPOINT is empty
                the responder runs locally; when set, the remote AI is used
                and falls back locally on failure. */}
            {(
              <form
                onSubmit={handleSubmit}
                className="border-t border-white/10 bg-void/40 px-4 pb-4 pt-3"
              >
                <p className="mb-2 font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ivory/35">
                  {AI_BANNER[chatLang]}
                </p>
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] pl-4 pr-1.5 py-1.5 focus-within:border-gold/45">
                  <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={INPUT_PLACEHOLDER[chatLang]}
                    aria-label={INPUT_PLACEHOLDER[chatLang]}
                    disabled={thinking}
                    maxLength={400}
                    className="flex-1 bg-transparent font-sans text-[0.86rem] text-ivory placeholder:text-ivory/35 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || thinking}
                    data-cursor
                    data-cursor-label="Send"
                    aria-label="Send"
                    className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-gold-bright via-gold to-gold-deep text-void shadow-[0_4px_14px_-4px_rgba(216,184,106,0.6)] transition-opacity duration-200 disabled:opacity-30"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M2 21 23 12 2 3v7l15 2-15 2z" /></svg>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
