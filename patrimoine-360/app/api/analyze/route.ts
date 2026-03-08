import Anthropic from "@anthropic-ai/sdk";
import { getPromptConfig } from "@/lib/prompts";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return Response.json(
        { error: `Trop de requêtes. Réessayez dans ${Math.ceil(rateCheck.resetIn / 1000)} secondes.` },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000)) } }
      );
    }

    const { moduleId, formData } = await request.json();

    if (!moduleId || !formData) {
      return Response.json({ error: "moduleId et formData sont requis" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return Response.json({ error: "ANTHROPIC_API_KEY non configurée. Ajoutez votre clé dans .env.local" }, { status: 500 });
    }

    const promptConfig = getPromptConfig(moduleId);
    if (!promptConfig) {
      return Response.json({ error: "Module non trouvé" }, { status: 404 });
    }

    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: promptConfig.system,
      messages: [
        { role: "user", content: promptConfig.buildUserPrompt(formData) },
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
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
