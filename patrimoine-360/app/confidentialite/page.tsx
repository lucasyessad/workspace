import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/landing" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition mb-8">
          <ArrowLeft size={14} /> Retour
        </Link>

        <h1 className="text-3xl font-serif font-bold text-white mb-8">Politique de confidentialité</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-serif font-semibold text-white">1. Responsable du traitement</h2>
            <p className="text-gray-400">
              Patrimoine 360° est une plateforme d&apos;aide à la décision financière. Le responsable du traitement des données
              personnelles est l&apos;éditeur de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-white">2. Données collectées</h2>
            <p className="text-gray-400">Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
            <ul className="text-gray-400 list-disc pl-5 space-y-1">
              <li>Adresse email (pour l&apos;authentification)</li>
              <li>Données financières saisies dans les modules (patrimoine, revenus, dépenses, dettes, investissements)</li>
              <li>Résultats d&apos;analyses IA générées</li>
              <li>Historique des analyses</li>
              <li>Préférences d&apos;utilisation (thème, objectifs)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-white">3. Finalité du traitement</h2>
            <p className="text-gray-400">Vos données sont utilisées exclusivement pour :</p>
            <ul className="text-gray-400 list-disc pl-5 space-y-1">
              <li>Générer vos analyses patrimoniales personnalisées</li>
              <li>Sauvegarder votre progression entre les sessions</li>
              <li>Produire des rapports PDF et Excel</li>
              <li>Améliorer la qualité du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-white">4. Base légale</h2>
            <p className="text-gray-400">
              Le traitement est fondé sur votre consentement (article 6.1.a du RGPD) et sur l&apos;exécution du contrat
              de service (article 6.1.b du RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-white">5. Partage des données</h2>
            <p className="text-gray-400">
              Vos données financières ne sont <strong className="text-white">jamais vendues ni partagées</strong> avec des tiers à des fins commerciales.
            </p>
            <p className="text-gray-400">Les sous-traitants techniques utilisés sont :</p>
            <ul className="text-gray-400 list-disc pl-5 space-y-1">
              <li><strong className="text-gray-300">Supabase</strong> — hébergement de la base de données et authentification</li>
              <li><strong className="text-gray-300">Anthropic (Claude)</strong> — moteur d&apos;analyse IA (les données sont envoyées de manière anonymisée)</li>
              <li><strong className="text-gray-300">Vercel</strong> — hébergement de l&apos;application web</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-white">6. Sécurité</h2>
            <p className="text-gray-400">Nous mettons en œuvre les mesures suivantes :</p>
            <ul className="text-gray-400 list-disc pl-5 space-y-1">
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Authentification sécurisée via Supabase Auth</li>
              <li>Row Level Security (RLS) sur toutes les tables de données</li>
              <li>Minimisation des données collectées</li>
              <li>Journalisation des accès</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-white">7. Conservation des données</h2>
            <p className="text-gray-400">
              Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte,
              toutes les données personnelles sont supprimées dans un délai de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-white">8. Vos droits</h2>
            <p className="text-gray-400">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="text-gray-400 list-disc pl-5 space-y-1">
              <li><strong className="text-gray-300">Droit d&apos;accès</strong> — obtenir une copie de vos données</li>
              <li><strong className="text-gray-300">Droit de rectification</strong> — corriger vos données</li>
              <li><strong className="text-gray-300">Droit de suppression</strong> — supprimer votre compte et vos données</li>
              <li><strong className="text-gray-300">Droit à la portabilité</strong> — exporter vos données (PDF, Excel)</li>
              <li><strong className="text-gray-300">Droit d&apos;opposition</strong> — vous opposer au traitement</li>
            </ul>
            <p className="text-gray-400 mt-2">
              Pour exercer vos droits, contactez-nous à : <strong className="text-indigo-400">privacy@patrimoine360.app</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-white">9. Cookies</h2>
            <p className="text-gray-400">
              Patrimoine 360° utilise uniquement des cookies techniques nécessaires au fonctionnement du service
              (session d&apos;authentification, préférences de thème). Aucun cookie publicitaire n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif font-semibold text-white">10. Avertissement</h2>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-amber-200/80 text-sm">
                Les analyses fournies par Patrimoine 360° ont une vocation d&apos;aide à la décision et d&apos;information.
                Elles ne remplacent pas un conseil financier, fiscal ou juridique individualisé délivré par un professionnel habilité.
              </p>
            </div>
          </section>

          <section>
            <p className="text-gray-500 text-xs">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
