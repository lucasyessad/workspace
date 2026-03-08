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
      <h3 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
        <span className="w-1 h-5 bg-purple-500 rounded-full" />
        Analyse IA
        {isStreaming && (
          <span className="ml-2 flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: "300ms" }} />
          </span>
        )}
      </h3>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 prose prose-invert prose-sm max-w-none
        prose-headings:font-serif prose-headings:text-white
        prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-li:text-gray-300
        prose-strong:text-white
        prose-table:text-sm
        prose-th:text-left prose-th:text-indigo-300 prose-th:border-white/10 prose-th:p-2
        prose-td:border-white/10 prose-td:p-2
        prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1 prose-code:rounded
        prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
