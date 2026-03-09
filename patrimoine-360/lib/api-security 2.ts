/**
 * Security utilities for API routes.
 * Centralizes auth validation, rate limiting, and audit logging.
 */

import { getSupabase } from "./supabase";
import { checkRateLimit } from "./rate-limit";
import { logAuditEvent, AuditActions } from "./audit-log";

interface SecurityCheckResult {
  allowed: boolean;
  error?: string;
  status?: number;
  userId?: string;
  ip: string;
  headers?: Record<string, string>;
}

/** Per-user quota tracking (authenticated users) */
const userQuotas = new Map<string, { count: number; resetAt: number }>();

const USER_QUOTA_WINDOW = 60 * 60 * 1000; // 1 hour
const USER_QUOTA_MAX_ANALYZE = 30; // 30 analyses per hour
const USER_QUOTA_MAX_CHAT = 50; // 50 chat messages per hour

function checkUserQuota(userId: string, max: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = `${userId}`;
  const entry = userQuotas.get(key);

  if (!entry || now > entry.resetAt) {
    userQuotas.set(key, { count: 1, resetAt: now + USER_QUOTA_WINDOW });
    return { allowed: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count };
}

/**
 * Full security check for API routes.
 * Checks: IP rate limit, optional auth, user quota.
 */
export async function apiSecurityCheck(
  request: Request,
  options: {
    requireAuth?: boolean;
    quotaType?: "analyze" | "chat";
  } = {}
): Promise<SecurityCheckResult> {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";

  // 1. IP rate limiting
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    await logAuditEvent(AuditActions.API_RATE_LIMITED, { ip, metadata: { remaining: 0 } });
    return {
      allowed: false,
      error: `Trop de requêtes. Réessayez dans ${Math.ceil(rateCheck.resetIn / 1000)} secondes.`,
      status: 429,
      ip,
      headers: { "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000)) },
    };
  }

  // 2. Auth check (optional or required)
  let userId: string | undefined;
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const client = getSupabase();
      if (client) {
        const { data } = await client.auth.getUser(token);
        if (data.user) {
          userId = data.user.id;
        }
      }
    } catch {
      // Token invalid, continue as anonymous
    }
  }

  if (options.requireAuth && !userId) {
    await logAuditEvent(AuditActions.SECURITY_AUTH_REQUIRED, { ip });
    return {
      allowed: false,
      error: "Authentification requise.",
      status: 401,
      ip,
    };
  }

  // 3. User quota (if authenticated)
  if (userId && options.quotaType) {
    const max = options.quotaType === "analyze" ? USER_QUOTA_MAX_ANALYZE : USER_QUOTA_MAX_CHAT;
    const quotaCheck = checkUserQuota(userId, max);
    if (!quotaCheck.allowed) {
      await logAuditEvent(AuditActions.API_RATE_LIMITED, {
        ip,
        metadata: { userId, quotaType: options.quotaType },
      });
      return {
        allowed: false,
        error: `Quota horaire atteint (${max} ${options.quotaType === "analyze" ? "analyses" : "messages"}/heure). Réessayez plus tard.`,
        status: 429,
        ip,
        userId,
      };
    }
  }

  return { allowed: true, ip, userId };
}

/**
 * Validate request body size to prevent abuse.
 */
export function validateBodySize(body: string, maxBytes: number = 100_000): boolean {
  return new TextEncoder().encode(body).length <= maxBytes;
}
