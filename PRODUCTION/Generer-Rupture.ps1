# ============================================================================
# Generer-Rupture.ps1  —  Outil generique de RUPTURE pour SendMailNotificationHTML v3
# ----------------------------------------------------------------------------
# A partir d'UN fichier CSV, genere un fichier SECTIONS JSON contenant
# UN TABLEAU par valeur d'une colonne de rupture (group-by), consommable par
# le moteur via le parametre SECTIONFILE.
#
# CAS LE PLUS SIMPLE (suffit dans la majorite des cas) :
#   .\Generer-Rupture.ps1 -Source C:\data\controle.csv -ColonneRupture Expediteur
#       -> ecrit controle.sections.json a cote de la source
#       -> 1 tableau par expediteur, toutes les autres colonnes affichees
#
# ENVOI EN UN SEUL APPEL (optionnel) : ajoutez les 3 parametres Notify et le
# script appelle Notify.bat tout seul :
#   .\Generer-Rupture.ps1 -Source C:\data\controle.csv -ColonneRupture Expediteur `
#       -ConfigFile C:\config\projet.json -NomJob CONTROLE -Status WARNING
#
# OPTIONS COURANTES :
#   -Colonnes        Liste ordonnee des colonnes a afficher (defaut : toutes sauf la rupture)
#   -ExclureColonnes Colonnes a masquer (ex: un flag constant) sans tout lister
#   -Entetes         Libelles affiches (defaut : noms des colonnes source)
#   -TitrePrefixe    Prefixe du titre de chaque tableau (defaut : nom de la colonne de rupture)
#   -Delimiteur      Separateur du CSV (defaut : ;)
#   -Tri             'Nom' (alphabetique, defaut) ou 'Source' (ordre du fichier)
#   -Sortie          Chemin du JSON genere (defaut : <source>.sections.json)
# ============================================================================
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)] [string]   $Source,
    [Parameter(Mandatory=$true)] [string]   $ColonneRupture,

    [string]   $Sortie          = '',
    [string[]] $Colonnes        = @(),          # projection (vide = auto)
    [string[]] $ExclureColonnes = @(),
    [string[]] $Entetes         = @(),          # libelles (vide = noms source)
    [string]   $TitrePrefixe    = '',           # vide = nom de la colonne de rupture
    [string]   $Delimiteur      = ';',
    [ValidateSet('Nom','Source')] [string] $Tri = 'Nom',

    # --- Envoi integre (optionnel) : si les 3 sont fournis, on appelle Notify ---
    [string]   $ConfigFile      = '',
    [string]   $NomJob          = '',
    [ValidateSet('OK','SUCCES','ERREUR','ECHEC','WARNING','INFO','AUCUN_FICHIER','PARTIEL','')]
    [string]   $Status          = '',
    [string]   $NotifyBat       = '',           # auto-localise si vide
    [string]   $NotifyExtra     = ''            # ex: 'KV="Env=PROD";DRYRUN'
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

# --- 1. Lecture ---------------------------------------------------------------
if (-not (Test-Path -LiteralPath $Source)) { throw "Source introuvable : $Source" }
$data = @(Import-Csv -LiteralPath $Source -Delimiter $Delimiteur)
if ($data.Count -eq 0) { throw "Aucune donnee dans : $Source" }

$colsSource = @($data[0].PSObject.Properties.Name)
if ($colsSource -notcontains $ColonneRupture) {
    throw "Colonne de rupture '$ColonneRupture' absente. Colonnes : $($colsSource -join ', ')"
}

# --- 2. Projection (quelles colonnes afficher, dans quel ordre) ---------------
if ($Colonnes.Count -gt 0) {
    $projection = $Colonnes
    $manquantes = $projection | Where-Object { $colsSource -notcontains $_ }
    if ($manquantes) { throw "Colonnes inconnues : $($manquantes -join ', ')" }
} else {
    # auto : toutes sauf la rupture et les exclusions
    $projection = $colsSource | Where-Object {
        $_ -ne $ColonneRupture -and $ExclureColonnes -notcontains $_
    }
}
if (@($projection).Count -eq 0) { throw "Aucune colonne a afficher apres projection." }

# --- 3. En-tetes --------------------------------------------------------------
if ($Entetes.Count -gt 0) {
    if ($Entetes.Count -ne @($projection).Count) {
        throw "Entetes ($($Entetes.Count)) != colonnes affichees ($(@($projection).Count))."
    }
    $entetesFinaux = $Entetes
} else {
    $entetesFinaux = @($projection)            # libelles = noms source
}

if (-not $TitrePrefixe) { $TitrePrefixe = $ColonneRupture }

# --- 4. Rupture (group-by) ----------------------------------------------------
$groupes = $data | Group-Object -Property $ColonneRupture
if ($Tri -eq 'Nom') { $groupes = $groupes | Sort-Object Name }

$sections = foreach ($g in $groupes) {
    $rows = foreach ($enr in $g.Group) {
        ,@( $projection | ForEach-Object { [string]$enr.$_ } )
    }
    [ordered]@{
        type    = 'table'
        title   = "$TitrePrefixe $($g.Name)".Trim()
        headers = $entetesFinaux
        rows    = @($rows)
    }
}

# --- 5. Ecriture JSON (UTF-8 sans BOM) ----------------------------------------
if (-not $Sortie) {
    $dir  = Split-Path -Path $Source -Parent
    $base = [System.IO.Path]::GetFileNameWithoutExtension($Source)
    $Sortie = Join-Path $dir "$base.sections.json"
}
$json = ,@($sections) | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($Sortie, $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "OK : $(@($sections).Count) tableau(x) [rupture '$ColonneRupture'] -> $Sortie"

# --- 6. Envoi integre (optionnel) ---------------------------------------------
if ($ConfigFile -and $NomJob -and $Status) {
    if (-not $NotifyBat) {
        $cand = @(
            (Join-Path $PSScriptRoot 'Notify.bat')
            (Join-Path $env:PROCLIB  'Notify.bat')
            'C:\proclib\Notify.bat'
        )
        $NotifyBat = $cand | Where-Object { $_ -and (Test-Path -LiteralPath $_ -ErrorAction SilentlyContinue) } | Select-Object -First 1
    }
    if (-not $NotifyBat) { throw "Notify.bat introuvable : precisez -NotifyBat." }

    $args = @("CONFIG=$ConfigFile", "JOB=$NomJob", "STATUS=$Status", "SECTIONFILE=$Sortie")
    if ($NotifyExtra) { $args += ($NotifyExtra -split ';' | Where-Object { $_ }) }
    Write-Host "Appel : $NotifyBat $($args -join ' ')"
    & cmd.exe /c $NotifyBat @args
    exit $LASTEXITCODE
}
