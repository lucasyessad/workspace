// ============================================================
// TabibPro — Service PDF Ordonnances
// Format algérien réglementaire (Décret 277-96)
// Bizone, stupéfiants, ALD — avec cachet + QR code
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { OrdonnancesService } from '../ordonnances/ordonnances.service';

// Note: En production utiliser @react-pdf/renderer ou puppeteer
// Pour l'instant génération HTML→PDF via template string

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly ordonnancesService: OrdonnancesService) {}

  async genererOrdonnancePdf(ordonnanceId: string): Promise<Buffer> {
    const ordonnance = await this.ordonnancesService.findOne(ordonnanceId);
    const html = this.genererHtml(ordonnance as any);

    this.logger.log(`PDF généré : ${ordonnance.numeroOrdonnance}`);

    // TODO: en production, convertir HTML → PDF avec puppeteer ou PDFKit
    // Pour l'instant, retourner le HTML encodé en buffer
    return Buffer.from(html, 'utf-8');
  }

  private genererHtml(ordonnance: any): string {
    const medecin = ordonnance.medecin;
    const patient = ordonnance.patient;
    const dateStr = new Date(ordonnance.dateCreation).toLocaleDateString('fr-DZ', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    const lignesHtml = ordonnance.lignes
      .sort((a: any, b: any) => a.ordreAffichage - b.ordreAffichage)
      .map((ligne: any, index: number) => {
        const posologie = this.formaterPosologie(ligne);
        return `
        <div class="ligne-medicament">
          <div class="medicament-numero">${index + 1}</div>
          <div class="medicament-info">
            <div class="medicament-nom">
              ${ligne.nomMedicament}${ligne.dosage ? ` ${ligne.dosage}` : ''}${ligne.formeGalenique ? ` — ${ligne.formeGalenique}` : ''}
            </div>
            ${ligne.dci ? `<div class="medicament-dci">DCI : ${ligne.dci}</div>` : ''}
            <div class="medicament-posologie">${posologie}</div>
            ${ligne.instructionsSpecifiques ? `<div class="medicament-instructions"><em>${ligne.instructionsSpecifiques}</em></div>` : ''}
            <div class="medicament-meta">
              Qté : ${ligne.quantite} boîte(s)
              ${ligne.dureeTraitementJours ? ` — Durée : ${ligne.dureeTraitementJours} jours` : ''}
              ${ligne.remboursableCnas ? ` — Remb. CNAS ${ligne.tauxRemboursementCnas || 0}%` : ''}
              ${ligne.substitutionAutorisee ? '' : ' — <strong>Non substituable</strong>'}
              ${ligne.siBesoin ? ' — Si besoin' : ''}
            </div>
          </div>
        </div>`;
      }).join('');

    const estBizone = ordonnance.typeOrdonnance === 'BIZONE';
    const estStupefiant = ordonnance.typeOrdonnance === 'STUPEFIANT';

    return `<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
<meta charset="UTF-8">
<title>Ordonnance ${ordonnance.numeroOrdonnance}</title>
<style>
  @page { size: A4; margin: 20mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #1a1a1a; }

  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1d4ed8; padding-bottom: 8px; margin-bottom: 12px; }
  .medecin-info { flex: 1; }
  .medecin-nom { font-size: 14pt; font-weight: bold; color: #1d4ed8; }
  .medecin-detail { font-size: 9pt; color: #555; margin-top: 2px; }
  .cabinet-info { text-align: right; font-size: 9pt; color: #555; }

  .titre-ordo { text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase;
    letter-spacing: 2px; margin: 10px 0; color: #1d4ed8;
    border: ${estStupefiant ? '2px solid #dc2626' : '1px solid #93c5fd'};
    padding: 6px; background: ${estStupefiant ? '#fef2f2' : '#eff6ff'}; }

  .patient-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; margin-bottom: 12px; }
  .patient-label { font-size: 8pt; text-transform: uppercase; color: #64748b; }
  .patient-nom { font-size: 12pt; font-weight: bold; }
  .patient-meta { font-size: 9pt; color: #555; margin-top: 2px; }

  .bizone-separator { border: none; border-top: 2px dashed #1d4ed8; margin: 16px 0;
    position: relative; }
  .bizone-label { text-align: center; font-size: 8pt; color: #1d4ed8; font-weight: bold;
    letter-spacing: 1px; margin: -8px 0 8px 0; }

  .lignes-section { margin-bottom: 16px; }
  .ligne-medicament { display: flex; gap: 10px; margin-bottom: 10px;
    padding-bottom: 8px; border-bottom: 1px dotted #e2e8f0; }
  .medicament-numero { font-size: 14pt; font-weight: bold; color: #1d4ed8;
    min-width: 20px; text-align: center; line-height: 1; }
  .medicament-nom { font-size: 11pt; font-weight: bold; }
  .medicament-dci { font-size: 9pt; color: #666; font-style: italic; }
  .medicament-posologie { font-size: 10pt; margin-top: 3px; }
  .medicament-instructions { font-size: 9pt; color: #555; margin-top: 2px; }
  .medicament-meta { font-size: 8pt; color: #888; margin-top: 2px; }

  .instructions-gen { background: #fefce8; border: 1px solid #fde047; border-radius: 4px;
    padding: 8px; font-size: 9pt; margin-bottom: 12px; }

  .footer-section { display: flex; justify-content: space-between; align-items: flex-end;
    border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 12px; }
  .date-lieu { font-size: 9pt; color: #555; }
  .signature-zone { text-align: center; }
  .signature-label { font-size: 8pt; color: #888; text-transform: uppercase; letter-spacing: 1px; }
  .cachet-zone { width: 80px; height: 80px; border: 2px dashed #93c5fd; border-radius: 4px;
    display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #93c5fd; }

  .qr-zone { text-align: center; }
  .qr-label { font-size: 7pt; color: #aaa; }
  .qr-code { font-size: 7pt; color: #aaa; word-break: break-all; max-width: 60px; }

  .alerte-stupefiant { background: #fef2f2; border: 2px solid #dc2626; border-radius: 4px;
    padding: 6px; text-align: center; font-size: 9pt; color: #dc2626; font-weight: bold;
    margin-bottom: 10px; }

  .numero-ordo { font-size: 8pt; color: #aaa; text-align: right; margin-bottom: 6px; }
  .tiers-payant { background: #d1fae5; padding: 4px 8px; border-radius: 3px;
    font-size: 9pt; font-weight: bold; color: #065f46; display: inline-block; margin-bottom: 8px; }
</style>
</head>
<body>

<!-- En-tête médecin -->
<div class="header">
  <div class="medecin-info">
    <div class="medecin-nom">Dr. ${medecin.prenomFr} ${medecin.nomFr}</div>
    <div class="medecin-detail">${medecin.specialite}</div>
    <div class="medecin-detail">N° CNOM : ${medecin.numeroCnom}</div>
  </div>
  <div class="cabinet-info">
    <div>Algérie — ${new Date().getFullYear()}</div>
    <div>Africa/Algiers (UTC+1)</div>
  </div>
</div>

<div class="numero-ordo">Réf. : ${ordonnance.numeroOrdonnance}</div>

<!-- Titre ordonnance -->
<div class="titre-ordo">
  ${estStupefiant ? '⚠️ ORDONNANCE SÉCURISÉE — STUPÉFIANTS' :
    estBizone ? 'ORDONNANCE BIZONE (Maladies Chroniques — CNAS)' :
    ordonnance.typeOrdonnance === 'CHRONIQUE' ? 'ORDONNANCE CHRONIQUE' :
    'ORDONNANCE MÉDICALE'}
</div>

${estStupefiant ? `<div class="alerte-stupefiant">Ordonnance à usage unique · Validité 7 jours · Décret 91-318</div>` : ''}

${ordonnance.tiersPayantCnas ? `<div class="tiers-payant">✅ TIERS PAYANT CNAS</div>` : ''}

<!-- Patient -->
<div class="patient-info">
  <div class="patient-label">Patient(e)</div>
  <div class="patient-nom">${patient.prenomFr} ${patient.nomFr}${patient.prenomAr ? ` — ${patient.prenomAr} ${patient.nomAr}` : ''}</div>
  <div class="patient-meta">
    Né(e) le ${new Date(patient.dateNaissance).toLocaleDateString('fr-DZ')}
    · Âge : ${new Date().getFullYear() - new Date(patient.dateNaissance).getFullYear()} ans
  </div>
</div>

<!-- Médicaments -->
${estBizone ? `
  <div class="bizone-label">▼ PARTIE 1 — Médicaments liés à l'ALD (Affection Longue Durée) ▼</div>
  <div class="lignes-section">${lignesHtml}</div>
  <div class="bizone-separator"></div>
  <div class="bizone-label">▼ PARTIE 2 — Autres médicaments ▼</div>
` : ''}

<div class="lignes-section">${estBizone ? '' : lignesHtml}</div>

${ordonnance.instructionsGenerales ? `
  <div class="instructions-gen">
    📋 Instructions générales : ${ordonnance.instructionsGenerales}
  </div>
` : ''}

<!-- Pied de page -->
<div class="footer-section">
  <div class="date-lieu">
    <div class="date-lieu">Fait le ${dateStr}</div>
    <div class="date-lieu">Validité : jusqu'au ${new Date(ordonnance.dateValidite).toLocaleDateString('fr-DZ')}</div>
  </div>
  <div class="signature-zone">
    <div class="cachet-zone">Cachet &<br/>Signature</div>
    <div class="signature-label">Dr. ${medecin.nomFr}</div>
  </div>
  <div class="qr-zone">
    <div class="qr-label">Vérification authenticité</div>
    <div class="qr-code">${ordonnance.qrCodeData?.substring(0, 20)}...</div>
  </div>
</div>

</body>
</html>`;
  }

  private formaterPosologie(ligne: any): string {
    if (ligne.posologieTexteLibre) return ligne.posologieTexteLibre;

    const prises = [];
    if (ligne.posologieMatin) prises.push(`${ligne.posologieMatin} cp matin`);
    if (ligne.posologieMidi) prises.push(`${ligne.posologieMidi} cp midi`);
    if (ligne.posologieSoir) prises.push(`${ligne.posologieSoir} cp soir`);
    if (ligne.posologieCoucher) prises.push(`${ligne.posologieCoucher} cp coucher`);

    return prises.length > 0
      ? prises.join(' + ')
      : 'Posologie selon prescription';
  }
}
