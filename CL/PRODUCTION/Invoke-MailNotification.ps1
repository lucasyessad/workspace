# ============================================================================
# Invoke-MailNotification.ps1 - WRAPPER INTELLIGENT v3.0
# ============================================================================
# Point d'entree unique pour TOUS les traitements batch/PS1.
# Simplifie l'appel au moteur SendMailNotificationHTML.ps1 en offrant :
#   - Des MODES pre-configures (etl, comparaison, surveillance, purge, ...)
#   - Detection automatique des fichiers et logs
#   - Construction intelligente du contenu
#   - Syntaxes simplifiees pour stats, etapes, fichiers
#   - Priorite mail automatique selon le statut
#   - Auto-localisation du moteur
# ============================================================================

[CmdletBinding()]
param(
    # --- OBLIGATOIRES ---
    [Parameter(Mandatory=$true)]  [string] $ConfigFile,
    [Parameter(Mandatory=$true)]  [string] $NomJob,
    [Parameter(Mandatory=$true)]
    [ValidateSet('OK','SUCCES','ERREUR','ECHEC','WARNING','INFO','AUCUN_FICHIER','PARTIEL')]
    [string] $Status,

    # --- MODE (comportement pre-configure) ---
    [ValidateSet('etl','comparaison','surveillance','purge','chargement','custom','')]
    [string] $Mode = '',

    # --- FICHIER(S) ---
    [string] $File         = '',         # Un seul fichier
    [string] $Files        = '',         # Plusieurs : "c:\a.csv;c:\b.log"
    [string] $FileDir      = '',         # Scan auto d'un repertoire
    [string] $FilePattern  = '*.*',
    [string] $FileTitle    = '',         # Titre fichier unique
    [string] $FileDesc     = '',         # Description fichier unique

    # --- LOGS ---
    [string] $LogDir       = '',
    [string] $LogPattern   = '*.log',
    [int]    $LogTailLines = 30,
    [string] $LogFile      = '',         # Un seul log specifique
    [switch] $LogAttach,

    # --- CONTENU ---
    [string]   $KeyValues    = '',       # "Cle1=Val1;Cle2=Val2"
    [string]   $Etapes       = '',       # "[OK] Etape1^[ECHEC] Etape2"
    [string]   $Message      = '',       # Texte libre
    [string]   $SectionFile  = '',       # Fichier JSON sections
    [string]   $SectionsJson = '',       # JSON inline

    # --- RACCOURCIS INTELLIGENTS ---
    [string]   $Stats        = '',       # "Lignes=1520;Erreurs=3;Duree=2m 15s"
    [string]   $StepsReport  = '',       # "OK:Extraction:12 tables;ECHEC:Chargement:timeout"

    # --- PIECES JOINTES ---
    [string[]] $Attachments  = @(),
    [string]   $AttachDir    = '',       # Joindre tout un repertoire
    [string]   $AttachPattern= '*.*',

    # --- OPTIONS ---
    [string] $Horodatage     = '',
    [switch] $DryRun,
    [string] $ExportHtml     = '',
    [string] $MailPriority   = '',       # Auto si vide
    [switch] $AutoAnalyze,
    [int]    $MaxCsvRows     = 50,
    [int]    $MaxCsvCols     = 10,
    [string] $OverrideTo     = '',
    [string] $OverrideCc     = '',
    [string] $ExtraSubject   = '',
    [switch] $NoFooter,
    [switch] $Verbose2,
    [string] $EnginePath     = ''        # Auto-detecte si vide
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

function WLog([string]$msg) {
    if ($Verbose2) { Write-Host "[$(Get-Date -Format 'HH:mm:ss')] [WRAPPER] $msg" -ForegroundColor Cyan }
}

WLog "=== Invoke-MailNotification WRAPPER v3.0 ==="
WLog "Job=$NomJob | Status=$Status | Mode=$Mode"

# --- Auto-detection du moteur ---
if (-not $EnginePath) {
    $candidates = @(
        (Join-Path $PSScriptRoot 'SendMailNotificationHTML.ps1')
        (Join-Path $PSScriptRoot '..\SendMailNotificationHTML.ps1')
    )
    if ($env:PROCLIB) { $candidates += Join-Path $env:PROCLIB 'SendMailNotificationHTML.ps1' }
    foreach ($c in $candidates) {
        if (Test-Path -LiteralPath $c -ErrorAction SilentlyContinue) { $EnginePath = $c; break }
    }
    if (-not $EnginePath) {
        Write-Error "Moteur SendMailNotificationHTML.ps1 introuvable. Specifier -EnginePath"
        exit 1
    }
}
WLog "Moteur : $EnginePath"

# ============================================================================
# CONSTRUCTION INTELLIGENTE
# ============================================================================

# --- Fichiers : unifier ---
$allFiles = @()
if ($File -and (Test-Path -LiteralPath $File -ErrorAction SilentlyContinue)) {
    $entry = $File
    if ($FileTitle) { $entry += "|$FileTitle" }
    if ($FileDesc)  { $entry += "|$FileDesc" }
    $allFiles += $entry
}
if ($Files) {
    $allFiles += ($Files -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}
if ($FileDir -and (Test-Path -LiteralPath $FileDir -ErrorAction SilentlyContinue)) {
    WLog "Scan repertoire : $FileDir ($FilePattern)"
    Get-ChildItem -Path $FileDir -Filter $FilePattern -File -ErrorAction SilentlyContinue |
        Sort-Object Name | ForEach-Object { $allFiles += "$($_.FullName)|$($_.Name)" }
    WLog "  -> $($allFiles.Count) fichier(s)"
}
$filesParam = ($allFiles -join ';')

# --- Logs : fichier unique -> repertoire + pattern ---
$logDirParam = $LogDir
if ($LogFile -and (Test-Path -LiteralPath $LogFile -ErrorAction SilentlyContinue)) {
    $logDirParam = Split-Path $LogFile -Parent
    $LogPattern  = Split-Path $LogFile -Leaf
}

# --- StepsReport -> JSON section etapes ---
$stepsSection = ''
if ($StepsReport) {
    $items = @()
    foreach ($step in ($StepsReport -split ';')) {
        $p = $step -split ':', 3
        if ($p.Count -ge 2) {
            $s = $p[0].Trim().ToUpper(); $l = $p[1].Trim()
            $d = if ($p.Count -ge 3) { $p[2].Trim() } else { '' }
            $items += "[`"$s`",`"$l`",`"$d`"]"
        }
    }
    if ($items.Count -gt 0) {
        $stepsSection = "{`"type`":`"etapes`",`"title`":`"Rapport d'execution`",`"items`":[$($items -join ',')]}"
    }
}

# --- Stats -> JSON section barres ---
$statsSection = ''
if ($Stats) {
    $si = @()
    foreach ($pair in ($Stats -split ';')) {
        $p = $pair -split '=', 2
        if ($p.Count -eq 2) { $si += "[`"$($p[0].Trim())`",`"$($p[1].Trim())`"]" }
    }
    if ($si.Count -gt 0) {
        $statsSection = "{`"type`":`"stats`",`"title`":`"Metriques`",`"items`":[$($si -join ',')]}"
    }
}

# --- Assembler SectionsInline ---
$inlineParts = @()
if ($statsSection)  { $inlineParts += $statsSection }
if ($stepsSection)  { $inlineParts += $stepsSection }
if ($SectionsJson) {
    $t = $SectionsJson.Trim()
    if ($t.StartsWith('[')) { $inlineParts += $t.Substring(1, $t.Length - 2) }
    else { $inlineParts += $t }
}
$sectionsInlineParam = if ($inlineParts.Count -gt 0) { "[$($inlineParts -join ',')]" } else { '' }

# --- Pieces jointes ---
$pjList = [System.Collections.Generic.List[string]]::new()
foreach ($a in $Attachments) {
    $at = $a.Trim()
    if ($at -and (Test-Path -LiteralPath $at -ErrorAction SilentlyContinue)) { $pjList.Add($at) }
}
if ($AttachDir -and (Test-Path -LiteralPath $AttachDir -ErrorAction SilentlyContinue)) {
    Get-ChildItem -Path $AttachDir -Filter $AttachPattern -File -ErrorAction SilentlyContinue |
        ForEach-Object { $pjList.Add($_.FullName) }
}

# --- Priorite automatique ---
if (-not $MailPriority) {
    $MailPriority = switch ($Status) {
        { $_ -in 'ERREUR','ECHEC' } { 'High' }
        default { 'Normal' }
    }
}

# --- Mode : comportements par defaut ---
$doAutoAnalyze = $AutoAnalyze.IsPresent
switch ($Mode) {
    'etl'          { $doAutoAnalyze = $true;  if (-not $ExtraSubject) { $ExtraSubject = '- ETL' } }
    'comparaison'  { $doAutoAnalyze = $true;  if (-not $ExtraSubject) { $ExtraSubject = '- Comparaison' } }
    'chargement'   { $doAutoAnalyze = $true;  if (-not $ExtraSubject) { $ExtraSubject = '- Chargement' } }
    'surveillance' {
        if (-not $ExtraSubject) { $ExtraSubject = '- Surveillance' }
        if ($Status -in 'ERREUR','ECHEC','WARNING') { $MailPriority = 'High' }
    }
    'purge'        { if (-not $ExtraSubject) { $ExtraSubject = '- Purge' } }
}
WLog "AutoAnalyze=$doAutoAnalyze | Priority=$MailPriority"

# ============================================================================
# APPEL DU MOTEUR
# ============================================================================
$ep = @{ ConfigFile = $ConfigFile; NomJob = $NomJob; Status = $Status }

if ($Horodatage)           { $ep.Horodatage     = $Horodatage }
if ($KeyValues)            { $ep.KeyValues       = $KeyValues }
if ($Etapes)               { $ep.Etapes          = $Etapes }
if ($Message)              { $ep.MessageLibre    = $Message }
if ($SectionFile)          { $ep.SectionFile     = $SectionFile }
if ($sectionsInlineParam)  { $ep.SectionsInline  = $sectionsInlineParam }
if ($filesParam)           { $ep.Files           = $filesParam }
if ($doAutoAnalyze)        { $ep.AutoAnalyze     = $true }
if ($MaxCsvRows -ne 50)    { $ep.MaxCsvRows      = $MaxCsvRows }
if ($MaxCsvCols -ne 10)    { $ep.MaxCsvCols      = $MaxCsvCols }
if ($logDirParam)          { $ep.LogDir           = $logDirParam }
if ($LogPattern -ne '*.log') { $ep.LogPattern     = $LogPattern }
if ($LogTailLines -ne 30)  { $ep.LogTailLines     = $LogTailLines }
if ($LogAttach)            { $ep.LogAttach        = $true }
if ($pjList.Count -gt 0)   { $ep.Attachments     = $pjList.ToArray() }
if ($DryRun)               { $ep.DryRun           = $true }
if ($ExportHtml)           { $ep.ExportHtml       = $ExportHtml }
if ($MailPriority)         { $ep.MailPriority     = $MailPriority }
if ($OverrideTo)           { $ep.OverrideTo       = $OverrideTo }
if ($OverrideCc)           { $ep.OverrideCc       = $OverrideCc }
if ($ExtraSubject)         { $ep.ExtraSubject     = $ExtraSubject }
if ($NoFooter)             { $ep.NoFooter         = $true }
if ($Verbose2)             { $ep.Verbose2         = $true }

WLog "Appel moteur avec $($ep.Count) parametres..."
try {
    & $EnginePath @ep
    $rc = $LASTEXITCODE
} catch {
    Write-Error "Erreur fatale : $($_.Exception.Message)"
    exit 1
}
exit $rc
