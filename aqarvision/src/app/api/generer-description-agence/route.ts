import { NextRequest, NextResponse } from "next/server";
import type { Locale } from "@/lib/i18n";

interface AgenceDescriptionRequest {
  points_cles: string;
  nom_agence: string;
  wilaya: string;
  commune: string;
  locale: Locale;
}

function genererDescriptionAgenceLocale(data: AgenceDescriptionRequest): string {
  const localisation = [data.commune, data.wilaya].filter(Boolean).join(", ");

  if (data.locale === "ar") {
    return `${data.nom_agence} — وكالة عقارية متخصصة${localisation ? ` في ${localisation}` : ""}.

${data.points_cles}

نرافقكم في جميع مشاريعكم العقارية: بيع، شراء، وإيجار. فريقنا المحترف في خدمتكم لتقديم أفضل الفرص العقارية.

تواصلوا معنا عبر واتساب أو قوموا بزيارة مكتبنا للاستفادة من استشارة مجانية.`;
  }

  if (data.locale === "en") {
    return `${data.nom_agence} — a professional real estate agency${localisation ? ` based in ${localisation}` : ""}.

${data.points_cles}

We support you in all your real estate projects: sales, purchases, and rentals. Our dedicated team is here to provide the best opportunities on the market.

Contact us via WhatsApp or visit our office for a free consultation.`;
  }

  return `${data.nom_agence} — agence immobilière professionnelle${localisation ? ` basée à ${localisation}` : ""}.

${data.points_cles}

Nous vous accompagnons dans tous vos projets immobiliers : vente, achat et location. Notre équipe dédiée est à votre service pour vous proposer les meilleures opportunités du marché.

Contactez-nous via WhatsApp ou rendez-nous visite pour une consultation gratuite.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: AgenceDescriptionRequest = await request.json();

    const locale = (["fr", "ar", "en"].includes(body.locale) ? body.locale : "fr") as Locale;
    body.locale = locale;

    const localisation = [body.commune, body.wilaya].filter(Boolean).join(", ");

    // Try OpenAI or Anthropic
    if (process.env.OPENAI_API_KEY) {
      const instructions: Record<Locale, string> = {
        fr: `Tu es un expert en marketing immobilier en Algérie. Génère une description professionnelle et accueillante en FRANÇAIS pour une agence immobilière.
- Nom : ${body.nom_agence}
- Localisation : ${localisation || "Non spécifiée"}
- Points clés : ${body.points_cles}
- 2-3 paragraphes courts, ton professionnel mais chaleureux
- Mets en avant l'expertise locale et la confiance
- Termine par une invitation à contacter l'agence
- Maximum 400 caractères`,
        ar: `أنت خبير في التسويق العقاري في الجزائر. أنشئ وصفاً احترافياً ومرحباً بالعربية لوكالة عقارية.
- الاسم: ${body.nom_agence}
- الموقع: ${localisation || "غير محدد"}
- النقاط الرئيسية: ${body.points_cles}
- 2-3 فقرات قصيرة، أسلوب مهني ولكن ودود
- أبرز الخبرة المحلية والثقة
- اختم بدعوة للتواصل
- بحد أقصى 400 حرف`,
        en: `You are a real estate marketing expert in Algeria. Generate a professional and welcoming description in ENGLISH for a real estate agency.
- Name: ${body.nom_agence}
- Location: ${localisation || "Not specified"}
- Key points: ${body.points_cles}
- 2-3 short paragraphs, professional but warm tone
- Highlight local expertise and trust
- End with an invitation to contact the agency
- Maximum 400 characters`,
      };

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Tu es un rédacteur marketing expert du marché immobilier algérien." },
              { role: "user", content: instructions[locale] },
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const description = data.choices?.[0]?.message?.content?.trim();
          if (description) {
            return NextResponse.json({ description, source: "ia" });
          }
        }
      } catch {
        // Fall through to template
      }
    }

    // Anthropic fallback
    if (process.env.ANTHROPIC_API_KEY) {
      const instructions: Record<Locale, string> = {
        fr: `Génère une description professionnelle en français pour l'agence immobilière "${body.nom_agence}"${localisation ? ` à ${localisation}` : ""}. Points clés : ${body.points_cles}. 2-3 paragraphes courts, max 400 caractères. Ton professionnel mais chaleureux.`,
        ar: `أنشئ وصفاً احترافياً بالعربية للوكالة العقارية "${body.nom_agence}"${localisation ? ` في ${localisation}` : ""}. النقاط: ${body.points_cles}. 2-3 فقرات قصيرة، 400 حرف كحد أقصى.`,
        en: `Generate a professional description in English for real estate agency "${body.nom_agence}"${localisation ? ` in ${localisation}` : ""}. Key points: ${body.points_cles}. 2-3 short paragraphs, max 400 chars. Professional but warm tone.`,
      };

      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 300,
            messages: [{ role: "user", content: instructions[locale] }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const description = data.content?.[0]?.text?.trim();
          if (description) {
            return NextResponse.json({ description, source: "ia" });
          }
        }
      } catch {
        // Fall through to template
      }
    }

    // Fallback template
    const description = genererDescriptionAgenceLocale(body);
    return NextResponse.json({ description, source: "template" });
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}
