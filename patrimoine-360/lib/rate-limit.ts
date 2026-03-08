/**
 * Limitation de débit avec persistance fichier.
 * Utilise la mémoire en runtime, avec nettoyage périodique.
 * Pour la production, remplacer par Redis/base de données.
 */

import { logger } from "./logger";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const requestCounts = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

// Persistance fichier pour survivre aux redémarrages à chaud (dev)
let persistPath: string | null = null;

function initPersistence() {
  if (persistPath !== null) return;
  try {
    const os = require("os");
    const path = require("path");
    persistPath = path.join(os.tmpdir(), "p360-rate-limits.json");

    const fs = require("fs");
    if (fs.existsSync(persistPath)) {
      const data = JSON.parse(fs.readFileSync(persistPath, "utf-8"));
      const now = Date.now();
      for (const [key, entry] of Object.entries(data)) {
        const e = entry as RateLimitEntry;
        if (e.resetAt > now) {
          requestCounts.set(key, e);
        }
      }
      logger.debug(`Limites de débit restaurées: ${requestCounts.size} entrées`, "rate-limit");
    }
  } catch {
    persistPath = "";
  }
}

function persist() {
  if (!persistPath) return;
  try {
    const fs = require("fs");
    const obj: Record<string, RateLimitEntry> = {};
    for (const [key, value] of requestCounts) {
      obj[key] = value;
    }
    fs.writeFileSync(persistPath, JSON.stringify(obj));
  } catch {
    // Échec silencieux
  }
}

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
  initPersistence();
  const now = Date.now();
  const entry = requestCounts.get(identifier);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    persist();
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  persist();
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetIn: entry.resetAt - now };
}

// Nettoyage périodique
if (typeof setInterval !== "undefined" && typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts) {
      if (now > value.resetAt) {
        requestCounts.delete(key);
      }
    }
    persist();
  }, 60 * 1000).unref();
}
