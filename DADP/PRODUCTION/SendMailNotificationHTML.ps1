# ============================================================================
# SendMailNotificationHTML.ps1 - MODULE UNIVERSEL v3.1
#   v3.1 : coloration des cellules d'evolution en pourcentage (negatif=rouge,
#          positif=vert) dans Rnd-Table. Retro-compatible (cf. ligne ~329).
# ============================================================================
# Moteur generique d'envoi de mails HTML avec analyse automatique de fichiers,
# recuperation de logs, statistiques dynamiques, et sections intelligentes.
#
# Fonctionnalites v3.0 :
#   - Multi-fichiers avec analyse automatique (CSV, LOG, TXT)
#   - Recuperation et analyse de logs avec patterns
#   - Statistiques dynamiques par fichier (comptages, ecarts, erreurs)
#   - Sections inline JSON ou fichier externe
#   - Mode DryRun (generation HTML sans envoi)
#   - Export HTML pour archivage/debug
#   - Compteurs automatiques depuis l'analyse des fichiers
#   - Gestion des priorites mail
#   - Rapport d'execution detaille avec metriques
#   - Configuration avancee par JSON avec heritage de valeurs
# ============================================================================

[CmdletBinding()]
param(
    # --- OBLIGATOIRES ---
    [Parameter(Mandatory=$true)]  [string]   $ConfigFile,
    [Parameter(Mandatory=$true)]  [string]   $NomJob,
    [Parameter(Mandatory=$true)]  [string]   $Status,

    # --- HORODATAGE ---
    [string]   $Horodatage     = '',

    # --- CONTENU SECTIONS ---
    [string]   $KeyValues      = '',            # "Cle1=Val1;Cle2=Val2"
    [string]   $Etapes         = '',            # "etape1^etape2^etape3"
    [string]   $MessageLibre   = '',
    [string]   $TableCsv       = '',            # Chemin CSV unique (retro-compatible v2)
    [string]   $TableTitle     = '',
    [string]   $SectionFile    = '',            # Fichier JSON de sections
    [string]   $SectionsInline = '',            # JSON inline de sections

    # --- v3.0 : MULTI-FICHIERS ---
    # Format : "chemin|titre|description;chemin2|titre2|desc2"
    # Ou simplement : "chemin1;chemin2" (titres auto-generes)
    [string]   $Files          = '',

    # --- v3.0 : ANALYSE AUTOMATIQUE ---
    [switch]   $AutoAnalyze,                    # Analyser les fichiers et generer des stats
    [int]      $MaxCsvRows     = 50,            # Limite lignes CSV affichees
    [int]      $MaxCsvCols     = 10,            # Limite colonnes CSV affichees

    # --- v3.0 : RECUPERATION LOGS ---
    [string]   $LogDir         = '',            # Repertoire des logs
    [string]   $LogPattern     = '*.log',       # Pattern de recherche
    [int]      $LogTailLines   = 30,            # Dernières N lignes
    [string]   $LogErrorPattern = '(?i)(error|erreur|exception|fatal|critical|echec|failed)', # Regex erreurs
    [switch]   $LogAttach,                      # Joindre les logs en PJ

    # --- v3.0 : OPTIONS AVANCEES ---
    [string[]] $Attachments    = @(),
    [switch]   $DryRun,                         # Generer HTML sans envoyer
    [string]   $ExportHtml     = '',            # Sauver HTML genere dans un fichier
    [string]   $MailPriority   = 'Normal',      # Low, Normal, High
    [string]   $OverrideTo     = '',            # Forcer destinataires (debug)
    [string]   $OverrideCc     = '',
    [string]   $ExtraSubject   = '',            # Texte supplementaire dans le sujet
    [switch]   $NoFooter,                       # Supprimer le footer
    [switch]   $Verbose2                        # Log detaille dans la console
)

# ============================================================================
# INITIALISATION
# ============================================================================
$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$script:Chrono = [System.Diagnostics.Stopwatch]::StartNew()
$script:Logs   = [System.Collections.Generic.List[string]]::new()

function Log([string]$msg, [string]$level='INFO') {
    $ts = Get-Date -Format 'HH:mm:ss.fff'
    $line = "[$ts] [$level] $msg"
    $script:Logs.Add($line)
    switch ($level) {
        'ERROR'   { Write-Error $msg }
        'WARNING' { Write-Warning $msg }
        default   { if ($Verbose2) { Write-Host $line -ForegroundColor DarkGray } }
    }
}

function HtmlEnc([string]$s) {
    if ($null -eq $s) { return '' }
    return [System.Net.WebUtility]::HtmlEncode($s)
}

function Norm-Rcpt([object]$v) {
    if ($null -eq $v) { return @() }
    if ($v -is [System.Array]) {
        return @($v | ForEach-Object { if($_){$_.ToString().Trim()} } | Where-Object { $_ -ne '' })
    }
    return @($v.ToString() -split '[,;]' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
}

function Format-Size([long]$bytes) {
    if ($bytes -ge 1GB) { return '{0:N2} Go' -f ($bytes / 1GB) }
    if ($bytes -ge 1MB) { return '{0:N2} Mo' -f ($bytes / 1MB) }
    if ($bytes -ge 1KB) { return '{0:N2} Ko' -f ($bytes / 1KB) }
    return "$bytes octets"
}

function Safe-Read([string]$path, [int]$maxLines=0) {
    try {
        if ($maxLines -gt 0) {
            return Get-Content -LiteralPath $path -Encoding UTF8 -TotalCount $maxLines -ErrorAction Stop
        }
        return Get-Content -LiteralPath $path -Encoding UTF8 -ErrorAction Stop
    } catch {
        try {
            if ($maxLines -gt 0) {
                return Get-Content -LiteralPath $path -Encoding Default -TotalCount $maxLines -ErrorAction Stop
            }
            return Get-Content -LiteralPath $path -Encoding Default -ErrorAction Stop
        } catch {
            Log "Impossible de lire : $path" 'WARNING'
            return @()
        }
    }
}

Log "=== SendMailNotificationHTML v3.0 ==="
Log "Job: $NomJob | Status: $Status | Config: $ConfigFile"

# ============================================================================
# CHARGEMENT CONFIG JSON
# ============================================================================
if (-not (Test-Path -LiteralPath $ConfigFile)) {
    Log "Fichier config introuvable : $ConfigFile" 'ERROR'
    exit 1
}

$raw = Get-Content -LiteralPath $ConfigFile -Raw -Encoding UTF8

# Remplacement variables d'environnement ${VAR}
$raw = [regex]::Replace($raw, '\$\{([^}]+)\}', {
    param($m)
    $vn = $m.Groups[1].Value
    $ev = [Environment]::GetEnvironmentVariable($vn)
    if ($ev) { return $ev } else { return $m.Value }
})

# Correction backslashes Windows dans les chemins JSON
$raw = [regex]::Replace($raw, '(?m)("(?:TemplatePath|LogDir|BasePath)"\s*:\s*")([^"]*)(")' , {
    param($m); $p=$m.Groups[2].Value
    if ($p -match '\\' -and $p -notmatch '\\\\') { $p = $p.Replace('\','\\') }
    return "$($m.Groups[1].Value)$p$($m.Groups[3].Value)"
})

try { $cfg = $raw | ConvertFrom-Json -ErrorAction Stop }
catch {
    Log "Erreur parse JSON config : $($_.Exception.Message)" 'ERROR'
    exit 1
}

# Validation champs obligatoires
foreach ($f in @('SmtpServer','From','To','TemplatePath')) {
    if (-not $cfg.$f) {
        Log "Champ manquant dans config : $f" 'ERROR'
        exit 1
    }
}

$SmtpSrv  = $cfg.SmtpServer
$Port     = if ($cfg.Port) { [int]$cfg.Port } else { 25 }
$From     = $cfg.From
$To       = if ($OverrideTo) { Norm-Rcpt $OverrideTo } else { Norm-Rcpt $cfg.To }
$Cc       = if ($OverrideCc) { Norm-Rcpt $OverrideCc } else { Norm-Rcpt $cfg.Cc }
$TplPath  = $cfg.TemplatePath
$Env_Name = if ($cfg.Environnement) { $cfg.Environnement } else { 'N/A' }
$SubjTpl  = if ($cfg.Subject) { $cfg.Subject } else { '[{{STATUS_LABEL}}] [{{ENVIRONNEMENT}}] {{JOB_NAME}} - {{DATE}}' }
$stMsgs   = $cfg.StatusMessages

# Heriter LogDir/LogPattern depuis config si non passes en parametre
if (-not $LogDir -and $cfg.LogDir)         { $LogDir = $cfg.LogDir }
if ($cfg.LogPattern -and $LogPattern -eq '*.log') { $LogPattern = $cfg.LogPattern }
if ($cfg.LogTailLines)    { $LogTailLines   = [int]$cfg.LogTailLines }
if ($cfg.LogErrorPattern) { $LogErrorPattern = $cfg.LogErrorPattern }

Log "Config chargee : SMTP=$SmtpSrv, Env=$Env_Name, To=$($To -join ',')"

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
    $dateFmt  = "{0}/{1}/{2}" -f $Horodatage.Substring(6,2),$Horodatage.Substring(4,2),$Horodatage.Substring(0,4)
    $heureFmt = "{0}:{1}:{2}" -f $Horodatage.Substring(9,2),$Horodatage.Substring(11,2),$Horodatage.Substring(13,2)
} else {
    $n = Get-Date
    $dateFmt  = $n.ToString('dd/MM/yyyy')
    $heureFmt = $n.ToString('HH:mm:ss')
    if (-not $Horodatage) { $Horodatage = $n.ToString('yyyyMMdd_HHmmss') }
}

# ============================================================================
# STATUS : LABEL + COULEUR + MESSAGE
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
        'OK'='Le traitement s''est termine avec succes.'
        'SUCCES'='Le traitement s''est termine avec succes.'
        'ERREUR'='Une ou plusieurs erreurs sont survenues.'
        'ECHEC'='Une ou plusieurs erreurs sont survenues.'
        'WARNING'='Le traitement s''est termine avec des avertissements.'
        'INFO'='Information transmise par le traitement.'
        'AUCUN_FICHIER'='Aucun fichier a traiter.'
        'PARTIEL'='Le traitement s''est termine partiellement.'
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

# ============================================================================
# RENDERERS DE SECTIONS (ameliores v3.0)
# ============================================================================

function Rnd-SectionTitle([string]$title, [string]$icon='') {
    if (-not $title) { return '' }
    $iconHtml = if ($icon) { "<span style=`"font-size:12px;margin-right:6px;`">$icon</span>" } else { '' }
    $h  = '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">'
    $h += "<tr><td style=`"font-family:Calibri,sans-serif;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.6px;color:#2B2B2B;padding-bottom:6px;`">${iconHtml}$(HtmlEnc $title)</td></tr>"
    $h += '<tr><td height="2" bgcolor="#00A8A8" style="font-size:0;line-height:2px;">&nbsp;</td></tr>'
    $h += '</table>'
    return $h
}

function Rnd-Separator() {
    return '<tr><td height="1" bgcolor="#E0E8E8" style="font-size:0;">&nbsp;</td></tr>'
}

function Rnd-Kv([array]$items, [string]$title='') {
    $h = '<tr><td style="padding:10px 22px;">'
    if ($title) { $h += Rnd-SectionTitle $title '&#9881;' }
    $h += '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    $alt = $false
    foreach ($p in $items) {
        $bg = if($alt){'#FFFFFF'}else{'#F5F8F8'}
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

function Rnd-Etapes([array]$lines, [string]$title='Rapport d''ex&eacute;cution') {
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

function Rnd-Table([string]$title, [array]$headers, [array]$rows, [string]$icon='&#9783;') {
    $h = '<tr><td style="padding:14px 22px;">'
    if ($title) { $h += Rnd-SectionTitle $title $icon }
    $h += '<table width="100%" cellpadding="0" cellspacing="1" border="0" bgcolor="#C8CACA">'
    if ($headers -and $headers.Count -gt 0) {
        $h += '<tr>'
        foreach ($hd in $headers) {
            $h += "<td bgcolor=`"#2B2B2B`" style=`"background-color:#2B2B2B;padding:8px 10px;font-family:Calibri,sans-serif;font-size:11px;font-weight:bold;color:#FFFFFF;text-transform:uppercase;letter-spacing:0.3px;`">$(HtmlEnc $hd)</td>"
        }
        $h += '</tr>'
    }
    $alt = $false
    foreach ($r in $rows) {
        $bg = if($alt){'#F7FAFA'}else{'#FFFFFF'}
        $h += '<tr>'
        foreach ($c in $r) {
            $cs = if($null -ne $c){$c.ToString()}else{''}
            # Coloration conditionnelle des cellules
            $cellColor = '#2B2B2B'
            if     ($cs -match '^-[\d.,]+\s*%$')                                                         { $cellColor = '#C0392B' }
            elseif ($cs -match '^\+?[\d.,]+\s*%$' -and $cs -notmatch '^\+?0([.,]0+)?\s*%$')             { $cellColor = '#1E8449' }
            $h += "<td bgcolor=`"$bg`" style=`"background-color:$bg;padding:6px 10px;font-family:Calibri,sans-serif;font-size:12px;color:${cellColor};`">$(HtmlEnc $cs)</td>"
        }
        $h += '</tr>'
        $alt = -not $alt
    }
    $h += '</table></td></tr>'
    return $h
}

function Rnd-Texte([string]$title, [string]$content, [string]$icon='') {
    $h = '<tr><td style="padding:12px 22px;">'
    if ($title) { $h += Rnd-SectionTitle $title $icon }
    # Gerer les retours a la ligne
    $htmlContent = (HtmlEnc $content) -replace "`r?`n", '<br/>'
    $h += "<div style=`"font-family:Calibri,sans-serif;font-size:13px;color:#2B2B2B;line-height:1.6;`">$htmlContent</div>"
    $h += '</td></tr>'
    return $h
}

function Rnd-CodeBlock([string]$title, [string[]]$lines, [string]$icon='&#128196;') {
    $h = '<tr><td style="padding:12px 22px;">'
    if ($title) { $h += Rnd-SectionTitle $title $icon }
    $h += '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
    $h += '<tr><td bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:14px 18px;border-left:3px solid #00A8A8;">'
    $lineNum = 0
    foreach ($l in $lines) {
        $lineNum++
        $color = '#D4D4D4'
        if ($l -match $LogErrorPattern) { $color = '#F44747' }
        elseif ($l -match '(?i)(warn|attention|avert)') { $color = '#CCA700' }
        elseif ($l -match '(?i)(success|succes|ok|done|termine)') { $color = '#6A9955' }
        $numColor = '#555555'
        $h += "<div style=`"font-family:'Courier New',Consolas,monospace;font-size:10px;line-height:1.5;white-space:pre-wrap;word-break:break-all;`">"
        $h += "<span style=`"color:${numColor};margin-right:10px;user-select:none;`">$($lineNum.ToString().PadLeft(3,' '))</span>"
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
# MOTEUR D'ANALYSE DE FICHIERS v3.0
# ============================================================================

function Analyze-CsvFile([string]$path, [string]$title, [int]$maxRows, [int]$maxCols) {
    $result = @{ Sections = ''; Stats = [ordered]@{} }
    Log "Analyse CSV : $path"

    try {
        # Essayer differents delimiteurs
        $delimiters = @(';', ',', "`t", '|')
        $csv = $null
        $bestDelim = ';'
        $bestCount = 0

        foreach ($d in $delimiters) {
            try {
                $test = Import-Csv -Path $path -Delimiter $d -Encoding Default -ErrorAction Stop
                if ($test.Count -gt 0) {
                    $colCount = @($test[0].PSObject.Properties.Name).Count
                    if ($colCount -gt $bestCount) {
                        $bestCount = $colCount
                        $bestDelim = $d
                        $csv = $test
                    }
                }
            } catch {}
        }

        if (-not $csv -or $csv.Count -eq 0) {
            Log "CSV vide ou illisible : $path" 'WARNING'
            return $result
        }

        $allHeaders = @($csv[0].PSObject.Properties.Name)
        $headers = @($allHeaders | Select-Object -First $maxCols)
        $truncCols = $allHeaders.Count -gt $maxCols

        # Statistiques automatiques
        $totalRows = $csv.Count
        $result.Stats['Lignes'] = $totalRows
        $result.Stats['Colonnes'] = $allHeaders.Count

        # Detection colonnes numeriques pour stats
        foreach ($col in $headers) {
            $numVals = @($csv | ForEach-Object { $_.$col } | Where-Object {
                $_ -match '^\s*-?\d+([.,]\d+)?\s*$'
            })
            if ($numVals.Count -eq $totalRows -and $totalRows -gt 0) {
                $nums = $numVals | ForEach-Object { [double]($_ -replace ',','.') }
                $sum = ($nums | Measure-Object -Sum).Sum
                $result.Stats["Somme $col"] = $sum
            }
        }

        # Detection colonnes "ecart"/"diff" pour comptage non-zero
        foreach ($col in $headers) {
            if ($col -match '(?i)(ecart|diff|delta|erreur|error)') {
                $nonZero = @($csv | ForEach-Object { $_.$col } | Where-Object {
                    $_ -and $_ -ne '0' -and $_ -ne '0.0' -and $_ -ne ''
                }).Count
                if ($nonZero -gt 0) {
                    $result.Stats["$col <> 0"] = $nonZero
                }
            }
        }

        # Rendu tableau (limite a maxRows)
        $displayRows = @($csv | Select-Object -First $maxRows)
        $rws = @()
        foreach ($r in $displayRows) {
            $row = @()
            foreach ($col in $headers) { $row += $r.$col }
            $rws += ,$row
        }

        $displayTitle = if ($title) { $title } else { [System.IO.Path]::GetFileName($path) }
        if ($totalRows -gt $maxRows) {
            $displayTitle += " (${maxRows}/${totalRows} lignes)"
        }
        if ($truncCols) {
            $displayTitle += " [${maxCols}/$($allHeaders.Count) colonnes]"
        }

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
        $allLines = Safe-Read $path
        $totalLines = $allLines.Count
        $result.Stats['Total lignes'] = $totalLines

        # Comptage erreurs
        $errorLines = @($allLines | Where-Object { $_ -match $errPattern })
        $result.Stats['Erreurs'] = $errorLines.Count
        $result.Errors = $errorLines

        # Comptage warnings
        $warnLines = @($allLines | Where-Object { $_ -match '(?i)(warn|avert|attention)' })
        $result.Stats['Avertissements'] = $warnLines.Count

        # Dernières lignes
        $tail = @($allLines | Select-Object -Last $tailLines)
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
        $result.Stats['Taille'] = Format-Size $fi.Length
        $result.Stats['Modifie'] = $fi.LastWriteTime.ToString('dd/MM/yyyy HH:mm')
        $ext = $fi.Extension.ToLower()

        if ($ext -in @('.txt','.log','.csv','.tsv','.dat','.sql','.xml','.json')) {
            $lines = Safe-Read $path
            $result.Stats['Lignes'] = $lines.Count
        }
    } catch {
        Log "Erreur lecture metadonnees $path : $($_.Exception.Message)" 'WARNING'
    }
    return $result
}

# ============================================================================
# ASSEMBLAGE DES SECTIONS
# ============================================================================

$secHtml = ''
$allAttachments = [System.Collections.Generic.List[string]]::new()
foreach ($a in $Attachments) {
    if (-not [string]::IsNullOrWhiteSpace($a)) { $allAttachments.Add($a.Trim()) }
}
$globalStats = [ordered]@{}

# --- 1. KeyValues ---
if ($KeyValues) {
    $kvList = @()
    foreach ($pair in ($KeyValues -split ';')) {
        $pts = $pair -split '=',2
        if ($pts.Count -eq 2) { $kvList += ,@($pts[0].Trim(), $pts[1].Trim()) }
    }
    if ($kvList.Count -gt 0) {
        $secHtml += Rnd-Kv $kvList
        $secHtml += Rnd-Separator
    }
}

# --- 2. Multi-Fichiers v3.0 ---
if ($Files) {
    Log "Traitement multi-fichiers..."
    $fileEntries = @($Files -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })

    foreach ($entry in $fileEntries) {
        $parts = $entry -split '\|'
        $filePath = $parts[0].Trim()
        $fileTitle = if ($parts.Count -gt 1 -and $parts[1].Trim()) { $parts[1].Trim() } else { [System.IO.Path]::GetFileName($filePath) }
        $fileDesc = if ($parts.Count -gt 2) { $parts[2].Trim() } else { '' }

        if (-not (Test-Path -LiteralPath $filePath)) {
            Log "Fichier introuvable : $filePath" 'WARNING'
            $secHtml += Rnd-Texte '' "&#9888; Fichier introuvable : $filePath" '&#128196;'
            continue
        }

        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $fileMeta = (Analyze-GenericFile $filePath).Stats

        # Carte du fichier
        $secHtml += Rnd-FileCard $fileTitle $fileDesc $fileMeta

        # Analyse automatique selon le type
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

# --- 3. Recuperation Logs v3.0 ---
if ($LogDir -and (Test-Path -LiteralPath $LogDir)) {
    Log "Recuperation logs depuis : $LogDir (pattern: $LogPattern)"
    $logFiles = @(Get-ChildItem -Path $LogDir -Filter $LogPattern -File -ErrorAction SilentlyContinue |
                  Sort-Object LastWriteTime -Descending)

    if ($logFiles.Count -eq 0) {
        Log "Aucun log trouve dans $LogDir avec pattern $LogPattern" 'WARNING'
        $secHtml += Rnd-Texte 'Logs' "Aucun fichier log trouve dans $LogDir (pattern: $LogPattern)" '&#128270;'
    } else {
        $totalLogErrors = 0
        $totalLogWarnings = 0

        foreach ($lf in $logFiles) {
            $logResult = Analyze-LogFile $lf.FullName $LogTailLines $LogErrorPattern
            $secHtml += $logResult.Sections
            $totalLogErrors   += $logResult.Stats['Erreurs']
            $totalLogWarnings += $logResult.Stats['Avertissements']

            # Afficher les erreurs extraites en tableau si > 0
            if ($logResult.Errors.Count -gt 0) {
                $errRows = @()
                $displayErrors = @($logResult.Errors | Select-Object -First 20)
                foreach ($el in $displayErrors) {
                    $errRows += ,@($el)
                }
                $errTitle = "Erreurs detectees : $($lf.Name)"
                if ($logResult.Errors.Count -gt 20) { $errTitle += " (20/$($logResult.Errors.Count))" }
                $secHtml += Rnd-Table $errTitle @('Ligne') $errRows '&#128680;'
            }

            if ($LogAttach) {
                $allAttachments.Add($lf.FullName)
            }
        }

        $globalStats['Fichiers log'] = $logFiles.Count
        $globalStats['Erreurs (logs)'] = $totalLogErrors
        $globalStats['Warnings (logs)'] = $totalLogWarnings
        $secHtml += Rnd-Separator
    }
}

# --- 4. SectionFile JSON externe ---
if ($SectionFile -and (Test-Path -LiteralPath $SectionFile)) {
    Log "Chargement sections depuis fichier : $SectionFile"
    try {
        $jSec = Get-Content -LiteralPath $SectionFile -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($s in $jSec) {
            switch ($s.type) {
                'kv' {
                    $it = @()
                    foreach ($i in $s.items) { $it += ,@($i[0], $i[1]) }
                    $secHtml += Rnd-Kv $it $(if($s.title){$s.title}else{''})
                }
                'etapes' {
                    $ln = @()
                    foreach ($i in $s.items) {
                        $ln += '['+$i[0]+'] '+$i[1]+$(if($i.Count -gt 2 -and $i[2]){' - '+$i[2]}else{''})
                    }
                    $secHtml += Rnd-Etapes $ln $(if($s.title){$s.title}else{'Rapport d''ex&eacute;cution'})
                }
                'table' {
                    $rw = @()
                    foreach ($r in $s.rows) { $rw += ,@($r) }
                    $secHtml += Rnd-Table $s.title @($s.headers) $rw
                }
                'texte' {
                    $secHtml += Rnd-Texte $s.title $s.content $(if($s.icon){$s.icon}else{''})
                }
                'code' {
                    $cLines = if ($s.file -and (Test-Path $s.file)) {
                        @(Safe-Read $s.file $s.maxLines)
                    } else {
                        @($s.content -split "`n")
                    }
                    $secHtml += Rnd-CodeBlock $s.title $cLines
                }
                'stats' {
                    $st = [ordered]@{}
                    foreach ($i in $s.items) { $st[$i[0]] = $i[1] }
                    $secHtml += Rnd-StatsBar $s.title $st
                }
            }
        }
        $secHtml += Rnd-Separator
    } catch {
        Log "Erreur SectionFile : $($_.Exception.Message)" 'WARNING'
    }
}

# --- 5. SectionsInline JSON ---
if ($SectionsInline) {
    Log "Traitement sections inline JSON"
    try {
        $jInline = $SectionsInline | ConvertFrom-Json
        foreach ($s in $jInline) {
            switch ($s.type) {
                'kv'     { $it=@(); foreach($i in $s.items){$it+=,@($i[0],$i[1])}; $secHtml += Rnd-Kv $it $(if($s.title){$s.title}else{''}) }
                'table'  { $rw=@(); foreach($r in $s.rows){$rw+=,@($r)}; $secHtml += Rnd-Table $s.title @($s.headers) $rw }
                'texte'  { $secHtml += Rnd-Texte $s.title $s.content }
                'stats'  { $st=[ordered]@{}; foreach($i in $s.items){$st[$i[0]]=$i[1]}; $secHtml += Rnd-StatsBar $s.title $st }
                'code'   { $secHtml += Rnd-CodeBlock $s.title @($s.content -split "`n") }
                'etapes' {
                    $ln=@()
                    foreach($i in $s.items){$ln+='['+$i[0]+'] '+$i[1]+$(if($i.Count -gt 2 -and $i[2]){' - '+$i[2]}else{''})}
                    $secHtml += Rnd-Etapes $ln $(if($s.title){$s.title}else{'Rapport d''ex&eacute;cution'})
                }
            }
        }
        $secHtml += Rnd-Separator
    } catch {
        Log "Erreur SectionsInline : $($_.Exception.Message)" 'WARNING'
    }
}

# --- 6. TableCsv (retro-compatible v2) ---
if ($TableCsv -and (Test-Path -LiteralPath $TableCsv)) {
    $csvResult = Analyze-CsvFile $TableCsv $TableTitle $MaxCsvRows $MaxCsvCols
    $secHtml += $csvResult.Sections
    $secHtml += Rnd-Separator
}

# --- 7. Etapes inline ---
if ($Etapes) {
    $el = @($Etapes -split '[\^|]' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' })
    if ($el.Count -gt 0) {
        $secHtml += Rnd-Etapes $el
        $secHtml += Rnd-Separator
    }
}

# --- 8. MessageLibre ---
if ($MessageLibre) {
    $secHtml += Rnd-Texte '' $MessageLibre '&#128172;'
}

# --- 9. Stats globales (si des analyses ont produit des stats) ---
if ($globalStats.Count -gt 0) {
    $secHtml += Rnd-StatsBar 'Metriques' $globalStats
    $secHtml += Rnd-Separator
}

# --- 10. Metriques d'execution du script ---
$script:Chrono.Stop()
$execTime = $script:Chrono.Elapsed
$execKv = @(
    ,@('Duree execution', '{0:00}:{1:00}:{2:00}.{3:000}' -f $execTime.Hours, $execTime.Minutes, $execTime.Seconds, $execTime.Milliseconds)
    ,@('Machine', $env:COMPUTERNAME)
    ,@('Utilisateur', "$env:USERDOMAIN\$env:USERNAME")
    ,@('Script', 'SendMailNotificationHTML v3.0')
)
if ($allAttachments.Count -gt 0) {
    $execKv += ,@('Pieces jointes', $allAttachments.Count.ToString())
}
$secHtml += Rnd-Kv $execKv 'Informations d''execution'

# ============================================================================
# REMPLACEMENT PLACEHOLDERS + GENERATION HTML
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
    '{{SECTIONS}}'       = $secHtml
}

$subj = $SubjTpl
if ($ExtraSubject) { $subj = $subj + ' ' + $ExtraSubject }
$body = $tplHtml
foreach ($k in $vars.Keys) {
    $subj = $subj.Replace($k, $vars[$k])
    $body = $body.Replace($k, $vars[$k])
}

# Supprimer le footer si demande
if ($NoFooter) {
    $body = $body -replace '(?s)<!--FOOTER_START-->.*?<!--FOOTER_END-->', ''
}

# ============================================================================
# EXPORT HTML (debug/archivage)
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
# ENVOI MAIL
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

    # Verifier pieces jointes
    $validPJ = @()
    foreach ($a in $allAttachments) {
        if (Test-Path -LiteralPath $a) {
            $validPJ += $a
        } else {
            Log "PJ introuvable : $a" 'WARNING'
        }
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
