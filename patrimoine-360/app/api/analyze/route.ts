import Anthropic from "@anthropic-ai/sdk";
import { getPromptConfig } from "@/lib/prompts";
import { apiSecurityCheck } from "@/lib/api-security";
import { sanitizeFormData } from "@/lib/sanitize";
import { logAuditEvent, AuditActions } from "@/lib/audit-log";
import { analyzeRequestSchema, formatZodErrors } from "@/lib/validation";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // === Security checks ===
    const security = await apiSecurityCheck(request, { quotaType: "analyze" });
    if (!security.allowed) {
      return Response.json(
        { error: security.error },
        { status: security.status, headers: security.headers }
      );
    }

    const body = await request.json();

    // === Validation Zod ===
    const validation = analyzeRequestSchema.safeParse(body);
    if (!validation.success) {
      const errors = formatZodErrors(validation.error);
      await logAuditEvent(AuditActions.SECURITY_INVALID_INPUT, { ip: security.ip, metadata: { reason: "validation", errors } });
      logger.warn("Entrée invalide pour analyse", "api.analyze", { errors });
      return Response.json({ error: `Données invalides: ${errors.join(", ")}` }, { status: 400 });
    }

    const { moduleId, formData } = validation.data;
    const sanitizedData = sanitizeFormData(formData);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return Response.json({ error: "ANTHROPIC_API_KEY non configurée. Ajoutez votre clé dans .env.local" }, { status: 500 });
    }

    const promptConfig = getPromptConfig(moduleId);
    if (!promptConfig) {
      return Response.json({ error: "Module non trouvé" }, { status: 404 });
    }

    // === Audit: log request ===
    await logAuditEvent(AuditActions.API_ANALYZE_REQUEST, {
      ip: security.ip,
      entityType: "module",
      entityId: String(moduleId),
      metadata: { userId: security.userId, fieldCount: Object.keys(sanitizedData).length },
    });

    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: promptConfig.system,
      messages: [
        { role: "user", content: promptConfig.buildUserPrompt(sanitizedData) },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          await logAuditEvent(AuditActions.API_ANALYZE_COMPLETE, {
            ip: security.ip,
            entityType: "module",
            entityId: String(moduleId),
          });
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
          controller.close();
          await logAuditEvent(AuditActions.API_ANALYZE_ERROR, {
            ip: security.ip,
            metadata: { error: String(err) },
          });
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-store",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    logger.error("Erreur analyse", "api.analyze", { error: String(err) });
    await logAuditEvent(AuditActions.API_ANALYZE_ERROR, { metadata: { error: String(err) } });
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
