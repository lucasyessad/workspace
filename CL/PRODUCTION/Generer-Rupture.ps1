# ============================================================================
# Generer-Rupture.ps1  —  Outil generique de RUPTURE pour SendMailNotificationHTML v3
# ----------------------------------------------------------------------------
# A partir d'UN fichier CSV, genere un fichier SECTIONS JSON contenant
# UN TABLEAU par valeur d'une colonne de rupture (group-by), consommable par
# le moteur via le parametre SECTIONFILE.
#
# CAS LE PLUS SIMPLE :
#   .\Generer-Rupture.ps1 -Source C:\data\controle.csv -ColonneRupture Expediteur
#
# AVEC REFERENCE (detection retard/manquants) :
#   .\Generer-Rupture.ps1 -Source data.csv -ColonneRupture Expediteur `
#       -ReferenceFile C:\config\expediteurs-ref.json
#       -> Ajoute une banniere d'alerte si des expediteurs sont absents ou en retard
#       -> Marque chaque section [RECU] / [NON RECU] / [RETARD]
#
# FORMAT DU FICHIER DE REFERENCE (-ReferenceFile) :
#   [
#     { "Expediteur": "EXP_BNP",  "Frequence": "Mensuelle",    "JoursRetard": 4 },
#     { "Expediteur": "EXP_CA",   "Frequence": "Trimestrielle","JoursRetard": 10 }
#   ]
#
# ENVOI EN UN SEUL APPEL (optionnel) :
#   .\Generer-Rupture.ps1 -Source data.csv -ColonneRupture Expediteur `
#       -ConfigFile C:\config\projet.json -NomJob CONTROLE -Status OK
# ============================================================================
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)] [string]   $Source,
    [Parameter(Mandatory=$true)] [string]   $ColonneRupture,

    [string]   $Sortie          = '',
    [string[]] $Colonnes        = @(),
    [string[]] $ExclureColonnes = @(),
    [string[]] $Entetes         = @(),
    [string]   $TitrePrefixe    = '',
    [string]   $Delimiteur      = ';',
    [ValidateSet('Nom','Source')] [string] $Tri = 'Nom',

    # --- Detection retard / manquants ---
    # Fichier JSON listant les expediteurs attendus avec frequence et delai de retard
    [string]   $ReferenceFile   = '',
    # Colonne du CSV contenant la date du dernier arrete (pour detection retard)
    [string]   $ColonneDate     = '',

    # --- Envoi integre (optionnel) ---
    [string]   $ConfigFile      = '',
    [string]   $NomJob          = '',
    [ValidateSet('OK','SUCCES','ERREUR','ECHEC','WARNING','INFO','AUCUN_FICHIER','PARTIEL','')]
    [string]   $Status          = '',
    [string]   $NotifyBat       = '',
    [string]   $NotifyExtra     = ''
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

# --- 1. Lecture CSV -----------------------------------------------------------
if (-not (Test-Path -LiteralPath $Source)) { throw "Source introuvable : $Source" }
$data = @(Import-Csv -LiteralPath $Source -Delimiter $Delimiteur)
if ($data.Count -eq 0) { throw "Aucune donnee dans : $Source" }

$colsSource = @($data[0].PSObject.Properties.Name)
if ($colsSource -notcontains $ColonneRupture) {
    throw "Colonne de rupture '$ColonneRupture' absente. Colonnes : $($colsSource -join ', ')"
}

# --- 2. Projection ------------------------------------------------------------
if ($Colonnes.Count -gt 0) {
    $projection = $Colonnes
    $manquantes = $projection | Where-Object { $colsSource -notcontains $_ }
    if ($manquantes) { throw "Colonnes inconnues : $($manquantes -join ', ')" }
} else {
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
    $entetesFinaux = @($projection)
}

if (-not $TitrePrefixe) { $TitrePrefixe = $ColonneRupture }

# --- 4. Chargement fichier de reference (detection retard/manquants) ----------
$referenceMap   = @{}    # expediteur -> { Frequence, JoursRetard }
$alertesSections = @()   # sections d'alerte a inserer en tete

if ($ReferenceFile -and (Test-Path -LiteralPath $ReferenceFile)) {
    try {
        $refData = Get-Content -LiteralPath $ReferenceFile -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($ref in $refData) {
            $referenceMap[$ref.Expediteur] = $ref
        }
        Write-Host "Reference chargee : $($referenceMap.Count) expediteur(s) attendu(s)"
    } catch {
        Write-Warning "Impossible de lire le fichier de reference : $_"
    }
}

# --- 5. Rupture (group-by) + statut par expediteur ----------------------------
$groupes = $data | Group-Object -Property $ColonneRupture
if ($Tri -eq 'Nom') { $groupes = $groupes | Sort-Object Name }

# Expediteurs presents dans le CSV
$expediteursPresents = @($groupes | ForEach-Object { $_.Name })

# Detection des expediteurs manquants et en retard
$expediteursManquants = @()
$expediteursRetard    = @()

if ($referenceMap.Count -gt 0) {
    $today = Get-Date

    foreach ($exp in $referenceMap.Keys | Sort-Object) {
        $ref = $referenceMap[$exp]

        if ($expediteursPresents -notcontains $exp) {
            # Completement absent du CSV
            $expediteursManquants += $exp
        } elseif ($ColonneDate) {
            # Present mais verifier si en retard selon la frequence
            $lignes = @($data | Where-Object { $_.$ColonneRupture -eq $exp } | Sort-Object { $_.$ColonneDate } -Descending)
            if ($lignes.Count -gt 0) {
                $dernierArrete = $null
                if ([DateTime]::TryParse($lignes[0].$ColonneDate, [ref]$dernierArrete)) {
                    $joursEcoules = ($today - $dernierArrete).Days
                    $seuilRetard  = switch ($ref.Frequence) {
                        'Mensuelle'    { 35 + [int]($ref.JoursRetard) }
                        'Trimestrielle'{ 100 + [int]($ref.JoursRetard) }
                        'Annuelle'     { 380 + [int]($ref.JoursRetard) }
                        default        { 35 + [int]($ref.JoursRetard) }
                    }
                    if ($joursEcoules -gt $seuilRetard) {
                        $expediteursRetard += $exp
                    }
                }
            }
        }
    }

    # Banniere d'alerte globale si des problemes detectes
    $nbProblemes = $expediteursManquants.Count + $expediteursRetard.Count
    if ($nbProblemes -gt 0) {
        $lignesAlerte = @()
        if ($expediteursManquants.Count -gt 0) {
            $lignesAlerte += "[ECHEC] $($expediteursManquants.Count) expediteur(s) n'ont pas transmis leurs donnees : $($expediteursManquants -join ', '). Relance necessaire."
        }
        if ($expediteursRetard.Count -gt 0) {
            $lignesAlerte += "[WARNING] $($expediteursRetard.Count) expediteur(s) presentent un retard par rapport a leur frequence d'envoi habituelle : $($expediteursRetard -join ', ')."
        }
        $alertesSections += [ordered]@{
            type    = 'etapes'
            title   = "Alertes — Controle des transmissions"
            items   = @($lignesAlerte | ForEach-Object {
                $parts = $_ -split ' ', 2
                @($parts[0] -replace '[\[\]]', '', $parts[1], '')
            })
        }
    }
}

# --- 6. Construction des sections ---------------------------------------------
$sectionsData = foreach ($g in $groupes) {
    $rows = foreach ($enr in $g.Group) {
        ,@( $projection | ForEach-Object { [string]$enr.$_ } )
    }

    # Titre avec statut si reference disponible
    $statut = ''
    if ($referenceMap.Count -gt 0) {
        if ($expediteursManquants -contains $g.Name) {
            $statut = ' [NON RECU]'
        } elseif ($expediteursRetard -contains $g.Name) {
            $statut = ' [RETARD]'
        } elseif ($referenceMap.ContainsKey($g.Name)) {
            $freq = $referenceMap[$g.Name].Frequence
            $statut = " [RECU — $freq]"
        }
    }

    [ordered]@{
        type    = 'table'
        title   = "$TitrePrefixe $($g.Name)$statut".Trim()
        headers = $entetesFinaux
        rows    = @($rows)
    }
}

# Sections pour expediteurs manquants (absent du CSV mais dans la reference)
$sectionManquants = foreach ($exp in ($expediteursManquants | Sort-Object)) {
    $ref   = $referenceMap[$exp]
    $freq  = if ($ref.Frequence) { $ref.Frequence } else { 'N/A' }
    $jours = if ($ref.JoursRetard) { $ref.JoursRetard } else { '4' }
    [ordered]@{
        type    = 'table'
        title   = "$TitrePrefixe $exp [NON RECU — Frequence : $freq]"
        headers = @('Statut', 'Detail')
        rows    = @(,@('NON RECU', "Aucune donnee recue pour cette periode. Relance necessaire a J+$jours."))
    }
}

# Assemblage final : alertes en tete, puis donnees reelles, puis manquants
$sections = @($alertesSections) + @($sectionsData) + @($sectionManquants)

# --- 7. Ecriture JSON (UTF-8 sans BOM) ----------------------------------------
if (-not $Sortie) {
    $dir  = Split-Path -Path $Source -Parent
    $base = [System.IO.Path]::GetFileNameWithoutExtension($Source)
    $Sortie = Join-Path $dir "$base.sections.json"
}
$json = ,@($sections) | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($Sortie, $json, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "OK : $(@($sectionsData).Count) tableau(x) [rupture '$ColonneRupture'], $($expediteursManquants.Count) manquant(s), $($expediteursRetard.Count) en retard -> $Sortie"

# --- 8. Envoi integre (optionnel) ---------------------------------------------
if ($ConfigFile -and $NomJob -and $Status) {
    # Escalade automatique en WARNING si des alertes sont detectees
    $statusEffectif = $Status
    if ($Status -eq 'OK' -and ($expediteursManquants.Count -gt 0 -or $expediteursRetard.Count -gt 0)) {
        $statusEffectif = 'WARNING'
        Write-Host "Statut escalade en WARNING ($($expediteursManquants.Count) manquant(s), $($expediteursRetard.Count) en retard)"
    }

    if (-not $NotifyBat) {
        $cand = @(
            (Join-Path $PSScriptRoot 'Notify.bat')
            (Join-Path $env:PROCLIB  'Notify.bat')
            'C:\proclib\Notify.bat'
        )
        $NotifyBat = $cand | Where-Object { $_ -and (Test-Path -LiteralPath $_ -ErrorAction SilentlyContinue) } | Select-Object -First 1
    }
    if (-not $NotifyBat) { throw "Notify.bat introuvable : precisez -NotifyBat." }

    $args = @("CONFIG=$ConfigFile", "JOB=$NomJob", "STATUS=$statusEffectif", "SECTIONFILE=$Sortie")
    if ($NotifyExtra) { $args += ($NotifyExtra -split ';' | Where-Object { $_ }) }
    Write-Host "Appel : $NotifyBat $($args -join ' ')"
    & cmd.exe /c $NotifyBat @args
    exit $LASTEXITCODE
}
