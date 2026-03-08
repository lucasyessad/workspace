# Design System — SaaS immobilier multi-agences (Marché algérien)

## 1. Objectif du design system

Ce design system définit les règles visuelles, structurelles et comportementales de la plateforme.

Il doit permettre de construire un produit :

- moderne
- premium
- crédible
- clair
- rapide
- cohérent
- facilement réutilisable

Le rendu final doit inspirer immédiatement :

- confiance
- professionnalisme
- stabilité
- modernité
- simplicité

Le design doit être pensé pour un **marché algérien mobile-first**, avec une forte attente de réassurance, de lisibilité et d'efficacité commerciale.

---

## 2. Principes fondateurs

### 2.1 Clarté avant tout

Chaque écran doit être compréhensible rapidement.

Règles :

- une hiérarchie visuelle forte
- peu d'éléments concurrents
- une action principale claire
- des textes simples
- des interfaces aérées

---

### 2.2 Confiance visible

Le produit doit rassurer.

Cela implique :

- cartes propres
- typographie lisible
- peu d'effets "gadgets"
- éléments de preuve visibles
- cohérence stricte entre tous les écrans

---

### 2.3 Premium mais accessible

Le produit doit faire "haut de gamme", sans être froid ou compliqué.

Donc :

- belles proportions
- bons espacements
- grandes images
- accents visuels sobres
- détails soignés
- composants élégants mais faciles à comprendre

---

### 2.4 Mobile-first réel

L'expérience smartphone n'est pas secondaire.

Les composants critiques doivent être pensés d'abord pour :

- petits écrans
- navigation tactile
- rapidité
- lecture verticale
- CTA visibles immédiatement

---

### 2.5 Réutilisabilité

Chaque composant doit être :

- modulable
- cohérent
- documenté
- indépendant
- facilement réutilisable dans plusieurs contextes

---

## 3. Personnalité visuelle

### Mots-clés de marque

- premium
- rassurant
- structuré
- lumineux
- immobilier
- local
- technologique
- simple
- élégant

### Impression recherchée

Le produit doit donner l'impression d'un mélange entre :

- une plateforme SaaS moderne
- une marque immobilière haut de gamme
- une interface business crédible
- un service digital accessible au marché local

---

## 4. Palette de couleurs

### 4.1 Philosophie couleur

La couleur ne doit pas saturer l'interface.

Répartition recommandée :

- 80 % tons neutres
- 15 % couleur de marque
- 5 % couleurs fonctionnelles

Le design repose d'abord sur :

- le contraste
- l'espace
- la typographie
- la structure

et non sur une accumulation de couleurs.

---

### 4.2 Couleurs principales

#### Neutres

- `background`: fond principal très clair
- `surface`: fond de cartes et blocs
- `surface-muted`: fond secondaire léger
- `border`: bordures discrètes
- `text-primary`: texte principal
- `text-secondary`: texte secondaire
- `text-muted`: texte discret

#### Couleur de marque

Deux directions premium recommandées :

**Option A — Bleu profond**
À utiliser si l'on veut un rendu :

- corporate
- crédible
- tech
- premium

**Option B — Vert émeraude**
À utiliser si l'on veut un rendu :

- élégant
- distinctif
- premium
- plus chaleureux

#### Couleur d'ambiance complémentaire

- sable clair
- beige très léger
- gris chaud subtil

Cette couleur doit servir à réchauffer l'interface, surtout sur les pages marketing et vitrines d'agences.

---

### 4.3 Couleurs fonctionnelles

#### Success

Pour :

- validation
- annonce publiée
- paiement confirmé
- action réussie

#### Warning

Pour :

- brouillon
- abonnement bientôt expiré
- information à vérifier

#### Error

Pour :

- erreur de formulaire
- échec d'upload
- action impossible

#### Info

Pour :

- message d'aide
- conseils
- notifications système

---

### 4.4 Règles d'usage couleur

- ne jamais utiliser plus d'une vraie couleur de marque dominante par écran
- garder les surfaces très claires
- réserver les couleurs fortes aux CTA et états importants
- éviter les dégradés trop visibles
- conserver une palette élégante et restreinte

---

## 5. Typographie

### 5.1 Police principale

Recommandation :

- **Plus Jakarta Sans** pour une sensation premium (choix actuel)
- **Cairo** pour le support arabe

#### Règle

Une seule police principale pour tout le produit au départ.

---

### 5.2 Hiérarchie typographique

#### Display

Utilisé pour :

- hero
- titres majeurs
- sections marketing

Caractéristiques :

- fort impact
- espacement soigné
- très lisible
- jamais trop serré

#### Heading 1

Utilisé pour :

- pages principales
- écrans dashboard majeurs

#### Heading 2

Utilisé pour :

- titres de sections
- blocs structurants

#### Heading 3

Utilisé pour :

- sous-sections
- titres de cartes importantes

#### Body Large

Utilisé pour :

- sous-titres
- paragraphes de mise en avant

#### Body

Utilisé pour :

- contenu courant
- descriptions
- formulaires
- textes de composants

#### Caption / Small

Utilisé pour :

- métadonnées
- informations secondaires
- légendes
- aides

---

### 5.3 Règles typographiques

- limiter les effets de gras excessifs
- créer la hiérarchie par taille, poids et espacement
- éviter les paragraphes trop serrés
- garder une excellente lisibilité sur mobile
- ne pas utiliser de texte gris trop faible en contraste

---

## 6. Espacements

### 6.1 Philosophie

L'espace est un élément premium.

Le produit doit "respirer".
Il vaut mieux :

- moins d'éléments
- mieux espacés
- mieux hiérarchisés

qu'un écran chargé.

---

### 6.2 Échelle recommandée

Utiliser une échelle cohérente de spacing :

- `4` / `8` / `12` / `16` / `20` / `24` / `32` / `40` / `48` / `64` / `80` / `96`

#### Utilisation

- petits espaces : icônes, badges, tags
- moyens espaces : cartes, formulaires, blocs internes
- grands espaces : sections, hero, séparations majeures

---

### 6.3 Règles d'espacement

- garder un padding généreux dans les cards
- utiliser de grands espaces entre sections
- ne jamais coller des composants critiques entre eux
- conserver un rythme vertical cohérent

---

## 7. Layout et grille

### 7.1 Largeur de contenu

Le contenu doit être centré avec une largeur maximale confortable.

Types de containers :

- `narrow`: textes, FAQ, formulaires simples
- `default`: sections standards (max-width: 1280px)
- `wide`: grilles annonces, dashboards, comparatifs
- `full`: hero visuels, galeries, cartes maps

---

### 7.2 Grille desktop

Recommandation :

- grille 12 colonnes
- gutters réguliers
- alignements stricts
- proportions visuelles propres

---

### 7.3 Grille mobile

Le mobile doit privilégier :

- lecture verticale
- cartes pleine largeur
- CTA faciles à toucher
- hiérarchie simplifiée

---

## 8. Bordures, rayons et ombres

### 8.1 Border radius

Le produit doit être moderne mais sérieux.

Recommandation :

- petits composants : `rounded-lg` (0.625rem)
- cartes : `rounded-xl` à `rounded-2xl`
- modales / grands blocs : `rounded-2xl`

Le radius doit être cohérent partout.

---

### 8.2 Bordures

Les bordures doivent être :

- fines
- sobres
- lisibles
- jamais trop contrastées

---

### 8.3 Ombres

Échelle d'ombres :

- `shadow-soft` : cartes légères, inputs
- `shadow-card` : cartes principales, hover
- `shadow-elevated` : dropdowns, popovers
- `shadow-float` : modales, éléments flottants

À éviter :

- ombres noires fortes
- effets datés
- sensation "cheap"

---

## 9. Iconographie

### 9.1 Style d'icônes

Bibliothèque : **Lucide React**

Les icônes doivent être :

- simples
- fines
- cohérentes
- modernes
- compréhensibles immédiatement

---

### 9.2 Usage

Les icônes servent à :

- guider
- clarifier
- structurer
- rassurer

Elles ne doivent pas être purement décoratives à outrance.

---

## 10. Imagerie

### 10.1 Style photo

Les images immobilières doivent être :

- lumineuses
- nettes
- premium
- réalistes
- valorisantes

Éviter :

- photos sombres
- images pixelisées
- banques d'images trop génériques
- visuels trop artificiels

---

### 10.2 Style marketing

Le site marketing doit utiliser :

- mockups propres
- captures dashboard élégantes
- aperçus d'annonces réalistes
- visuels de biens qualitatifs
- très peu d'illustrations cartoon

---

## 11. Composants fondamentaux

### 11.1 Boutons

#### Variantes

- `default` (primary) : `bg-bleu-nuit text-white shadow-soft hover:shadow-card`
- `or` : `bg-or text-white`
- `outline` : `bg-white border hover:bg-muted`
- `ghost` : transparent, hover léger
- `destructive` : réservé aux actions destructives
- `link` : texte seul

#### Règles

- bouton principal bien visible
- bouton secondaire discret mais clair
- tailles : `sm` (h-9), `default` (h-10), `lg` (h-12), `icon`
- états hover, focus, loading et disabled obligatoires

---

### 11.2 Inputs

#### Règles

- `h-11 rounded-lg bg-white px-4`
- label toujours visible
- aide contextuelle si utile
- erreurs sous le champ
- contraste élevé
- grande zone tactile sur mobile

---

### 11.3 Cards

#### Règles

- `rounded-xl shadow-soft border`
- padding généreux
- hover discret (`hover:shadow-card`)
- contenu très structuré

---

### 11.4 Badges

#### Variantes

- `default` : `bg-bleu-nuit text-white`
- `success` : `bg-emerald-50 text-emerald-700`
- `warning` : `bg-amber-50 text-amber-700`
- `destructive` : `bg-red-50 text-red-700`
- `secondary` : `bg-muted text-muted-foreground`
- `outline` : bordure seule

---

## 12. Motion design

### 12.1 Philosophie

Les animations doivent :

- accompagner
- rassurer
- améliorer la perception de qualité
- jamais ralentir l'usage

---

### 12.2 Animations autorisées

- `fade-in-up` : apparition douce avec translation (16px, 0.5s)
- `scale-in` : apparition avec scale (0.95 → 1)
- hover subtil (`hover-lift` : translateY -4px)
- transition d'état
- skeleton loading

---

### 12.3 Animations à éviter

- rebonds excessifs
- effets trop lents
- sur-animations décoratives
- transitions qui gênent la productivité
- parallax lourde
- gradient-shift, pulse-glow

---

## 13. Responsive design

### 13.1 Breakpoints

- `sm` : 640px
- `md` : 768px
- `lg` : 1024px
- `xl` : 1280px
- `2xl` : 1536px

---

### 13.2 Priorités mobile

Sur mobile :

- header compact
- CTA visibles
- filtres accessibles (drawer)
- formulaires faciles
- cartes pleine largeur
- lecture verticale naturelle
- sticky CTA sur fiches biens si pertinent

---

## 14. Accessibilité

Le design system doit intégrer des règles minimales solides :

- contraste suffisant
- focus visible (`.focus-ring`)
- navigation clavier correcte
- labels explicites
- boutons compréhensibles
- états d'erreur clairs
- tailles tactiles correctes (min 44x44px)

---

## 15. Internationalisation et arabe

Le système doit être compatible avec :

- français (V1)
- arabe (V2)
- anglais (futur)

### Contraintes à prévoir

- inversion de layout en RTL
- alignements dynamiques
- composants compatibles RTL
- champs multilingues
- typographie lisible dans les deux systèmes (Cairo pour l'arabe)

---

## 16. Règles branding par agence

Chaque agence doit pouvoir personnaliser certains éléments sans casser la cohérence globale.

### Personnalisables

- logo
- couleur principale
- slogan
- photo de couverture
- coordonnées
- réseaux sociaux

### Non personnalisables

- structure des pages
- règles de spacing
- composants critiques
- hiérarchie visuelle globale
- logique UX

---

## 17. États d'interface

Chaque composant important doit prévoir :

- default
- hover
- focus
- active
- disabled
- loading
- success
- error
- empty

### Exemples métier

- aucune annonce
- aucun lead
- annonce en brouillon
- image en cours d'upload
- publication réussie
- abonnement expiré

---

## 18. Consigne finale pour implémentation

L'équipe ou l'IA qui construit l'interface doit suivre cette logique :

1. poser les fondations visuelles
2. créer les tokens
3. créer les composants de base
4. créer les patterns de layout
5. construire les composants métier immobilier
6. construire les écrans
7. harmoniser les états
8. finaliser le polish visuel

Le résultat attendu est un produit :

- prêt à vendre
- crédible en démonstration
- beau sur mobile
- rassurant pour le marché algérien
- extensible à grande échelle
