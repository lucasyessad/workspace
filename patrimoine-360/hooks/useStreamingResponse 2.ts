"use client";
import { useState, useRef, useCallback } from "react";

interface UseStreamingResponseOptions {
  url: string;
  onComplete?: (text: string) => void;
  onError?: (error: string) => void;
}

interface UseStreamingResponseReturn {
  text: string;
  isStreaming: boolean;
  start: (body: Record<string, unknown>) => Promise<string>;
  abort: () => void;
}

/**
 * Hook centralisé pour les réponses SSE (Server-Sent Events).
 * Élimine la duplication entre la page module et le copilote.
 */
export function useStreamingResponse({ url, onComplete, onError }: UseStreamingResponseOptions): UseStreamingResponseReturn {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const start = useCallback(async (body: Record<string, unknown>): Promise<string> => {
    setIsStreaming(true);
    setText("");
    abortRef.current = new AbortController();

    let accumulated = "";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        const errorMsg = `**Erreur**: ${err.error || "Une erreur est survenue"}`;
        setText(errorMsg);
        onError?.(err.error || "Une erreur est survenue");
        setIsStreaming(false);
        return errorMsg;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setIsStreaming(false);
        return "";
      }

      const decoder = new TextDecoder();

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
                setText(accumulated);
              }
              if (parsed.error) {
                accumulated += `\n\n**Erreur**: ${parsed.error}`;
                setText(accumulated);
              }
            } catch {
              // Ligne SSE mal formée, ignorer
            }
          }
        }
      }

      onComplete?.(accumulated);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        const errorMsg = `**Erreur**: ${err.message}`;
        setText(errorMsg);
        onError?.(err.message);
        accumulated = errorMsg;
      }
    } finally {
      setIsStreaming(false);
    }

    return accumulated;
  }, [url, onComplete, onError]);

  return { text, isStreaming, start, abort };
}
