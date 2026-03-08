// ============================================================
// TabibPro — Mouvement de stock
// Entrée, sortie ou ajout d'un article de stock cabinet
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';

type TypeMouvement = 'entree' | 'sortie' | 'nouveau';

const MEDICAMENTS_STOCK = [
  'Amoxicilline 500mg caps. (boîte 24)',
  'Metformine 850mg cps. (boîte 30)',
  'Paracétamol 1g comp. (boîte 16)',
  'Losartan 50mg cps. (boîte 28)',
  'Insuline NPH 100UI/ml (flacon 10ml)',
];

const FOURNISSEURS = [
  'Saidal Distribution',
  'LPA Distribution',
  'Novapharm Algérie',
  'Biopharm',
  'SNAPO',
  'Autre',
];

const FORMES = ['Comprimés', 'Gélules', 'Sirop', 'Spray inhalateur', 'Crème', 'Injectable', 'Flacon', 'Ampoules'];

export default function StockMouvementPage() {
  const [type, setType] = useState<TypeMouvement>('entree');
  const [saved, setSaved] = useState(false);

  const [entree, setEntree] = useState({
    medicament: '',
    quantite: '',
    lot: '',
    datePeremption: '',
    prixAchat: '',
    fournisseur: '',
    facture: '',
    note: '',
  });

  const [sortie, setSortie] = useState({
    medicament: '',
    quantite: '',
    motif: 'Utilisation consultation',
    note: '',
  });

  const [nouveau, setNouveau] = useState({
    nom: '',
    forme: 'Comprimés',
    dosage: '',
    quantiteInitiale: '',
    quantiteMinimale: '',
    lot: '',
    datePeremption: '',
    prixAchat: '',
    fournisseur: '',
    remboursable: true,
    note: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const TYPE_INFO: Record<TypeMouvement, { label: string; icon: string; color: string }> = {
    entree: { label: 'Entrée de stock', icon: '📦', color: 'border-green-500 bg-green-50 text-green-800' },
    sortie: { label: 'Sortie de stock', icon: '📤', color: 'border-orange-500 bg-orange-50 text-orange-800' },
    nouveau: { label: 'Nouveau produit', icon: '➕', color: 'border-blue-500 bg-blue-50 text-blue-800' },
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link href="../stock" className="text-gray-400 hover:text-gray-600 text-lg">←</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mouvement de stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">Enregistrement des entrées, sorties et nouveaux produits</p>
        </div>
      </div>

      {/* Sélecteur type */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(TYPE_INFO) as TypeMouvement[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              type === t ? TYPE_INFO[t].color : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-2xl mb-1">{TYPE_INFO[t].icon}</p>
            <p className="text-sm font-semibold">{TYPE_INFO[t].label}</p>
          </button>
        ))}
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          ✅ Mouvement enregistré avec succès
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">{TYPE_INFO[type].icon} {TYPE_INFO[type].label}</h2>

        {/* ── ENTRÉE ── */}
        {type === 'entree' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Médicament <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={entree.medicament}
                onChange={(e) => setEntree({ ...entree, medicament: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Sélectionner un médicament --</option>
                {MEDICAMENTS_STOCK.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité reçue <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={entree.quantite}
                  onChange={(e) => setEntree({ ...entree, quantite: e.target.value })}
                  placeholder="Ex: 10"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (DZD)</label>
                <input
                  type="number"
                  min="0"
                  value={entree.prixAchat}
                  onChange={(e) => setEntree({ ...entree, prixAchat: e.target.value })}
                  placeholder="Ex: 480"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° de lot</label>
                <input
                  type="text"
                  value={entree.lot}
                  onChange={(e) => setEntree({ ...entree, lot: e.target.value })}
                  placeholder="Ex: LOT-2025-441"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de péremption <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min="2026-03-06"
                  value={entree.datePeremption}
                  onChange={(e) => setEntree({ ...entree, datePeremption: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select
                  value={entree.fournisseur}
                  onChange={(e) => setEntree({ ...entree, fournisseur: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Sélectionner --</option>
                  {FOURNISSEURS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° Facture</label>
                <input
                  type="text"
                  value={entree.facture}
                  onChange={(e) => setEntree({ ...entree, facture: e.target.value })}
                  placeholder="Ex: FAC-2026-00123"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                rows={2}
                value={entree.note}
                onChange={(e) => setEntree({ ...entree, note: e.target.value })}
                placeholder="Remarques éventuelles…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </>
        )}

        {/* ── SORTIE ── */}
        {type === 'sortie' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Médicament <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={sortie.medicament}
                onChange={(e) => setSortie({ ...sortie, medicament: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Sélectionner un médicament --</option>
                {MEDICAMENTS_STOCK.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité sortie <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={sortie.quantite}
                  onChange={(e) => setSortie({ ...sortie, quantite: e.target.value })}
                  placeholder="Ex: 2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <select
                  value={sortie.motif}
                  onChange={(e) => setSortie({ ...sortie, motif: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Utilisation consultation</option>
                  <option>Don / Urgence</option>
                  <option>Périmé — destruction</option>
                  <option>Retour fournisseur</option>
                  <option>Inventaire — correction</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                rows={2}
                value={sortie.note}
                onChange={(e) => setSortie({ ...sortie, note: e.target.value })}
                placeholder="Patient, consultation associée…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-800">
              ⚠️ La sortie va décrémenter le stock actuel. Vérifiez la quantité disponible avant de valider.
            </div>
          </>
        )}

        {/* ── NOUVEAU PRODUIT ── */}
        {type === 'nouveau' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du médicament <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nouveau.nom}
                  onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })}
                  placeholder="Ex: Amlodipine 5mg comp. (boîte 30)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forme galénique</label>
                <select
                  value={nouveau.forme}
                  onChange={(e) => setNouveau({ ...nouveau, forme: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FORMES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                <input
                  type="text"
                  value={nouveau.dosage}
                  onChange={(e) => setNouveau({ ...nouveau, dosage: e.target.value })}
                  placeholder="Ex: 5mg"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité initiale <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={nouveau.quantiteInitiale}
                  onChange={(e) => setNouveau({ ...nouveau, quantiteInitiale: e.target.value })}
                  placeholder="Ex: 10"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d&apos;alerte minimum</label>
                <input
                  type="number"
                  min="0"
                  value={nouveau.quantiteMinimale}
                  onChange={(e) => setNouveau({ ...nouveau, quantiteMinimale: e.target.value })}
                  placeholder="Ex: 3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° de lot</label>
                <input
                  type="text"
                  value={nouveau.lot}
                  onChange={(e) => setNouveau({ ...nouveau, lot: e.target.value })}
                  placeholder="Ex: LOT-2025-889"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de péremption <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min="2026-03-06"
                  value={nouveau.datePeremption}
                  onChange={(e) => setNouveau({ ...nouveau, datePeremption: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix d&apos;achat (DZD)</label>
                <input
                  type="number"
                  min="0"
                  value={nouveau.prixAchat}
                  onChange={(e) => setNouveau({ ...nouveau, prixAchat: e.target.value })}
                  placeholder="Ex: 560"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <select
                  value={nouveau.fournisseur}
                  onChange={(e) => setNouveau({ ...nouveau, fournisseur: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Sélectionner --</option>
                  {FOURNISSEURS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remboursable"
                checked={nouveau.remboursable}
                onChange={(e) => setNouveau({ ...nouveau, remboursable: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="remboursable" className="text-sm text-gray-700">
                Médicament remboursable (liste positive CNAS)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                rows={2}
                value={nouveau.note}
                onChange={(e) => setNouveau({ ...nouveau, note: e.target.value })}
                placeholder="Informations complémentaires…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <Link
            href="../stock"
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {type === 'entree' ? '📦 Enregistrer l\'entrée' :
             type === 'sortie' ? '📤 Enregistrer la sortie' :
             '➕ Ajouter au stock'}
          </button>
        </div>
      </form>
    </div>
  );
}
