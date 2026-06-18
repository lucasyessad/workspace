# ============================================================================
# SendMailNotificationHTML.ps1 - MOTEUR UNIVERSEL DE NOTIFICATION HTML  (v3.3)
# ============================================================================
# Outil ORGANISATIONNEL commun a tous les traitements (YHM, DADP, futurs jobs).
# A partir d'un fichier de configuration JSON par job + de parametres en ligne
# de commande, il construit un e-mail HTML (a partir d'un template) et l'envoie.
#
# PRINCIPE : l'intelligence metier reste dans le traitement (ODI / SQL / BAT).
#            Ce moteur ne fait que METTRE EN FORME et ENVOYER, de facon generique.
#
# UN TRAITEMENT COMPLET = ce moteur + 1 config JSON par job.
# Il n'y a AUCUNE couche intermediaire : chaque BAT appelle directement ce
# script. Tout le confort autrefois porte par un wrapper (scan de repertoires,
# raccourci statistiques, priorite automatique) est integre ici.
#
# ----------------------------------------------------------------------------
# CONTRAT D'APPEL (parametres) :
#   Obligatoires : -ConfigFile -NomJob -Status
#   Horodatage   : -Horodatage "yyyyMMdd_HHmmss"
#   Contenu      : -KeyValues -Etapes -Stats -MessageLibre -TableCsv -TableTitle
#                  -SectionFile -SectionsInline
#   Multi-fichiers / logs : -Files -FileDir -AutoAnalyze -LogDir -LogPattern ...
#   Pieces jointes : -Attachments -AttachDir -AttachPattern
#   Regroupement CSV (v3.2): -GroupBy -StatusColumn -Columns -Headers
#                  (ces 4 peuvent aussi venir du JSON ; le parametre l'emporte)
#   Options      : -DryRun -ExportHtml -MailPriority -AutoPriority -OverrideTo
#                  -OverrideCc -ExtraSubject -NoFooter -Verbose2
#
# HISTORIQUE :
#   v3.3 : moteur autosuffisant (suppression du wrapper Invoke-MailNotification).
#          Integration de : scan de repertoire fichiers (-FileDir/-FilePattern),
#          scan de pieces jointes (-AttachDir/-AttachPattern), raccourci
#          statistiques (-Stats "k=v;k=v") et priorite automatique
#          (-AutoPriority : High si ERREUR/ECHEC).
#   v3.2 : regroupement CSV par colonne (-GroupBy), selection/renommage de
#          colonnes (-Columns/-Headers) et badge statut par groupe
#          (-StatusColumn, pire valeur du groupe). Configurables aussi via le
#          JSON. Retro-compatible v3.1 (sans ces parametres : comportement v3.1).
#   v3.1 : coloration des cellules d'evolution en pourcentage
#          (negatif=rouge, positif=vert) dans Rnd-Table.
#   v3.0 : multi-fichiers, recuperation de logs, statistiques dynamiques,
#          sections inline/fichier, DryRun, export HTML.
# ============================================================================

[CmdletBinding()]
param(
    # --- OBLIGATOIRES --------------------------------------------------------
    [Parameter(Mandatory=$true)]  [string]   $ConfigFile,
    [Parameter(Mandatory=$true)]  [string]   $NomJob,
    [Parameter(Mandatory=$true)]  [string]   $Status,

    # --- HORODATAGE ----------------------------------------------------------
    [string]   $Horodatage      = '',           # "yyyyMMdd_HHmmss" (sinon = maintenant)

    # --- CONTENU DES SECTIONS ------------------------------------------------
    [string]   $KeyValues       = '',           # "Cle1=Val1;Cle2=Val2"
    [string]   $Etapes          = '',           # "etape1^etape2^etape3" (sep. ^ ou |)
    [string]   $Stats           = '',           # "Lignes=1520;Erreurs=3" -> bloc metriques
    [string]   $MessageLibre    = '',
    [string]   $TableCsv        = '',           # Chemin d'un CSV (delimiteur ;)
    [string]   $TableTitle      = '',
    [string]   $SectionFile     = '',           # Fichier JSON de sections
    [string]   $SectionsInline  = '',           # JSON inline de sections

    # --- MULTI-FICHIERS (v3.0) ----------------------------------------------
    # Format : "chemin|titre|description;chemin2|titre2|desc2" ou "chemin1;chemin2"
    [string]   $Files           = '',
    [string]   $FileDir         = '',           # Repertoire scanne -> fichiers ajoutes a -Files
    [string]   $FilePattern     = '*.*',        # Filtre du scan -FileDir

    # --- ANALYSE AUTOMATIQUE (v3.0) -----------------------------------------
    [switch]   $AutoAnalyze,                     # Analyser les fichiers -> stats
    [int]      $MaxCsvRows      = 50,            # Limite lignes CSV affichees
    [int]      $MaxCsvCols      = 10,            # Limite colonnes CSV affichees

    # --- RECUPERATION DE LOGS (v3.0) ----------------------------------------
    [string]   $LogDir          = '',
    [string]   $LogPattern      = '*.log',
    [int]      $LogTailLines    = 30,
    [string]   $LogErrorPattern = '(?i)(error|erreur|exception|fatal|critical|echec|failed)',
    [switch]   $LogAttach,                       # Joindre les logs en piece jointe

    # --- OPTIONS AVANCEES (v3.0) --------------------------------------------
    [string[]] $Attachments     = @(),
    [string]   $AttachDir        = '',           # Repertoire scanne -> pieces jointes
    [string]   $AttachPattern    = '*.*',        # Filtre du scan -AttachDir
    [switch]   $DryRun,                          # Generer le HTML sans envoyer
    [string]   $ExportHtml      = '',            # Sauvegarder le HTML genere
    [string]   $MailPriority    = 'Normal',      # Low | Normal | High
    [switch]   $AutoPriority,                    # Priorite auto : High si ERREUR/ECHEC
    [string]   $OverrideTo      = '',            # Forcer les destinataires (debug)
    [string]   $OverrideCc      = '',
    [string]   $ExtraSubject    = '',            # Texte ajoute au sujet
    [switch]   $NoFooter,                        # Retirer le footer du template
    [switch]   $Verbose2,                        # Journalisation detaillee console

    # --- REGROUPEMENT / SELECTION DE COLONNES CSV (v3.2) --------------------
    [string]   $GroupBy         = '',            # Colonne de rupture : 1 section / valeur
    [string]   $StatusColumn    = '',            # Colonne statut -> badge (pire valeur du groupe)
    [string]   $Columns         = '',            # Colonnes a afficher (CSV, surcharge config)
    [string]   $Headers         = ''             # En-tetes affichees (meme ordre que -Columns)
)

# ============================================================================
# INITIALISATION
# ============================================================================
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$script:Chrono = [System.Diagnostics.Stopwatch]::StartNew()
$script:Logs   = [System.Collections.Generic.List[string]]::new()

function Log([string]$msg, [string]$level = 'INFO') {
    $line = "[$(Get-Date -Format 'HH:mm:ss.fff')] [$level] $msg"
    $script:Logs.Add($line)
    switch ($level) {
        'ERROR'   { Write-Error   $msg }
        'WARNING' { Write-Warning $msg }
        default   { if ($Verbose2) { Write-Host $line -ForegroundColor DarkGray } }
    }
}

function HtmlEnc([string]$s) {
    if ($null -eq $s) { return '' }
    return [System.Net.WebUtility]::HtmlEncode($s)
}

# Normalise une liste de destinataires (tableau JSON ou chaine "a,b;c")
function Norm-Rcpt([object]$v) {
    if ($null -eq $v) { return @() }
    if ($v -is [System.Array]) {
        return @($v | ForEach-Object { if ($_) { $_.ToString().Trim() } } | Where-Object { $_ -ne '' })
    }
    return @($v.ToString() -split '[,;]' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
}

function Format-Size([long]$bytes) {
    if ($bytes -ge 1GB) { return '{0:N2} Go' -f ($bytes / 1GB) }
    if ($bytes -ge 1MB) { return '{0:N2} Mo' -f ($bytes / 1MB) }
    if ($bytes -ge 1KB) { return '{0:N2} Ko' -f ($bytes / 1KB) }
    return "$bytes octets"
}

# Detection d'encodage par BOM : UTF-8 avec BOM -> 'UTF8', sinon 'Default'
# (ANSI/Windows-1252 sur Windows francais). Garantit les accents quel que soit
# l'export ODI/Excel sans configuration manuelle.
function Detect-Encoding([string]$path) {
    try {
        $fs = [System.IO.File]::OpenRead($path)
        try {
            $b = New-Object byte[] 3
            $n = $fs.Read($b, 0, 3)
            if ($n -ge 3 -and $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF) { return 'UTF8' }
        } finally { $fs.Close() }
    } catch { }
    return 'Default'
}

# Lecture tolerante (UTF8 puis ANSI), avec limite optionnelle de lignes
function Safe-Read([string]$path, [int]$maxLines = 0) {
    foreach ($enc in @('UTF8', 'Default')) {
        try {
            if ($maxLines -gt 0) {
                return Get-Content -LiteralPath $path -Encoding $enc -TotalCount $maxLines -ErrorAction Stop
            }
            return Get-Content -LiteralPath $path -Encoding $enc -ErrorAction Stop
        } catch { }
    }
    Log "Impossible de lire : $path" 'WARNING'
    return @()
}

Log "=== SendMailNotificationHTML v3.3 ==="
Log "Job: $NomJob | Status: $Status | Config: $ConfigFile"

# ============================================================================
# CHARGEMENT DE LA CONFIGURATION JSON
# ============================================================================
if (-not (Test-Path -LiteralPath $ConfigFile)) {
    Log "Fichier config introuvable : $ConfigFile" 'ERROR'
    exit 1
}

$raw = Get-Content -LiteralPath $ConfigFile -Raw -Encoding UTF8

# Substitution des variables d'environnement ${VAR} (ex: ${SMTP_SERVER})
$raw = [regex]::Replace($raw, '\$\{([^}]+)\}', {
    param($m)
    $ev = [Environment]::GetEnvironmentVariable($m.Groups[1].Value)
    if ($ev) { $ev } else { $m.Value }
})

# Echappement des backslashes Windows non doubles dans les chemins JSON
$raw = [regex]::Replace($raw, '(?m)("(?:TemplatePath|LogDir|BasePath)"\s*:\s*")([^"]*)(")', {
    param($m)
    $p = $m.Groups[2].Value
    if ($p -match '\\' -and $p -notmatch '\\\\') { $p = $p.Replace('\', '\\') }
    "$($m.Groups[1].Value)$p$($m.Groups[3].Value)"
})

try { $cfg = $raw | ConvertFrom-Json -ErrorAction Stop }
catch {
    Log "Erreur de parsing JSON config : $($_.Exception.Message)" 'ERROR'
    exit 1
}

# Validation des champs obligatoires
foreach ($f in @('SmtpServer', 'From', 'To', 'TemplatePath')) {
    if (-not $cfg.$f) { Log "Champ manquant dans la config : $f" 'ERROR'; exit 1 }
}

# Champs de configuration (avec valeurs par defaut)
$SmtpSrv  = $cfg.SmtpServer
$Port     = if ($cfg.Port) { [int]$cfg.Port } else { 25 }
$From     = $cfg.From
$To       = if ($OverrideTo) { Norm-Rcpt $OverrideTo } else { Norm-Rcpt $cfg.To }
$Cc       = if ($OverrideCc) { Norm-Rcpt $OverrideCc } else { Norm-Rcpt $cfg.Cc }
$TplPath  = $cfg.TemplatePath
$Env_Name = if ($cfg.Environnement) { $cfg.Environnement } else { 'N/A' }
$SubjTpl  = if ($cfg.Subject) { $cfg.Subject } else { '[{{STATUS_LABEL}}] [{{ENVIRONNEMENT}}] {{JOB_NAME}} - {{DATE}}' }
$stMsgs   = $cfg.StatusMessages
$Equipe   = if ($cfg.EquipeNom) { $cfg.EquipeNom } else { "L'equipe INEO" }

# Heritage depuis la config si non passe en parametre (logs)
if (-not $LogDir -and $cfg.LogDir)                  { $LogDir       = $cfg.LogDir }
if ($cfg.LogPattern -and $LogPattern -eq '*.log')   { $LogPattern   = $cfg.LogPattern }
if ($cfg.LogTailLines)                              { $LogTailLines = [int]$cfg.LogTailLines }
if ($cfg.LogErrorPattern)                           { $LogErrorPattern = $cfg.LogErrorPattern }

Log "Config chargee : SMTP=$SmtpSrv, Env=$Env_Name, To=$($To -join ',')"

# ============================================================================
# RESOLUTION GroupBy / StatusColumn / Columns / Headers   (parametre > config)
# ============================================================================
# Helper : transforme une valeur config (tableau JSON OU chaine "a,b,c") en tableau
function ConvertTo-ColList([object]$v) {
    if ($null -eq $v) { return @() }
    if ($v -is [array]) { return @($v) }
    return @([string]$v -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
}

$effGroupBy      = if ($GroupBy)      { $GroupBy }      elseif ($cfg.GroupBy)      { [string]$cfg.GroupBy }      else { '' }
$effStatusColumn = if ($StatusColumn) { $StatusColumn } elseif ($cfg.StatusColumn) { [string]$cfg.StatusColumn } else { '' }
$effColumns      = if ($Columns) { ConvertTo-ColList $Columns } else { ConvertTo-ColList $cfg.Columns }
$effHeaders      = if ($Headers) { ConvertTo-ColList $Headers } else { ConvertTo-ColList $cfg.Headers }

# ============================================================================
# TEMPLATE HTML
# ============================================================================
if (-not (Test-Path -LiteralPath $TplPath)) {
    Log "Template introuvable : $TplPath" 'ERROR'
    exit 1
}
$tplHtml = Get-Content -LiteralPath $TplPath -Raw -Encoding UTF8
Log "Template charge : $TplPath"

# ============================================================================
# HORODATAGE
# ============================================================================
if ($Horodatage -match '^\d{8}_\d{6}$') {
    $dateFmt  = '{0}/{1}/{2}' -f $Horodatage.Substring(6,2), $Horodatage.Substring(4,2), $Horodatage.Substring(0,4)
    $heureFmt = '{0}:{1}:{2}' -f $Horodatage.Substring(9,2), $Horodatage.Substring(11,2), $Horodatage.Substring(13,2)
} else {
    $n = Get-Date
    $dateFmt  = $n.ToString('dd/MM/yyyy')
    $heureFmt = $n.ToString('HH:mm:ss')
    if (-not $Horodatage) { $Horodatage = $n.ToString('yyyyMMdd_HHmmss') }
}

# ============================================================================
# STATUT : LIBELLE + MESSAGE + COULEUR
# ============================================================================
$statusLabelMap = @{
    'OK'            = 'SUCCES'
    'SUCCES'        = 'SUCCES'
    'ERREUR'        = 'ECHEC'
    'ECHEC'         = 'ECHEC'
    'WARNING'       = 'AVERTISSEMENT'
    'INFO'          = 'INFORMATION'
    'AUCUN_FICHIER' = 'AUCUN FICHIER'
    'PARTIEL'       = 'SUCCES PARTIEL'
}
$statusLabel = if ($statusLabelMap.ContainsKey($Status)) { $statusLabelMap[$Status] } else { $Status }

$stMsg = $null
if ($stMsgs -and ($stMsgs.PSObject.Properties.Name -contains $Status)) { $stMsg = $stMsgs.$Status }
if ([string]::IsNullOrWhiteSpace($stMsg)) {
    $defaults = @{
        'OK'            = 'Le traitement s''est termine avec succes.'
        'SUCCES'        = 'Le traitement s''est termine avec succes.'
        'ERREUR'        = 'Une ou plusieurs erreurs sont survenues.'
        'ECHEC'         = 'Une ou plusieurs erreurs sont survenues.'
        'WARNING'       = 'Le traitement s''est termine avec des avertissements.'
        'INFO'          = 'Information transmise par le traitement.'
        'AUCUN_FICHIER' = 'Aucun fichier a traiter.'
        'PARTIEL'       = 'Le traitement s''est termine partiellement.'
    }
    $stMsg = if ($defaults.ContainsKey($Status)) { $defaults[$Status] } else { "Statut : $Status" }
}

$colorMap = @{
    'OK'='#00A8A8'; 'SUCCES'='#00A8A8'
    'ERREUR'='#C0392B'; 'ECHEC'='#C0392B'
    'WARNING'='#D8A825'
    'INFO'='#2E75B6'
    'AUCUN_FICHIER'='#6BCFCF'
    'PARTIEL'='#E67E22'
}
$stColor = if ($colorMap.ContainsKey($Status)) { $colorMap[$Status] } else { '#888888' }

# Priorite mail automatique selon le statut (si -AutoPriority)
if ($AutoPriority) {
    $MailPriority = if ($Status -in 'ERREUR', 'ECHEC') { 'High' } else { 'Normal' }
    Log "Priorite automatique -> $MailPriority (statut $Status)"
}

# ============================================================================
# RENDERERS DE SECTIONS  (palette Credit Logement)
# ============================================================================

# Titre de section. Detecte un badge de statut en fin de titre :
#   "EXP_BNP [RECU]" / "... [RETARD]" / "... [NON RECU]"  -> pastille coloree.
function Rnd-SectionTitle([string]$title, [string]$icon = '') {
    if (-not $title) { return '' }
    $badgeHtml   = ''
    $borderColor = '#0056b3'
    $cleanTitle  = $title
    if ($title -match '\[((?:NON RECU|RETARD|RECU)[^\]]*)\]$') {
        $badgeText  = $Matches[0]
        $badgeKey   = $Matches[1] -replace '\s*[—-].*', ''
        $cleanTitle = $title.Substring(0, $title.Length - $badgeText.Length).TrimEnd()
        $badgeColor = '#28a745'; $badgeBg = '#eafaf1'; $borderColor = '#28a745'
        switch -Wildcard ($badgeKey.Trim()) {
            'NON RECU' { $badgeColor = '#dc3545'; $badgeBg = '#fdf2f2'; $borderColor = '#dc3545' }
            'RETARD'   { $badgeColor = '#E67E22'; $badgeBg = '#fef9f0'; $borderColor = '#E67E22' }
        }
        $badgeHtml = " <span style=`"display:inline-block;padding:2px 10px;border-radius:3px;font-size:11px;font-weight:700;background-color:${badgeBg};color:${badgeColor};border:1px solid ${badgeColor};`">$(HtmlEnc $badgeText)</span>"
    }
    $iconHtml = if ($icon) { "<span style=`"font-size:13px;margin-right:6px;`">$icon</span>" } else { '' }
    $h  = '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">'
    $h += "<tr><td bgcolor=`"#f8f9fa`" style=`"background-color:#f8f9fa;padding:7px 12px;border-left:4px solid ${borderColor};font-family:'Segoe UI',Calibri,Arial,sans-serif;font-size:15px;font-weight:600;color:#444444;`">${iconHtml}$(HtmlEnc $cleanTitle)${badgeHtml}</td></tr>"
    $h += '</table>'
    return $h
}

function Rnd-Separator() {
    return '<tr><td height="1" bgcolor="#E0E8E8" style="font-size:0;">&nbsp;</td></tr>'
}

function Rnd-Kv([array]$items, [string]$title = '') {
    $h = '<tr><td style="padding:10px 22px;">'
    if ($title) { $h += Rnd-SectionTitle $title '&#9881;' }
    $h += '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    $alt = $false
    foreach ($p in $items) {
        $bg = if ($alt) { '#FFFFFF' } else { '#F5F8F8' }
        $h += "<tr><td bgcolor=`"$bg`" style=`"background-color:$bg;padding:9px 22px;`">" +
              "<table width=`"100%`" cellpadding=`"0`" cellspacing=`"0`" border=`"0`"><tr>" +
              "<td width=`"200`" style=`"font-family:Calibri,'Segoe UI',sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.4px;color:#00A8A8;vertical-align:top;`">$(HtmlEnc $p[0])</td>" +
              "<td style=`"font-family:Calibri,'Segoe UI',sans-serif;font-size:13px;font-weight:bold;color:#2B2B2B;`">$(HtmlEnc $p[1])</td>" +
              "</tr></table></td></tr>"
        $alt = -not $alt
    }
    $h += '</table></td></tr>'
    return $h
}

function Rnd-Etapes([array]$lines, [string]$title = 'Rapport d''ex&eacute;cution') {
    $h = '<tr><td style="padding:12px 22px;">'
    $h += Rnd-SectionTitle $title '&#9776;'
    $h += '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    foreach ($l in $lines) {
        $t = $l.Trim(); if (-not $t) { continue }
        $ic = '&#9679;'; $icc = '#888888'; $pad = ''; $weight = 'normal'
        if ($t -match '^\[SUCCES\]')  { $ic = '&#10003;'; $icc = '#00A8A8'; $weight = 'bold' }
        if ($t -match '^\[OK\]')      { $ic = '&#10003;'; $icc = '#00A8A8'; $weight = 'bold' }
        if ($t -match '^\[ECHEC\]')   { $ic = '&#10007;'; $icc = '#C0392B'; $weight = 'bold' }
        if ($t -match '^\[ERREUR\]')  { $ic = '&#10007;'; $icc = '#C0392B'; $weight = 'bold' }
        if ($t -match '^\[WARNING\]') { $ic = '&#9888;';  $icc = '#D8A825' }
        if ($t -match '^\[INFO\]')    { $ic = '&#8505;';  $icc = '#2E75B6' }
        if ($t -match '^\[SKIP\]')    { $ic = '&#8594;';  $icc = '#AAAAAA' }
        if ($t -match '^\s*\|')       { $pad = 'padding-left:24px;'; $icc = '#AAAAAA'; $ic = '&#8226;' }
        $h += "<tr><td style=`"font-family:'Courier New',Consolas,monospace;font-size:11px;color:#2B2B2B;padding:3px 0;line-height:1.6;font-weight:${weight};${pad}`"><span style=`"color:${icc};font-size:13px;`">${ic}</span>&nbsp; $(HtmlEnc $t)</td></tr>"
    }
    $h += '</table></td></tr>'
    return $h
}

# Tableau de donnees. Les cellules de type pourcentage sont colorees :
#   negatif -> rouge, positif non nul -> vert (zero = neutre).
function Rnd-Table([string]$title, [array]$headers, [array]$rows, [string]$icon = '&#9783;') {
    $h = '<tr><td style="padding:10px 22px 18px 22px;">'
    $h += '<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff;border:1px solid #eee;">'
    $h += '<tr><td style="padding:15px;">'
    if ($title) { $h += Rnd-SectionTitle $title $icon }
    $h += '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">'
    if ($headers -and $headers.Count -gt 0) {
        $h += '<tr bgcolor="#ffffff" style="background-color:#ffffff;">'
        foreach ($hd in $headers) {
            $h += "<td style=`"padding:10px;font-family:'Segoe UI',Calibri,Arial,sans-serif;font-size:12px;font-weight:600;color:#666666;text-transform:uppercase;border-bottom:2px solid #dee2e6;`">$(HtmlEnc $hd)</td>"
        }
        $h += '</tr>'
    }
    $alt = $false
    foreach ($r in $rows) {
        $bg = if ($alt) { '#f8f9fa' } else { '#ffffff' }
        $h += "<tr bgcolor=`"$bg`" style=`"background-color:$bg;`">"
        foreach ($c in $r) {
            $cs = if ($null -ne $c) { $c.ToString() } else { '' }
            $cellColor = '#333333'
            $extraStyle = ''
            if ($cs -match '^-[\d.,]+\s*%$') {
                $cellColor = '#dc3545'; $extraStyle = 'background-color:#fdf2f2;padding:2px 6px;border-radius:3px;'
            } elseif ($cs -match '^\+?[\d.,]+\s*%$' -and $cs -notmatch '^\+?0([.,]0+)?\s*%$') {
                $cellColor = '#28a745'; $extraStyle = 'background-color:#eafaf1;padding:2px 6px;border-radius:3px;'
            }
            $h += "<td style=`"padding:12px 10px;font-family:'Segoe UI',Calibri,Arial,sans-serif;font-size:13px;border-bottom:1px solid #eee;`"><span style=`"color:${cellColor};font-weight:$(if($extraStyle){'bold'}else{'normal'});${extraStyle}`">$(HtmlEnc $cs)</span></td>"
        }
        $h += '</tr>'
        $alt = -not $alt
    }
    $h += '</table></td></tr></table></td></tr>'
    return $h
}

function Rnd-Texte([string]$title, [string]$content, [string]$icon = '') {
    $h = '<tr><td style="padding:12px 22px;">'
    if ($title) { $h += Rnd-SectionTitle $title $icon }
    $htmlContent = (HtmlEnc $content) -replace "`r?`n", '<br/>'
    $h += "<div style=`"font-family:Calibri,sans-serif;font-size:13px;color:#2B2B2B;line-height:1.6;`">$htmlContent</div>"
    $h += '</td></tr>'
    return $h
}

function Rnd-CodeBlock([string]$title, [string[]]$lines, [string]$icon = '&#128196;') {
    $h = '<tr><td style="padding:12px 22px;">'
    if ($title) { $h += Rnd-SectionTitle $title $icon }
    $h += '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    $h += '<tr><td bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:14px 18px;border-left:3px solid #00A8A8;">'
    $lineNum = 0
    foreach ($l in $lines) {
        $lineNum++
        $color = '#D4D4D4'
        if ($l -match $LogErrorPattern)                          { $color = '#F44747' }
        elseif ($l -match '(?i)(warn|attention|avert)')          { $color = '#CCA700' }
        elseif ($l -match '(?i)(success|succes|ok|done|termine)') { $color = '#6A9955' }
        $h += "<div style=`"font-family:'Courier New',Consolas,monospace;font-size:10px;line-height:1.5;white-space:pre-wrap;word-break:break-all;`">"
        $h += "<span style=`"color:#555555;margin-right:10px;user-select:none;`">$($lineNum.ToString().PadLeft(3,' '))</span>"
        $h += "<span style=`"color:${color};`">$(HtmlEnc $l)</span></div>"
    }
    $h += '</td></tr></table></td></tr>'
    return $h
}

function Rnd-StatsBar([string]$title, [hashtable]$stats) {
    $h = '<tr><td style="padding:12px 22px;">'
    if ($title) { $h += Rnd-SectionTitle $title '&#128202;' }
    $h += '<table width="100%" cellpadding="0" cellspacing="8" border="0"><tr>'
    $colors = @('#00A8A8','#2E75B6','#D8A825','#C0392B','#6BCFCF','#E67E22','#8E44AD','#27AE60')
    $i = 0
    foreach ($key in $stats.Keys) {
        $c = $colors[$i % $colors.Count]
        $h += "<td bgcolor=`"#F5F8F8`" style=`"background-color:#F5F8F8;padding:14px 16px;text-align:center;border-top:3px solid ${c};`">"
        $h += "<div style=`"font-family:Calibri,sans-serif;font-size:22px;font-weight:bold;color:${c};`">$(HtmlEnc $stats[$key].ToString())</div>"
        $h += "<div style=`"font-family:Calibri,sans-serif;font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#6B7070;margin-top:4px;`">$(HtmlEnc $key)</div>"
        $h += '</td>'
        $i++
    }
    $h += '</tr></table></td></tr>'
    return $h
}

function Rnd-FileCard([string]$filename, [string]$description, [hashtable]$meta) {
    $h = '<tr><td style="padding:8px 22px;">'
    $h += '<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F8F8" style="background-color:#F5F8F8;border-left:4px solid #00A8A8;">'
    $h += '<tr><td style="padding:12px 16px;">'
    $h += "<div style=`"font-family:Calibri,sans-serif;font-size:13px;font-weight:bold;color:#2B2B2B;`">&#128206; $(HtmlEnc $filename)</div>"
    if ($description) {
        $h += "<div style=`"font-family:Calibri,sans-serif;font-size:11px;color:#6B7070;margin-top:4px;line-height:1.4;`">$(HtmlEnc $description)</div>"
    }
    if ($meta -and $meta.Count -gt 0) {
        $h += '<div style="margin-top:8px;">'
        foreach ($mk in $meta.Keys) {
            $h += "<span style=`"display:inline-block;background-color:#E0E8E8;padding:2px 8px;margin:2px 4px 2px 0;font-family:Calibri,sans-serif;font-size:10px;color:#2B2B2B;`">"
            $h += "<strong>$(HtmlEnc $mk)</strong>: $(HtmlEnc $meta[$mk].ToString())</span>"
        }
        $h += '</div>'
    }
    $h += '</td></tr></table></td></tr>'
    return $h
}

# ============================================================================
# ANALYSEURS DE FICHIERS  (v3.0)
# ============================================================================

# Analyse un CSV : detection du delimiteur, stats numeriques automatiques,
# rendu en tableau (limite a maxRows / maxCols).
function Analyze-CsvFile([string]$path, [string]$title, [int]$maxRows, [int]$maxCols) {
    $result = @{ Sections = ''; Stats = [ordered]@{} }
    Log "Analyse CSV : $path"
    try {
        $csv = $null; $bestCount = 0
        $enc = Detect-Encoding $path
        foreach ($d in @(';', ',', "`t", '|')) {
            try {
                $test = Import-Csv -Path $path -Delimiter $d -Encoding $enc -ErrorAction Stop
                if ($test.Count -gt 0) {
                    $colCount = @($test[0].PSObject.Properties.Name).Count
                    if ($colCount -gt $bestCount) { $bestCount = $colCount; $csv = $test }
                }
            } catch { }
        }
        if (-not $csv -or $csv.Count -eq 0) { Log "CSV vide ou illisible : $path" 'WARNING'; return $result }

        $allHeaders = @($csv[0].PSObject.Properties.Name)
        $headers    = @($allHeaders | Select-Object -First $maxCols)
        $truncCols  = $allHeaders.Count -gt $maxCols
        $totalRows  = $csv.Count

        $result.Stats['Lignes']   = $totalRows
        $result.Stats['Colonnes'] = $allHeaders.Count

        # Somme des colonnes entierement numeriques
        foreach ($col in $headers) {
            $numVals = @($csv | ForEach-Object { $_.$col } | Where-Object { $_ -match '^\s*-?\d+([.,]\d+)?\s*$' })
            if ($numVals.Count -eq $totalRows -and $totalRows -gt 0) {
                $nums = $numVals | ForEach-Object { [double]($_ -replace ',', '.') }
                $result.Stats["Somme $col"] = ($nums | Measure-Object -Sum).Sum
            }
        }
        # Comptage des valeurs non nulles dans les colonnes ecart/diff/erreur
        foreach ($col in $headers) {
            if ($col -match '(?i)(ecart|diff|delta|erreur|error)') {
                $nonZero = @($csv | ForEach-Object { $_.$col } | Where-Object { $_ -and $_ -ne '0' -and $_ -ne '0.0' -and $_ -ne '' }).Count
                if ($nonZero -gt 0) { $result.Stats["$col <> 0"] = $nonZero }
            }
        }

        $displayRows = @($csv | Select-Object -First $maxRows)
        $rws = @()
        foreach ($r in $displayRows) {
            $rws += ,@($headers | ForEach-Object { $r.$_ })
        }

        $displayTitle = if ($title) { $title } else { [System.IO.Path]::GetFileName($path) }
        if ($totalRows -gt $maxRows) { $displayTitle += " (${maxRows}/${totalRows} lignes)" }
        if ($truncCols)              { $displayTitle += " [${maxCols}/$($allHeaders.Count) colonnes]" }

        $result.Sections = Rnd-Table $displayTitle $headers $rws '&#128202;'
    } catch {
        Log "Erreur analyse CSV $path : $($_.Exception.Message)" 'WARNING'
    }
    return $result
}

function Analyze-LogFile([string]$path, [int]$tailLines, [string]$errPattern) {
    $result = @{ Sections = ''; Stats = [ordered]@{}; Errors = @() }
    Log "Analyse LOG : $path"
    try {
        $allLines   = Safe-Read $path
        $result.Stats['Total lignes'] = $allLines.Count

        $errorLines = @($allLines | Where-Object { $_ -match $errPattern })
        $result.Stats['Erreurs'] = $errorLines.Count
        $result.Errors           = $errorLines

        $warnLines  = @($allLines | Where-Object { $_ -match '(?i)(warn|avert|attention)' })
        $result.Stats['Avertissements'] = $warnLines.Count

        $tail     = @($allLines | Select-Object -Last $tailLines)
        $filename = [System.IO.Path]::GetFileName($path)
        $result.Sections = Rnd-CodeBlock "Log : $filename (${tailLines} dernieres lignes)" $tail
    } catch {
        Log "Erreur analyse LOG $path : $($_.Exception.Message)" 'WARNING'
    }
    return $result
}

function Analyze-GenericFile([string]$path) {
    $result = @{ Stats = [ordered]@{} }
    try {
        $fi = Get-Item -LiteralPath $path -ErrorAction Stop
        $result.Stats['Taille']  = Format-Size $fi.Length
        $result.Stats['Modifie'] = $fi.LastWriteTime.ToString('dd/MM/yyyy HH:mm')
        if ($fi.Extension.ToLower() -in @('.txt','.log','.csv','.tsv','.dat','.sql','.xml','.json')) {
            $result.Stats['Lignes'] = (Safe-Read $path).Count
        }
    } catch {
        Log "Erreur lecture metadonnees $path : $($_.Exception.Message)" 'WARNING'
    }
    return $result
}

# ============================================================================
# ASSEMBLAGE DES SECTIONS
# ============================================================================
$secHtml         = ''
$globalStats     = [ordered]@{}
$allAttachments  = [System.Collections.Generic.List[string]]::new()
foreach ($a in $Attachments) {
    if (-not [string]::IsNullOrWhiteSpace($a)) { $allAttachments.Add($a.Trim()) }
}

# Scan automatique d'un repertoire de pieces jointes (-AttachDir)
if ($AttachDir -and (Test-Path -LiteralPath $AttachDir)) {
    Log "Scan pieces jointes : $AttachDir (pattern: $AttachPattern)"
    Get-ChildItem -Path $AttachDir -Filter $AttachPattern -File -ErrorAction SilentlyContinue |
        ForEach-Object { $allAttachments.Add($_.FullName) }
}

# Scan automatique d'un repertoire de fichiers (-FileDir) -> alimente -Files
if ($FileDir -and (Test-Path -LiteralPath $FileDir)) {
    Log "Scan fichiers : $FileDir (pattern: $FilePattern)"
    $scanned = @(Get-ChildItem -Path $FileDir -Filter $FilePattern -File -ErrorAction SilentlyContinue |
                 Sort-Object Name | ForEach-Object { "$($_.FullName)|$($_.Name)" })
    if ($scanned.Count -gt 0) {
        $Files = if ($Files) { "$Files;$($scanned -join ';')" } else { $scanned -join ';' }
        Log "  -> $($scanned.Count) fichier(s) ajoute(s) a la liste"
    }
}

# --- 1. KeyValues -----------------------------------------------------------
if ($KeyValues) {
    $kvList = @()
    foreach ($pair in ($KeyValues -split ';')) {
        $pts = $pair -split '=', 2
        if ($pts.Count -eq 2) { $kvList += ,@($pts[0].Trim(), $pts[1].Trim()) }
    }
    if ($kvList.Count -gt 0) {
        $secHtml += Rnd-Kv $kvList
        $secHtml += Rnd-Separator
    }
}

# --- 1bis. Stats (raccourci "k=v;k=v") -> bloc metriques --------------------
if ($Stats) {
    $stItems = [ordered]@{}
    foreach ($pair in ($Stats -split ';')) {
        $p = $pair -split '=', 2
        if ($p.Count -eq 2) { $stItems[$p[0].Trim()] = $p[1].Trim() }
    }
    if ($stItems.Count -gt 0) {
        $secHtml += Rnd-StatsBar 'Metriques' $stItems
        $secHtml += Rnd-Separator
    }
}

# --- 2. Multi-fichiers ------------------------------------------------------
if ($Files) {
    Log "Traitement multi-fichiers..."
    $fileEntries = @($Files -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
    foreach ($entry in $fileEntries) {
        $parts     = $entry -split '\|'
        $filePath  = $parts[0].Trim()
        $fileTitle = if ($parts.Count -gt 1 -and $parts[1].Trim()) { $parts[1].Trim() } else { [System.IO.Path]::GetFileName($filePath) }
        $fileDesc  = if ($parts.Count -gt 2) { $parts[2].Trim() } else { '' }

        if (-not (Test-Path -LiteralPath $filePath)) {
            Log "Fichier introuvable : $filePath" 'WARNING'
            $secHtml += Rnd-Texte '' "&#9888; Fichier introuvable : $filePath" '&#128196;'
            continue
        }

        $ext      = [System.IO.Path]::GetExtension($filePath).ToLower()
        $fileMeta = (Analyze-GenericFile $filePath).Stats
        $secHtml += Rnd-FileCard $fileTitle $fileDesc $fileMeta

        if ($AutoAnalyze) {
            switch -regex ($ext) {
                '\.(csv|tsv)' {
                    $csvResult = Analyze-CsvFile $filePath $fileTitle $MaxCsvRows $MaxCsvCols
                    $secHtml += $csvResult.Sections
                    foreach ($sk in $csvResult.Stats.Keys) { $globalStats[$sk] = $csvResult.Stats[$sk] }
                }
                '\.(log|txt)' {
                    $logResult = Analyze-LogFile $filePath $LogTailLines $LogErrorPattern
                    $secHtml += $logResult.Sections
                    foreach ($sk in $logResult.Stats.Keys) { $globalStats["$fileTitle - $sk"] = $logResult.Stats[$sk] }
                }
            }
        }
        $secHtml += Rnd-Separator
    }
}

# --- 3. Recuperation de logs ------------------------------------------------
if ($LogDir -and (Test-Path -LiteralPath $LogDir)) {
    Log "Recuperation logs depuis : $LogDir (pattern: $LogPattern)"
    $logFiles = @(Get-ChildItem -Path $LogDir -Filter $LogPattern -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending)
    if ($logFiles.Count -eq 0) {
        Log "Aucun log trouve dans $LogDir avec pattern $LogPattern" 'WARNING'
        $secHtml += Rnd-Texte 'Logs' "Aucun fichier log trouve dans $LogDir (pattern: $LogPattern)" '&#128270;'
    } else {
        $totalLogErrors = 0; $totalLogWarnings = 0
        foreach ($lf in $logFiles) {
            $logResult = Analyze-LogFile $lf.FullName $LogTailLines $LogErrorPattern
            $secHtml += $logResult.Sections
            $totalLogErrors   += $logResult.Stats['Erreurs']
            $totalLogWarnings += $logResult.Stats['Avertissements']

            if ($logResult.Errors.Count -gt 0) {
                $errRows = @()
                foreach ($el in @($logResult.Errors | Select-Object -First 20)) { $errRows += ,@($el) }
                $errTitle = "Erreurs detectees : $($lf.Name)"
                if ($logResult.Errors.Count -gt 20) { $errTitle += " (20/$($logResult.Errors.Count))" }
                $secHtml += Rnd-Table $errTitle @('Ligne') $errRows '&#128680;'
            }
            if ($LogAttach) { $allAttachments.Add($lf.FullName) }
        }
        $globalStats['Fichiers log']    = $logFiles.Count
        $globalStats['Erreurs (logs)']  = $totalLogErrors
        $globalStats['Warnings (logs)'] = $totalLogWarnings
        $secHtml += Rnd-Separator
    }
}

# --- 4. SectionFile (JSON externe) ------------------------------------------
if ($SectionFile -and (Test-Path -LiteralPath $SectionFile)) {
    Log "Chargement sections depuis fichier : $SectionFile"
    try {
        $jSec = Get-Content -LiteralPath $SectionFile -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($s in $jSec) {
            switch ($s.type) {
                'kv' {
                    $it = @(); foreach ($i in $s.items) { $it += ,@($i[0], $i[1]) }
                    $secHtml += Rnd-Kv $it $(if ($s.title) { $s.title } else { '' })
                }
                'etapes' {
                    $ln = @()
                    foreach ($i in $s.items) { $ln += '[' + $i[0] + '] ' + $i[1] + $(if ($i.Count -gt 2 -and $i[2]) { ' - ' + $i[2] } else { '' }) }
                    $secHtml += Rnd-Etapes $ln $(if ($s.title) { $s.title } else { 'Rapport d''ex&eacute;cution' })
                }
                'table' {
                    $rw = @(); foreach ($r in $s.rows) { $rw += ,@($r) }
                    $secHtml += Rnd-Table $s.title @($s.headers) $rw
                }
                'texte' {
                    $secHtml += Rnd-Texte $s.title $s.content $(if ($s.icon) { $s.icon } else { '' })
                }
                'code' {
                    $cLines = if ($s.file -and (Test-Path $s.file)) { @(Safe-Read $s.file $s.maxLines) } else { @($s.content -split "`n") }
                    $secHtml += Rnd-CodeBlock $s.title $cLines
                }
                'stats' {
                    $st = [ordered]@{}; foreach ($i in $s.items) { $st[$i[0]] = $i[1] }
                    $secHtml += Rnd-StatsBar $s.title $st
                }
            }
        }
        $secHtml += Rnd-Separator
    } catch {
        Log "Erreur SectionFile : $($_.Exception.Message)" 'WARNING'
    }
}

# --- 5. SectionsInline (JSON en parametre) ----------------------------------
if ($SectionsInline) {
    Log "Traitement sections inline JSON"
    try {
        $jInline = $SectionsInline | ConvertFrom-Json
        foreach ($s in $jInline) {
            switch ($s.type) {
                'kv'     { $it=@(); foreach ($i in $s.items) { $it += ,@($i[0],$i[1]) }; $secHtml += Rnd-Kv $it $(if ($s.title) { $s.title } else { '' }) }
                'table'  { $rw=@(); foreach ($r in $s.rows)  { $rw += ,@($r) };           $secHtml += Rnd-Table $s.title @($s.headers) $rw }
                'texte'  { $secHtml += Rnd-Texte $s.title $s.content }
                'stats'  { $st=[ordered]@{}; foreach ($i in $s.items) { $st[$i[0]] = $i[1] }; $secHtml += Rnd-StatsBar $s.title $st }
                'code'   { $secHtml += Rnd-CodeBlock $s.title @($s.content -split "`n") }
                'etapes' {
                    $ln = @()
                    foreach ($i in $s.items) { $ln += '[' + $i[0] + '] ' + $i[1] + $(if ($i.Count -gt 2 -and $i[2]) { ' - ' + $i[2] } else { '' }) }
                    $secHtml += Rnd-Etapes $ln $(if ($s.title) { $s.title } else { 'Rapport d''ex&eacute;cution' })
                }
            }
        }
        $secHtml += Rnd-Separator
    } catch {
        Log "Erreur SectionsInline : $($_.Exception.Message)" 'WARNING'
    }
}

# --- 6. TableCsv ------------------------------------------------------------
# Deux modes :
#   * AVANCE (v3.2) si -GroupBy / -Columns / -StatusColumn (param ou config) :
#       selection de colonnes, 1 section par valeur de rupture, badge statut
#       (pire valeur du groupe) sur le titre.
#   * SIMPLE (v3.1) sinon : analyse automatique + tableau unique.
if ($TableCsv -and (Test-Path -LiteralPath $TableCsv)) {
    if ($effGroupBy -or $effColumns.Count -gt 0 -or $effStatusColumn) {
        try {
            $csv = Import-Csv -Path $TableCsv -Delimiter ';' -Encoding (Detect-Encoding $TableCsv)
            if ($csv.Count -gt 0) {
                $allCols  = @($csv[0].PSObject.Properties.Name)
                $dispCols = if ($effColumns.Count -gt 0) { $effColumns } else { $allCols }
                $dispHdrs = if ($effHeaders.Count -eq $dispCols.Count) { $effHeaders } else { $dispCols }

                # Alerte (non bloquante) si une colonne demandee n'existe pas
                $unknownCols = @($dispCols | Where-Object { $allCols -notcontains $_ })
                if ($unknownCols.Count -gt 0) {
                    Log "Colonnes absentes du CSV (affichees vides) : $($unknownCols -join ', ')" 'WARNING'
                }

                if ($effGroupBy -and ($allCols -contains $effGroupBy)) {
                    # Rang de gravite : sert a determiner la pire valeur d'un groupe
                    $sRank = @{
                        'NON_RECU'=3; 'ABSENT'=3; 'ECHEC'=3; 'KO'=3; 'ERREUR'=3
                        'RETARD'=2;   'WARNING'=2; 'PARTIEL'=2
                        'RECU'=1;     'OK'=1;      'SUCCES'=1
                    }
                    foreach ($g in ($csv | Group-Object -Property $effGroupBy | Sort-Object Name)) {
                        $suffix = ''
                        if ($effStatusColumn -and ($allCols -contains $effStatusColumn)) {
                            $worst = 0; $worstVal = ''
                            foreach ($row in $g.Group) {
                                $sv = ([string]$row.$effStatusColumn).ToUpper().Trim()
                                $rv = if ($sRank.ContainsKey($sv)) { $sRank[$sv] } else { 0 }
                                if ($rv -gt $worst) { $worst = $rv; $worstVal = [string]$row.$effStatusColumn }
                            }
                            if ($worstVal) { $suffix = " [$($worstVal -replace '_',' ')]" }
                        }
                        $rws = @($g.Group | ForEach-Object { $r = $_; ,@($dispCols | ForEach-Object { [string]$r.$_ }) })
                        $secHtml += Rnd-Table "$($g.Name)$suffix" $dispHdrs $rws
                    }
                } else {
                    $rws = @($csv | ForEach-Object { $r = $_; ,@($dispCols | ForEach-Object { [string]$r.$_ }) })
                    $secHtml += Rnd-Table $(if ($TableTitle) { $TableTitle } else { 'Donnees' }) $dispHdrs $rws
                }
            }
        } catch {
            Log "Erreur TableCsv (GroupBy) : $($_.Exception.Message)" 'WARNING'
        }
    } else {
        $csvResult = Analyze-CsvFile $TableCsv $TableTitle $MaxCsvRows $MaxCsvCols
        $secHtml += $csvResult.Sections
    }
    $secHtml += Rnd-Separator
}

# --- 7. Etapes (en parametre) -----------------------------------------------
if ($Etapes) {
    $el = @($Etapes -split '[\^|]' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
    if ($el.Count -gt 0) {
        $secHtml += Rnd-Etapes $el
        $secHtml += Rnd-Separator
    }
}

# --- 8. Message libre -------------------------------------------------------
if ($MessageLibre) {
    $secHtml += Rnd-Texte '' $MessageLibre '&#128172;'
}

# --- 9. Statistiques globales (issues des analyses) -------------------------
if ($globalStats.Count -gt 0) {
    $secHtml += Rnd-StatsBar 'Metriques' $globalStats
    $secHtml += Rnd-Separator
}

# --- 10. Informations d'execution -------------------------------------------
$script:Chrono.Stop()
$execTime = $script:Chrono.Elapsed
$execKv = @(
    ,@('Duree execution', '{0:00}:{1:00}:{2:00}.{3:000}' -f $execTime.Hours, $execTime.Minutes, $execTime.Seconds, $execTime.Milliseconds)
    ,@('Machine',         $env:COMPUTERNAME)
    ,@('Utilisateur',     "$env:USERDOMAIN\$env:USERNAME")
    ,@('Script',          'SendMailNotificationHTML v3.3')
)
if ($allAttachments.Count -gt 0) { $execKv += ,@('Pieces jointes', $allAttachments.Count.ToString()) }
$secHtml += Rnd-Kv $execKv 'Informations d''execution'

# ============================================================================
# REMPLACEMENT DES PLACEHOLDERS + GENERATION DU CORPS
# ============================================================================
$vars = [ordered]@{
    '{{JOB_NAME}}'       = $NomJob
    '{{STATUS}}'         = $Status
    '{{STATUS_LABEL}}'   = $statusLabel
    '{{DATE}}'           = $dateFmt
    '{{HEURE}}'          = $heureFmt
    '{{STATUS_MESSAGE}}' = $stMsg
    '{{ENVIRONNEMENT}}'  = $Env_Name
    '{{STATUS_COLOR}}'   = $stColor
    '{{HOSTNAME}}'       = $env:COMPUTERNAME
    '{{EQUIPE}}'         = $Equipe
    '{{SECTIONS}}'       = $secHtml
}

$subj = $SubjTpl
if ($ExtraSubject) { $subj = "$subj $ExtraSubject" }
$body = $tplHtml
foreach ($k in $vars.Keys) {
    $subj = $subj.Replace($k, $vars[$k])
    $body = $body.Replace($k, $vars[$k])
}

if ($NoFooter) {
    $body = $body -replace '(?s)<!--FOOTER_START-->.*?<!--FOOTER_END-->', ''
}

# ============================================================================
# EXPORT HTML (debug / archivage)
# ============================================================================
if ($ExportHtml) {
    try {
        $body | Out-File -LiteralPath $ExportHtml -Encoding UTF8 -Force
        Log "HTML exporte : $ExportHtml"
    } catch {
        Log "Erreur export HTML : $($_.Exception.Message)" 'WARNING'
    }
}

# ============================================================================
# ENVOI DU MAIL
# ============================================================================
if ($DryRun) {
    Write-Output "DRYRUN_OK"
    Write-Output "Subject: $subj"
    Write-Output "To: $($To -join ',')"
    Write-Output "Cc: $($Cc -join ',')"
    Write-Output "Attachments: $($allAttachments.Count)"
    if ($ExportHtml) { Write-Output "HTML saved: $ExportHtml" }
    Log "Mode DryRun - mail non envoye"
    exit 0
}

try {
    $mp = @{
        SmtpServer = $SmtpSrv
        Port       = $Port
        From       = $From
        To         = $To
        Subject    = $subj
        Body       = $body
        BodyAsHtml = $true
        Encoding   = [System.Text.Encoding]::UTF8
        Priority   = $MailPriority
    }
    if ($Cc -and $Cc.Count -gt 0) { $mp.Cc = $Cc }

    $validPJ = @()
    foreach ($a in $allAttachments) {
        if (Test-Path -LiteralPath $a) { $validPJ += $a } else { Log "PJ introuvable : $a" 'WARNING' }
    }
    if ($validPJ.Count -gt 0) { $mp.Attachments = $validPJ }

    Send-MailMessage @mp
    Log "Mail envoye avec succes a $($To -join ',')"
    Write-Output "MAIL_OK"
    exit 0
} catch {
    Log "Erreur envoi mail : $($_.Exception.Message)" 'ERROR'
    Write-Output "MAIL_ERROR: $($_.Exception.Message)"
    exit 1
}
