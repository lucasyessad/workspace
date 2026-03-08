"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Bot, User, Trash2, Sparkles } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { AppState } from "@/types";
import { modules } from "@/lib/modules";
import { calculate } from "@/lib/calculators";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function loadState(): AppState {
  try {
    const stored = localStorage.getItem("patrimoine360_state");
    if (stored) return JSON.parse(stored);
  } catch {}
  return { modules: {} };
}

function buildContext(appState: AppState): string {
  const parts: string[] = [];

  for (const mod of modules) {
    const ms = appState.modules[mod.id];
    if (!ms || !ms.formData || Object.keys(ms.formData).length === 0) continue;

    parts.push(`\n--- Module ${mod.id}: ${mod.title} ---`);
    for (const [key, value] of Object.entries(ms.formData)) {
      if (value !== "" && value !== undefined) {
        parts.push(`${key}: ${value}`);
      }
    }

    const calcs = calculate(mod.id, ms.formData);
    if (calcs) {
      parts.push("Résultats calculés:");
      for (const c of calcs) {
        parts.push(`  ${c.label}: ${c.value}${c.suffix ? ` ${c.suffix}` : ""}`);
      }
    }
  }

  return parts.length > 0 ? parts.join("\n") : "";
}

const suggestions = [
  "Puis-je acheter un appartement à 300 000 € ?",
  "Dois-je rembourser mes dettes ou investir ?",
  "Quel est mon risque de déficit à la retraite ?",
  "Comment optimiser ma fiscalité cette année ?",
  "Quelle stratégie pour mon excédent de trésorerie ?",
  "Mon fonds d'urgence est-il suffisant ?",
];

export default function CopilotePage() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [appState, setAppState] = useState<AppState>({ modules: {} });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setAppState(loadState());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const context = buildContext(appState);
    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        setMessages([...newMessages, { role: "assistant", content: `**Erreur**: ${err.error}` }]);
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let accumulated = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages([...newMessages, { role: "assistant", content: accumulated }]);
              }
            } catch {}
          }
        }
      }

      setMessages([...newMessages, { role: "assistant", content: accumulated }]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages([...newMessages, { role: "assistant", content: `**Erreur**: ${err.message}` }]);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming, appState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const filledModules = modules.filter(
    (m) => appState.modules[m.id]?.formData && Object.keys(appState.modules[m.id].formData).length > 0
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-white/[0.08] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-white transition">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-indigo-400" />
              <h1 className="text-lg font-serif font-bold text-white">Copilote Financier</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {filledModules.length > 0 && (
              <span className="text-xs text-gray-500">
                {filledModules.length} module(s) chargé(s)
              </span>
            )}
            <button
              onClick={() => setMessages([])}
              className="text-gray-500 hover:text-gray-300 transition"
              title="Effacer la conversation"
            >
              <Trash2 size={16} />
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <Sparkles className="mx-auto text-indigo-400 mb-4" size={32} />
              <h2 className="text-xl font-serif font-bold text-white mb-2">Pose ta question patrimoniale</h2>
              <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
                Le copilote analyse tes données (si tu as rempli des modules) et te fournit des recommandations personnalisées.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-left text-sm px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-gray-400 hover:border-indigo-500/30 hover:text-white transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-indigo-400" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-indigo-500/20 text-white"
                    : "bg-white/[0.03] border border-white/[0.08]"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || "..."}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-purple-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Le copilote réfléchit...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.08] px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose ta question patrimoniale..."
            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
