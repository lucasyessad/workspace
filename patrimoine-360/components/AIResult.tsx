"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";

interface AIResultProps {
  content: string;
  isStreaming?: boolean;
}

export default function AIResult({ content, isStreaming }: AIResultProps) {
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <h3 className="text-heading font-serif text-[var(--color-text-primary)] section-marker">
        Analyse IA
        {isStreaming && (
          <span className="ml-2 flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" style={{ animationDelay: "300ms" }} />
          </span>
        )}
      </h3>
      <div className="surface-card p-6 prose prose-sm max-w-none
        dark:prose-invert
        prose-headings:font-serif prose-headings:text-[var(--color-text-primary)]
        prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
        prose-p:text-[var(--color-text-secondary)] prose-p:leading-relaxed
        prose-li:text-[var(--color-text-secondary)]
        prose-strong:text-[var(--color-text-primary)]
        prose-table:text-sm
        prose-th:text-left prose-th:text-gold-600 dark:prose-th:text-gold-400
        prose-code:text-gold-600 dark:prose-code:text-gold-400 prose-code:bg-gold-50 dark:prose-code:bg-gold-500/10 prose-code:px-1 prose-code:rounded
        prose-a:text-navy-500 dark:prose-a:text-gold-400 prose-a:no-underline hover:prose-a:underline
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
