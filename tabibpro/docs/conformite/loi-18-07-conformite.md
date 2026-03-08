# Conformité TabibPro — Loi 18-07 (Algérie)

## Loi 18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel

---

## 1. Présentation

La **Loi 18-07** est la loi algérienne sur la protection des données personnelles. Elle crée des obligations pour tout organisme qui traite des données à caractère personnel de personnes physiques, et établit des droits pour les personnes dont les données sont traitées.

**TabibPro** est conçu en conformité totale avec cette loi.

---

## 2. Données traitées par TabibPro

### 2.1 Données à caractère personnel (Article 3)

| Type de donnée | Catégorie | Base légale |
|----------------|-----------|-------------|
| Identité du patient (nom, prénom, date naissance) | Personnelle | Consentement (Art. 7) |
| Numéro de téléphone | Personnelle | Consentement |
| Adresse | Personnelle | Nécessité contractuelle |
| N° Carte Chifa | Personnelle | Nécessité contractuelle (CNAS) |
| Données de santé (consultations, diagnostics) | **Sensible** (Art. 17) | Consentement explicite |
| Ordonnances | **Sensible** | Consentement explicite |
| Documents médicaux | **Sensible** | Consentement explicite |
| Données IA (suggestions diagnostiques) | **Sensible** | Consentement explicite |

### 2.2 Données sensibles (Article 17)

Les **données de santé** sont classées comme données sensibles et bénéficient d'une protection renforcée :
- Chiffrement AES-256 au repos
- TLS 1.3 en transit
- Accès restreint (RBAC — Role Based Access Control)
- Journalisation de tous les accès (audit trail)
- Stockage **exclusivement local** sur le serveur du cabinet

---

## 3. Droits des personnes concernées

### 3.1 Droit d'accès (Article 34)

Le patient peut demander l'accès à toutes ses données personnelles.

**Implémentation dans TabibPro :**
```
GET /api/v1/patients/:id/export-donnees
→ Export complet de toutes les données du patient en JSON/PDF
→ Délai de réponse : 48 heures maximum
```

### 3.2 Droit de rectification (Article 35)

Le patient peut demander la correction de ses données.

**Implémentation :**
```
PATCH /api/v1/patients/:id
→ Modification des données avec traçabilité (qui a modifié, quand)
→ Accessible par le médecin ou le secrétaire sur demande du patient
```

### 3.3 Droit de suppression (Article 36)

Le patient peut demander la suppression de ses données.

**Implémentation :**
```
DELETE /api/v1/patients/:id/supprimer-donnees
→ Suppression des données personnelles identifiantes
→ Conservation anonymisée des données médicales agrégées (épidémiologie)
→ Durée légale de conservation des dossiers médicaux : 10 ans (réglementation médicale DZ)
→ Traçabilité de la demande de suppression
```

### 3.4 Droit d'opposition (Article 37)

Le patient peut s'opposer au traitement de ses données dans certains cas.

**Implémentation :**
- Module de consentement granulaire (par type de traitement)
- Révocation du consentement possible à tout moment

---

## 4. Obligations du responsable de traitement

### 4.1 Consentement (Article 7)

> "Le traitement des données à caractère personnel ne peut avoir lieu qu'avec le consentement libre, exprès et éclairé de la personne concernée."

**Implémentation dans TabibPro :**

```typescript
// Formulaire de consentement patient
interface ConsentementPatient {
  consentementDonnees: boolean;          // Obligatoire
  consentementDataAnalyse: boolean;      // Analytics anonymisées (optionnel)
  consentementIA: boolean;               // Utilisation données pour IA (optionnel)
  consentementContact: boolean;          // Rappels SMS/email (optionnel)
  dateConsentement: DateTime;
  versionPolitique: string;              // Version de la politique de confidentialité
  ipAddress: string;                     // Traçabilité
}
```

Le formulaire de consentement est disponible en **4 langues** (FR, AR, BER, EN).

### 4.2 Obligation de sécurité (Article 39)

> "Le responsable du traitement est tenu de prendre toutes les précautions utiles pour préserver la sécurité des données."

**Mesures techniques implémentées :**

| Mesure | Implémentation |
|--------|---------------|
| Chiffrement au repos | AES-256 pour données sensibles |
| Chiffrement en transit | TLS 1.3 |
| Authentification forte | JWT + MFA/TOTP obligatoire pour médecins |
| Contrôle d'accès | RBAC (Admin, Médecin, Secrétaire, Infirmier, Patient) |
| Audit trail | Journalisation complète de tous les accès |
| Sauvegarde sécurisée | Backup chiffré automatique (nuit) |
| Gestion des sessions | Timeout après 8h, révocation immédiate |
| Limitation d'accès | Rate limiting, protection brute-force |

### 4.3 Transfert de données hors Algérie (Article 44)

> "Le transfert de données à caractère personnel vers un pays étranger ne peut avoir lieu que si ce pays assure un niveau de protection suffisant."

**Architecture TabibPro — Conformité Article 44 :**

```
✅ Données médicales : Stockage LOCAL exclusif sur serveur cabinet
   → Aucun transfert hors Algérie

⚠️ API Claude (Anthropic) :
   → Les données envoyées à l'API Claude sont ANONYMISÉES avant envoi
   → Aucune donnée personnelle identifiable n'est envoyée
   → Seules des descriptions médicales anonymisées sont transmises
   → Politique d'anonymisation : voir AnonymisationService

⚠️ Si cloud activé (optionnel) :
   → Option A : Hébergeur algérien → Conformité totale Art. 44
   → Option B : Hébergeur étranger (OVH France) → Vérification niveau de protection suffisant
```

### 4.4 Déclaration auprès de l'ANPDP

L'**ANPDP** (Autorité Nationale de Protection des Données à caractère Personnel) doit être notifiée selon les modalités en vigueur.

**TabibPro génère automatiquement** le dossier de déclaration dans le module `Paramètres > Conformité > Déclaration ANPDP`.

---

## 5. Durées de conservation

| Type de donnée | Durée de conservation | Base légale |
|----------------|----------------------|-------------|
| Dossier médical complet | 10 ans minimum | Réglementation médicale DZ |
| Ordonnances | 10 ans | Réglementation médicale DZ |
| Données administratives | 5 ans | Loi 18-07 |
| Logs d'accès (audit) | 3 ans | Loi 18-07 |
| Suggestions IA (journal) | 5 ans | Bonne pratique médicale |
| Données de facturation | 10 ans | Code fiscal algérien |

---

## 6. Politique de confidentialité

Le fichier `docs/conformite/politique-confidentialite.md` contient la politique de confidentialité complète disponible en FR et AR, à afficher sur :
- Le portail patient (`/confidentialite`)
- Le formulaire d'inscription
- L'application IHM professionnelle (`Paramètres > Conformité`)

---

## 7. Checklist de conformité

- [x] Module de consentement explicite en 4 langues
- [x] Export des données patient (droit d'accès)
- [x] Suppression des données patient (droit de suppression)
- [x] Rectification des données (droit de rectification)
- [x] Chiffrement AES-256 au repos
- [x] TLS 1.3 en transit
- [x] MFA obligatoire pour le personnel médical
- [x] Audit trail complet
- [x] Anonymisation avant envoi à l'IA externe
- [x] Sauvegarde chiffrée locale
- [x] Architecture offline-first (données locales)
- [x] Politique de confidentialité FR + AR
- [ ] Déclaration ANPDP (à effectuer par le cabinet)
- [ ] DPO désigné (si requis par la taille de la structure)

---

## 8. Contact DPO

Si un délégué à la protection des données (DPO) est désigné dans votre cabinet, ses coordonnées doivent être saisies dans :

```
Paramètres > Cabinet > Conformité > DPO
```

---

*Document mis à jour le : Mars 2026*
*Version TabibPro : 1.0*
*Référence légale : Loi 18-07 du 10 juin 2018 (JORADP n°34 du 10 juin 2018)*
