// ============================================================
// TabibPro — IA Diagnostique (Mode passif)
// L'IA intervient UNIQUEMENT quand le médecin la sollicite
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface DiagnosticRequest {
  symptomes: string[];
  antecedents?: string;
  constantes?: {
    tension?: string;
    temperature?: number;
    pouls?: number;
    saturation?: number;
  };
  examensRealises?: string;
  agePatient?: number;
  sexePatient?: 'M' | 'F';
  contexteMedical?: string;
}

export interface DiagnosticSuggestion {
  diagnosticPrincipal: string;
  diagnosticsAlternatifs: string[];
  codeCim10Principal?: string;
  codesCim10Alternatifs?: string[];
  conduiteProposeee: string;
  examensComplementaires?: string[];
  urgenceNiveau: 'faible' | 'modere' | 'eleve' | 'critique';
  disclaimer: string;
  sourcesReferentielles?: string[];
  tokensUtilises?: number;
}

@Injectable()
export class DiagnosticProvider {
  private readonly logger = new Logger(DiagnosticProvider.name);
  private readonly client: Anthropic;

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async suggestDiagnostic(
    request: DiagnosticRequest,
    locale: string = 'fr'
  ): Promise<DiagnosticSuggestion> {
    const model = this.config.get<string>('AI_MODEL_DEEP', 'claude-opus-4-6');

    const systemPrompt = `Tu es un assistant médical en aide au diagnostic pour un médecin en Algérie.

RÔLE : Mode passif — Tu fournis des SUGGESTIONS au médecin, qui reste le seul décisionnaire.

CONTEXTE ALGÉRIEN :
- Référentiels utilisés : CIM-10, recommandations OMS, guidelines MSPRH (Ministère de la Santé DZ)
- Pharmacopée algérienne (ANPP) — les médicaments disponibles en Algérie
- Pathologies fréquentes en Algérie : tuberculose, hypertension, diabète, hépatite B/C, etc.
- Conditions climatiques : chaleur (wilayas du Sud), altitude (Kabyle)

RÈGLES ABSOLUES :
1. Toujours mentionner le disclaimer médical
2. Ne jamais prétendre remplacer le jugement clinique du médecin
3. Signaler si un symptôme est urgent / nécessite transfert
4. Utiliser CIM-10 pour les codes diagnostiques
5. Mentionner uniquement des médicaments disponibles en Algérie si possible

Réponds en ${locale === 'ar' ? 'arabe littéraire' : 'français'} au format JSON strict.`;

    const userPrompt = `Suggère un diagnostic pour ce patient :

Symptômes : ${request.symptomes.join(', ')}
${request.agePatient ? `Âge : ${request.agePatient} ans` : ''}
${request.sexePatient ? `Sexe : ${request.sexePatient === 'M' ? 'Masculin' : 'Féminin'}` : ''}
${request.constantes ? `Constantes : ${JSON.stringify(request.constantes)}` : ''}
${request.antecedents ? `Antécédents : ${request.antecedents}` : ''}
${request.examensRealises ? `Examen clinique : ${request.examensRealises}` : ''}
${request.contexteMedical ? `Contexte : ${request.contexteMedical}` : ''}

Réponds avec ce JSON :
{
  "diagnosticPrincipal": "...",
  "diagnosticsAlternatifs": ["...", "..."],
  "codeCim10Principal": "...",
  "codesCim10Alternatifs": ["..."],
  "conduiteProposeee": "...",
  "examensComplementaires": ["..."],
  "urgenceNiveau": "faible|modere|eleve|critique",
  "sourcesReferentielles": ["..."],
  "disclaimer": "..."
}`;

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') throw new Error('Réponse invalide');

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON non trouvé');

      const parsed = JSON.parse(jsonMatch[0]) as DiagnosticSuggestion;
      parsed.tokensUtilises = response.usage.input_tokens + response.usage.output_tokens;

      // Disclaimer obligatoire
      parsed.disclaimer =
        parsed.disclaimer ||
        "⚠️ AIDE AU DIAGNOSTIC — Cette suggestion est fournie à titre indicatif uniquement. " +
          "Le médecin reste le seul décisionnaire du diagnostic et du traitement.";

      return parsed;
    } catch (error) {
      this.logger.error('Erreur suggestion diagnostic:', error);
      throw error;
    }
  }

  async analyzeInteractions(
    medicaments: Array<{ nom: string; dci?: string }>,
    patientContext?: string
  ): Promise<{
    interactions: Array<{
      medicament1: string;
      medicament2: string;
      gravite: 'mineure' | 'moderee' | 'grave' | 'contre_indiquee';
      description: string;
      recommandation: string;
    }>;
    alertesSpeciales: string[];
  }> {
    const model = this.config.get<string>('AI_MODEL_FAST', 'claude-sonnet-4-6');

    const response = await this.client.messages.create({
      model,
      max_tokens: 1024,
      system: `Tu es un pharmacologue spécialisé en interactions médicamenteuses,
avec une expertise sur la pharmacopée algérienne (ANPP).
Analyse les interactions entre médicaments et réponds en JSON.`,
      messages: [
        {
          role: 'user',
          content: `Analyse les interactions entre ces médicaments (pharmacopée algérienne) :

Médicaments : ${medicaments.map((m) => `${m.nom}${m.dci ? ` (${m.dci})` : ''}`).join(', ')}
${patientContext ? `Contexte patient : ${patientContext}` : ''}

JSON :
{
  "interactions": [
    {
      "medicament1": "...",
      "medicament2": "...",
      "gravite": "mineure|moderee|grave|contre_indiquee",
      "description": "...",
      "recommandation": "..."
    }
  ],
  "alertesSpeciales": ["..."]
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') return { interactions: [], alertesSpeciales: [] };

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { interactions: [], alertesSpeciales: [] };

    return JSON.parse(jsonMatch[0]);
  }
}
