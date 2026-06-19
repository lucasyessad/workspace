# CL — Notifications HTML des traitements d'exploitation

Système **commun** de notification par e-mail HTML pour les jobs d'exploitation
(YHM, DADP, et tout futur traitement). Un seul moteur, une configuration par job.

> **Un traitement complet = le moteur `SendMailNotificationHTML.ps1` + 1 config JSON.**
> Aucune couche intermédiaire : chaque BAT appelle directement le moteur.
> Pour un guide pas à pas avec exemples complets, voir
> [`GUIDE_UTILISATION.md`](GUIDE_UTILISATION.md).

## Objectifs

1. **Un outil générique, jamais spécifique.** Le moteur
   `SendMailNotificationHTML.ps1` ne connaît aucun métier : il met en forme et
   envoie. Chaque job apporte sa propre config JSON. **Aucun statut, libellé,
   couleur ou seuil n'est codé en dur** : tout le vocabulaire vit dans
   `theme.json` (partagé) et peut être surchargé par la config d'un job.
2. **L'intelligence reste dans ODI / SQL**, pas dans l'envoi du mail. Les
   calculs (évolutions, statuts, retards, expéditeurs manquants…) sont faits en
   base ; le mail ne fait qu'afficher le résultat.
3. **Tout en dynamique.** Aucune valeur métier en dur dans le PowerShell ou le
   BAT : colonnes, regroupements, libellés et seuils sont pilotés par la donnée
   et la configuration.

## Architecture (chaîne DADP en exemple)

```
EXPEDITEURS_REF (table)            référentiel des expéditeurs attendus + fréquence
        │
        ▼
DADP_STOCK_EVOL_MAIL.sql   ──►  table DADP_STOCK_EVOL_MAIL   ──►  CSV (;)
  (intelligence : 2 derniers arrêtés, évolutions "4,8%",
   Statut RECU/RETARD/NON_RECU, expéditeurs absents)
        │
        ▼
IMR_DADP_CHARGE_IMAGE.bat   lance ODI, déduit le statut global (RC), puis appelle :
        │
        ▼
SendMailNotificationHTML.ps1  + config-dadp.json + template-notification.html
        │
        ▼
        e-mail HTML
```

Le **contrat** entre ODI et le mail est le CSV : délimiteur `;`, une colonne de
rupture (`Expediteur`). Le reste (colonnes affichées, en-têtes, regroupement) est
décrit dans la config JSON — on ne touche ni au BAT ni au moteur pour faire évoluer
l'affichage.

## Contenu du dépôt

| Fichier | Rôle |
|---|---|
| `PRODUCTION/SendMailNotificationHTML.ps1` | **Moteur universel** (v4.0). Utilisé par tous les jobs. |
| `PRODUCTION/theme.json` | **Thème partagé** : tout le vocabulaire (statuts, couleurs, badges, étapes, palette). Rien n'est codé en dur dans le moteur. |
| `PRODUCTION/template-notification.html` | Template HTML (charte Crédit Logement, thème clair teal). |
| `PRODUCTION/config-template.json` | Modèle de configuration commenté pour un nouveau job. |
| `PRODUCTION/Notify.bat` | Point d'entrée optionnel `CLE=VALEUR` qui appelle directement le moteur. |
| `DADP/IMR_DADP_CHARGE_IMAGE.bat` | Job DADP : ODI + envoi de la notification. |
| `DADP/config-dadp.json` | Config DADP (destinataires, sujet, messages, GroupBy, colonnes). |
| `DADP/DADP_CREATE_EXPEDITEURS_REF.sql` | Table de référence des expéditeurs (+ seed). |
| `DADP/DADP_CREATE_STOCK_EVOL_MAIL.sql` | Table de travail consommée par le mail. |
| `DADP/DADP_STOCK_EVOL_MAIL.sql` | Requête de calcul (évolutions + statut + manquants). |
| `DADP/DADP_STOCK_EVOL_MAIL_exemple.csv` | Jeu d'exemple pour tester l'envoi. |

## Paramètres du moteur

Obligatoires : `-ConfigFile -NomJob -Status`.

| Paramètre | Description |
|---|---|
| `-Horodatage` | `yyyyMMdd_HHmmss` (sinon = maintenant). |
| `-KeyValues` | `"Cle1=Val1;Cle2=Val2"` → bloc clé/valeur. |
| `-Etapes` | `"etape1^etape2"` (sép. `^` ou `\|`), badges `[SUCCES]`/`[ECHEC]`/`[WARNING]`. |
| `-Stats` | `"Lignes=1520;Erreurs=3"` → bloc métriques (cartes chiffrées). |
| `-MessageLibre` | Texte libre. |
| `-TableCsv` / `-TableTitle` | CSV (`;`) rendu en tableau. |
| `-GroupBy` | Colonne de rupture → 1 section par valeur. |
| `-StatusColumn` | Colonne statut → badge (pire valeur du groupe) sur le titre. |
| `-Columns` / `-Headers` | Colonnes affichées et leurs en-têtes (surchargent la config). |
| `-Delimiter` | Délimiteur du CSV (défaut `;`). |
| `-SortBy` / `-Descending` | Tri des lignes de chaque groupe par une colonne. |
| `-TitlePrefix` | Préfixe du titre de groupe (ex. `Expéditeur`). |
| `-ThemeFile` | Thème alternatif (défaut : `PRODUCTION/theme.json`). |
| `-SectionFile` / `-SectionsInline` | Sections JSON (fichier ou inline). |
| `-Files` / `-FileDir` / `-FilePattern` | Fichiers explicites ou scan auto d'un répertoire. |
| `-AutoAnalyze` / `-LogDir` … | Analyse auto des fichiers, récupération de logs. |
| `-Attachments` / `-AttachDir` / `-AttachPattern` | Pièces jointes explicites ou scan d'un répertoire. |
| `-MailPriority` / `-AutoPriority` | Priorité fixe, ou auto (`High` si ERREUR/ECHEC). |
| `-DryRun` | Génère le HTML **sans** envoyer. |
| `-ExportHtml` | Sauvegarde le HTML généré dans un fichier. |

`GroupBy`, `StatusColumn`, `Columns`, `Headers`, `Delimiter`, `SortBy`,
`Descending`, `TitlePrefix` peuvent aussi être placés dans le JSON de config ;
le paramètre en ligne de commande l'emporte sur la config.

### Tout est configurable : le thème (`theme.json`)

Le moteur ne code **aucun** statut ni couleur en dur. Le fichier
`PRODUCTION/theme.json` définit, pour toute l'organisation :

- **`Statuses`** : par statut → `Label`, `Color` (bandeau), `Priority`, `Message`.
  Un job peut **inventer ses propres statuts** (ex. `EN_COURS`, `REJETE`).
- **`BadgeColors`** / **`BadgeSeverity`** : couleur et gravité des badges par
  ligne (la « pire » valeur d'un groupe).
- **`StepBadges`** : icône + couleur du vocabulaire des étapes (`[SUCCES]`…).
- **`Theme`** : palette complète (primaire, couleurs des %, logs, métriques…).

N'importe quelle clé du thème peut être **surchargée par la config d'un job**
(précédence : `job > theme`). Exemple, dans `config-monjob.json` :

```json
"Statuses":     { "EN_COURS": { "Label": "EN COURS", "Color": "#8E44AD", "Message": "..." } },
"BadgeColors":  { "NON_RECU": { "Bg": "#C62828", "Text": "#FFFFFF" } },
"Theme":        { "Primary": "#005F73" }
```

## Configuration d'un job (format plat)

```json
{
  "SmtpServer":    "${SMTP_SERVER}",
  "Port":          25,
  "From":          "expediteur@creditlogement.fr",
  "To":            ["destinataire@creditlogement.fr"],
  "Cc":            [],
  "TemplatePath":  "${TEMPLATE_PATH}",
  "Environnement": "PROD",
  "EquipeNom":     "DSI - Exploitation",
  "Subject":       "[{{STATUS_LABEL}}] [{{ENVIRONNEMENT}}] MON JOB - {{DATE}}",
  "StatusMessages": { "SUCCES": "...", "WARNING": "...", "ERREUR": "..." }
}
```

`${SMTP_SERVER}` et `${TEMPLATE_PATH}` sont remplacés par les variables
d'environnement positionnées dans le BAT. Placeholders disponibles dans `Subject`
et le template : `{{JOB_NAME}}`, `{{STATUS_LABEL}}`, `{{STATUS_COLOR}}`,
`{{STATUS_MESSAGE}}`, `{{DATE}}`, `{{HEURE}}`, `{{ENVIRONNEMENT}}`, `{{HOSTNAME}}`,
`{{EQUIPE}}`, `{{SECTIONS}}`.

## Tester sans envoyer

```powershell
powershell -ExecutionPolicy Bypass -File CL\PRODUCTION\SendMailNotificationHTML.ps1 `
  -ConfigFile CL\DADP\config-dadp.json -NomJob IMR_DADP_CHARGE_IMAGE -Status SUCCES `
  -TableCsv CL\DADP\DADP_STOCK_EVOL_MAIL_exemple.csv `
  -DryRun -ExportHtml apercu.html
```

`apercu.html` contient alors le rendu exact du mail (à ouvrir dans un navigateur).

## Ajouter un nouveau job

1. Créer `MONJOB/config-monjob.json` (format plat ci-dessus).
2. Dans le BAT du job : positionner `SMTP_SERVER` / `TEMPLATE_PATH`, calculer le
   statut, appeler `SendMailNotificationHTML.ps1` avec la config et le contenu
   voulu (`-KeyValues`, `-Etapes`, `-TableCsv` + `-GroupBy`…).
3. Aucune modification du moteur : tout passe par la config et les paramètres.

## Statut global vs statut par ligne

- Le **statut global** (bandeau SUCCES / WARNING / ERREUR) vient du paramètre
  `-Status`, lui-même déduit du code retour ODI dans le BAT.
- Le **statut par ligne** (badge RECU / RETARD / NON_RECU sur chaque section) est
  porté par la colonne `StatusColumn` du CSV, calculée en SQL.

> Évolution possible : faire remonter un RC=1 depuis ODI quand le SQL détecte des
> RETARD / NON_RECU, pour que le bandeau global passe en WARNING automatiquement.
