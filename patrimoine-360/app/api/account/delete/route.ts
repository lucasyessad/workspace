import { getSupabase, getCurrentUser } from "@/lib/supabase";
import { logAuditEvent, AuditActions } from "@/lib/audit-log";
import { apiSecurityCheck } from "@/lib/api-security";
import { verifyCsrfToken } from "@/lib/csrf";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

/**
 * DELETE /api/account/delete
 * Supprime toutes les données utilisateur (RGPD droit de suppression).
 * Protégé par CSRF + authentification.
 */
export async function DELETE(request: Request) {
  try {
    if (!verifyCsrfToken(request)) {
      logger.warn("Tentative de suppression sans token CSRF", "api.account.delete");
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

    const tables = [
      "user_profiles", "user_module_data", "user_module_results", "ai_analyses",
      "onboarding_sessions", "exports", "subscriptions", "user_objectives",
      "copilot_conversations", "reminders", "audit_logs", "user_data",
    ];

    const errors: string[] = [];
    for (const table of tables) {
      const { error } = await client.from(table).delete().eq("user_id", user.id);
      if (error && !error.message.includes("does not exist")) {
        errors.push(`${table}: ${error.message}`);
        logger.error(`Échec suppression table ${table}`, "api.account.delete", { userId: user.id, error: error.message });
      }
    }

    await logAuditEvent(AuditActions.DATA_DELETE_ACCOUNT, {
      ip: security.ip,
      metadata: { userId: user.id, tablesCleared: tables.length, errors: errors.length },
    });

    logger.info("Compte supprimé", "api.account.delete", { userId: user.id, errors: errors.length });

    if (errors.length > 0) {
      return Response.json({ message: "Suppression partielle. Certaines tables ont échoué.", errors }, { status: 207 });
    }

    return Response.json({ message: "Toutes vos données ont été supprimées. Votre compte sera désactivé sous 30 jours." });
  } catch (err) {
    logger.error("Erreur suppression compte", "api.account.delete", { error: String(err) });
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
