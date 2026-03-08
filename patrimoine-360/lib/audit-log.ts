/**
 * Audit logging — traçabilité des événements critiques.
 * Stocke côté serveur (Supabase si configuré) + logs console.
 * Côté client, utilise localStorage en fallback.
 */

import { getSupabase, getCurrentUser } from "./supabase";

export interface AuditEntry {
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  ip?: string;
  timestamp: string;
}

const STORAGE_KEY = "patrimoine360_audit_logs";
const MAX_LOCAL_ENTRIES = 200;

// === Server-side logging (API routes) ===

export async function logAuditEvent(
  action: string,
  options?: {
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
    ip?: string;
  }
): Promise<void> {
  const entry: AuditEntry = {
    action,
    entityType: options?.entityType,
    entityId: options?.entityId,
    metadata: options?.metadata,
    ip: options?.ip,
    timestamp: new Date().toISOString(),
  };

  // Console log (always)
  console.log(`[AUDIT] ${entry.action}`, {
    entity: entry.entityType,
    id: entry.entityId,
    ip: entry.ip,
    time: entry.timestamp,
  });

  // Supabase persistence (if configured)
  try {
    const client = getSupabase();
    if (client) {
      const user = await getCurrentUser();
      if (user) {
        await client.from("audit_logs").insert({
          user_id: user.id,
          action: entry.action,
          entity_type: entry.entityType,
          entity_id: entry.entityId,
          metadata: entry.metadata,
        });
      }
    }
  } catch {
    // Silent fail — audit should never break the app
  }
}

// === Client-side logging (browser) ===

export function logClientAudit(action: string, metadata?: Record<string, unknown>): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const entries: AuditEntry[] = stored ? JSON.parse(stored) : [];

    entries.push({
      action,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // Trim to max entries
    const trimmed = entries.slice(-MAX_LOCAL_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Silent fail
  }
}

// === Predefined audit actions ===

export const AuditActions = {
  // Auth
  AUTH_SIGN_IN: "auth.sign_in",
  AUTH_SIGN_UP: "auth.sign_up",
  AUTH_SIGN_OUT: "auth.sign_out",
  AUTH_FAILED: "auth.failed",

  // API
  API_ANALYZE_REQUEST: "api.analyze.request",
  API_ANALYZE_COMPLETE: "api.analyze.complete",
  API_ANALYZE_ERROR: "api.analyze.error",
  API_CHAT_REQUEST: "api.chat.request",
  API_CHAT_COMPLETE: "api.chat.complete",
  API_RATE_LIMITED: "api.rate_limited",

  // Security
  SECURITY_CORS_BLOCKED: "security.cors_blocked",
  SECURITY_PROMPT_INJECTION: "security.prompt_injection_detected",
  SECURITY_INVALID_INPUT: "security.invalid_input",
  SECURITY_AUTH_REQUIRED: "security.auth_required",

  // Data
  DATA_EXPORT_PDF: "data.export.pdf",
  DATA_EXPORT_EXCEL: "data.export.excel",
  DATA_SYNC_CLOUD: "data.sync.cloud",
  DATA_DELETE_MODULE: "data.delete.module",
  DATA_DELETE_ACCOUNT: "data.delete.account",

  // Objectives
  OBJECTIVE_CREATE: "objective.create",
  OBJECTIVE_COMPLETE: "objective.complete",
  OBJECTIVE_DELETE: "objective.delete",
} as const;
