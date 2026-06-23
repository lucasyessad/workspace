# Erreur PowerShell — Zone.Identifier (fichier réseau bloqué)

## Symptôme

```
Échec de la vérification d'AuthorizationManager.
   + CategoryInfo          : Erreur de sécurité : (:) [], ParentContainsErrorRecordException
   + FullyQualifiedErrorId : UnauthorizedAccess
```

L'erreur apparaît **en INT mais pas en DEV**, même si la ligne de commande contient déjà `-ExecutionPolicy Bypass`.

---

## Explication

Windows attache un flux de données alternatif (`Zone.Identifier`) à tout fichier copié depuis un partage réseau (`\\serveur\...`) ou téléchargé depuis Internet. Ce flux indique la **zone de sécurité d'origine** du fichier :

| ZoneId | Signification |
|--------|--------------|
| 0 | Ordinateur local |
| 1 | Intranet local |
| 2 | Sites de confiance |
| 3 | Internet |
| 4 | Sites sensibles |

Quand `ZoneId=3` (ou parfois `ZoneId=1` en environnement restrictif), PowerShell considère le script comme **non fiable** et refuse de l'exécuter, **même avec `-ExecutionPolicy Bypass`**.

En DEV le `.ps1` est souvent copié localement (ZoneId absent ou 0).  
En INT il est déployé depuis un partage réseau → Windows le marque automatiquement.

---

## Vérification

Exécuter sur le serveur INT (dans un terminal PowerShell ou cmd) :

```powershell
Get-Content "E:\dsi\exploit\proclib\SendMailNotificationHTML.ps1" -Stream Zone.Identifier
```

**Résultat si le fichier est bloqué :**

```
[ZoneTransfer]
ZoneId=3
```

**Résultat si le fichier est sain (non bloqué) :**

```
Get-Content : Le flux spécifié n'existe pas.
```
_(ou commande sans retour)_

---

## Solution

### Option 1 — Débloquer le fichier (action ponctuelle)

```powershell
Unblock-File "E:\dsi\exploit\proclib\SendMailNotificationHTML.ps1"
```

Vérifier ensuite que le flux a disparu :

```powershell
Get-Content "E:\dsi\exploit\proclib\SendMailNotificationHTML.ps1" -Stream Zone.Identifier
# Doit retourner une erreur "flux inexistant" -> fichier débloqué
```

### Option 2 — Débloquer lors du déploiement (durable)

Ajouter `Unblock-File` dans la procédure de déploiement, juste après la copie du fichier :

```powershell
Copy-Item "\\partage\PRODUCTION\SendMailNotificationHTML.ps1" `
          "E:\dsi\exploit\proclib\SendMailNotificationHTML.ps1" -Force
Unblock-File "E:\dsi\exploit\proclib\SendMailNotificationHTML.ps1"
```

### Option 3 — Débloquer tous les fichiers du répertoire (déploiement complet)

```powershell
Get-ChildItem "E:\dsi\exploit\proclib\" -Filter "*.ps1" | Unblock-File
```

---

## Pourquoi `-ExecutionPolicy Bypass` ne suffit pas

Le paramètre `-ExecutionPolicy Bypass` surcharge uniquement le scope **Process** (la session en cours).  
Le contrôle `AuthorizationManager` vérifie en plus la **zone de confiance du fichier**, indépendamment de l'ExecutionPolicy. Ces deux mécanismes sont distincts :

| Mécanisme | Contournable par `-ExecutionPolicy Bypass` |
|-----------|-------------------------------------------|
| ExecutionPolicy (Restricted / AllSigned…) | ✅ Oui |
| Zone.Identifier (fichier réseau non fiable) | ❌ Non — `Unblock-File` requis |

---

## Prévention

Pour éviter de rencontrer ce problème à chaque déploiement, deux approches :

1. **Signer le script** avec un certificat reconnu par le domaine → Windows fait confiance au fichier quelle que soit sa zone d'origine.
2. **Intégrer `Unblock-File`** systématiquement dans les scripts de déploiement / procédures Maestro qui copient les `.ps1`.
