import { Resend } from "resend";

/** Échapper les caractères HTML pour prévenir les injections XSS */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Client Resend pour l'envoi d'emails */
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "AqarVision <noreply@aqarvision.dz>";

/** Templates d'emails */
const templates = {
  /** Email de bienvenue après inscription */
  bienvenue: (nomAgence: string) => ({
    subject: `Bienvenue sur AqarVision, ${escapeHtml(nomAgence)} !`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a202c; padding: 30px; text-align: center;">
          <h1 style="color: #d4af37; margin: 0;">AqarVision</h1>
        </div>
        <div style="padding: 30px; background: #f7fafc;">
          <h2 style="color: #1a202c;">Bienvenue, ${escapeHtml(nomAgence)} !</h2>
          <p>Votre agence est maintenant inscrite sur AqarVision.</p>
          <p>Voici ce que vous pouvez faire dès maintenant :</p>
          <ul>
            <li>Créer vos premières annonces immobilières</li>
            <li>Personnaliser votre page publique</li>
            <li>Utiliser l'IA pour générer des descriptions professionnelles</li>
          </ul>
          <p>Vous bénéficiez d'un <strong>essai gratuit de 14 jours</strong> avec toutes les fonctionnalités Pro.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard"
               style="background: #d4af37; color: #1a202c; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Accéder à mon tableau de bord
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>AqarVision - La plateforme immobilière pour l'Algérie</p>
        </div>
      </div>
    `,
  }),

  /** Notification : nouveau contact prospect */
  nouveau_contact: (params: {
    nomAgence: string;
    titreAnnonce: string;
    typeContact: string;
    nomProspect: string;
    telProspect?: string;
  }) => ({
    subject: `Nouveau ${params.typeContact} pour "${params.titreAnnonce}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a202c; padding: 20px; text-align: center;">
          <h1 style="color: #d4af37; margin: 0; font-size: 20px;">AqarVision</h1>
        </div>
        <div style="padding: 30px; background: #f7fafc;">
          <h2 style="color: #1a202c;">Nouveau contact !</h2>
          <p>Un prospect a contacté votre agence <strong>${escapeHtml(params.nomAgence)}</strong> :</p>
          <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #d4af37;">
            <p><strong>Annonce :</strong> ${escapeHtml(params.titreAnnonce)}</p>
            <p><strong>Type :</strong> ${escapeHtml(params.typeContact)}</p>
            <p><strong>Prospect :</strong> ${escapeHtml(params.nomProspect || "Anonyme")}</p>
            ${params.telProspect ? `<p><strong>Téléphone :</strong> ${escapeHtml(params.telProspect)}</p>` : ""}
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/analytics"
               style="background: #d4af37; color: #1a202c; padding: 10px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Voir mes contacts
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  /** Notification : vérification de document */
  verification_document: (params: {
    nomAgence: string;
    titreAnnonce: string;
    statut: string;
    notes?: string;
  }) => ({
    subject: `Document ${params.statut === "verified" ? "vérifié" : "rejeté"} - ${params.titreAnnonce}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a202c; padding: 20px; text-align: center;">
          <h1 style="color: #d4af37; margin: 0; font-size: 20px;">AqarVision</h1>
        </div>
        <div style="padding: 30px; background: #f7fafc;">
          <h2 style="color: #1a202c;">Mise à jour de vérification</h2>
          <p>Le document soumis pour <strong>"${escapeHtml(params.titreAnnonce)}"</strong> a été
             <strong style="color: ${params.statut === "verified" ? "#38a169" : "#e53e3e"}">
               ${params.statut === "verified" ? "vérifié" : "rejeté"}
             </strong>.
          </p>
          ${params.notes ? `<p><strong>Notes :</strong> ${escapeHtml(params.notes)}</p>` : ""}
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/annonces"
               style="background: #d4af37; color: #1a202c; padding: 10px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Voir mes annonces
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  /** Notification : essai qui expire bientôt */
  trial_expiring: (nomAgence: string, joursRestants: number) => ({
    subject: `Votre essai gratuit expire dans ${joursRestants} jours`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a202c; padding: 20px; text-align: center;">
          <h1 style="color: #d4af37; margin: 0; font-size: 20px;">AqarVision</h1>
        </div>
        <div style="padding: 30px; background: #f7fafc;">
          <h2 style="color: #1a202c;">${escapeHtml(nomAgence)}, votre essai expire bientôt</h2>
          <p>Il vous reste <strong>${joursRestants} jours</strong> d'essai gratuit.</p>
          <p>Passez au plan Pro pour conserver toutes les fonctionnalités :</p>
          <ul>
            <li>Génération IA trilingue</li>
            <li>Analytics complets</li>
            <li>Badge agence vérifiée</li>
            <li>Jusqu'à 50 annonces</li>
          </ul>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/pricing"
               style="background: #d4af37; color: #1a202c; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Voir les tarifs
            </a>
          </div>
        </div>
      </div>
    `,
  }),
};

/** Envoyer un email via Resend */
export async function envoyerEmail(
  to: string,
  template: keyof typeof templates,
  params: any
): Promise<{ succes: boolean; erreur?: string }> {
  if (!resend) {
    console.log(`[Email simulé] ${template} → ${to}`);
    return { succes: true };
  }

  try {
    const emailConfig = typeof templates[template] === "function"
      ? (templates[template] as Function)(params)
      : templates[template];

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: emailConfig.subject,
      html: emailConfig.html,
    });

    if (error) {
      console.error("Erreur envoi email:", error);
      return { succes: false, erreur: error.message };
    }

    return { succes: true };
  } catch (error) {
    console.error("Erreur email:", error);
    return { succes: false, erreur: "Erreur d'envoi" };
  }
}

export { templates };
