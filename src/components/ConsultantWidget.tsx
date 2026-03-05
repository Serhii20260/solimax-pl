import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../lib/LanguageContext";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
};

type ConsultantWidgetProps = {
  open: boolean;
  onClose: () => void;
};

export default function ConsultantWidget({ open, onClose }: ConsultantWidgetProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState<string | null>(null);
  const [lastUsedLlm, setLastUsedLlm] = useState<boolean | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [cta, setCta] = useState<"calculator" | "lead" | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const { language, t } = useLanguage();

  const resetState = () => {
    setQuestion("");
    setLoading(false);
    setMessages([]);
    setError(null);
    setStatusInfo(null);
    setLastUsedLlm(null);
    setFollowUps([]);
    setCta(null);
  };

  useEffect(() => {
    if (!open) {
      resetState();
    } else {
      sessionIdRef.current = crypto.randomUUID();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSend = async () => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    const loadingMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: t.sending,
      loading: true,
    };

    setLoading(true);
    setError(null);
    setStatusInfo(null);
    setQuestion("");
    setMessages((prev) => [...prev, newUserMessage, loadingMessage]);
    try {
      const devBaseUrl = "http://127.0.0.1:4000";
      const configuredBaseUrl = import.meta.env.VITE_API_BASE?.trim();
      const baseUrl = import.meta.env.DEV ? devBaseUrl : configuredBaseUrl;
      const endpoint = baseUrl ? `${baseUrl}/api/consultant/ask` : "/api/consultant/ask";
      const history = messages
        .filter((item) => !item.loading)
        .slice(-12)
        .map(({ role, content }) => ({ role, content }));
      const payload: {
        question: string;
        language: string;
        history?: { role: "user" | "assistant"; content: string }[];
        sessionId?: string;
      } = {
        question: trimmed,
        language,
        sessionId: sessionIdRef.current,
      };
      if (history.length > 0) {
        payload.history = history;
      }
      const body = JSON.stringify(payload);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
        },
        body: new TextEncoder().encode(body),
      });

      if (!res.ok) {
        setStatusInfo(`HTTP ${res.status}`);
        const raw = await res.text();
        if (raw) {
          setError(raw);
        }
        throw new Error("REQUEST_FAILED");
      }
      const data = (await res.json()) as {
        answer_text?: string;
        missing_questions?: string[];
        cta?: "none" | "calculator" | "lead";
        meta?: { usedLLM?: boolean; language?: string };
      };
      const answerText = data.answer_text?.trim() || "";
      if (typeof data.meta?.usedLLM === "boolean") {
        setLastUsedLlm(data.meta.usedLLM);
      }
      setFollowUps(Array.isArray(data.missing_questions) ? data.missing_questions : []);
      setCta(data.cta && data.cta !== "none" ? data.cta : null);
      if (!answerText) {
        setError(t.noResponse);
        setMessages((prev) => prev.filter((item) => item.id !== loadingMessage.id));
        return;
      }
      setMessages((prev) =>
        prev.map((item) =>
          item.id === loadingMessage.id
            ? { ...item, loading: false, content: answerText }
            : item
        )
      );
    } catch {
      setError((prev) => prev ?? t.connectionError);
      setMessages((prev) => prev.filter((item) => item.id !== loadingMessage.id));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const hasMessages = messages.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/20 p-4" onClick={handleClose}>
      <div
        className="w-80 max-w-[85vw] rounded-2xl border border-slate-200 bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">{t.consultant}</div>
            {import.meta.env.DEV && lastUsedLlm !== null ? (
              <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                LLM: {lastUsedLlm ? "ON" : "OFF"}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
          >
            {t.close}
          </button>
        </div>

        <div className="flex max-h-[70vh] flex-col gap-3 px-4 py-3 text-sm text-slate-700">
          <div
            ref={messagesRef}
            className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3"
          >
            {hasMessages ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      message.role === "user"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-900 border border-slate-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500">{t.askQuestion}</div>
            )}
          </div>

          <textarea
            className="w-full min-h-[96px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            placeholder={t.placeholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !question.trim()}
            className={`w-full rounded-xl px-4 py-2 text-sm font-semibold ${
              loading || !question.trim()
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {loading ? t.sending : t.send}
          </button>

          {error ? (
            <div className="space-y-1">
              <div className="text-xs text-rose-600">{error}</div>
              {statusInfo ? <div className="text-[11px] text-slate-500">{statusInfo}</div> : null}
            </div>
          ) : null}

          {followUps.length > 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
              <div className="mb-2 text-[11px] font-semibold uppercase text-slate-500">
                {t.followUps}
              </div>
              <ul className="list-disc space-y-1 pl-4">
                {followUps.map((item, index) => (
                  <li key={`${index}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {cta ? (
            <div className="flex gap-2">
              {cta === "calculator" ? (
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                >
                  {t.calculator}
                </button>
              ) : null}
              {cta === "lead" ? (
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  {t.leaveRequest}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
