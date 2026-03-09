# Patrimoine 360° — Bilan complet

## 1. Application Web (Next.js 14)

**Stack** : Next.js 14 App Router, TypeScript, Tailwind CSS v3, Framer Motion, Recharts, jsPDF, ExcelJS

### 12 modules financiers

Chaque module dispose de :
- Formulaire dynamique avec champs typés (nombre, texte, textarea, select)
- Prompts IA dédiés (système + utilisateur) en français
- Analyse IA via Claude API (claude-sonnet-4-20250514) avec streaming SSE
- Export PDF et Excel
- Persistance localStorage

| Module | Titre | Calculateur |
|--------|-------|-------------|
| 01 | Bilan patrimonial | Patrimoine net, taux d'épargne, score 0-100 |
| 02 | Planification retraite | Projection avec intérêts composés |
| 03 | Stratégie d'investissement | — |
| 04 | Optimisation fiscale | — |
| 05 | Gestion des dettes | Parsing et estimation de remboursement |
| 06 | Fonds d'urgence | Mois couverts |
| 07 | Planification successorale | — |
| 08 | Immobilier — résidence principale | — |
| 09 | Expatriation et mobilité | — |
| 10 | Investissement locatif | Amortissement hypothécaire |
| 11 | Budget mensuel | Règle 50/30/20 |
| 12 | Bilan global et plan d'action | — |

---

## 2. Application Mobile (React Native / Expo)

**Stack** : Expo, TypeScript, React Navigation, AsyncStorage, expo-print, expo-sharing

- Même logique métier que le web (modules, champs, prompts, calculateurs)
- Navigation native avec stack navigator
- Formulaires natifs avec picker modal pour les selects
- Streaming SSE réel via ReadableStream
- Export PDF natif
- Persistance AsyncStorage

---

## 3. Les 10 améliorations implémentées

| # | Amélioration | Détails |
|---|-------------|---------|
| 1 | **Charts interactifs** | Recharts : PieChart (patrimoine, budget), BarChart (cash-flow, dettes, immo), AreaChart (retraite) |
| 2 | **Onboarding wizard** | 4 étapes avec pré-remplissage automatique des 12 modules |
| 3 | **Historique d'analyses** | Panel extensible avec comparaison en % entre analyses |
| 4 | **Bilan complet** | Modal qui lance l'IA sur tous les modules remplis + PDF consolidé |
| 5 | **Animations Framer Motion** | Transitions de pages, hover/tap sur les cartes, AnimatePresence |
| 6 | **Thème clair/sombre** | Toggle avec contexte React, persistance localStorage, CSS light mode |
| 7 | **PWA** | manifest.json, icônes, meta tags pour installation |
| 8 | **Tests unitaires** | 16 tests Jest couvrant les 6 calculateurs |
| 9 | **SSE streaming mobile** | ReadableStream + TextDecoder avec gestion de buffer |
| 10 | **Supabase auth + sync** | Email auth, sync cloud, table user_data |

---

## 4. État technique

- **Build web** : `npx next build` — OK
- **Tests** : 16/16 passent
- **TypeScript mobile** : `npx tsc --noEmit` — OK
- **Branche** : `claude/new-session-R8CvS` (4 commits)

---

## 5. Structure des fichiers

### Web (`patrimoine-360/`)

```
patrimoine-360/
├── app/
│   ├── layout.tsx              — Root layout avec ThemeProvider, PWA metadata
│   ├── page.tsx                — Dashboard avec onboarding wizard
│   ├── globals.css             — Styles globaux + light mode
│   ├── module/[id]/page.tsx    — Page module avec Charts, History, animations
│   └── api/analyze/route.ts   — API Claude avec streaming SSE
├── components/
│   ├── Dashboard.tsx           — Grille de modules + BilanComplet
│   ├── Sidebar.tsx             — Navigation latérale rétractable
│   ├── ModuleForm.tsx          — Rendu dynamique des formulaires
│   ├── AIResult.tsx            — Rendu Markdown de l'analyse IA
│   ├── Charts.tsx              — Visualisations Recharts (5 modules)
│   ├── ScoreGauge.tsx          — Jauge SVG animée
│   ├── MetricCard.tsx          — Carte de métrique
│   ├── ProgressBar.tsx         — Barre de progression animée
│   ├── LocalCalculations.tsx   — Affichage des résultats calculés
│   ├── OnboardingWizard.tsx    — Wizard 4 étapes + mapOnboardingToModules()
│   ├── HistoryPanel.tsx        — Historique avec comparaison en %
│   ├── BilanComplet.tsx        — Modal bilan multi-modules + PDF
│   ├── ThemeProvider.tsx       — Contexte React pour le thème
│   ├── ThemeToggle.tsx         — Bouton bascule soleil/lune
│   └── ExportButtons.tsx       — Export PDF et Excel
├── lib/
│   ├── modules.ts              — 12 définitions de modules
│   ├── fields.ts               — Champs de formulaire par module
│   ├── prompts.ts              — Prompts système et utilisateur
│   ├── calculators.ts          — 6 moteurs de calcul
│   ├── export-pdf.ts           — Génération PDF (jsPDF)
│   ├── export-excel.ts         — Génération Excel (ExcelJS)
│   └── supabase.ts             — Auth + sync cloud
├── types/
│   └── index.ts                — Types TypeScript
├── __tests__/
│   └── calculators.test.ts     — 16 tests unitaires
├── public/
│   └── manifest.json           — PWA manifest
├── jest.config.js
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── package.json
```

### Mobile (`patrimoine-360-mobile/`)

```
patrimoine-360-mobile/
├── App.tsx                     — Point d'entrée + React Navigation
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.tsx — Grille de modules + progression
│   │   └── ModuleScreen.tsx    — Module complet avec SSE streaming
│   ├── components/
│   │   ├── ModuleForm.tsx      — Formulaire natif + picker modal
│   │   ├── ScoreGauge.tsx      — Jauge SVG
│   │   ├── MetricCard.tsx      — Carte métrique
│   │   ├── ProgressBar.tsx     — Barre de progression
│   │   └── LocalCalculations.tsx
│   ├── lib/
│   │   ├── modules.ts          — Définitions des modules
│   │   ├── fields.ts           — Champs par module
│   │   ├── prompts.ts          — Prompts IA
│   │   ├── calculators.ts      — Moteurs de calcul
│   │   ├── storage.ts          — AsyncStorage wrapper
│   │   └── theme.ts            — Constantes de couleurs
│   └── types/
│       └── index.ts
├── assets/
├── app.json
├── tsconfig.json
└── package.json
```

---

## 6. Configuration requise

### Web — Déploiement Vercel

1. Variable d'environnement : `ANTHROPIC_API_KEY`
2. (Optionnel) Variables Supabase : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `npx next build && npx next start`

### Mobile — Expo

1. Configurer `API_URL` dans `src/screens/ModuleScreen.tsx`
   - Android emulator : `http://10.0.2.2:3000/api/analyze`
   - iOS simulator : `http://localhost:3000/api/analyze`
   - Production : URL de votre API déployée
2. `npx expo start`

---

## 7. Technologies utilisées

| Catégorie | Web | Mobile |
|-----------|-----|--------|
| Framework | Next.js 14 (App Router) | Expo / React Native |
| Langage | TypeScript | TypeScript |
| Style | Tailwind CSS v3 | StyleSheet |
| Animations | Framer Motion | — |
| Charts | Recharts | — |
| Navigation | Next.js routing | React Navigation |
| IA | Anthropic Claude API (SSE) | Anthropic Claude API (SSE) |
| Export PDF | jsPDF | expo-print |
| Export Excel | ExcelJS | — |
| Persistance | localStorage | AsyncStorage |
| Auth | Supabase | — |
| Tests | Jest + ts-jest | — |
| PWA | manifest.json | — |
