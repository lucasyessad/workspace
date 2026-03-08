// ============================================================
// TabibPro — Gestion du Stock Cabinet
// Médicaments, alertes rupture et péremption
// ============================================================

import Link from 'next/link';

interface StockPageProps {
  params: Promise<{ locale: string }>;
}

type StatutStock = 'OK' | 'Stock faible' | 'Rupture' | 'Bientôt périmé';

interface ArticleStock {
  id: string;
  medicament: string;
  quantiteActuelle: number;
  quantiteMinimale: number;
  prixAchatDzd: number;
  datePeremption: string;
  fournisseur: string;
  statut: StatutStock;
}

const STOCK_FICTIF: ArticleStock[] = [
  {
    id: 'stk-001',
    medicament: 'Amoxicilline 500mg caps. (boîte 24)',
    quantiteActuelle: 12,
    quantiteMinimale: 5,
    prixAchatDzd: 480,
    datePeremption: '2027-06-30',
    fournisseur: 'Saidal Distribution',
    statut: 'OK',
  },
  {
    id: 'stk-002',
    medicament: 'Metformine 850mg cps. (boîte 30)',
    quantiteActuelle: 0,
    quantiteMinimale: 10,
    prixAchatDzd: 320,
    datePeremption: '2026-12-31',
    fournisseur: 'LPA Distribution',
    statut: 'Rupture',
  },
  {
    id: 'stk-003',
    medicament: 'Paracétamol 1g comp. (boîte 16)',
    quantiteActuelle: 45,
    quantiteMinimale: 20,
    prixAchatDzd: 180,
    datePeremption: '2026-04-01',
    fournisseur: 'Saidal Distribution',
    statut: 'Bientôt périmé',
  },
  {
    id: 'stk-004',
    medicament: 'Losartan 50mg cps. (boîte 28)',
    quantiteActuelle: 3,
    quantiteMinimale: 8,
    prixAchatDzd: 560,
    datePeremption: '2027-03-31',
    fournisseur: 'Novapharm Algérie',
    statut: 'Stock faible',
  },
  {
    id: 'stk-005',
    medicament: 'Insuline NPH 100UI/ml (flacon 10ml)',
    quantiteActuelle: 8,
    quantiteMinimale: 5,
    prixAchatDzd: 1200,
    datePeremption: '2026-11-15',
    fournisseur: 'Biopharm',
    statut: 'OK',
  },
];

const BADGE_STATUT: Record<StatutStock, string> = {
  OK: 'bg-green-100 text-green-700',
  'Stock faible': 'bg-orange-100 text-orange-700',
  Rupture: 'bg-red-100 text-red-700',
  'Bientôt périmé': 'bg-amber-100 text-amber-700',
};

const ROW_STYLE: Record<StatutStock, string> = {
  OK: '',
  'Stock faible': 'bg-orange-50/40',
  Rupture: 'bg-red-50/50',
  'Bientôt périmé': 'bg-amber-50/40',
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-DZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function formatPrix(prix: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0,
  }).format(prix);
}

export default async function StockPage({ params }: StockPageProps) {
  const { locale } = await params;

  const nbRuptures = STOCK_FICTIF.filter((a) => a.statut === 'Rupture').length;
  const nbBientotPerimes = STOCK_FICTIF.filter((a) => a.statut === 'Bientôt périmé').length;
  const nbStockFaible = STOCK_FICTIF.filter((a) => a.statut === 'Stock faible').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock cabinet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestion des médicaments et consommables
          </p>
        </div>
        <Link
          href={`/${locale}/stock/mouvement`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <span>+</span>
          Ajouter mouvement
        </Link>
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {nbRuptures > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <span className="text-xl">🚨</span>
              </div>
              <div>
                <p className="font-semibold text-red-800">
                  {nbRuptures} article{nbRuptures > 1 ? 's' : ''} en rupture
                </p>
                <p className="text-xs text-red-600">Réapprovisionnement urgent requis</p>
              </div>
            </div>
          </div>
        )}

        {nbBientotPerimes > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <p className="font-semibold text-amber-800">
                  {nbBientotPerimes} article{nbBientotPerimes > 1 ? 's' : ''} bientôt périmé
                  {nbBientotPerimes > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-amber-600">Péremption dans moins de 30 jours</p>
              </div>
            </div>
          </div>
        )}

        {nbStockFaible > 0 && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                <span className="text-xl">📉</span>
              </div>
              <div>
                <p className="font-semibold text-orange-800">
                  {nbStockFaible} article{nbStockFaible > 1 ? 's' : ''} en stock faible
                </p>
                <p className="text-xs text-orange-600">En dessous du seuil minimum</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tableau stock */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Médicament
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Qté actuelle
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Qté minimale
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Prix achat
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Péremption
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Fournisseur
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Statut
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {STOCK_FICTIF.map((article) => (
                <tr
                  key={article.id}
                  className={`transition-colors hover:brightness-95 ${ROW_STYLE[article.statut]}`}
                >
                  <td className="px-4 py-3 font-medium">{article.medicament}</td>
                  <td
                    className={`px-4 py-3 text-center font-bold ${
                      article.statut === 'Rupture'
                        ? 'text-red-700'
                        : article.statut === 'Stock faible'
                        ? 'text-orange-700'
                        : 'text-foreground'
                    }`}
                  >
                    {article.quantiteActuelle}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {article.quantiteMinimale}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatPrix(article.prixAchatDzd)}
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      article.statut === 'Bientôt périmé'
                        ? 'font-medium text-amber-700'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {formatDate(article.datePeremption)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{article.fournisseur}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        BADGE_STATUT[article.statut]
                      }`}
                    >
                      {article.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted transition-colors">
                        Entrée
                      </button>
                      <button className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted transition-colors">
                        Sortie
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Résumé stock */}
        <div className="border-t px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{STOCK_FICTIF.length} articles</span> dans le stock
          </p>
          <p className="text-sm text-muted-foreground">
            Valeur totale:{' '}
            <span className="font-medium">
              {formatPrix(
                STOCK_FICTIF.reduce(
                  (sum, a) => sum + a.prixAchatDzd * a.quantiteActuelle,
                  0
                )
              )}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
