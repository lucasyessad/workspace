# Session : Luxury Branding System — Enterprise Only

## Objectif
Ajouter un systeme de branding premium/luxe reserve exclusivement aux agences avec le pack **Enterprise** (societe). Les agences Enterprise (qui auront un domaine personnalise) obtiennent un site vitrine digne des agences immobilieres de luxe (Douglas Elliman, Corcoran), tandis que les agences Starter/Pro conservent leur mini-site basique inchange.

## Commit
`237037c` — `feat: add luxury branding system for Enterprise agencies`
Branche : `claude/aqarvision-supabase-rebuild-vPlfY`

---

## Modifications effectuees

### 1. Types & Interface Agency
**Fichier :** `src/types/database.ts`

Ajout de 3 nouveaux types + 9 nouveaux champs a l'interface `Agency` :
```typescript
export type HeroStyle = 'color' | 'cover' | 'video';
export type FontStyle = 'modern' | 'classic' | 'elegant';
export type ThemeMode = 'light' | 'dark';

// Nouveaux champs dans Agency :
secondary_color: string | null;      // Couleur secondaire (accents, decorations)
hero_video_url: string | null;       // URL video YouTube/MP4 pour hero
hero_style: HeroStyle;               // 'color' | 'cover' | 'video'
font_style: FontStyle;               // 'modern' | 'classic' | 'elegant'
theme_mode: ThemeMode;               // 'light' | 'dark'
tagline: string | null;              // Sous-titre premium (different du slogan)
stats_years: number | null;          // Annees d'experience
stats_properties_sold: number | null; // Biens vendus
stats_clients: number | null;        // Clients satisfaits
```

**IMPORTANT :** Ces champs doivent aussi etre ajoutes dans la base de donnees Supabase. Une migration SQL est necessaire :
```sql
ALTER TABLE agencies ADD COLUMN secondary_color TEXT;
ALTER TABLE agencies ADD COLUMN hero_video_url TEXT;
ALTER TABLE agencies ADD COLUMN hero_style TEXT NOT NULL DEFAULT 'cover';
ALTER TABLE agencies ADD COLUMN font_style TEXT NOT NULL DEFAULT 'elegant';
ALTER TABLE agencies ADD COLUMN theme_mode TEXT NOT NULL DEFAULT 'dark';
ALTER TABLE agencies ADD COLUMN tagline TEXT;
ALTER TABLE agencies ADD COLUMN stats_years INTEGER;
ALTER TABLE agencies ADD COLUMN stats_properties_sold INTEGER;
ALTER TABLE agencies ADD COLUMN stats_clients INTEGER;
```

### 2. Validation (Zod)
**Fichier :** `src/lib/validators/agency.ts`

- Ajout du schema `agencyLuxuryBrandingSchema` qui etend `agencyBrandingSchema` avec les champs Enterprise
- Utilise `z.coerce.number()` pour les stats (conversion string→number depuis les inputs HTML)
- Exporte aussi `AgencyLuxuryBrandingValues`

**Fichier :** `src/lib/validators/index.ts`
- Ajout de l'export `agencyLuxuryBrandingSchema` et `AgencyLuxuryBrandingValues`

### 3. Actions Server
**Fichier :** `src/lib/actions/branding.ts`

- `updateAgencyBranding()` : detecte maintenant le plan de l'agence et utilise le bon schema (luxury vs basique)
- Ajout de `updateAgencyCoverImage()` : upload image de couverture (max 10Mo), stockee dans `agencies/{id}/branding/cover.{ext}`, met a jour `cover_image_url`
- Gate d'acces : verifie `active_plan === 'enterprise'` avant d'autoriser l'upload cover

**Fichier :** `src/lib/actions/index.ts`
- Ajout de l'export `updateAgencyCoverImage`

### 4. Formulaire Branding Dashboard
**Fichier :** `src/app/(dashboard)/dashboard/branding/form.tsx`

- Ajout de la prop `isEnterprise: boolean`
- Section conditionnelle `{isEnterprise && (...)}` avec Card decoree (bordure or, gradient)
- Champs Enterprise :
  - Upload image de couverture (avec preview)
  - Style hero (select : couleur/cover/video)
  - URL video hero
  - Tagline premium (textarea)
  - Couleur secondaire (color picker)
  - Typographie (select : Modern/Classic/Elegant)
  - Mode theme (select : Sombre luxe / Clair)
  - 3 inputs stats numeriques (annees, biens vendus, clients)

**Fichier :** `src/app/(dashboard)/dashboard/branding/page.tsx`
- Calcule `isEnterprise` et le passe au formulaire
- Apercu : affiche l'image de couverture pour Enterprise

### 5. Animations CSS
**Fichier :** `src/app/globals.css`

Ajout de 7 keyframes + 10+ classes d'animation :
- `luxury-fade-in-up` — apparition avec translation
- `luxury-fade-in` — fondu simple
- `luxury-scale-in` — zoom entrant
- `luxury-scroll-bounce` — indicateur de scroll
- `luxury-line-grow` — trait decoratif qui s'allonge
- `luxury-counter` — apparition des compteurs
- Classes delayees : `.luxury-animate-fade-in-delayed`, `-delayed-2`, `-delayed-3`
- `.luxury-scroll-reveal` + `.is-visible` — animations au scroll via IntersectionObserver
- `.luxury-property-card` — hover zoom image
- `.luxury-header-glass` + `.is-scrolled` — header glassmorphism

### 6. Hook useScrollReveal
**Nouveau fichier :** `src/hooks/use-scroll-reveal.ts`

- Hook React qui retourne un `ref` a placer sur un container
- Observe tous les elements `.luxury-scroll-reveal` dans le container
- Ajoute la classe `is-visible` quand l'element entre dans le viewport
- Desinscrit l'element apres animation (one-shot)
- `threshold: 0.1`, `rootMargin: '0px 0px -50px 0px'`

### 7. Composants Luxury (nouveaux)

**`src/components/agency/luxury-hero.tsx`** (client component)
- Hero plein ecran (100vh) avec 3 modes : couleur unie / cover image / video
- Support YouTube embed + video MP4 directe
- Overlay gradient adaptatif (sombre ou clair selon `theme_mode`)
- Logo avec animation scale-in
- Nom en `font-display text-display-xl` (Playfair Display)
- Trait decoratif anime en `secondary_color`
- Tagline/slogan avec fade-in delayed
- Bouton CTA style luxe (sans border-radius, tracking-widest, uppercase)
- Compteurs animes (`AnimatedCounter`) avec easing cubique
- Indicateur de scroll (chevron avec bounce infini)

**`src/components/agency/luxury-layout.tsx`** (client component)
- Header fixe glassmorphism : transparent au top → opaque au scroll
- Navigation uppercase tracking-widest
- Menu hamburger mobile
- Footer premium avec ligne decorative `secondary_color`, icones colorees
- Mode sombre/clair dynamique selon `agency.theme_mode`
- `font-display` conditionnel selon `font_style`

**`src/components/agency/luxury-properties-section.tsx`** (client component)
- En-tete section avec label "Portfolio", titre, trait decoratif
- Grille de proprietes avec :
  - Badge type de transaction en `secondary_color`
  - Prix en overlay gradient
  - Infos (titre, wilaya, surface)
  - Hover zoom sur image (`.luxury-property-card`)
  - Scroll-reveal avec delay progressif
- Bouton "Voir tous les biens" style outline luxe

**`src/components/agency/luxury-about-section.tsx`** (client component)
- En-tete section avec label "Notre histoire"
- Description en texte centre
- Grille de statistiques avec couleur `secondary_color`
- Info cards (wilaya, registre commerce, adresse) avec fond translucide
- Scroll-reveal animations

### 8. Integration dans les pages Agency

**`src/app/agence/[slug]/layout.tsx`**
- Condition : `agency.active_plan === 'enterprise'` → `<LuxuryLayout>` sinon layout basique
- Layout basique inchange

**`src/app/agence/[slug]/page.tsx`**
- Condition Enterprise → `<LuxuryHero>` + `<LuxuryPropertiesSection>` + `<LuxuryAboutSection>`
- Page basique inchangee

**`src/app/agence/[slug]/a-propos/page.tsx`**
- Condition Enterprise → `<LuxuryAboutSection>` avec stats
- Page basique inchangee

**`src/app/agence/[slug]/contact/page.tsx`**
- Condition Enterprise → contact cards stylees avec `secondary_color`, fond adaptatif
- Page basique inchangee

---

## Verification TypeScript
- `npx tsc --noEmit` : **0 nouvelle erreur** dans les fichiers modifies/crees
- Les erreurs pre-existantes (supabase client, search filters, vitest config) ne sont PAS liees a ce commit

## Ce qui reste a faire
1. **Migration SQL Supabase** : ajouter les 9 colonnes a la table `agencies` (voir section 1 ci-dessus)
2. **Tester visuellement** : creer une agence Enterprise et verifier le rendu
3. **Responsive** : verifier le hero et le layout sur mobile/tablette
4. **Upload images** : tester l'upload cover image via le dashboard
5. **Video hero** : tester avec une URL YouTube et un fichier MP4 direct
6. **Custom domain routing** : implementer la resolution par domaine personnalise (non couvert dans cette session)

## Architecture
```
src/
├── types/database.ts              # Agency interface + HeroStyle, FontStyle, ThemeMode
├── lib/
│   ├── validators/agency.ts       # agencyLuxuryBrandingSchema
│   └── actions/branding.ts        # updateAgencyBranding (plan-aware), updateAgencyCoverImage
├── hooks/use-scroll-reveal.ts     # IntersectionObserver hook
├── components/agency/
│   ├── luxury-hero.tsx            # Full-screen hero (cover/video/color)
│   ├── luxury-layout.tsx          # Glassmorphism header + premium footer
│   ├── luxury-properties-section.tsx  # Portfolio grid
│   └── luxury-about-section.tsx   # About with stats
├── app/
│   ├── globals.css                # Luxury animations CSS
│   ├── (dashboard)/dashboard/branding/
│   │   ├── page.tsx               # Passes isEnterprise
│   │   └── form.tsx               # Enterprise section with luxury fields
│   └── agence/[slug]/
│       ├── layout.tsx             # Conditional LuxuryLayout
│       ├── page.tsx               # Conditional LuxuryHero + sections
│       ├── a-propos/page.tsx      # Conditional LuxuryAboutSection
│       └── contact/page.tsx       # Conditional luxury contact styling
```

## Gating : Comment les features sont protegees
- **Dashboard** : `isEnterprise = agency.active_plan === 'enterprise'` → section masquee sinon
- **Pages publiques** : `agency.active_plan === 'enterprise'` → composants luxury vs basiques
- **Actions** : `updateAgencyCoverImage` verifie `active_plan` cote serveur → erreur si pas Enterprise
- **Validation** : schema different selon le plan (agencyBrandingSchema vs agencyLuxuryBrandingSchema)
