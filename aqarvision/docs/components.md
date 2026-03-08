# Components Specification — SaaS immobilier multi-agences (Marché algérien)

## 1. Objectif du fichier

Ce document liste les composants à construire pour la plateforme.

Pour chaque composant, on cherche à définir :

- son rôle
- son contexte d'usage
- ses variantes
- ses éléments internes
- ses états
- ses props principales
- ses contraintes UX/UI

Le but est de construire une bibliothèque cohérente, réutilisable et scalable.

---

## 2. Règles globales de développement des composants

Chaque composant doit être :

- réutilisable
- responsive
- accessible
- typé proprement
- visuellement cohérent
- simple à maintenir
- compatible avec le branding agence si nécessaire

### Règles générales

- toujours prévoir les états `default`, `hover`, `focus`, `disabled`, `loading`, `error` si pertinents
- éviter les composants trop rigides
- privilégier la composition
- séparer les composants UI génériques des composants métier
- documenter les variantes visuelles
- prévoir l'internationalisation
- prévoir la compatibilité RTL à terme

---

## 3. Organisation recommandée

```txt
components/
  ui/           # Composants UI génériques
  layout/       # Header, Footer, Sidebar, Container
  marketing/    # Hero, Feature card, Pricing card, etc.
  real-estate/  # Property card, Gallery, Filters, etc.
  dashboard/    # KPI card, Data table, Forms, etc.
  forms/        # Form sections, Media uploader, etc.
  feedback/     # Toast, Modal, Alert, Empty state, etc.
  branding/     # Trust badges, Agent card, etc.
```

---

## 4. Composants UI génériques

### 4.1 Button

**Rôle** : Déclencher une action principale ou secondaire.

#### Variantes

- `default` (primary)
- `or`
- `outline`
- `ghost`
- `destructive`
- `link`

#### Sizes

- `sm` / `default` / `lg` / `icon`

#### Props principales

- `variant`
- `size`
- `children`
- `disabled`
- `loading`
- `iconLeft`
- `iconRight`
- `fullWidth`
- `onClick`
- `asChild`

#### États

- default / hover / focus / active / disabled / loading

---

### 4.2 Input

**Rôle** : Saisie simple de texte ou donnée courte.

#### Types supportés

- text / email / password / tel / number / url

#### Props principales

- `label`
- `placeholder`
- `value`
- `onChange`
- `error`
- `hint`
- `required`
- `disabled`
- `prefix`
- `suffix`

#### États

- default / focus / error / disabled / filled

---

### 4.3 Textarea

**Rôle** : Saisie de contenu plus long.

#### Props principales

- `label`
- `placeholder`
- `value`
- `rows`
- `error`
- `hint`
- `maxLength`

---

### 4.4 Select

**Rôle** : Sélection dans une liste simple.

#### Props principales

- `label`
- `options`
- `value`
- `onValueChange`
- `placeholder`
- `error`
- `disabled`

---

### 4.5 Combobox

**Rôle** : Sélection et recherche dans une liste longue.

#### Cas d'usage

- wilaya
- commune
- quartier
- type de bien

#### Props principales

- `items`
- `value`
- `onSelect`
- `searchPlaceholder`
- `emptyMessage`

---

### 4.6 Checkbox

**Rôle** : Sélection multiple ou validation.

#### Cas d'usage

- équipements
- conditions
- filtres
- consentement

---

### 4.7 Radio Group

**Rôle** : Choix unique parmi plusieurs options.

#### Cas d'usage

- achat / location
- type de plan
- mode de contact
- publication immédiate / brouillon

---

### 4.8 Switch

**Rôle** : Activer ou désactiver un paramètre.

#### Cas d'usage

- annonce vedette
- afficher téléphone
- publier automatiquement
- recevoir notifications

---

### 4.9 Badge

**Rôle** : Afficher un statut court.

#### Variantes

- `default` / `success` / `warning` / `destructive` / `secondary` / `outline`

#### Cas métier

- Agence agréée
- Annonce vérifiée
- Publié / Brouillon
- Vedette / Nouveau

---

### 4.10 Tag

**Rôle** : Afficher une information courte catégorielle.

#### Cas d'usage

- appartement / villa / location
- Alger / 120 m²

---

### 4.11 Card

**Rôle** : Conteneur visuel de contenu structuré.

#### Variantes

- `default` : bordure + ombre légère
- `elevated` : ombre plus marquée
- `interactive` : hover visible
- `dark` : fond sombre (pricing Pro)

#### Props principales

- `children`
- `className`
- `hover`

---

### 4.12 Modal

**Rôle** : Dialogue superposé pour confirmation ou action ponctuelle.

#### Props principales

- `open`
- `onClose`
- `title`
- `description`
- `children`
- `actions`

---

### 4.13 Drawer

**Rôle** : Panneau latéral ou bas pour mobile.

#### Cas d'usage

- filtres mobile
- navigation mobile
- détails rapides

---

### 4.14 Alert

**Rôle** : Message contextuel important.

#### Variantes

- `info` / `success` / `warning` / `error`

---

### 4.15 Toast

**Rôle** : Notification temporaire non bloquante.

#### Variantes

- `default` / `success` / `error`

---

### 4.16 Skeleton

**Rôle** : Placeholder de chargement.

#### Cas d'usage

- cartes annonces
- images
- listes
- KPI

---

### 4.17 Empty State

**Rôle** : Afficher un état vide avec message et action.

#### Props principales

- `icon`
- `title`
- `description`
- `action` (label + onClick)

---

### 4.18 Pagination

**Rôle** : Navigation entre pages de résultats.

#### Props principales

- `currentPage`
- `totalPages`
- `onPageChange`

---

### 4.19 Breadcrumb

**Rôle** : Navigation hiérarchique.

#### Props principales

- `items` (label + href)

---

## 5. Composants layout

### 5.1 MarketingHeader

**Rôle** : Header sticky du site marketing.

#### Éléments

- logo AqarVision (carré sombre + texte)
- liens de navigation
- CTA "Connexion" et "Commencer"
- menu burger mobile

#### Style

- glass effect
- sticky top
- `max-w-6xl` centré

---

### 5.2 MarketingFooter

**Rôle** : Footer du site marketing.

#### Colonnes

- Brand (logo + description)
- Produit (liens)
- Agences (liens)
- Légal (liens)

---

### 5.3 DashboardSidebar

**Rôle** : Navigation latérale du dashboard.

#### Éléments

- logo
- liens de navigation avec icônes
- indicateur de page active
- lien déconnexion
- affichage mobile en bottom nav

---

### 5.4 DashboardTopbar

**Rôle** : Barre supérieure du dashboard.

#### Éléments

- titre de page
- avatar utilisateur
- menu burger mobile

---

### 5.5 SectionWrapper

**Rôle** : Conteneur de section avec padding vertical cohérent.

#### Props principales

- `children`
- `className`
- `id`

#### Style

- `section-padding` (py-20 md:py-28)

---

## 6. Composants marketing

### 6.1 HeroSection

**Rôle** : Section d'accroche principale de la landing page.

#### Éléments

- section label doré
- titre display
- sous-titre
- 2 boutons CTA
- badges de confiance
- mockup visuel

---

### 6.2 FeatureCard

**Rôle** : Carte de bénéfice/fonctionnalité.

#### Props principales

- `icon`
- `title`
- `description`

#### Style

- `rounded-2xl border bg-white p-6`
- hover: `shadow-card`

---

### 6.3 PricingCard

**Rôle** : Carte de plan tarifaire.

#### Variantes

- `light` : fond blanc, bordure
- `dark` : fond bleu nuit, texte blanc (plan populaire)

#### Props principales

- `planName`
- `price`
- `period`
- `features`
- `cta`
- `popular`

---

### 6.4 FAQItem

**Rôle** : Question/réponse dépliable.

#### Implémentation

- élément `<details>` natif
- style cohérent avec le design system

---

### 6.5 StatsStrip

**Rôle** : Bande de chiffres clés.

#### Props principales

- `stats` (valeur + label)

---

### 6.6 CTABand

**Rôle** : Bloc d'appel à l'action en bas de page.

#### Style

- fond sombre `bg-bleu-nuit`
- `rounded-2xl`
- titre + sous-titre + bouton

---

## 7. Composants immobilier

### 7.1 PropertyCard

**Rôle** : Carte d'annonce immobilière.

C'est le composant central du produit.

#### Éléments

- image principale avec gradient overlay
- badge type de transaction
- badge type de bien
- prix
- titre
- localisation (wilaya/commune)
- surface + pièces
- bouton favori (hover)

#### Style

- `rounded-2xl overflow-hidden`
- hover: `shadow-card`, translate up
- image: `aspect-[4/3]`

#### Props principales

- `listing` (objet annonce complet)
- `onFavorite`
- `showAgent`

---

### 7.2 PropertyGallery

**Rôle** : Galerie photos d'une annonce.

#### Éléments

- image principale grande
- miniatures navigation
- compteur photos
- zoom/plein écran

---

### 7.3 PropertyDetails

**Rôle** : Bloc de détails d'une annonce.

#### Sections

- caractéristiques principales (surface, pièces, étage, etc.)
- description
- équipements
- localisation

---

### 7.4 FilterPanel

**Rôle** : Panneau de filtres pour la recherche.

#### Filtres

- type de transaction (vente/location)
- type de bien
- wilaya
- commune
- prix min/max
- surface min/max
- nombre de pièces

#### Mobile

- drawer avec validation

---

### 7.5 SearchBar

**Rôle** : Barre de recherche avec icône.

#### Props principales

- `value`
- `onChange`
- `onSearch`
- `placeholder`

---

### 7.6 ContactPanel

**Rôle** : Bloc de contact sur une fiche annonce.

#### Éléments

- formulaire court (nom, téléphone, message)
- bouton appeler
- bouton WhatsApp
- bouton demander visite

---

### 7.7 AgentCard

**Rôle** : Carte d'un agent immobilier.

#### Éléments

- photo
- nom
- rôle
- téléphone
- email

---

### 7.8 AmenitiesList

**Rôle** : Liste des équipements d'un bien.

#### Éléments

- icônes + labels
- grille responsive

---

## 8. Composants dashboard

### 8.1 KPICard

**Rôle** : Carte de métrique sur le tableau de bord.

#### Éléments

- icône dans fond coloré
- valeur
- label
- variation optionnelle

#### Style

- `rounded-2xl border bg-white p-5`

---

### 8.2 DataTable

**Rôle** : Tableau de données (annonces, leads).

#### Éléments

- headers
- lignes avec données
- actions par ligne
- tri
- pagination

#### Mobile

- transformation en cartes empilées

---

### 8.3 FormSection

**Rôle** : Section de formulaire avec titre et contenu.

#### Style

- `rounded-2xl border bg-white`
- header avec titre + description
- contenu avec padding

---

### 8.4 MediaUploader

**Rôle** : Upload de photos pour les annonces.

#### Éléments

- zone de drop (`border-dashed rounded-xl`)
- preview des images
- bouton suppression (overlay sombre)
- compteur
- compression automatique
- support HEIC/HEIF

---

### 8.5 StepIndicator

**Rôle** : Indicateur d'étape pour formulaires multi-étapes.

#### Éléments

- numéros d'étapes dans carrés arrondis
- état actif / complété / à venir
- connecteurs entre étapes

#### Style

- complété : `bg-emerald-500 text-white`
- actif : `bg-bleu-nuit text-white`
- à venir : `bg-muted text-muted-foreground`

---

### 8.6 BillingCard

**Rôle** : Affichage du plan actuel et gestion de l'abonnement.

#### Éléments

- nom du plan
- prix
- date de renouvellement
- bouton changer de plan
- historique des paiements

---

## 9. Composants de réassurance (spécifiques Algérie)

### 9.1 TrustBadge

**Rôle** : Badge de confiance affiché sur les vitrines.

#### Variantes

- `agence-agreee` : avec icône BadgeCheck
- `annonce-verifiee` : avec icône ShieldCheck
- `reponse-rapide` : avec icône Clock

---

### 9.2 AgencyCredentials

**Rôle** : Bloc affichant les informations officielles de l'agence.

#### Éléments

- numéro d'agrément
- adresse physique
- wilaya
- années d'activité
- nombre de biens publiés

---

### 9.3 CoverageMap

**Rôle** : Affichage des zones couvertes par l'agence.

#### Éléments

- liste des wilayas/communes
- visuel carte optionnel

---

### 9.4 QuickContact

**Rôle** : Bloc de contact rapide sticky sur mobile.

#### Éléments

- bouton appeler
- bouton WhatsApp
- bouton demander visite

#### Style

- sticky bottom sur mobile
- backdrop-blur

---

## 10. Composants de feedback

### 10.1 LoadingSpinner

**Rôle** : Indicateur de chargement.

#### Variantes

- `sm` / `md` / `lg`
- couleur adaptable

---

### 10.2 ErrorState

**Rôle** : Affichage d'erreur avec action de retry.

#### Éléments

- icône
- titre
- description
- bouton réessayer

---

### 10.3 NotFoundState

**Rôle** : Page 404.

#### Éléments

- code "404" en display
- message
- bouton retour accueil

---

### 10.4 SuccessState

**Rôle** : Confirmation d'action réussie.

#### Éléments

- icône check
- titre
- description
- action suivante

---

## 11. Composants futurs (V2+)

### À prévoir mais pas encore à construire :

- `RichTextEditor` : éditeur de description enrichie
- `DatePicker` : sélection de dates
- `CommandPalette` : recherche rapide globale
- `NotificationCenter` : centre de notifications
- `ChatWidget` : messagerie intégrée
- `ComparisonTable` : comparaison de biens
- `FavoritesGrid` : grille de favoris
- `LeadTimeline` : historique d'interactions avec un lead
- `AIAssistant` : assistant IA pour la rédaction d'annonces
- `ThemePicker` : sélecteur de thème pour le branding agence

---

## 12. Règles de nommage

### Fichiers

- composants UI : `kebab-case.tsx` (ex: `button.tsx`, `badge.tsx`)
- composants métier : `kebab-case.tsx` (ex: `property-card.tsx`, `filter-panel.tsx`)
- composants partagés : dans `components/shared/`

### Exports

- composants : `PascalCase` (ex: `PropertyCard`, `FilterPanel`)
- variantes CVA : `camelCase` (ex: `buttonVariants`, `badgeVariants`)

### Props

- interfaces : `PascalCase` + suffixe `Props` si nécessaire (ex: `PropertyCardProps`)
- types métier : dans `types/index.ts`

---

## 13. Priorité d'implémentation

### Phase 1 — Fondations

1. Button, Input, Textarea, Select, Badge, Card
2. MarketingHeader, MarketingFooter
3. DashboardSidebar, DashboardTopbar
4. Empty State, Skeleton, Toast

### Phase 2 — Pages marketing

5. HeroSection, FeatureCard, PricingCard, FAQItem
6. StatsStrip, CTABand

### Phase 3 — Immobilier

7. PropertyCard, FilterPanel, SearchBar
8. PropertyGallery, PropertyDetails
9. ContactPanel, AgentCard

### Phase 4 — Dashboard

10. KPICard, DataTable, FormSection
11. MediaUploader, StepIndicator
12. BillingCard

### Phase 5 — Réassurance Algérie

13. TrustBadge, AgencyCredentials
14. QuickContact, CoverageMap

### Phase 6 — Polish

15. LoadingSpinner, ErrorState, NotFoundState
16. Animations et transitions
17. Responsive final
