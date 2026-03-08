# TabibPro — Logiciel de Gestion Médicale avec IA Diagnostique

## Édition Algérie 🇩🇿

> Logiciel de gestion médicale professionnel adapté au contexte algérien : réglementation (Loi 18-07), système de santé (CNAS, CNOM, carte Chifa), pharmacopée nationale (ANPP), quatre langues (FR, AR, BER, EN), compréhension du darija algérien par l'IA, mode hors ligne robuste.

---

## Architecture

```
tabibpro/
├── apps/
│   ├── api/              # Backend NestJS 11
│   ├── web/              # IHM Professionnelle Next.js 15
│   └── patient-portal/   # Portail Patient Next.js 15
├── packages/
│   ├── shared/           # Types, constantes, utilitaires TypeScript
│   ├── db-medical/       # Schéma Prisma — DB médicale locale
│   ├── db-service/       # Schéma Prisma — DB service
│   ├── ui/               # Composants UI partagés
│   └── config/           # Configuration partagée
├── docker/               # Docker configs, init scripts, backup
└── docs/                 # Documentation & conformité
```

---

## Fonctionnalités principales

### 🏥 Gestion médicale complète
- Dossiers patients avec champs algériens (carte Chifa, CNAS, CASNOS)
- Consultations avec constantes vitales
- Ordonnances au format algérien réglementaire (bizone, stupéfiants, ALD)
- Pharmacopée ANPP (nomenclature nationale)
- Vaccinations (calendrier PEV algérien)
- Maladies chroniques (protocoles de suivi)

### 🤖 Intelligence Artificielle Médicale
- **Aide au diagnostic** (mode passif — suggestions uniquement)
- **Interactions médicamenteuses** (pharmacopée algérienne)
- **Recherche littérature** (PubMed + recommandations MSPRH)
- **Analyse résultats de laboratoire**
- **Protocoles maladies chroniques**
- **Aide à la rédaction médicale**
- **Dictée médicale** (FR + AR + Darija)
- **🌟 Traducteur darija algérien** → Français médical structuré

### 🌐 Multilingue (4 langues)
- **Français** (langue principale — milieu médical algérien)
- **العربية** (arabe littéraire — RTL natif)
- **ⵜⴰⵎⴰⵣⵉⵖⵜ** (tamazight — Tifinagh)
- **English** (médecins formés à l'étranger)

### 📱 Mode Hors Ligne (CRITIQUE pour l'Algérie)
Service Worker + IndexedDB — Fonctionne sans internet :
- ✅ Consultation dossiers patients
- ✅ Création consultations & ordonnances
- ✅ Gestion stock médicaments
- ✅ RDV du jour
- ⚠️ IA indisponible (nécessite connexion)
- ⚠️ Messages en file d'attente

### 💰 Facturation Algérienne
- Dinar Algérien (DZD)
- Tiers payant CNAS
- Modes de paiement : Espèces, CIB, Edahabia, BaridiMob, CCP
- Feuilles de soins CNAS

### 📅 Calendrier Algérien
- Weekend : **Vendredi + Samedi**
- Jours fériés nationaux + religieux (calendrier hégirien)
- Fuseau horaire : Africa/Algiers (UTC+1, stable)

---

## Stack Technologique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 (App Router, RSC) |
| UI | Tailwind CSS 4 + shadcn/ui + RTL natif |
| Backend | NestJS 11 + TypeScript 5 |
| Base données médicale | PostgreSQL 17 + pgvector (LOCAL) |
| Base données service | PostgreSQL 17 (local ou cloud) |
| Cache / Queues | Redis 7 + BullMQ |
| Recherche | Meilisearch (supporte l'arabe) |
| Stockage fichiers | MinIO (compatible S3) |
| IA | Anthropic Claude API |
| PWA Offline | Service Worker + Workbox |
| Infrastructure | Docker + Traefik |
| Monorepo | Turborepo + pnpm |

---

## Installation Rapide

### Prérequis
- Docker Desktop
- pnpm >= 9

### 1. Configuration
```bash
cp .env.example .env
# Éditer .env avec vos valeurs (DB passwords, API keys, etc.)
```

### 2. Démarrage
```bash
# Démarrer tous les services
docker compose --profile local-service up -d

# Migrations & seed (première installation)
pnpm db:migrate
pnpm db:seed
```

### 3. Accès
- **IHM Professionnelle** : http://localhost:3000
- **Portail Patient** : http://localhost:3002
- **API Documentation** : http://localhost:3001/api/docs
- **Meilisearch** : http://localhost:7700
- **MinIO Console** : http://localhost:9001

---

## Conformité Loi 18-07 (Algérie)

Voir `docs/conformite/loi-18-07-conformite.md` pour le détail complet.

Points clés :
- Données médicales stockées **exclusivement localement**
- Consentement explicite patient en 4 langues
- Droits d'accès, rectification, suppression
- Chiffrement AES-256 au repos, TLS 1.3 en transit
- Anonymisation avant envoi à l'IA externe
- Audit trail complet
- Sauvegarde chiffrée automatique

---

## Modules en développement

- [ ] Intégration carte Chifa (lecteur USB/NFC)
- [ ] Téléconsultation vidéo (WebRTC)
- [ ] Application mobile React Native
- [ ] Télétransmission CNAS dématérialisée
- [ ] Extension marché tunisien et marocain

---

## Licence

Propriétaire — TabibPro © 2026

Contact : support@tabibpro.dz
