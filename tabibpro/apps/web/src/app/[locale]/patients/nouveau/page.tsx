// ============================================================
// TabibPro — Nouveau Patient
// Formulaire de création patient (conforme Loi 18-07)
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const WILAYAS = [
  { code: '01', nom: 'Adrar' }, { code: '02', nom: 'Chlef' },
  { code: '03', nom: 'Laghouat' }, { code: '04', nom: 'Oum El Bouaghi' },
  { code: '05', nom: 'Batna' }, { code: '06', nom: 'Béjaïa' },
  { code: '07', nom: 'Biskra' }, { code: '08', nom: 'Béchar' },
  { code: '09', nom: 'Blida' }, { code: '10', nom: 'Bouira' },
  { code: '11', nom: 'Tamanrasset' }, { code: '12', nom: 'Tébessa' },
  { code: '13', nom: 'Tlemcen' }, { code: '14', nom: 'Tiaret' },
  { code: '15', nom: 'Tizi Ouzou' }, { code: '16', nom: 'Alger' },
  { code: '17', nom: 'Djelfa' }, { code: '18', nom: 'Jijel' },
  { code: '19', nom: 'Sétif' }, { code: '20', nom: 'Saïda' },
  { code: '21', nom: 'Skikda' }, { code: '22', nom: 'Sidi Bel Abbès' },
  { code: '23', nom: 'Annaba' }, { code: '24', nom: 'Guelma' },
  { code: '25', nom: 'Constantine' }, { code: '26', nom: 'Médéa' },
  { code: '27', nom: 'Mostaganem' }, { code: '28', nom: "M'Sila" },
  { code: '29', nom: 'Mascara' }, { code: '30', nom: 'Ouargla' },
  { code: '31', nom: 'Oran' }, { code: '32', nom: 'El Bayadh' },
  { code: '33', nom: 'Illizi' }, { code: '34', nom: 'Bordj Bou Arréridj' },
  { code: '35', nom: 'Boumerdès' }, { code: '36', nom: 'El Tarf' },
  { code: '37', nom: 'Tindouf' }, { code: '38', nom: 'Tissemsilt' },
  { code: '39', nom: 'El Oued' }, { code: '40', nom: 'Khenchela' },
  { code: '41', nom: 'Souk Ahras' }, { code: '42', nom: 'Tipaza' },
  { code: '43', nom: 'Mila' }, { code: '44', nom: 'Aïn Defla' },
  { code: '45', nom: 'Naâma' }, { code: '46', nom: 'Aïn Témouchent' },
  { code: '47', nom: 'Ghardaïa' }, { code: '48', nom: 'Relizane' },
  { code: '49', nom: 'Timimoun' }, { code: '50', nom: 'Bordj Badji Mokhtar' },
  { code: '51', nom: 'Ouled Djellal' }, { code: '52', nom: 'Béni Abbès' },
  { code: '53', nom: 'In Salah' }, { code: '54', nom: 'In Guezzam' },
  { code: '55', nom: 'Touggourt' }, { code: '56', nom: 'Djanet' },
  { code: '57', nom: "El M'Ghair" }, { code: '58', nom: 'El Meniaa' },
];

const inputClass =
  'w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
const gridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

export default function NouveauPatientPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [consentement, setConsentement] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentement) return;
    setSubmitting(true);
    // TODO: appel API
    setTimeout(() => {
      router.push(`/${locale}/patients`);
    }, 1000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link href={`/${locale}/patients`} className="hover:text-foreground">
            Patients
          </Link>
          <span>/</span>
          <span>Nouveau patient</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau patient</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Créer un nouveau dossier patient
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Identité */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-blue-700 mb-3">
              Identité
            </legend>
            <div className="space-y-4">
              {/* Civilité */}
              <div>
                <label className={labelClass}>Civilité</label>
                <div className="flex gap-4">
                  {['M', 'Mme', 'Mlle'].map((civ) => (
                    <label key={civ} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="civilite" value={civ} className="text-blue-600" />
                      <span className="text-sm">{civ}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={gridClass}>
                <div>
                  <label className={labelClass}>Nom (français)</label>
                  <input type="text" name="nomFr" placeholder="Benali" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Prénom (français)</label>
                  <input type="text" name="prenomFr" placeholder="Karim" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Nom (arabe)</label>
                  <input
                    type="text"
                    name="nomAr"
                    placeholder="بن علي"
                    dir="rtl"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Prénom (arabe)</label>
                  <input
                    type="text"
                    name="prenomAr"
                    placeholder="كريم"
                    dir="rtl"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Date de naissance</label>
                  <input type="date" name="dateNaissance" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Sexe</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sexe" value="M" className="text-blue-600" />
                      <span className="text-sm">Masculin</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="sexe" value="F" className="text-blue-600" />
                      <span className="text-sm">Féminin</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Lieu de naissance</label>
                  <input type="text" name="lieuNaissance" placeholder="Alger" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Wilaya de naissance</label>
                  <select name="wilayaNaissance" className={inputClass}>
                    <option value="">Sélectionner...</option>
                    {WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} — {w.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Section Contact */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-blue-700 mb-3">
              Contact
            </legend>
            <div className={gridClass}>
              <div>
                <label className={labelClass}>Téléphone mobile</label>
                <input
                  type="tel"
                  name="telephoneMobile"
                  placeholder="0555 12 34 56"
                  className={inputClass}
                />
                <p className="text-xs text-muted-foreground mt-1">Format: 0555 12 34 56</p>
              </div>
              <div>
                <label className={labelClass}>Téléphone fixe</label>
                <input
                  type="tel"
                  name="telephoneFixe"
                  placeholder="023 45 67 89"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="patient@email.dz"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Code postal</label>
                <input
                  type="text"
                  name="codePostal"
                  placeholder="16000"
                  maxLength={5}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Adresse</label>
                <input
                  type="text"
                  name="adresse"
                  placeholder="12 Rue des Martyrs"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Commune</label>
                <input
                  type="text"
                  name="commune"
                  placeholder="Alger Centre"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Wilaya</label>
                <select name="wilaya" className={inputClass}>
                  <option value="">Sélectionner...</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} — {w.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Section Assurance */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-blue-700 mb-3">
              Assurance sociale
            </legend>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Organisme</label>
                <div className="flex flex-wrap gap-4">
                  {['CNAS', 'CASNOS', 'Mutuelle privée', 'Aucun'].map((org) => (
                    <label key={org} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="organismeAssurance"
                        value={org}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{org}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className={gridClass}>
                <div>
                  <label className={labelClass}>N° CNAS</label>
                  <input type="text" name="numeroCnas" placeholder="N° assuré CNAS" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>N° CASNOS</label>
                  <input type="text" name="numeroCasnos" placeholder="N° assuré CASNOS" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>N° Carte Chifa (20 chiffres)</label>
                  <input
                    type="text"
                    name="numeroCarteChifa"
                    placeholder="12345678901234567890"
                    maxLength={20}
                    pattern="[0-9]{20}"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Section Données médicales */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-blue-700 mb-3">
              Données médicales
            </legend>
            <div className={gridClass}>
              <div>
                <label className={labelClass}>Groupe sanguin</label>
                <select name="groupeSanguin" className={inputClass}>
                  <option value="">Inconnu</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Rhésus</label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rhesus" value="POSITIF" className="text-blue-600" />
                    <span className="text-sm">Positif (+)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rhesus" value="NEGATIF" className="text-blue-600" />
                    <span className="text-sm">Négatif (-)</span>
                  </label>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Allergies connues</label>
                <textarea
                  name="allergiesConnues"
                  placeholder="Ex: Pénicilline, AINS, Aspirine..."
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
          </fieldset>
        </div>

        {/* Section Consentement Loi 18-07 */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-amber-800 mb-3">
              Consentement — Loi 18-07 du 10 juin 2018
            </legend>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentement}
                onChange={(e) => setConsentement(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-blue-600"
              />
              <span className="text-sm text-amber-900">
                J&apos;ai informé le patient de ses droits concernant ses données personnelles
                (Loi 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans
                le traitement des données à caractère personnel). Le patient a donné son
                consentement explicite pour la collecte et le traitement de ses données médicales.
              </span>
            </label>
          </fieldset>
        </div>

        {/* Boutons */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Link
            href={`/${locale}/patients`}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={!consentement || submitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Création en cours...' : 'Créer le patient'}
          </button>
        </div>
      </form>
    </div>
  );
}
