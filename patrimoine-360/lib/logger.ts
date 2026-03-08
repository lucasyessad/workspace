/**
 * Journalisation structurée.
 * Fournit des logs JSON formatés pour l'observabilité.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  env: string;
}

const ENV = process.env.NODE_ENV || "development";
const IS_DEV = ENV === "development";

function formatLog(entry: LogEntry): string {
  if (IS_DEV) {
    const prefix = { debug: "🔍", info: "ℹ️", warn: "⚠️", error: "❌" }[entry.level];
    const ctx = entry.context ? `[${entry.context}]` : "";
    return `${prefix} ${ctx} ${entry.message}`;
  }
  return JSON.stringify(entry);
}

function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
    env: ENV,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "debug":
      if (IS_DEV) console.debug(formatted, data || "");
      break;
    case "info":
      console.info(formatted, IS_DEV ? (data || "") : "");
      break;
    case "warn":
      console.warn(formatted, IS_DEV ? (data || "") : "");
      break;
    case "error":
      console.error(formatted, IS_DEV ? (data || "") : "");
      break;
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: Record<string, unknown>) => log("debug", message, context, data),
  info: (message: string, context?: string, data?: Record<string, unknown>) => log("info", message, context, data),
  warn: (message: string, context?: string, data?: Record<string, unknown>) => log("warn", message, context, data),
  error: (message: string, context?: string, data?: Record<string, unknown>) => log("error", message, context, data),
};
