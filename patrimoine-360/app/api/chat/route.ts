import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Tu es un copilote financier intelligent pour Patrimoine 360°.

Tu aides les utilisateurs à comprendre leur situation patrimoniale et à prendre des décisions éclairées.

Règles importantes :
- Tu es pédagogue, clair et rigoureux.
- Tu ne dois jamais inventer de données. Si l'utilisateur n'a pas fourni une information, demande-la.
- Tu distingues clairement les hypothèses des certitudes.
- Tu priorises tes recommandations.
- Tu restes prudent : tu es un outil d'aide à la décision, pas un substitut à un conseil professionnel.
- Tu réponds toujours en français.
- Tu structures tes réponses avec des paragraphes clairs.
- Si l'utilisateur fournit des données patrimoniales dans le contexte, utilise-les pour personnaliser tes réponses.

Tu peux répondre à des questions comme :
- Puis-je acheter un bien immobilier ?
- Dois-je rembourser mes dettes ou investir ?
- Quel est mon risque à la retraite ?
- Comment optimiser ma fiscalité ?
- Quelle stratégie patrimoniale pour ma situation ?`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: Request) {
  try {
    const { messages, context } = await request.json() as {
      messages: ChatMessage[];
      context?: string;
    };

    if (!messages || messages.length === 0) {
      return Response.json({ error: "Messages requis" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return Response.json({ error: "ANTHROPIC_API_KEY non configurée" }, { status: 500 });
    }

    let systemPrompt = SYSTEM_PROMPT;
    if (context) {
      systemPrompt += `\n\nContexte patrimonial de l'utilisateur :\n${context}`;
    }

    const client = new Anthropic({ apiKey });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
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
