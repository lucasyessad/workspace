// ============================================================
// TabibPro — Traducteur Darija Algérien
// Claude comprend nativement le darija algérien
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { DarijaTranslationResult } from '@tabibpro/shared';
import { detectDarija } from '@tabibpro/shared';

@Injectable()
export class DarijaTranslatorProvider {
  private readonly logger = new Logger(DarijaTranslatorProvider.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
    this.model = this.config.get<string>('AI_MODEL_FAST', 'claude-sonnet-4-6');
  }

  /**
   * Traduit un message en darija algérien (lettres latines ou arabes)
   * vers le français médical structuré.
   *
   * Exemples :
   *  "rani marid f karchi"  → "J'ai mal à l'estomac/ventre"
   *  "3andi sda3 kbir"      → "J'ai de forts maux de tête"
   *  "benti 3andha shkhana" → "Ma fille a de la fièvre"
   */
  async translateToMedicalFrench(message: string): Promise<DarijaTranslationResult> {
    const systemPrompt = `Tu es un assistant médical spécialisé dans la traduction du darija algérien
(dialecte arabe algérien écrit en lettres latines ou en arabe) vers le français médical structuré.

Tes règles :
1. Traduis fidèlement et intégralement le message, sans rien omettre
2. Structure les symptômes de manière médicale claire
3. Préserve toutes les informations médicales (durée, intensité, localisation)
4. Utilise des termes médicaux français professionnels
5. Si le message est déjà en français ou en arabe standard, indique-le
6. Détecte la langue du message : darija_latin, darija_arabe, francais, arabe_standard, tamazight

Réponds UNIQUEMENT en JSON avec cette structure exacte :
{
  "traductionFr": "traduction en français médical",
  "symptomesExtraits": ["symptôme 1", "symptôme 2"],
  "langueDetectee": "darija_latin | darija_arabe | francais | arabe_standard | tamazight",
  "confianceScore": 0.95
}`;

    const userPrompt = `Traduis ce message de patient algérien vers le français médical structuré :

Message : "${message}"`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Réponse IA invalide');
      }

      // Extraire le JSON de la réponse
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format JSON invalide dans la réponse IA');
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        traductionFr: string;
        symptomesExtraits: string[];
        langueDetectee: DarijaTranslationResult['langueDetectee'];
        confianceScore: number;
      };

      return {
        original: message,
        traductionFr: parsed.traductionFr,
        symptomesExtraits: parsed.symptomesExtraits || [],
        langueDetectee: parsed.langueDetectee || 'darija_latin',
        confianceScore: parsed.confianceScore || 0.8,
      };
    } catch (error) {
      this.logger.error('Erreur traduction darija:', error);
      return {
        original: message,
        traductionFr: message, // Retourner le message original si erreur
        symptomesExtraits: [],
        langueDetectee: 'darija_latin',
        confianceScore: 0,
      };
    }
  }

  /**
   * Détecte si un message contient du darija algérien et le traduit si oui.
   * Retourne null si pas de darija détecté.
   */
  async detectAndTranslate(message: string): Promise<DarijaTranslationResult | null> {
    // Vérification rapide avec regex avant d'appeler l'IA
    if (!detectDarija(message)) {
      return null;
    }
    return this.translateToMedicalFrench(message);
  }

  /**
   * Simplifie le vocabulaire médical du médecin en langage accessible
   * pour le patient (en français ou arabe).
   */
  async simplifyForPatient(
    texteMedial: string,
    languePatient: 'fr' | 'ar' | 'ber' = 'fr'
  ): Promise<string> {
    const systemPrompt = `Tu es un assistant médical qui simplifie le vocabulaire médical
pour le rendre accessible aux patients. Utilise un langage simple, des phrases courtes,
et évite le jargon médical.

Langue de sortie : ${languePatient === 'ar' ? 'arabe littéraire (الفصحى)' : languePatient === 'ber' ? 'français simple (le tamazight médical est en développement)' : 'français simple et accessible'}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Simplifie ce texte médical pour un patient :\n\n${texteMedial}`,
        },
      ],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : texteMedial;
  }
}
