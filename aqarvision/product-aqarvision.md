# Product Spec — Plateforme SaaS immobilière multi-agences (Marché algérien)

## 1. Vision du produit

Créer une plateforme SaaS immobilière moderne, premium et multi-agences, destinée dans un premier temps au marché algérien.

Le produit doit permettre à chaque agence immobilière de disposer :

- d’un mini-site vitrine professionnel
- d’un espace d’administration simple
- d’un système de gestion et publication d’annonces
- d’un abonnement mensuel
- d’une identité visuelle propre
- d’un parcours de conversion efficace pour générer des leads

L’objectif n’est pas simplement de créer un “site internet”.
L’objectif est de créer une **plateforme de référence** pour les agences immobilières qui veulent :

- mieux présenter leurs biens
- inspirer confiance
- se différencier des annonces diffusées sur les réseaux sociaux
- centraliser leurs contacts
- professionnaliser leur présence digitale

---

## 2. Problème à résoudre

Aujourd’hui, beaucoup d’agences immobilières publient leurs biens de manière dispersée :

- Facebook
- Instagram
- WhatsApp
- petites annonces
- bouche-à-oreille
- sites peu modernes
- outils de gestion inexistants ou peu pratiques

Cela crée plusieurs problèmes :

- faible crédibilité
- difficulté à inspirer confiance
- image de marque peu professionnelle
- perte d’annonces dans plusieurs canaux
- manque de suivi des prospects
- absence de structure digitale sérieuse
- difficulté à convertir proprement les visiteurs

Le produit doit résoudre cela avec une solution :

- belle
- simple
- rapide
- rassurante
- rentable pour l’agence

---

## 3. Positionnement

Le produit se positionne comme :

> la solution moderne, élégante et rassurante pour les agences immobilières algériennes qui veulent mieux présenter leurs biens, gagner en crédibilité et convertir davantage de prospects.

Ce n’est pas :

- un simple template vitrine
- un WordPress bricolé
- un logiciel interne complexe
- un portail d’annonces impersonnel

C’est :

- un SaaS immobilier
- une vitrine premium
- un back-office simple
- un outil métier moderne
- une base scalable

---

## 4. Marché cible

## 4.1 Marché initial

Le produit est conçu en priorité pour le **marché algérien**.

Il doit prendre en compte :

- les usages très orientés mobile
- le besoin fort de réassurance
- la concurrence indirecte des réseaux sociaux
- l’importance de l’ancrage local
- le besoin de contact rapide
- la nécessité d’une interface simple même pour des agences peu digitalisées

---

## 4.2 Cibles principales

### Cible 1 — Petites agences immobilières
Agences avec peu ou pas d’outil digital structuré.

Besoins :
- avoir un site moderne
- publier rapidement des annonces
- recevoir des contacts
- améliorer leur image

### Cible 2 — Agences établies
Agences qui veulent moderniser leur présence.

Besoins :
- branding plus fort
- mini-site professionnel
- gestion plus propre des annonces
- crédibilité renforcée

### Cible 3 — Réseaux ou agences premium
Acteurs voulant une image plus haut de gamme.

Besoins :
- identité visuelle forte
- personnalisation avancée
- structure propre
- expérience premium

---

## 4.3 Cible secondaire future

- diaspora algérienne
- promoteurs immobiliers
- agences de location saisonnière
- groupes multi-agences
- marchés Maghreb voisins

---

## 5. Proposition de valeur

La plateforme doit offrir aux agences :

- un mini-site vitrine premium
- un dashboard simple pour gérer leurs biens
- une meilleure crédibilité
- une publication centralisée
- un meilleur suivi des leads
- une présence digitale sérieuse
- une base évolutive sans refonte complète

La plateforme doit offrir aux visiteurs :

- des annonces plus claires
- une navigation plus simple
- des fiches biens plus crédibles
- un accès rapide au contact
- une meilleure confiance dans l’agence

---

## 6. Principes produit

Le produit doit être :

- mobile-first
- multi-tenant
- simple à utiliser
- premium visuellement
- rassurant
- rapide
- localisé pour l’Algérie
- extensible pour d’autres marchés

Les priorités doivent toujours être :

1. confiance
2. clarté
3. conversion
4. rapidité
5. cohérence visuelle

---

## 7. Architecture produit

La plateforme est composée de 3 grands blocs.

## 7.1 Site marketing principal

Rôle :
- présenter la plateforme
- convaincre les agences
- expliquer les bénéfices
- vendre l’abonnement
- générer des inscriptions ou demandes de démo

Exemples d’URL :
- `plateforme.com`
- `plateforme.com/features`
- `plateforme.com/pricing`

---

## 7.2 Mini-sites vitrines d’agences

Rôle :
- permettre à chaque agence d’avoir sa propre présence web
- valoriser ses annonces
- afficher sa marque
- inspirer confiance
- générer des leads

Exemples d’URL :
- `agence-x.plateforme.com`
- `agence-y.plateforme.com`
- `www.agence-x.dz`

---

## 7.3 Dashboard SaaS

Rôle :
- gérer les annonces
- gérer le branding
- gérer les leads
- gérer l’abonnement
- gérer les utilisateurs
- centraliser l’activité de l’agence

Exemple d’URL :
- `app.plateforme.com`
- `plateforme.com/dashboard`

---

## 8. Architecture multi-tenant

Le produit doit être pensé comme **une seule application** servant plusieurs agences.

Chaque agence dispose :

- de ses propres utilisateurs
- de ses propres annonces
- de ses propres leads
- de son propre branding
- de son propre mini-site
- éventuellement de son propre domaine

### Règles multi-tenant

- séparation stricte des données par agence
- logique d’authentification sécurisée
- branding isolé par tenant
- configuration indépendante par agence
- possibilité de montée en charge

---

## 9. Spécificités marché algérien

## 9.1 Mobile-first obligatoire

Le marché algérien impose une forte priorité mobile.

Cela implique :

- navigation très fluide sur smartphone
- CTA visibles immédiatement
- formulaires courts
- galeries d’images optimisées
- chargement rapide
- boutons d’appel et de prise de contact mis en avant

---

## 9.2 Confiance au centre de l’expérience

Le produit doit rassurer dès les premières secondes.

Les mini-sites d’agences doivent mettre visuellement en avant :

- agence agréée
- numéro d’agrément
- adresse réelle
- zone couverte
- identité de l’agence
- nombre d’annonces
- ancienneté
- présence locale
- annonces vérifiées
- photos réelles
- horaires et moyens de contact

---

## 9.3 Paiement adapté au contexte local

La V1 ne doit pas dépendre d’un système unique de paiement international.

### V1
- abonnement par facture manuelle
- activation manuelle du plan
- paiement hors ligne ou virement
- validation par l’équipe admin

### V2
- intégration de paiement local
- prise en charge CIB / SATIM
- étude Edahabia
- logique hybride international / local

---

## 9.4 Localisation fonctionnelle

Le produit doit prévoir dès le départ :

- français
- arabe
- anglais plus tard

Même si la V1 sort en français, l’architecture doit être prête pour :

- i18n
- support RTL
- champs multilingues
- contenus localisés

---

## 9.5 Géographie locale

Les filtres et formulaires doivent être adaptés à l’Algérie.

Structures à gérer :

- wilaya
- commune
- quartier
- zone
- prix en DZD
- types de biens locaux
- types de transactions adaptés

---

## 10. Utilisateurs du système

## 10.1 Visiteur public
Peut :
- visiter le site marketing
- voir les mini-sites agences
- rechercher des biens
- voir les fiches annonces
- contacter l’agence
- demander une visite

---

## 10.2 Propriétaire d’agence
Peut :
- gérer le compte agence
- gérer le branding
- publier des annonces
- gérer l’abonnement
- voir les leads
- inviter des collaborateurs

---

## 10.3 Administrateur agence
Peut :
- créer et modifier des annonces
- gérer les leads
- modifier certaines informations agence
- publier ou dépublier selon permissions

---

## 10.4 Éditeur agence
Peut :
- créer des brouillons
- modifier certaines annonces
- préparer les contenus

---

## 10.5 Super admin plateforme
Peut :
- gérer les agences
- activer ou suspendre des comptes
- gérer les plans
- voir les abonnements
- modérer certains contenus
- gérer les configurations globales

---

## 11. Pages du site marketing principal

## 11.1 Page d’accueil

### Objectif
Présenter la plateforme et convertir les agences.

### Sections
- Hero premium
- preuve sociale
- bénéfices clés
- aperçu du dashboard
- aperçu d’un mini-site agence
- fonctionnalités principales
- plans tarifaires
- FAQ
- CTA final

### Message principal
Créer un site vitrine immobilier moderne et gérer ses annonces depuis une seule plateforme.

---

## 11.2 Page fonctionnalités

### Objectif
Détailler le produit.

### Blocs
- mini-site agence
- gestion des annonces
- branding personnalisé
- génération de leads
- dashboard simple
- partage mobile
- personnalisation
- évolutivité

---

## 11.3 Page exemples / démo

### Objectif
Montrer des exemples visuels concrets.

### Contenu
- aperçu de plusieurs agences
- variantes visuelles
- exemples desktop/mobile
- cards avant/après
- démos de fiches biens

---

## 11.4 Page tarifs

### Objectif
Présenter les plans d’abonnement.

### Plans recommandés
- Starter
- Pro
- Premium

### Informations à afficher
- prix mensuel
- prix annuel éventuel
- nombre d’annonces
- branding
- utilisateurs
- domaine personnalisé
- support
- limitations éventuelles

---

## 11.5 Page contact / démo

### Objectif
Recevoir des demandes entrantes.

### Champs
- nom
- nom de l’agence
- email
- téléphone
- ville / wilaya
- volume d’annonces
- message

---

## 12. Pages des mini-sites vitrines d’agences

## 12.1 Home agence

### Objectif
Présenter l’agence et mettre en avant ses biens.

### Sections
- hero agence
- moteur de recherche
- biens en vedette
- avantages de l’agence
- zones couvertes
- chiffres clés
- témoignages éventuels
- bloc “pourquoi nous faire confiance”
- CTA contact

### Éléments de confiance
- badge agence agréée
- adresse physique
- téléphone visible
- horaires
- présence locale

---

## 12.2 Liste des annonces

### Objectif
Permettre de rechercher facilement les biens.

### Fonctionnalités
- recherche rapide
- filtres
- tri
- affichage grille / liste
- pagination ou chargement progressif

### Filtres
- achat / location
- wilaya
- commune
- quartier
- type de bien
- budget
- surface
- nombre de pièces
- statut
- équipements

---

## 12.3 Fiche annonce

### Objectif
Maximiser la conversion.

### Structure
- galerie d’images
- titre du bien
- prix
- type d’offre
- localisation
- informations clés
- description
- équipements
- formulaire de contact
- boutons contact rapide
- agence responsable
- biens similaires

### Éléments de conversion
- bouton appeler
- bouton demander visite
- bouton message
- téléphone visible
- sticky CTA mobile

### Éléments de réassurance
- annonce vérifiée
- agence agréée
- documents disponibles si activé
- temps de réponse estimé

---

## 12.4 Page À propos

### Objectif
Humaniser et crédibiliser l’agence.

### Contenu
- histoire
- mission
- équipe
- ancrage local
- adresse
- photo réelle
- wilayas / communes couvertes
- numéro d’agrément

---

## 12.5 Page contact

### Objectif
Créer un point d’entrée simple.

### Contenu
- formulaire
- téléphone
- email
- adresse
- carte
- horaires
- réseaux sociaux

---

## 13. Dashboard agence

## 13.1 Vue d’ensemble

### Objectif
Donner une vision rapide de l’activité.

### Widgets
- nombre d’annonces actives
- nombre de brouillons
- leads reçus
- leads récents
- plan actuel
- statut abonnement
- actions rapides

---

## 13.2 Gestion des annonces

### Fonctionnalités
- créer une annonce
- modifier
- enregistrer en brouillon
- publier
- archiver
- supprimer
- dupliquer

### Champs annonce
- titre
- slug
- transaction
- type de bien
- prix
- négociable ou non
- surface
- pièces
- chambres
- salles de bain
- localisation
- wilaya
- commune
- quartier
- description
- équipements
- images
- statut
- annonce vedette
- agent responsable

---

## 13.3 Gestion des leads

### Fonctionnalités
- voir les demandes
- filtrer
- changer le statut
- ajouter des notes
- identifier le bien concerné

### Statuts possibles
- nouveau
- contacté
- qualifié
- visite planifiée
- clos

---

## 13.4 Branding agence

### Fonctionnalités
- logo
- nom agence
- slogan
- couleur principale
- photo de couverture
- coordonnées
- liens sociaux
- texte de présentation
- agrément
- zones couvertes

---

## 13.5 Utilisateurs agence

### Fonctionnalités
- inviter un collaborateur
- choisir un rôle
- voir les membres
- désactiver des accès
- suivre les invitations

---

## 13.6 Abonnement

### Fonctionnalités
- voir le plan actuel
- voir la date de renouvellement
- demander un upgrade
- voir l’historique
- afficher l’état de paiement

---

## 13.7 Paramètres

### Fonctionnalités
- informations générales
- domaine personnalisé
- préférences contact
- visibilité du téléphone
- préférences langue
- notifications futures

---

## 14. Modules clés du produit

## 14.1 Module annonces
Permet de centraliser toute la gestion des biens.

## 14.2 Module vitrines agences
Permet de générer automatiquement un mini-site agence.

## 14.3 Module leads
Permet de suivre les demandes entrantes.

## 14.4 Module branding
Permet à chaque agence de personnaliser son apparence.

## 14.5 Module abonnement
Permet de gérer les plans et activations.

## 14.6 Module administration
Permet à l’équipe plateforme de gérer les agences.

---

## 15. Fonctionnalités V1

La V1 doit être simple mais vendable.

### À inclure absolument
- landing page
- auth agence
- dashboard agence
- CRUD annonces
- upload d’images
- mini-site agence
- liste des annonces
- fiche annonce
- branding simple
- gestion des leads
- abonnement manuel
- rôles de base
- responsive mobile
- structure multi-tenant

### À ne pas complexifier au départ
- CRM avancé
- analytics complexes
- workflow ultra détaillé
- marketplace globale
- moteur IA avancé
- diffusion multi-portails

---

## 16. Fonctionnalités V2

### À envisager
- assistant IA pour rédaction d’annonces
- génération de titres
- reformulation premium
- multilingue FR/AR
- paiement local intégré
- statistiques simples
- favoris visiteurs
- comparaison de biens
- blog agence
- thèmes supplémentaires
- domaine custom simplifié
- partage social optimisé

---

## 17. Fonctionnalités V3

### Plus tard
- réseau multi-agences
- portail global
- scoring lead
- matching intelligent
- campagnes marketing
- import/export massif
- diffusion automatique externe
- application mobile
- système de rendez-vous avancé

---

## 18. ADN visuel

Le design doit être :

- premium
- moderne
- rassurant
- lumineux
- simple
- très lisible
- mobile-first
- plus chaleureux qu’un SaaS B2B froid

Le rendu recherché doit évoquer :

- confiance
- structure
- qualité
- sérieux
- valeur immobilière
- professionnalisme

---

## 19. Direction artistique

Le style doit se situer entre :

- un SaaS moderne premium
- une marque immobilière élégante
- une interface business simple

### Mots-clés visuels
- luxe discret
- propreté
- espace
- fluidité
- réassurance
- clarté
- précision

---

## 20. Palette visuelle

## 20.1 Base neutre
- fond principal clair
- surfaces blanches ou gris très léger
- texte principal presque noir
- texte secondaire gris profond
- bordures discrètes

## 20.2 Couleur de marque
Choisir une dominante principale :

### Option A
Bleu profond premium

### Option B
Vert émeraude élégant

## 20.3 Couleur d’ambiance
Touches sable ou beige léger pour réchauffer l’interface.

## 20.4 Couleurs fonctionnelles
- succès
- warning
- erreur
- info

### Règle générale
- 80 % neutre
- 15 % accent
- 5 % fonctionnel

---

## 21. Typographie

### Police recommandée
- Inter
ou
- Plus Jakarta Sans

### Principes
- hiérarchie claire
- lisibilité maximale
- pas de fantaisie excessive
- peu de gras agressif
- beaucoup d’air

### Niveaux
- Display
- H1
- H2
- H3
- Body large
- Body
- Small

---

## 22. Layout et spacing

### Principes
- grand confort visuel
- sections respirantes
- cartes généreuses
- rythme vertical fort
- hiérarchie claire

### Grille
- desktop : 12 colonnes
- mobile : lecture verticale simple

### Containers
- narrow
- default
- wide
- full

---

## 23. Motion design

Les animations doivent être :

- sobres
- utiles
- légères
- rapides

### Autorisé
- fade-in
- hover subtil
- ouverture douce
- skeleton loading
- transition de panneaux

### À éviter
- animations lourdes
- effets gadgets
- lenteurs inutiles

---

## 24. Composants principaux à construire

## 24.1 UI générique
- Button
- Input
- Textarea
- Select
- Combobox
- Checkbox
- Radio Group
- Switch
- Badge
- Tag
- Card
- Modal
- Drawer
- Tabs
- Accordion
- Tooltip
- Alert
- Toast
- Skeleton
- Empty State

---

## 24.2 Layout
- Container
- Section
- Page Header
- Breadcrumb
- Divider
- Grid
- Sidebar Layout

---

## 24.3 Marketing
- Hero Section
- Feature Card
- Feature Grid
- Logo Cloud
- Testimonial Card
- Pricing Card
- Comparison Table
- FAQ Block
- CTA Band
- Metrics Strip

---

## 24.4 Immobilier
- Property Card
- Property List
- Property Gallery
- Property Price Block
- Property Meta
- Property Description
- Amenities List
- Property Location Block
- Property Search Bar
- Filter Panel
- Sort Select
- Agency Card
- Agent Card
- Trust Badge Group
- Lead Contact Panel
- Visit Request Form
- Similar Properties
- Social Share Block

---

## 24.5 Spécifiques Algérie
- Official Agency Badge
- Verified Listing Badge
- Coverage Area Block
- DZD Price Formatter
- Wilaya / Commune Selector
- Local Trust Section

---

## 24.6 Dashboard
- Dashboard Sidebar
- Dashboard Topbar
- KPI Card
- Stats Grid
- Listing Table
- Leads Table
- Lead Status Chip
- Property Form Wizard
- Media Uploader
- Rich Text Editor
- Branding Form
- Theme Preview Card
- Subscription Card
- Billing History List
- Team Member Card
- Invite User Form
- Draft / Publish Controls

---

## 25. UX principles

Le produit doit toujours :

- montrer l’action principale
- réduire la charge mentale
- guider l’utilisateur
- rassurer
- rester simple
- fonctionner parfaitement sur mobile

### Règles
- une action primaire claire par écran
- labels explicites
- formulaires bien découpés
- erreurs compréhensibles
- états vides utiles
- feedback visible après action
- navigation propre

---

## 26. Responsive design

Le mobile est prioritaire.

### Règles clés
- header compact
- filtres dans un drawer
- cartes annonces empilées
- formulaire court
- CTA téléphone et visite très visibles
- sticky CTA mobile sur la fiche bien
- zones tactiles généreuses

---

## 27. Accessibilité minimale attendue

- contrastes lisibles
- focus visible
- navigation clavier correcte
- labels clairs
- erreurs explicites
- composants accessibles
- tailles tactiles adaptées

---

## 28. SEO et crédibilité

Chaque mini-site agence doit être pensé pour être :

- bien indexable
- propre techniquement
- crédible commercialement

### À prévoir
- URLs propres
- metadata par page
- Open Graph par bien
- titres cohérents
- contenu localisé
- structure claire
- images optimisées
- sections agence solides
- pages contact crédibles

---

## 29. Contenus et ton éditorial

### Partie marketing plateforme
Le ton doit être :
- premium
- simple
- orienté bénéfices
- compréhensible
- non technique

### Partie agence
Le ton doit être :
- humain
- rassurant
- local
- professionnel

### Partie dashboard
Le ton doit être :
- direct
- métier
- fonctionnel
- simple

---

## 30. Données principales à modéliser

## 30.1 Agency
Contient :
- id
- nom
- slug
- logo
- slogan
- couleurs
- coordonnées
- wilaya
- communes couvertes
- licence / agrément
- cover image
- plan actif
- statut

---

## 30.2 User
Contient :
- id
- agency_id
- nom
- email
- rôle
- statut

---

## 30.3 Property
Contient :
- id
- agency_id
- titre
- slug
- transaction
- type de bien
- prix
- devise
- surface
- pièces
- chambres
- salles de bain
- wilaya
- commune
- quartier
- adresse
- description
- équipements
- statut
- vedette
- vérifiée
- images
- dates

---

## 30.4 Lead
Contient :
- id
- agency_id
- property_id
- nom
- téléphone
- email
- message
- statut
- date création
- notes éventuelles

---

## 30.5 Subscription
Contient :
- id
- agency_id
- plan
- statut
- date début
- date renouvellement
- historique

---

## 31. Stack technique recommandée

### Frontend / App
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend / DB / Auth
- Supabase

### Stockage images
- Supabase Storage
ou
- Cloudinary

### Email
- Resend

### Analytics
- PostHog

### Paiement V1
- facturation manuelle

### Paiement V2
- solution locale adaptée Algérie

---

## 32. Raisons du choix technique

Cette stack permet :

- un design premium
- une vitesse de développement élevée
- une architecture propre
- un coût raisonnable
- une bonne évolutivité
- une base solide pour le multi-tenant
- une bonne compatibilité avec Claude Code

---

## 33. Principes d’implémentation

L’ordre de construction recommandé est :

1. design tokens
2. composants UI de base
3. layouts
4. pages marketing
5. dashboard
6. composants immobilier
7. mini-sites agences
8. formulaires métier
9. states / errors / empty states
10. polish visuel final

---

## 34. Priorité de build

## Phase 1 — Fondation
- setup Next.js
- auth
- base multi-tenant
- design system
- composants UI
- layout global

## Phase 2 — Partie marketing
- landing page
- pricing
- contact
- exemples

## Phase 3 — Dashboard agence
- overview
- CRUD annonces
- leads
- branding
- abonnement

## Phase 4 — Vitrine agence
- home agence
- listing
- fiche annonce
- à propos
- contact

## Phase 5 — Localisation Algérie
- DZD
- wilaya/commune
- badges confiance
- adaptation éditoriale

## Phase 6 — Premium polish
- micro-animations
- responsive avancé
- SEO
- performance
- tests visuels

---

## 35. Critères de succès produit

Le produit est réussi si :

- une agence peut être onboardée rapidement
- elle peut publier des annonces sans friction
- son mini-site inspire confiance
- les visiteurs comprennent vite l’offre
- les fiches biens convertissent bien
- le dashboard reste simple
- l’ensemble paraît premium
- l’expérience mobile est excellente

---

## 36. KPI produit à suivre

### KPI business
- nombre d’agences inscrites
- taux d’activation
- taux de conversion essai → abonnement
- revenu mensuel récurrent

### KPI usage
- nombre d’annonces publiées
- nombre de leads générés
- taux de publication
- fréquence de connexion agence

### KPI UX
- temps de chargement
- taux de complétion formulaire
- taux de clic contact
- taux de rebond mobile

---

## 37. Risques à éviter

- vouloir trop de fonctionnalités dès la V1
- faire un design trop “template”
- négliger la confiance
- faire un dashboard trop complexe
- surcharger les formulaires
- oublier la logique locale algérienne
- sous-estimer le mobile
- mélanger trop de styles visuels

---

## 38. Prompt maître pour Claude Code

```txt
Tu dois construire un SaaS immobilier multi-agences destiné d’abord au marché algérien.

Objectif :
Créer une plateforme premium permettant à chaque agence immobilière d’avoir :
1. un mini-site vitrine moderne
2. un dashboard simple pour gérer ses annonces, ses leads, son branding et son abonnement

Contraintes clés :
- mobile-first
- multi-tenant
- design premium, moderne, rassurant
- fort niveau de crédibilité
- orienté conversion
- pensé pour des agences parfois peu digitalisées
- localisé pour l’Algérie
- prêt pour le français puis l’arabe
- prix en DZD
- géographie basée sur wilaya / commune / quartier
- support des badges agence agréée / annonce vérifiée
- architecture scalable
- composants réutilisables
- code propre et factorisé

Stack cible :
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Storage pour les images
- système d’abonnement manuel en V1

Pages à créer :
- landing page
- page fonctionnalités
- page tarifs
- page contact
- home mini-site agence
- listing annonces
- fiche annonce
- page à propos agence
- dashboard overview
- gestion annonces
- gestion leads
- branding
- abonnement

Composants prioritaires :
- design tokens
- button, input, card, badge, modal, drawer
- hero section, pricing card, faq block
- property card, property gallery, filter panel, lead contact panel
- dashboard sidebar, KPI card, listing table, property form wizard
- composants spécifiques Algérie : DZD formatter, wilaya selector, official agency badge

Le résultat attendu doit ressembler à un produit de grande qualité, prêt à vendre, et non à un prototype scolaire.