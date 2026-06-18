# CL — Notifications HTML des traitements d'exploitation

Système **commun** de notification par e-mail HTML pour les jobs d'exploitation
(YHM, DADP, et tout futur traitement). Un seul moteur, une configuration par job.

## Objectifs

1. **Un outil générique, jamais spécifique.** Le moteur
   `SendMailNotificationHTML.ps1` ne connaît aucun métier : il met en forme et
   envoie. Chaque job apporte sa propre config JSON.
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
| `PRODUCTION/SendMailNotificationHTML.ps1` | **Moteur universel** (v3.2). Utilisé par tous les jobs. |
| `PRODUCTION/template-notification.html` | Template HTML (charte Crédit Logement, thème clair teal). |
| `PRODUCTION/Invoke-MailNotification.ps1` | Wrapper optionnel (modes pré-configurés : etl, surveillance…). |
| `PRODUCTION/Notify.bat` | Point d'entrée universel `CLE=VALEUR` depuis n'importe quel BAT. |
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
| `-MessageLibre` | Texte libre. |
| `-TableCsv` / `-TableTitle` | CSV (`;`) rendu en tableau. |
| `-GroupBy` | Colonne de rupture → 1 section par valeur. |
| `-StatusColumn` | Colonne statut → badge (pire valeur du groupe) sur le titre. |
| `-Columns` / `-Headers` | Colonnes affichées et leurs en-têtes (surchargent la config). |
| `-SectionFile` / `-SectionsInline` | Sections JSON (fichier ou inline). |
| `-Files` / `-AutoAnalyze` / `-LogDir` … | Multi-fichiers, analyse auto, récupération de logs. |
| `-Attachments` | Pièces jointes. |
| `-DryRun` | Génère le HTML **sans** envoyer. |
| `-ExportHtml` | Sauvegarde le HTML généré dans un fichier. |

`GroupBy`, `StatusColumn`, `Columns`, `Headers` peuvent aussi être placés dans le
JSON de config ; le paramètre en ligne de commande l'emporte sur la config.

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
