import { getSupabase, getCurrentUser } from "@/lib/supabase";
import { logAuditEvent, AuditActions } from "@/lib/audit-log";
import { apiSecurityCheck } from "@/lib/api-security";

export const runtime = "nodejs";

/**
 * GET /api/account/export
 * Exporte toutes les données utilisateur (RGPD droit à la portabilité).
 */
export async function GET(request: Request) {
  try {
    const security = await apiSecurityCheck(request);
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

    // Collect all user data
    const exportData: Record<string, unknown> = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      email: user.email,
    };

    const tables = [
      "user_profiles",
      "user_module_data",
      "user_module_results",
      "ai_analyses",
      "onboarding_sessions",
      "user_objectives",
      "copilot_conversations",
      "reminders",
      "user_data",
    ];

    for (const table of tables) {
      const { data, error } = await client
        .from(table)
        .select("*")
        .eq("user_id", user.id);

      if (!error && data) {
        exportData[table] = data;
      }
    }

    await logAuditEvent(AuditActions.DATA_EXPORT_PDF, {
      ip: security.ip,
      metadata: { userId: user.id, format: "json" },
    });

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="patrimoine360-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
