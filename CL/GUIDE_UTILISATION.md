# Guide d'utilisation — Notifications HTML d'exploitation

Guide pas à pas pour envoyer des e-mails HTML de notification depuis n'importe
quel traitement Windows (BAT, ODI, planificateur…).

> **Règle d'or : un traitement complet = le moteur `SendMailNotificationHTML.ps1`
> + 1 fichier de configuration JSON.**
> Pas de couche intermédiaire, pas de script par job. Le BAT du traitement
> appelle directement le moteur ; tout le reste (mise en forme, regroupements,
> couleurs, accents) est géré par le moteur et piloté par la config.

---

## Sommaire

1. [Comment ça marche](#1-comment-ça-marche)
2. [Prérequis Windows](#2-prérequis-windows)
3. [Les accents et l'encodage (à lire absolument)](#3-les-accents-et-lencodage-à-lire-absolument)
4. [Le template HTML : comment il fonctionne](#4-le-template-html--comment-il-fonctionne)
5. [Le fichier de configuration JSON](#5-le-fichier-de-configuration-json)
6. [Les paramètres du moteur](#6-les-paramètres-du-moteur)
7. [Exemples complets](#7-exemples-complets)
8. [Ajouter un nouveau traitement (pas à pas)](#8-ajouter-un-nouveau-traitement-pas-à-pas)
9. [Tester sans envoyer](#9-tester-sans-envoyer)
10. [Dépannage (FAQ)](#10-dépannage-faq)

---

## 1. Comment ça marche

```
  Traitement (ODI / SQL / BAT)              CONFIG (1 fichier JSON par job)
  produit la donnée + le statut             destinataires, sujet, messages,
            │                               colonnes, regroupement…
            │                                         │
            └──────────────┬──────────────────────────┘
                           ▼
            SendMailNotificationHTML.ps1   ◄── template-notification.html
            (moteur : met en forme + envoie)
                           │
                           ▼
                     e-mail HTML
```

**Principe clé : l'intelligence reste dans le traitement (ODI / SQL), pas dans
le mail.** Le moteur ne calcule rien de métier : il prend une donnée déjà
calculée (un CSV, un statut, des étapes) et la met en forme. Pour faire évoluer
l'affichage, on touche à la **config**, jamais au moteur ni au BAT.

Les 3 fichiers de production :

| Fichier | Rôle |
|---|---|
| `PRODUCTION/SendMailNotificationHTML.ps1` | Le **moteur**. On ne le modifie pas par job. |
| `PRODUCTION/template-notification.html` | L'**habillage** HTML (charte, couleurs, footer). |
| `PRODUCTION/Notify.bat` | Point d'entrée optionnel `CLÉ=VALEUR` (confort). |

---

## 2. Prérequis Windows

- **Windows** avec **PowerShell 5.1** (présent par défaut) ou supérieur.
- Un **relais SMTP** interne joignable (port 25 en général) — le moteur utilise
  `Send-MailMessage`.
- Les fichiers déposés sur le serveur dans les **bibliothèques standard**
  (définies par `Chemin.bat`) :
  - `%proclib%` → procédures / outillage : `SendMailNotificationHTML.ps1`,
    `template-notification.html`, `Notify.bat` ;
  - `%parmlib%` → fichiers de **configuration** JSON : `config-<job>.json` ;
  - `%datalib%` → **données** : le CSV produit par ODI.

L'exécution se fait toujours avec ces options (déjà incluses dans les BAT
fournis), pour ne pas dépendre de la politique d'exécution du serveur :

```bat
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "...\SendMailNotificationHTML.ps1" ...
```

---

## 3. Les accents et l'encodage (à lire absolument)

L'affichage correct des accents (é, è, à, ç, ù…) dépend de **l'encodage des
fichiers**. Voici les règles, simples, à respecter :

| Élément | Encodage attendu | Pourquoi |
|---|---|---|
| **Template** `.html` | indifférent | Les accents y sont écrits en **entités HTML** (`&eacute;`, `&agrave;`…) : ils s'affichent partout, quel que soit l'encodage du fichier. |
| **Config** `.json` | **UTF-8** | Le moteur lit la config en UTF-8. Écrivez les messages avec de vrais accents (`succès`, `terminé`) et enregistrez en UTF-8. |
| **CSV produit par ODI** | UTF-8 **ou** ANSI (Windows-1252) | Le moteur **détecte automatiquement** : si le fichier a un BOM UTF-8 il le lit en UTF-8, sinon en ANSI Windows-1252 (le défaut sur Windows français). Les deux marchent. |
| **E-mail envoyé** | UTF-8 | Le moteur envoie toujours le corps en UTF-8 (`Encoding UTF8` + `<meta charset="UTF-8">` dans le template). |

**En pratique :**

- Dans **Notepad** : *Fichier → Enregistrer sous → Encodage : UTF-8* pour les
  `.json`.
- Dans **VS Code** : encodage en bas à droite → `UTF-8`.
- Pour le **CSV ODI** : aucune contrainte, le moteur s'adapte. Si vous avez le
  choix dans ODI, exportez en UTF-8.

> ⚠️ **Attention aux accents dans les fichiers `.bat`.** La console Windows
> utilise une page de codes (souvent CP850/CP1252) qui peut déformer les accents
> passés en ligne de commande. **Bonne pratique : ne mettez pas de texte accentué
> en dur dans le BAT.** Laissez les accents dans la **config UTF-8** (messages de
> statut) et dans la **donnée** (CSV). Le BAT ne fait que passer des chemins et un
> statut. C'est exactement ce que font les BAT fournis.

---

## 4. Le template HTML : comment il fonctionne

`template-notification.html` est l'**habillage** (la « coquille ») de tous les
mails. C'est un fichier HTML classique **compatible Outlook** (tableaux,
styles en ligne) aux couleurs de la charte Crédit Logement (teal `#00A8A8`).

Le moteur le lit, **remplace les marqueurs `{{...}}`** par les valeurs réelles,
puis envoie le résultat. **On ne crée pas un template par job** : le même
template sert tous les traitements. Le contenu variable arrive par les
marqueurs.

### Les marqueurs disponibles

| Marqueur | Remplacé par |
|---|---|
| `{{JOB_NAME}}` | Le nom du job (`-NomJob`). |
| `{{STATUS_LABEL}}` | Le libellé du statut : `SUCCES`, `ECHEC`, `AVERTISSEMENT`… |
| `{{STATUS_COLOR}}` | La couleur du bandeau selon le statut (teal / rouge / orange…). |
| `{{STATUS_MESSAGE}}` | Le message de la config (`StatusMessages`) correspondant au statut. |
| `{{DATE}}` / `{{HEURE}}` | Date et heure (de `-Horodatage`, sinon maintenant). |
| `{{ENVIRONNEMENT}}` | `PROD`, `RECETTE`… (champ `Environnement` de la config). |
| `{{EQUIPE}}` | Signature (champ `EquipeNom` de la config). |
| `{{HOSTNAME}}` | Le serveur d'exécution. |
| `{{SECTIONS}}` | **Le cœur dynamique** : tout le contenu (tableaux, étapes, clés/valeurs, métriques, logs…) que le moteur a généré à partir de vos paramètres. |

### Schéma du template

```
┌───────────────────────────────────────────────┐
│  INEO — Exploitation        [ {{ENVIRONNEMENT}} ]│  ← en-tête + bandeau
│  {{JOB_NAME}}                                   │
│  {{DATE}} à {{HEURE}}                            │
├───────────────────────────────────────────────┤
│ ▌ {{STATUS_LABEL}}   {{STATUS_MESSAGE}}         │  ← bloc statut (couleur dynamique)
├───────────────────────────────────────────────┤
│                                                 │
│   {{SECTIONS}}   ← tableaux, étapes, métriques… │  ← contenu généré par le moteur
│                                                 │
├───────────────────────────────────────────────┤
│ Cordialement,                                   │
│ {{EQUIPE}}                                      │  ← signature
├───────────────────────────────────────────────┤
│ Message généré automatiquement…  (footer)       │  ← footer (masquable : -NoFooter)
└───────────────────────────────────────────────┘
```

### À retenir sur le template

- **Accents** : écrits en entités HTML (`&eacute;` = é). C'est volontaire : ça
  garantit l'affichage correct dans tous les clients mail, indépendamment de
  l'encodage. Le contenu **dynamique** (vos messages, vos données), lui, n'a pas
  besoin d'entités : les vrais accents UTF-8 fonctionnent.
- **Modifier l'habillage** (logo, couleurs, textes fixes) = on édite ce seul
  fichier, **tous les jobs en bénéficient**.
- **Le footer** (`<!--FOOTER_START-->…<!--FOOTER_END-->`) peut être retiré à la
  volée avec le paramètre `-NoFooter`.
- **Compatibilité Outlook** : la mise en page utilise des `<table>` et des styles
  en ligne. Si vous l'adaptez, gardez ce style « e-mail » (pas de flexbox/grid).

---

## 5. Le fichier de configuration JSON

Un fichier **par traitement**. Format **plat** (pas d'imbrication compliquée).
Exemple minimal :

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
  "StatusMessages": {
    "SUCCES":  "Le traitement s'est terminé avec succès.",
    "WARNING": "Le traitement s'est terminé avec des avertissements.",
    "ERREUR":  "Une erreur est survenue. Intervention requise."
  }
}
```

### Champs

| Champ | Obligatoire | Description |
|---|:---:|---|
| `SmtpServer` | ✅ | Relais SMTP. Souvent `"${SMTP_SERVER}"` (variable posée par le BAT). |
| `Port` | | Port SMTP (défaut `25`). |
| `From` | ✅ | Adresse expéditeur. |
| `To` | ✅ | Tableau de destinataires. |
| `Cc` | | Tableau en copie. |
| `TemplatePath` | ✅ | Chemin du template. Souvent `"${TEMPLATE_PATH}"`. |
| `Environnement` | | `PROD`, `RECETTE`… (affiché en haut à droite). |
| `EquipeNom` | | Signature du mail. |
| `Subject` | | Modèle de sujet (accepte les `{{...}}`). |
| `StatusMessages` | | Message affiché selon le statut (`SUCCES`/`WARNING`/`ERREUR`…). |
| `GroupBy` | | Colonne de rupture du CSV → 1 tableau par valeur. |
| `StatusColumn` | | Colonne statut du CSV → badge coloré (pire valeur du groupe). |
| `Columns` | | Colonnes du CSV à afficher (et dans quel ordre). |
| `Headers` | | En-têtes affichées (même ordre que `Columns`). |
| `LogDir` / `LogPattern` | | Répertoire/filtre de logs à joindre automatiquement. |

### La syntaxe `${VARIABLE}`

Dans la config, `${SMTP_SERVER}` ou `${TEMPLATE_PATH}` sont remplacés **au moment
de l'exécution** par les variables d'environnement positionnées dans le BAT.
Avantage : **la même config marche en DEV, recette et prod** sans la modifier —
c'est le BAT qui fixe les valeurs du serveur.

```bat
set "SMTP_SERVER=smtp.interne.creditlogement.fr"
set "TEMPLATE_PATH=%proclib%\template-notification.html"
```

> `GroupBy`, `StatusColumn`, `Columns`, `Headers` peuvent être mis **soit dans la
> config, soit en paramètre** de ligne de commande. Le paramètre l'emporte.

## 5bis. Le vocabulaire — défauts du moteur, tout surchargeable

Tout le **vocabulaire** et toute la **palette** ont des **défauts internes** au
moteur : **aucun fichier externe n'est nécessaire**. Ces défauts ne sont pas
figés — chaque clé peut être **surchargée par la config du job**, sans toucher au
PowerShell.

| Clé de config | Définit |
|---|---|
| `Statuses` | Par statut : `Label`, `Color` (bandeau), `Priority`, `Message`. |
| `StatusMessages` | Raccourci pour ne surcharger que le `Message` d'un statut. |
| `BadgeColors` | Couleur des badges par ligne (par valeur de `StatusColumn`). |
| `BadgeSeverity` | Gravité (nombre) de chaque statut → choix de la « pire » ligne d'un groupe. |
| `StepBadges` | Icône + couleur du vocabulaire des étapes (`[SUCCES]`, `[ECHEC]`…). |
| `Theme` | Palette : couleur primaire, couleurs des %, des logs, des métriques. |

**Inventer un statut** (ex. un job de surveillance avec `EN_COURS`) — il suffit de
l'ajouter dans la config du job :

```json
"Statuses": {
  "EN_COURS": { "Label": "EN COURS", "Color": "#8E44AD", "Priority": "Normal",
                "Message": "Le traitement est en cours d'exécution." }
}
```

**Changer une couleur de badge** pour un job précis, sans impacter les autres :

```json
"BadgeColors": { "NON_RECU": { "Bg": "#B00020", "Text": "#FFFFFF" } }
```

**Précédence** : `paramètre CLI` > `config du job` > `-ThemeFile (optionnel)` >
`défauts du moteur`. Une clé absente de la config retombe sur les défauts ; rien
n'est jamais en erreur pour une clé manquante.

> 💡 **`-ThemeFile` (optionnel, avancé)** : si plusieurs jobs doivent partager un
> même vocabulaire commun, on peut le décrire une seule fois dans un fichier JSON
> (mêmes clés que ci-dessus) et le désigner via `-ThemeFile` ou la clé
> `ThemeFile` de la config. Il est fusionné par-dessus les défauts du moteur, et
> la config du job garde le dernier mot. Sans lui, les défauts internes suffisent.

---

## 6. Les paramètres du moteur

Appel type :

```
SendMailNotificationHTML.ps1 -ConfigFile <json> -NomJob <nom> -Status <statut> [options]
```

**Obligatoires** : `-ConfigFile`, `-NomJob`, `-Status`.

Valeurs de `-Status` reconnues : `SUCCES`/`OK`, `WARNING`, `ERREUR`/`ECHEC`,
`INFO`, `PARTIEL`, `AUCUN_FICHIER`.

### Contenu

| Paramètre | Exemple | Effet |
|---|---|---|
| `-KeyValues` | `"Lignes=1520;Durée=2m"` | Bloc clé/valeur. |
| `-Stats` | `"Reçus=8;Retard=2;Absents=1"` | Bloc de **métriques** (cartes chiffrées). |
| `-Etapes` | `"[SUCCES] Extraction^[ECHEC] Chargement"` | Liste d'étapes avec icônes. |
| `-MessageLibre` | `"Voir pièce jointe."` | Paragraphe de texte libre. |
| `-TableCsv` / `-TableTitle` | `"C:\data\res.csv"` | Affiche un CSV (`;`) en tableau. |

### Regroupement et sélection de colonnes (pour les CSV)

| Paramètre | Effet |
|---|---|
| `-GroupBy <colonne>` | Un tableau par valeur de la colonne (ex. un tableau par expéditeur). |
| `-StatusColumn <colonne>` | Badge coloré sur le titre du groupe (pire valeur : `RECU`/`RETARD`/`NON_RECU`). |
| `-Columns "A,B,C"` | Colonnes affichées et leur ordre. |
| `-Headers "Lib A,Lib B,Lib C"` | En-têtes affichées (même ordre que `-Columns`). |

### Fichiers, logs, pièces jointes

| Paramètre | Effet |
|---|---|
| `-Files "c:\a.csv\|Titre\|Desc;c:\b.log"` | Plusieurs fichiers (fiche + analyse si `-AutoAnalyze`). |
| `-FileDir <rép>` / `-FilePattern <*.csv>` | Scanne un répertoire et ajoute tous les fichiers trouvés. |
| `-AutoAnalyze` | Analyse auto (stats CSV, extraits de logs). |
| `-LogDir <rép>` / `-LogPattern <*.log>` | Récupère les logs (extraits + erreurs détectées). |
| `-Attachments c:\f.pdf` | Pièce(s) jointe(s) explicite(s). |
| `-AttachDir <rép>` / `-AttachPattern <*.pdf>` | Joint tous les fichiers d'un répertoire. |

### Options

| Paramètre | Effet |
|---|---|
| `-Horodatage "yyyyMMdd_HHmmss"` | Date/heure du mail (sinon = maintenant). |
| `-MailPriority High\|Normal\|Low` | Priorité fixe. |
| `-AutoPriority` | Priorité auto : `High` si statut ERREUR/ECHEC. |
| `-ExtraSubject "- Lot 3"` | Ajout au sujet. |
| `-OverrideTo` / `-OverrideCc` | Force les destinataires (utile en test). |
| `-NoFooter` | Retire le footer du template. |
| `-DryRun` | **Ne pas envoyer** : juste générer/valider. |
| `-ExportHtml apercu.html` | Sauve le HTML produit (pour le visualiser). |
| `-Verbose2` | Journalisation détaillée en console. |

---

## 7. Exemples complets

### Exemple 1 — Notification simple (succès / échec) depuis un BAT

```bat
@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM --- Bibliotheques (definies par Chemin.bat) + parametres serveur ---
call e:\dsi\exploit\parmlib\Chemin.bat
set "SMTP_SERVER=smtp.interne.creditlogement.fr"
set "TEMPLATE_PATH=%proclib%\template-notification.html"
set "ENGINE=%proclib%\SendMailNotificationHTML.ps1"
set "CONFIG=%parmlib%\config-monjob.json"

REM --- Mon traitement ---
call mon_traitement.bat
set "RC=%ERRORLEVEL%"

REM --- Statut global à partir du code retour ---
set "STATUS=SUCCES"
if "!RC!" NEQ "0" set "STATUS=ERREUR"

REM --- Envoi de la notification ---
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass ^
  -File       "%ENGINE%"   ^
  -ConfigFile "%CONFIG%"   ^
  -NomJob     "MON_JOB"    ^
  -Status     "!STATUS!"   ^
  -KeyValues  "Lignes traitées=1520;Durée=2m 14s;Code retour=!RC!" ^
  -Etapes     "[SUCCES] Extraction^[SUCCES] Transformation^[SUCCES] Chargement" ^
  -AutoPriority

exit /B !RC!
```

> Les accents de `Lignes traitées` viennent du BAT : si vous en voyez de
> déformés, déplacez ce texte dans la config (champ `StatusMessages`) ou ajoutez
> `chcp 65001 >nul` en début de BAT. Voir [§3](#3-les-accents-et-lencodage-à-lire-absolument).

### Exemple 2 — DADP : un tableau par expéditeur (GroupBy via la config)

Le BAT ne fait que passer le CSV ; **tout le reste est dans la config**
(`GroupBy`, `Columns`, `Headers`).

```bat
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass ^
  -File       "%ENGINE%"                ^
  -ConfigFile "%parmlib%\config-dadp.json" ^
  -Status     "!MAIL_STATUS!"           ^
  -NomJob     "IMR_DADP_CHARGE_IMAGE"   ^
  -Horodatage "!TS!"                    ^
  -TableCsv   "%DADP_CSV%"
```

Résultat : une section par expéditeur, colonnes FOR/DEF/NPE/IMP avec leurs
évolutions colorées (rouge si négatif, vert si positif), badge `[RETARD]` /
`[NON RECU]` sur le titre du groupe si une colonne de statut est configurée.

### Exemple 3 — Avec métriques, logs et pièce jointe

```bat
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass ^
  -File       "%ENGINE%"   ^
  -ConfigFile "%CONFIG%"   ^
  -NomJob     "ETL_QUOTIDIEN" ^
  -Status     "WARNING"    ^
  -Stats      "Lignes=15230;Rejets=12;Durée=4m 02s" ^
  -LogDir     "C:\logs\etl\%DATE%"  -LogPattern "*.log" ^
  -Attachments "C:\rapports\etl_rejets.csv" ^
  -AutoPriority
```

`-LogDir` récupère les logs du jour, en extrait les dernières lignes et
**surligne les erreurs** détectées ; `-Stats` produit le bandeau de métriques ;
le CSV de rejets est joint.

### Exemple 4 — Via `Notify.bat` (syntaxe `CLÉ=VALEUR`)

Pour un appel rapide sans écrire la longue ligne PowerShell :

```bat
call %proclib%\Notify.bat ^
     CONFIG=%parmlib%\config-monjob.json ^
     JOB=MON_JOB ^
     STATUS=ERREUR ^
     MESSAGE="Échec du chargement, voir les logs" ^
     LOGDIR=C:\logs\monjob\today ^
     AUTOPRIORITY=1
```

`Notify.bat` traduit chaque `CLÉ=VALEUR` en paramètre et **appelle directement le
moteur** (aucune couche intermédiaire).

### Exemple 5 — Tester sans envoyer (voir le rendu)

```bat
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass ^
  -File       "%ENGINE%" ^
  -ConfigFile "%parmlib%\config-dadp.json" ^
  -NomJob     "IMR_DADP_CHARGE_IMAGE" ^
  -Status     "SUCCES" ^
  -TableCsv   "%datalib%\DADP_STOCK_EVOL_MAIL_exemple.csv" ^
  -DryRun -ExportHtml "C:\temp\apercu.html"
```

`C:\temp\apercu.html` contient alors le mail exact ; ouvrez-le dans un navigateur
pour vérifier la mise en forme **et les accents** avant la mise en production.

---

## 8. Ajouter un nouveau traitement (pas à pas)

1. **Créer la config** : `%parmlib%\config-monjob.json` (copier le modèle du
   [§5](#5-le-fichier-de-configuration-json), l'enregistrer en **UTF-8**,
   renseigner destinataires / sujet / messages). Le moteur et le template restent
   partagés dans `%proclib%` — rien à dupliquer.
2. **Dans le BAT du job** :
   - charger les bibliothèques (`call …\Chemin.bat`) puis poser `SMTP_SERVER` et
     `TEMPLATE_PATH` (`%proclib%\template-notification.html`) ;
   - lancer le traitement et **calculer le statut** à partir du code retour ;
   - appeler `%proclib%\SendMailNotificationHTML.ps1` avec `-ConfigFile`
     (`%parmlib%\config-monjob.json`), `-NomJob`, `-Status` et le contenu voulu
     (`-KeyValues`, `-Etapes`, `-TableCsv` pointant le CSV dans `%datalib%`…).
3. **C'est tout.** Aucune modification du moteur ni du template : l'affichage se
   pilote par la config et les paramètres.

---

## 9. Tester sans envoyer

`-DryRun` génère et valide **sans** envoyer ; `-ExportHtml <fichier>` sauvegarde
le rendu pour le visualiser. Combinez les deux pour une recette sûre (voir
[Exemple 5](#exemple-5--tester-sans-envoyer-voir-le-rendu)). En `-DryRun`, le
moteur affiche aussi le sujet, les destinataires et le nombre de pièces jointes.

---

## 10. Dépannage (FAQ)

**Les accents sont déformés dans le mail (« Ã© » au lieu de « é »).**
- Vérifiez que la **config `.json` est en UTF-8** (Notepad → Enregistrer sous →
  UTF-8).
- Si le texte vient d'un **BAT**, retirez les accents du BAT (mettez-les dans la
  config) ou ajoutez `chcp 65001 >nul` en tête de BAT.
- Le **CSV** : le moteur détecte UTF-8 (avec BOM) ou ANSI automatiquement ; si
  votre CSV est en UTF-8 **sans BOM**, ré-exportez-le avec BOM ou en ANSI.

**« Template introuvable » / « Champ manquant dans la config ».**
- Vérifiez `TemplatePath` (ou la variable `${TEMPLATE_PATH}` posée par le BAT) et
  la présence des champs obligatoires (`SmtpServer`, `From`, `To`,
  `TemplatePath`).

**Le mail part mais le tableau est vide ou les colonnes sont fausses.**
- Le CSV doit être délimité par `;`.
- Les noms dans `Columns`/`GroupBy`/`StatusColumn` doivent **correspondre
  exactement** aux en-têtes du CSV (le moteur journalise les colonnes absentes).

**Le bandeau ne passe pas au rouge en cas d'erreur.**
- Le statut global vient de `-Status`, déduit du **code retour** dans le BAT.
  Vérifiez la logique `if RC NEQ 0 set STATUS=ERREUR`.

**Erreur d'envoi SMTP.**
- Vérifiez `SmtpServer`/`Port` et que le serveur autorise l'expéditeur `From`.
  Testez d'abord en `-DryRun` pour isoler un problème de mise en forme d'un
  problème réseau.

**Rien ne s'exécute / erreur de stratégie d'exécution.**
- Utilisez toujours `-ExecutionPolicy Bypass` (inclus dans les BAT fournis).
