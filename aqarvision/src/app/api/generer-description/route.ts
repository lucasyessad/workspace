import { NextRequest, NextResponse } from "next/server";
import type { Locale } from "@/lib/i18n";

/** Structure des données pour la génération IA */
interface GenerationIARequest {
  points_cles: string;
  type_bien: string;
  type_transaction: string;
  surface: string;
  prix: string;
  commune: string;
  wilaya: string;
  statut_document: string;
  nb_pieces: string;
  etage: string;
  ascenseur: boolean;
  citerne: boolean;
  garage: boolean;
  jardin: boolean;
  locale: Locale;
}

/** Construire le prompt de génération selon la locale */
function buildPrompt(data: GenerationIARequest): string {
  const equipements: string[] = [];
  if (data.ascenseur) equipements.push("ascenseur");
  if (data.citerne) equipements.push("citerne/réservoir d'eau");
  if (data.garage) equipements.push("garage");
  if (data.jardin) equipements.push("jardin");

  const localisation = [data.commune, data.wilaya].filter(Boolean).join(", ");

  const contexte = `
Type de bien : ${data.type_bien || "Non spécifié"}
Transaction : ${data.type_transaction}
Surface : ${data.surface} m²
Prix : ${data.prix} DA
Localisation : ${localisation || "Non spécifiée"}
Document : ${data.statut_document}
${data.nb_pieces ? `Nombre de pièces : ${data.nb_pieces}` : ""}
${data.etage ? `Étage : ${data.etage}` : ""}
${equipements.length > 0 ? `Équipements : ${equipements.join(", ")}` : ""}

Points clés mentionnés par l'agent :
${data.points_cles}
`.trim();

  const instructions: Record<Locale, string> = {
    fr: `Tu es un expert en rédaction d'annonces immobilières en Algérie.
Génère une description professionnelle et séduisante en FRANÇAIS pour cette annonce.
- Mets en avant la sécurité juridique (type de document : ${data.statut_document})
- Souligne le confort moderne et les équipements
- Mentionne l'emplacement stratégique si applicable
- Utilise un ton professionnel mais chaleureux
- Format : 3-4 paragraphes courts, adaptés au mobile
- N'invente pas de caractéristiques non mentionnées
- Termine par un appel à l'action`,

    ar: `أنت خبير في كتابة إعلانات عقارية في الجزائر.
أنشئ وصفاً احترافياً وجذاباً بالعربية الفصحى لهذا الإعلان.
- أبرز الأمان القانوني (نوع الوثيقة: ${data.statut_document})
- سلّط الضوء على الراحة العصرية والتجهيزات
- اذكر الموقع الاستراتيجي إن أمكن
- استخدم أسلوباً مهنياً ولكن ودوداً
- الصيغة: 3-4 فقرات قصيرة، ملائمة للهاتف المحمول
- لا تخترع خصائص لم تُذكر
- اختم بدعوة للتواصل`,

    en: `You are an expert in writing real estate listings for the Algerian market.
Generate a professional and appealing description in ENGLISH for this listing.
- Highlight legal security (document type: ${data.statut_document})
- Emphasize modern comfort and amenities
- Mention strategic location if applicable
- Use a professional but warm tone
- Format: 3-4 short paragraphs, mobile-friendly
- Do not invent characteristics not mentioned
- End with a call to action targeting diaspora investors`,
  };

  return `${instructions[data.locale]}\n\nDétails du bien :\n${contexte}`;
}

/** Générer la description localement (template avancé) sans API externe */
function genererDescriptionLocale(data: GenerationIARequest): string {
  const equipements: string[] = [];
  if (data.ascenseur) equipements.push(data.locale === "ar" ? "مصعد" : data.locale === "en" ? "elevator" : "ascenseur");
  if (data.citerne) equipements.push(data.locale === "ar" ? "خزان مياه" : data.locale === "en" ? "water tank" : "citerne/réservoir");
  if (data.garage) equipements.push(data.locale === "ar" ? "مرآب" : data.locale === "en" ? "garage" : "garage");
  if (data.jardin) equipements.push(data.locale === "ar" ? "حديقة" : data.locale === "en" ? "garden" : "jardin");

  const localisation = [data.commune, data.wilaya].filter(Boolean).join(", ");
  const etageTexte = data.etage
    ? data.locale === "ar"
      ? `الطابق ${data.etage}`
      : data.locale === "en"
      ? `Floor ${data.etage}`
      : data.etage === "0"
      ? "Rez-de-chaussée"
      : `${data.etage}e étage`
    : "";

  if (data.locale === "ar") {
    return `${data.type_bien || "عقار"} ${data.type_transaction === "Location" ? "للإيجار" : data.type_transaction === "Location vacances" ? "للإيجار الموسمي" : "للبيع"}${localisation ? ` في ${localisation}` : ""}.

${data.points_cles}

عقار موثق بـ "${data.statut_document}" - ضمان الأمان القانوني لاستثماركم.
المساحة: ${data.surface} م² ${data.nb_pieces ? `| ${data.nb_pieces} غرف` : ""} ${etageTexte ? `| ${etageTexte}` : ""}
${equipements.length > 0 ? `التجهيزات: ${equipements.join("، ")}` : ""}

السعر: ${new Intl.NumberFormat("ar-DZ").format(Number(data.prix))} د.ج

للمزيد من المعلومات أو لترتيب زيارة، تواصلوا معنا عبر واتساب أو اتصلوا بنا مباشرة. فرصة لا تُفوّت!`;
  }

  if (data.locale === "en") {
    return `${data.type_bien || "Property"} ${data.type_transaction === "Location" ? "for rent" : data.type_transaction === "Location vacances" ? "for vacation rental" : "for sale"}${localisation ? ` in ${localisation}` : ""}.

${data.points_cles}

Legally secured property with "${data.statut_document}" documentation — ensuring complete legal protection for your investment.
Area: ${data.surface} m² ${data.nb_pieces ? `| ${data.nb_pieces} rooms` : ""} ${etageTexte ? `| ${etageTexte}` : ""}
${equipements.length > 0 ? `Amenities: ${equipements.join(", ")}` : ""}

Price: ${new Intl.NumberFormat("en-DZ").format(Number(data.prix))} DZD

Contact us via WhatsApp or call directly for more information or to schedule a viewing. An opportunity not to be missed!`;
  }

  // Français par défaut
  return `${data.type_bien || "Bien"} ${data.type_transaction === "Location" ? "à louer" : data.type_transaction === "Location vacances" ? "en location vacances" : "à vendre"}${localisation ? ` à ${localisation}` : ""}.

${data.points_cles}

Bien sécurisé par "${data.statut_document}" — une garantie juridique solide pour votre investissement.
Surface : ${data.surface} m² ${data.nb_pieces ? `| ${data.nb_pieces} pièces` : ""} ${etageTexte ? `| ${etageTexte}` : ""}
${equipements.length > 0 ? `Équipements : ${equipements.join(", ")}` : ""}

Prix : ${new Intl.NumberFormat("fr-DZ").format(Number(data.prix))} DA

Pour plus d'informations ou pour organiser une visite, contactez-nous via WhatsApp ou appelez-nous directement. Une opportunité à ne pas manquer !`;
}

/** Route API : Génération de description IA trilingue */
export async function POST(request: NextRequest) {
  try {
    const body: GenerationIARequest = await request.json();

    if (!body.points_cles?.trim()) {
      return NextResponse.json(
        { erreur: "Les points clés sont requis" },
        { status: 400 }
      );
    }

    // Valider la locale
    const locale = (["fr", "ar", "en"].includes(body.locale) ? body.locale : "fr") as Locale;
    body.locale = locale;

    // Vérifier si une clé API OpenAI/Anthropic est configurée
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (apiKey && process.env.OPENAI_API_KEY) {
      // Utiliser OpenAI si disponible
      const prompt = buildPrompt(body);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Tu es un rédacteur immobilier expert du marché algérien.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 500,
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
    }

    // Essayer Anthropic si disponible
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const prompt = buildPrompt(body);
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 500,
            messages: [{ role: "user", content: prompt }],
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

    // Fallback : génération locale avancée (template intelligent)
    const description = genererDescriptionLocale(body);
    return NextResponse.json({ description, source: "template" });
  } catch {
    return NextResponse.json(
      { erreur: "Erreur lors de la génération" },
      { status: 500 }
    );
  }
}
