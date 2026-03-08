# Spécificités produit — Marché algérien

## 1. Positionnement local

Le produit est un SaaS immobilier destiné en priorité aux agences immobilières algériennes.

L'objectif n'est pas seulement de leur fournir un site vitrine, mais de leur permettre de devenir des acteurs **crédibles, visibles et rassurants** dans un marché où beaucoup d'offres circulent encore via les réseaux sociaux et où la confiance est un enjeu central.

Le produit doit donc combiner :

- une image premium
- une grande simplicité d'utilisation
- une forte crédibilité
- une publication rapide d'annonces
- une mise en avant de l'identité de l'agence
- une génération de contacts qualifiés

---

## 2. Contraintes locales à intégrer

### A. Mobile-first obligatoire

En Algérie, le produit doit être pensé d'abord pour le mobile.

#### Implications :

- navigation très fluide sur smartphone
- temps de chargement très courts
- boutons d'appel à l'action très visibles
- formulaires courts
- accès rapide au téléphone, au message et à la demande de visite
- galerie d'images optimisée pour les connexions mobiles

---

### B. Marché basé sur la confiance

Le site doit rassurer dès les premières secondes.

Il faut mettre visuellement en avant :

- agence agréée
- numéro d'agrément
- adresse physique
- wilaya / zone d'intervention
- nombre d'années d'activité
- nombre de biens publiés
- annonces vérifiées
- identité claire des agents
- mentions légales visibles

Le design doit inspirer :

- sérieux
- transparence
- stabilité
- sécurité

---

### C. Paiement et abonnement adaptés à l'Algérie

Pour une V1 orientée agences algériennes, il ne faut pas dépendre uniquement de Stripe.

### Recommandation produit

#### V1 :

- abonnement par facture manuelle
- validation manuelle du plan
- possibilité de paiement offline ou par virement
- option de paiement en ligne local plus tard

#### V2 :

- intégration SATIM / CIB
- étude d'intégration Edahabia
- logique hybride éventuelle :
  - clients algériens : paiement local
  - diaspora / international : Stripe ou autre solution adaptée

---

### D. Domaine et identité locale

Le produit doit permettre :

- un sous-domaine de la plateforme
- un domaine personnalisé
- idéalement le support du `.dz`

Le produit doit être conçu pour accueillir des domaines locaux et renforcer la crédibilité des agences.

---

## 3. Localisation fonctionnelle

### Langues

Le produit doit être prévu dès l'architecture pour :

- français
- arabe
- éventuellement anglais plus tard pour la diaspora

Même si la V1 sort en français, il faut préparer :

- un système i18n
- la prise en charge RTL pour l'arabe
- des champs de contenus multilingues

---

## 4. Spécificités métier immobilier Algérie

### A. Géographie locale

Les filtres et formulaires doivent être adaptés à l'Algérie :

- wilaya
- commune
- quartier
- zone
- type de transaction
- type de bien
- surface
- nombre de pièces
- prix en DZD

Le moteur de recherche ne doit pas être pensé comme un simple modèle européen.
La logique locale doit être très visible dans les formulaires et dans les pages d'annonces.

---

### B. Types de biens à prévoir

Prévoir nativement :

- appartement
- villa
- maison
- terrain
- local commercial
- bureau
- promotion immobilière
- location vacances
- colocation
- immeuble

---

### C. Informations utiles dans les annonces

Chaque annonce doit pouvoir afficher :

- prix en dinars
- négociable ou non
- wilaya / commune / quartier
- surface
- nombre de pièces
- état du bien
- disponibilité
- type de document ou statut administratif si l'agence souhaite l'afficher
- contact rapide
- possibilité de visite

---

## 5. Direction design adaptée à l'Algérie

### Objectif visuel

Le site doit se situer entre :

- agence haut de gamme
- plateforme digitale moderne
- marque locale crédible

Le rendu doit être :

- propre
- lumineux
- premium
- rassurant
- plus chaleureux qu'un SaaS B2B classique

---

### Recommandation esthétique

Je recommande une identité visuelle avec :

- un fond clair très propre
- un bleu profond ou un vert émeraude comme couleur principale
- des touches sable / beige léger pour rappeler l'univers immobilier méditerranéen
- de grandes photos
- des cartes très soignées
- des icônes simples
- une typographie élégante mais ultra lisible

Le marché algérien répond souvent très bien aux interfaces :

- visuelles
- démonstratives
- concrètes
- pas trop abstraites

#### Donc :

- moins de jargon SaaS
- plus de preuves visuelles
- plus de photos
- plus de badges de réassurance
- plus de CTA directs

---

## 6. Composants spécifiques à ajouter

### Composants de réassurance

Créer des composants dédiés :

- badge `Agence agréée`
- badge `Annonce vérifiée`
- bloc `Documents disponibles`
- bloc `Zone couverte`
- bloc `Réponse rapide`
- carte `Agent responsable`
- bloc `Coordonnées officielles`
- bandeau `Présence locale`

---

### Composants de conversion

- bouton appeler
- bouton demander une visite
- bouton demander un rappel
- bouton message direct
- sticky CTA mobile

---

### Composants de crédibilité

- nombre de biens publiés
- nombre de clients accompagnés
- avis clients
- partenaires
- agence physique / carte / horaires

---

## 7. Pages à renforcer pour le marché algérien

### Home agence

Ajouter :

- bloc `Pourquoi nous faire confiance ?`
- bloc `Agence agréée`
- bloc `Nos wilayas / communes couvertes`
- bloc `Nos derniers biens`
- bloc `Demander une estimation`
- bloc `Contact immédiat`

---

### Détail annonce

La fiche bien doit être très orientée conversion :

- galerie photos
- informations clés immédiatement visibles
- téléphone visible
- formulaire court
- bouton visite
- bouton partage
- suggestions de biens similaires

---

### À propos

Très important en Algérie :

- histoire de l'agence
- équipe
- ancrage local
- adresse réelle
- photo réelle
- zone d'activité

---

## 8. Dashboard agence — adaptation locale

Le dashboard doit être pensé pour des agences qui ne sont pas toutes très digitalisées.

### Principes UX :

- interface très simple
- labels clairs
- peu d'écrans compliqués
- onboarding guidé
- création d'annonce en plusieurs étapes
- prévisualisation avant publication

### Modules prioritaires :

- tableau de bord
- annonces
- leads
- branding
- coordonnées
- abonnement
- utilisateurs

### Bonus très utile :

- assistant IA pour rédiger l'annonce
- génération automatique d'un titre vendeur
- reformulation en style plus professionnel
- option de génération FR puis AR plus tard

---

## 9. Acquisition et diffusion locale

Le produit doit être pensé comme une base centrale qui alimente :

- le site vitrine de l'agence
- le partage sur les réseaux sociaux
- des fiches annonce bien présentables
- des pages partageables sur mobile

### Prévoir :

- image Open Graph propre pour chaque bien
- carte annonce élégante à partager
- lien court
- page mobile très rapide

---

## 10. Décision technique adaptée à l'Algérie

### Stack recommandée

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Supabase**
- **Cloudinary** ou **Supabase Storage**
- **Resend** pour les emails
- **PostHog** pour les analytics produit
- **SATIM / CIB** plus tard pour le paiement local
- **facturation manuelle** au départ

### Pourquoi cette stack

Parce qu'elle permet :

- un très beau design
- une sortie rapide
- un coût raisonnable
- une architecture sérieuse
- un produit évolutif
- la préparation du multilingue
- la gestion multi-agences

---

## 11. Positionnement stratégique

Le vrai avantage concurrentiel du produit ne sera pas seulement d'avoir un beau site.

Le produit doit devenir :

- plus crédible que Facebook pour publier des biens
- plus simple qu'un gros portail immobilier
- plus valorisant pour les agences agréées
- plus moderne que les solutions vitrines classiques

Le produit doit être perçu comme :

> la solution moderne, élégante et rassurante pour les agences immobilières algériennes qui veulent mieux présenter leurs biens, gagner en crédibilité et convertir davantage de prospects.

---

## 12. Prompt de cadrage pour Claude Code

```txt
Le produit est un SaaS immobilier multi-agences destiné d'abord au marché algérien. Il doit permettre à chaque agence immobilière d'avoir un mini-site vitrine premium et un dashboard pour gérer ses annonces. L'interface doit être mobile-first, très rassurante, moderne, élégante et orientée conversion. Le produit doit intégrer les réalités locales : confiance, annonces vérifiées, agence agréée, wilaya/commune/quartier, prix en dinars, branding local, contact rapide, partage réseaux sociaux, support futur du français et de l'arabe, et paiements adaptés au contexte algérien. Le rendu doit ressembler à un produit premium de grande entreprise, pas à un template générique.
```
