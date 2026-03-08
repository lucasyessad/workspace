import { getSupabase, getCurrentUser } from "@/lib/supabase";
import { logAuditEvent, AuditActions } from "@/lib/audit-log";
import { apiSecurityCheck } from "@/lib/api-security";
import { verifyCsrfToken } from "@/lib/csrf";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * GET /api/account/export
 * Exporte toutes les données utilisateur (RGPD droit à la portabilité).
 * Protégé par CSRF + authentification.
 */
export async function GET(request: Request) {
  try {
    if (!verifyCsrfToken(request)) {
      logger.warn("Tentative d'export sans token CSRF", "api.account.export");
      return Response.json({ error: "Token CSRF invalide" }, { status: 403 });
    }

    const security = await apiSecurityCheck(request, { requireAuth: true });
    if (!security.allowed) {
      return Response.json({ error: security.error }, { status: security.status });
    }

    const client = getSupabase();
    if (!client) {
      return Response.json({ error: "Service non disponible" }, { status: 503 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Authentification requise" }, { status: 401 });
    }

    const exportData: Record<string, unknown> = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      email: user.email,
    };

    const tables = [
      "user_profiles", "user_module_data", "user_module_results", "ai_analyses",
      "onboarding_sessions", "user_objectives", "copilot_conversations", "reminders", "user_data",
    ];

    for (const table of tables) {
      const { data, error } = await client.from(table).select("*").eq("user_id", user.id);
      if (!error && data) {
        exportData[table] = data;
      }
    }

    await logAuditEvent(AuditActions.DATA_EXPORT_PDF, {
      ip: security.ip,
      metadata: { userId: user.id, format: "json" },
    });

    logger.info("Export de données", "api.account.export", { userId: user.id });

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="patrimoine360-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    logger.error("Erreur export données", "api.account.export", { error: String(err) });
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
