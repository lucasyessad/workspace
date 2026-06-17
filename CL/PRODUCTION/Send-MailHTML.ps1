#Requires -Version 5.1
<#
.SYNOPSIS
    Envoie un mail de notification HTML professionnel.

.DESCRIPTION
    Outil generique d'envoi de mail HTML. Charge un profil JSON (avec heritage),
    evalue la severite depuis le RC du job et/ou les donnees CSV, construit
    un email HTML compatible Outlook et l'envoie via SMTP.

    Aucun module externe requis. SMTP via System.Net.Mail.

.PARAMETER Config
    Chemin vers le fichier JSON de configuration.
    Supporte la cle "Inherits" pour l'heritage de profil.

.PARAMETER Subject
    Sujet du mail.

.PARAMETER RC
    Code retour du job execute. Mappe en severite via RcMapping dans le JSON.

.PARAMETER Severity
    Severite initiale (surclassee par RC et/ou AutoSeverity si presents).
    Valeurs : Info | Success | Warning | Error | Critical

.PARAMETER Body
    Texte libre. Surcharge Messages[Severity] du JSON si fourni.

.PARAMETER Steps
    Liste d'etapes affichees comme log d'execution ordonne.
    Exemple : -Steps "Chargement OK","Controle KO","Rollback OK"

.PARAMETER Summary
    Bloc cle/valeur affiche en en-tete.
    Exemple : -Summary @{ "Duree"="02:14"; "Lignes"="1 524" }

.PARAMETER Source
    Un ou plusieurs fichiers CSV source pour les tableaux.
    Supporte les variables {DATE}, {TIME}, {DATETIME}, {HOSTNAME}, {ENV}.

.PARAMETER Delimiter
    Separateur CSV. Defaut : valeur du JSON ou ';'.

.PARAMETER GroupBy
    Colonne de rupture : 1 section par valeur distincte. Surcharge JSON.

.PARAMETER Columns
    Colonnes a afficher. Defaut : toutes (ou valeur du JSON).

.PARAMETER Headers
    Noms d'affichage des colonnes (meme ordre que -Columns).

.PARAMETER SortBy
    Colonne de tri des donnees.

.PARAMETER Descending
    Tri decroissant (utilise avec -SortBy).

.PARAMETER MaxRows
    Nombre max de lignes par tableau. 0 = illimite.

.PARAMETER TitlePrefix
    Prefixe des titres de section (avec -GroupBy).

.PARAMETER Attachments
    Fichiers a joindre au mail.
    Supporte les variables {DATE}, {TIME}, {DATETIME}, {HOSTNAME}, {ENV}.

.PARAMETER AttachWhen
    Severites pour lesquelles joindre les -Attachments runtime.
    Defaut : "Always". Exemple : "Warning,Error"

.PARAMETER To
    Surcharge les destinataires du JSON.

.PARAMETER Cc
    Destinataires en copie.

.PARAMETER Bcc
    Destinataires en copie cachee.

.PARAMETER Priority
    Priorite du mail. Valeurs : High | Normal | Low.

.PARAMETER Template
    Surcharge le chemin du template HTML du JSON.

.PARAMETER Env
    Badge environnement (PROD, DEV, UAT...). Surcharge le JSON.

.PARAMETER OutFile
    Sauvegarde le HTML genere dans ce fichier.
    Compatible avec -WhatIf (genere le fichier sans envoyer).

.PARAMETER TestAddress
    Redirige l'envoi vers cette adresse au lieu des destinataires configures.
    Le sujet est prefixe de [TEST - Destinataires reels : ...].

.EXAMPLE
    # Notification simple depuis un job ODI
    .\Send-MailHTML.ps1 -Config cfg.json -Subject "Deploiement v2.1" -RC 0

.EXAMPLE
    # Erreur avec log en piece jointe (uniquement si Warning ou Error)
    .\Send-MailHTML.ps1 -Config cfg.json -Subject "MON_JOB" -RC %RC% `
        -Attachments "C:\logs\job_{DATE}.log" -AttachWhen "Warning,Error"

.EXAMPLE
    # Rapport DADP avec donnees CSV groupees (autorite des colonnes dans le JSON)
    .\Send-MailHTML.ps1 -Config config-dadp.json `
        -Subject "Chargement donnees partenaires" -Source data.csv -RC 0

.EXAMPLE
    # Log de traitement par etapes avec resume
    .\Send-MailHTML.ps1 -Config cfg.json -Subject "Batch nuit" -RC 1 `
        -Steps "Etape 1 OK","Etape 2 KO","Rollback OK" `
        -Summary @{ Duree="02:14"; Erreurs="3"; Lignes="1 524" }

.EXAMPLE
    # Mail avec piece jointe toujours et copie
    .\Send-MailHTML.ps1 -Config cfg.json -Subject "Rapport mensuel" -RC 0 `
        -Attachments "C:\reports\rapport.xlsx" -Cc dsi@example.com -Priority High

.EXAMPLE
    # Generer le HTML sans envoyer (apercu ou archivage)
    .\Send-MailHTML.ps1 -Config cfg.json -Subject "Test" -Source data.csv `
        -OutFile "C:\temp\preview.html" -WhatIf

.EXAMPLE
    # Rediriger vers adresse de test sans impacter les vrais destinataires
    .\Send-MailHTML.ps1 -Config cfg.json -Subject "Test" -Source data.csv `
        -TestAddress "dev@example.com"

.NOTES
    Version      : 1.0
    Dependances  : aucune (System.Net.Mail integre a PowerShell)
    Auth OAuth2  : non inclus dans cette version (necessite Mailozaurr)
    Heritage     : le JSON peut contenir "Inherits" pour heriter d'un config parent
    Variables    : {DATE} {TIME} {DATETIME} {HOSTNAME} {ENV} dans Source et Attachments
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)][string]   $Config,
    [Parameter(Mandatory)][string]   $Subject,

    [int]     $RC       = [int]::MinValue,
    [ValidateSet('Info','Success','Warning','Error','Critical','')]
    [string]  $Severity = '',
    [string]  $Body     = '',

    [string[]]  $Steps   = @(),
    [hashtable] $Summary = @{},

    [string[]]  $Source      = @(),
    [string]    $Delimiter   = '',
    [string]    $GroupBy     = '',
    [string[]]  $Columns     = @(),
    [string[]]  $Headers     = @(),
    [string]    $SortBy      = '',
    [switch]    $Descending,
    [int]       $MaxRows     = -1,
    [string]    $TitlePrefix = '',

    [string[]]  $Attachments = @(),
    [string]    $AttachWhen  = 'Always',

    [string[]]  $To       = @(),
    [string[]]  $Cc       = @(),
    [string[]]  $Bcc      = @(),
    [string]    $Priority = '',

    [string]  $Template    = '',
    [string]  $Env         = '',
    [string]  $OutFile     = '',
    [string]  $TestAddress = ''
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

# ============================================================================
# Utilitaires
# ============================================================================

function HtmlEnc([string]$s) {
    if (-not $s) { return '' }
    $s -replace '&','&amp;' -replace '<','&lt;' -replace '>','&gt;' -replace '"','&quot;'
}

function Get-Prop($obj, [string]$name, $default = $null) {
    if ($null -ne $obj -and $obj.PSObject.Properties[$name]) {
        $v = $obj.$name
        if ($null -ne $v) { return $v }
    }
    return $default
}

function Merge-Configs($base, $child) {
    $r = [ordered]@{}
    if ($base)  { foreach ($p in $base.PSObject.Properties)  { $r[$p.Name] = $p.Value } }
    if ($child) { foreach ($p in $child.PSObject.Properties) { if ($p.Name -ne 'Inherits') { $r[$p.Name] = $p.Value } } }
    return [PSCustomObject]$r
}

function Load-Config([string]$path) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Config introuvable : $path" }
    $raw = Get-Content -LiteralPath $path -Raw -Encoding UTF8 | ConvertFrom-Json
    $parent = Get-Prop $raw 'Inherits'
    if ($parent) { return Merge-Configs (Load-Config $parent) $raw }
    return $raw
}

$SEVERITY_RANK = @{ Info=0; Success=1; Warning=2; Error=3; Critical=4 }
$SEVERITY_COLORS = @{
    Info     = @{ Bg='#1565C0'; Light='#E3F2FD'; Border='#1565C0' }
    Success  = @{ Bg='#2E7D32'; Light='#E8F5E9'; Border='#2E7D32' }
    Warning  = @{ Bg='#E65100'; Light='#FFF3E0'; Border='#E65100' }
    Error    = @{ Bg='#C62828'; Light='#FFEBEE'; Border='#C62828' }
    Critical = @{ Bg='#6A1B9A'; Light='#F3E5F5'; Border='#6A1B9A' }
}

function Get-MaxSeverity([string[]]$list) {
    $max = 'Info'
    foreach ($s in $list) {
        if ($SEVERITY_RANK.ContainsKey($s) -and $SEVERITY_RANK[$s] -gt $SEVERITY_RANK[$max]) { $max = $s }
    }
    return $max
}

function Expand-Vars([string]$s, [datetime]$now, [string]$envLabel) {
    $s -replace '\{DATE\}',     $now.ToString('yyyy-MM-dd') `
       -replace '\{TIME\}',     $now.ToString('HH-mm-ss') `
       -replace '\{DATETIME\}', $now.ToString('yyyyMMdd-HHmmss') `
       -replace '\{HOSTNAME\}', $env:COMPUTERNAME `
       -replace '\{ENV\}',      $envLabel
}

function Test-ShouldAttach([string]$when, [string]$sev) {
    if (-not $when -or $when -eq 'Always') { return $true }
    if ($when -eq 'Never') { return $false }
    return ($when -split '[,;]' | ForEach-Object { $_.Trim() }) -contains $sev
}

# ============================================================================
# Generateurs HTML
# ============================================================================

function New-SummaryHtml([hashtable]$data) {
    if (-not $data -or $data.Count -eq 0) { return '' }
    $rows = ''; $i = 0
    foreach ($k in $data.Keys) {
        $bg = if ($i % 2 -eq 0) { '#ffffff' } else { '#f8f9fa' }
        $rows += "<tr style=`"background-color:$bg;`">" +
            "<td style=`"padding:6px 14px;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:12px;font-weight:bold;color:#1B3254;width:35%;border-bottom:1px solid #DDE3E9;white-space:nowrap;`">$(HtmlEnc $k)</td>" +
            "<td style=`"padding:6px 14px;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:12px;color:#2C3E50;border-bottom:1px solid #DDE3E9;`">$(HtmlEnc $data[$k])</td>" +
            "</tr>"; $i++
    }
    return "<tr><td style=`"padding:8px 28px 16px 28px;`"><table width=`"100%`" cellpadding=`"0`" cellspacing=`"0`" border=`"0`" style=`"border-collapse:collapse;border:1px solid #DDE3E9;`"><thead><tr style=`"background-color:#1B3254;`"><th style=`"padding:7px 14px;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:11px;color:#fff;text-align:left;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;`">Parametre</th><th style=`"padding:7px 14px;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:11px;color:#fff;text-align:left;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;`">Valeur</th></tr></thead><tbody>$rows</tbody></table></td></tr>"
}

function New-StepsHtml([string[]]$stepList) {
    if (-not $stepList -or $stepList.Count -eq 0) { return '' }
    $rows = ''
    for ($i = 0; $i -lt $stepList.Count; $i++) {
        $bg  = if ($i % 2 -eq 0) { '#ffffff' } else { '#f8f9fa' }
        $num = ($i + 1).ToString().PadLeft(2,'0')
        $rows += "<tr style=`"background-color:$bg;`"><td style=`"padding:6px 14px;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:12px;color:#2C3E50;border-bottom:1px solid #DDE3E9;`"><span style=`"color:#8A9BB0;margin-right:10px;font-size:11px;`">$num.</span>$(HtmlEnc $stepList[$i])</td></tr>"
    }
    return "<tr><td style=`"padding:8px 28px 16px 28px;`"><table width=`"100%`" cellpadding=`"0`" cellspacing=`"0`" border=`"0`" style=`"border-collapse:collapse;border:1px solid #DDE3E9;`"><thead><tr style=`"background-color:#1B3254;`"><th style=`"padding:7px 14px;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:11px;color:#fff;text-align:left;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;`">Etapes d'execution</th></tr></thead><tbody>$rows</tbody></table></td></tr>"
}

function New-BadgeHtml([string]$value, $badgeColors) {
    if (-not $value) { return '' }
    $bg = '#6B7F96'; $fg = '#ffffff'
    if ($badgeColors) {
        $key = $badgeColors.PSObject.Properties.Name | Where-Object { $_ -ieq $value } | Select-Object -First 1
        if ($key) { $bg = Get-Prop $badgeColors.$key 'Bg' $bg; $fg = Get-Prop $badgeColors.$key 'Text' $fg }
    }
    return " <span style=`"display:inline-block;padding:2px 9px;border-radius:3px;font-size:10px;font-weight:bold;background-color:$bg;color:$fg;font-family:Calibri,'Segoe UI',Arial,sans-serif;letter-spacing:0.3px;`">$(HtmlEnc $value)</span>"
}

function New-SectionTitleHtml([string]$title, [string]$badgeHtml, [string]$borderColor = '#1B3254') {
    return "<tr><td style=`"padding:14px 28px 4px 28px;`"><table width=`"100%`" cellpadding=`"0`" cellspacing=`"0`" border=`"0`"><tr><td style=`"background-color:#f8f9fa;padding:7px 14px;border-left:4px solid $borderColor;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:12px;font-weight:bold;color:#1B3254;`">$(HtmlEnc $title)$badgeHtml</td></tr></table></td></tr>"
}

function New-DataTableHtml([string[]]$dispHeaders, $rows, [string[]]$dispColumns, [int]$effMaxRows) {
    $show   = if ($effMaxRows -gt 0 -and $rows.Count -gt $effMaxRows) { @($rows[0..($effMaxRows-1)]) } else { @($rows) }
    $hidden = $rows.Count - $show.Count

    $th = ($dispHeaders | ForEach-Object { "<th style=`"padding:6px 10px;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:11px;color:#fff;text-align:left;font-weight:bold;white-space:nowrap;border-right:1px solid #2d4a6e;`">$(HtmlEnc $_)</th>" }) -join ''

    $tbody = ''
    for ($i = 0; $i -lt $show.Count; $i++) {
        $bg = if ($i % 2 -eq 0) { '#ffffff' } else { '#f8f9fa' }
        $tds = ($dispColumns | ForEach-Object {
            "<td style=`"padding:5px 10px;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:12px;color:#2C3E50;border-bottom:1px solid #DDE3E9;white-space:nowrap;`">$(HtmlEnc ([string]$show[$i].$_))</td>"
        }) -join ''
        $tbody += "<tr style=`"background-color:$bg;`">$tds</tr>"
    }
    if ($hidden -gt 0) {
        $span = $dispHeaders.Count
        $tbody += "<tr><td colspan=`"$span`" style=`"padding:5px 10px;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:11px;color:#8A9BB0;font-style:italic;border-top:1px solid #DDE3E9;`">... $hidden ligne(s) supplementaire(s) non affichee(s)</td></tr>"
    }
    return "<tr><td style=`"padding:0 28px 16px 28px;overflow-x:auto;`"><table width=`"100%`" cellpadding=`"0`" cellspacing=`"0`" border=`"0`" style=`"border-collapse:collapse;`"><thead><tr style=`"background-color:#1B3254;`">$th</tr></thead><tbody>$tbody</tbody></table></td></tr>"
}

function New-RunbookHtml([string]$url) {
    if (-not $url) { return '' }
    return "<tr><td style=`"padding:4px 28px 16px 28px;font-family:Calibri,'Segoe UI',Arial,sans-serif;font-size:12px;color:#6B7F96;`">Procedure : <a href=`"$(HtmlEnc $url)`" style=`"color:#1565C0;`">$(HtmlEnc $url)</a></td></tr>"
}

# ============================================================================
# MAIN
# ============================================================================

$now = Get-Date

# 1. Chargement de la configuration avec heritage
$cfg         = Load-Config -path $Config
$cfgSmtp     = Get-Prop $cfg 'Smtp'
$cfgData     = Get-Prop $cfg 'Data'
$cfgMessages = Get-Prop $cfg 'Messages'
$cfgRcMap    = Get-Prop $cfg 'RcMapping'
$cfgAutoSev  = @(Get-Prop $cfg 'AutoSeverity' @())
$cfgAttRules = @(Get-Prop $cfg 'Attachments'  @())

# 2. Resolution des parametres effectifs (param > JSON)
$effEnv      = if ($Env)      { $Env      } else { Get-Prop $cfg 'Env'      '' }
$effTemplate = if ($Template) { $Template } else { Get-Prop $cfg 'Template' '' }
$effSmtpSrv  = Get-Prop $cfgSmtp 'Server'               ''
$effSmtpPort = [int](Get-Prop $cfgSmtp 'Port'            25)
$effSmtpSsl  = Get-Prop $cfgSmtp 'SecureSocketOptions'   'None'
$effTimeout  = [int](Get-Prop $cfgSmtp 'TimeoutMs'        30000)
$effRetry    = [int](Get-Prop $cfgSmtp 'RetryCount'       0)
$effRetDly   = [int](Get-Prop $cfgSmtp 'RetryDelayMs'     5000)
$effDeliv    = Get-Prop $cfgSmtp 'DeliveryNotification'   'Never'
$effAuth     = Get-Prop $cfgSmtp 'Auth'
$effFrom     = Get-Prop $cfg 'From'            ''
$effFromName = Get-Prop $cfg 'FromName'        ''
$effTo       = if ($To.Count  -gt 0) { $To  } else { @(Get-Prop $cfg 'To'  @()) }
$effCc       = if ($Cc.Count  -gt 0) { $Cc  } else { @(Get-Prop $cfg 'Cc'  @()) }
$effBcc      = if ($Bcc.Count -gt 0) { $Bcc } else { @(Get-Prop $cfg 'Bcc' @()) }
$effPrio     = if ($Priority) { $Priority } else { Get-Prop $cfg 'Priority' 'Normal' }
$effTeam     = Get-Prop $cfg 'Team'       ''
$effFooter   = Get-Prop $cfg 'Footer'     'Message genere automatiquement.'
$effRunbook  = Get-Prop $cfg 'RunbookUrl' ''
$effHost     = Get-Prop $cfg 'Hostname'   $env:COMPUTERNAME
if (-not $effHost) { $effHost = $env:COMPUTERNAME }
$effSubPfx   = Get-Prop $cfg 'SubjectPrefix' ''
$effDefSev   = Get-Prop $cfg 'DefaultSeverity' 'Info'

$effDelim    = if ($Delimiter)        { $Delimiter   } else { Get-Prop $cfgData 'Delimiter'   ';'    }
$effGroupBy  = if ($GroupBy)          { $GroupBy     } else { Get-Prop $cfgData 'GroupBy'     ''     }
$effColumns  = if ($Columns.Count -gt 0) { $Columns } else { @(Get-Prop $cfgData 'Columns'   @())   }
$effHeaders  = if ($Headers.Count -gt 0) { $Headers } else { @(Get-Prop $cfgData 'Headers'   @())   }
$effSortBy   = if ($SortBy)           { $SortBy      } else { Get-Prop $cfgData 'SortBy'     ''     }
$effDesc     = if ($Descending)       { $true        } else { [bool](Get-Prop $cfgData 'Descending' $false) }
$effMaxRows  = if ($MaxRows -ge 0)    { $MaxRows     } else { [int](Get-Prop $cfgData 'MaxRows' 0)   }
$effTitlePfx = if ($TitlePrefix)      { $TitlePrefix } else { Get-Prop $cfgData 'TitlePrefix' $effGroupBy }
$effBadgeCol = Get-Prop $cfgData 'BadgeColumn' ''
$effBadgeClr = Get-Prop $cfgData 'BadgeColors'

$effSubject  = if ($effSubPfx) { "$effSubPfx $Subject".Trim() } else { $Subject }

# 3. Severite technique depuis RC
$techSev = ''
if ($RC -ne [int]::MinValue -and $cfgRcMap) {
    $rcKey = [string]$RC
    if ($cfgRcMap.PSObject.Properties[$rcKey]) { $techSev = $cfgRcMap.$rcKey }
    elseif ($cfgRcMap.PSObject.Properties['*']) { $techSev = $cfgRcMap.'*' }
}

# 4. Lecture CSV
$csvData = [System.Collections.Generic.List[object]]::new()
foreach ($src in $Source) {
    $srcPath = Expand-Vars $src $now $effEnv
    if (-not (Test-Path -LiteralPath $srcPath)) { Write-Warning "Source introuvable : $srcPath"; continue }
    $csvData.AddRange(@(Import-Csv -LiteralPath $srcPath -Delimiter $effDelim))
}

# 5. Severite fonctionnelle depuis AutoSeverity
$funcSev = 'Info'
if ($cfgAutoSev.Count -gt 0 -and $csvData.Count -gt 0) {
    $candidates = [System.Collections.Generic.List[string]]::new()
    $candidates.Add('Info')
    foreach ($row in $csvData) {
        foreach ($rule in $cfgAutoSev) {
            $cell = [string]$row.($rule.Column)
            $hit  = switch ($rule.Operator) {
                'Equals'      { $cell -eq $rule.Value }
                'NotEquals'   { $cell -ne $rule.Value }
                'Contains'    { $cell -like "*$($rule.Value)*" }
                'NotContains' { $cell -notlike "*$($rule.Value)*" }
                'GreaterThan' { try { [double]$cell -gt [double]$rule.Value } catch { $false } }
                'LessThan'    { try { [double]$cell -lt [double]$rule.Value } catch { $false } }
                'IsEmpty'     { [string]::IsNullOrWhiteSpace($cell) }
                'IsNotEmpty'  { -not [string]::IsNullOrWhiteSpace($cell) }
                'Regex'       { try { $cell -match $rule.Value } catch { $false } }
                default       { $false }
            }
            if ($hit) { $candidates.Add($rule.Severity) }
        }
    }
    $funcSev = Get-MaxSeverity $candidates.ToArray()
}

# 6. Severite initiale et finale
$initSev  = if ($Severity) { $Severity } else { $effDefSev }
$finalSev = Get-MaxSeverity @($initSev, $techSev, $funcSev)
$colors   = $SEVERITY_COLORS[$finalSev]

Write-Host "Severite : initiale=$initSev | technique=$(if($techSev){'[RC='+$RC+'] '+$techSev}else{'n/a'}) | fonctionnelle=$funcSev | finale=$finalSev"

# 7. Construction des sections HTML
$sections = ''

if ($Summary.Count -gt 0)  { $sections += New-SummaryHtml $Summary }
if ($Steps.Count   -gt 0)  { $sections += New-StepsHtml   $Steps   }

if ($csvData.Count -gt 0) {
    $srcCols = @($csvData[0].PSObject.Properties.Name)

    # Colonnes a afficher
    $dispCols = if ($effColumns.Count -gt 0) {
        $effColumns
    } elseif ($effGroupBy) {
        $srcCols | Where-Object { $_ -ne $effGroupBy -and $_ -ne $effBadgeCol }
    } else {
        $srcCols | Where-Object { $_ -ne $effBadgeCol }
    }

    # En-tetes effectifs
    $dispHdrs = if ($effHeaders.Count -eq @($dispCols).Count) { $effHeaders } else { @($dispCols) }

    # Tri
    if ($effSortBy -and ($srcCols -contains $effSortBy)) {
        $csvArr = if ($effDesc) { $csvData | Sort-Object { $_.$effSortBy } -Descending }
                  else          { $csvData | Sort-Object { $_.$effSortBy } }
    } else { $csvArr = @($csvData) }

    if ($effGroupBy -and ($srcCols -contains $effGroupBy)) {
        foreach ($g in ($csvArr | Group-Object -Property $effGroupBy)) {
            # Badge depuis BadgeColumn
            $badgeVal    = ''
            $borderColor = '#1B3254'
            if ($effBadgeCol -and $g.Group[0].PSObject.Properties[$effBadgeCol]) {
                $badgeVal = $g.Group | ForEach-Object { $_.$effBadgeCol } |
                            Where-Object { $_ -ne '' } | Select-Object -First 1
                if ($badgeVal -and $effBadgeClr) {
                    $bk = $effBadgeClr.PSObject.Properties.Name | Where-Object { $_ -ieq $badgeVal } | Select-Object -First 1
                    if ($bk) { $borderColor = Get-Prop $effBadgeClr.$bk 'Bg' '#1B3254' }
                }
            }
            $badge = if ($badgeVal) { New-BadgeHtml $badgeVal $effBadgeClr } else { '' }
            $title = if ($effTitlePfx) { "$effTitlePfx $($g.Name)" } else { $g.Name }
            $sections += New-SectionTitleHtml $title $badge $borderColor
            $sections += New-DataTableHtml $dispHdrs @($g.Group) @($dispCols) $effMaxRows
        }
    } else {
        $sections += New-DataTableHtml $dispHdrs $csvArr @($dispCols) $effMaxRows
    }
}

$sections += New-RunbookHtml $effRunbook

# 8. Population du template
if (-not $effTemplate -or -not (Test-Path -LiteralPath $effTemplate)) {
    throw "Template HTML introuvable : '$effTemplate'. Verifiez la cle Template dans votre config."
}
$html = Get-Content -LiteralPath $effTemplate -Raw -Encoding UTF8

$msgText = if ($Body) { $Body } else {
    if ($cfgMessages -and $cfgMessages.PSObject.Properties[$finalSev]) { $cfgMessages.$finalSev } else { '' }
}

$html = $html `
    -replace '\{\{STATUS_COLOR\}\}',   $colors.Bg `
    -replace '\{\{STATUS_LABEL\}\}',   $finalSev.ToUpper() `
    -replace '\{\{STATUS_MESSAGE\}\}', (HtmlEnc $msgText) `
    -replace '\{\{JOB_NAME\}\}',       (HtmlEnc $effSubject) `
    -replace '\{\{DATE\}\}',           $now.ToString('dd/MM/yyyy') `
    -replace '\{\{HEURE\}\}',          $now.ToString('HH:mm:ss') `
    -replace '\{\{ENVIRONNEMENT\}\}',  (HtmlEnc $effEnv) `
    -replace '\{\{HOSTNAME\}\}',       (HtmlEnc $effHost) `
    -replace '\{\{EQUIPE\}\}',         (HtmlEnc $effTeam) `
    -replace '\{\{SECTIONS\}\}',       $sections

# 9. Sauvegarde HTML optionnelle
if ($OutFile) {
    $dir = Split-Path $OutFile -Parent
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($OutFile, $html, [System.Text.UTF8Encoding]::new($false))
    Write-Host "HTML sauvegarde : $OutFile"
}

# 10. Pieces jointes effectives
$finalAtt = [System.Collections.Generic.List[string]]::new()

foreach ($rule in $cfgAttRules) {
    $p    = Expand-Vars (Get-Prop $rule 'Path' '') $now $effEnv
    $when = Get-Prop $rule 'When' 'Always'
    if (-not $p) { continue }
    $conds = if ($when -is [array]) { $when } else { @($when -split '[,;]' | ForEach-Object { $_.Trim() }) }
    $ok = ($conds -contains 'Always') -or ($conds -contains $finalSev)
    if ($ok) {
        if (Test-Path -LiteralPath $p) { $finalAtt.Add($p) }
        else { Write-Warning "Piece jointe introuvable (ignoree) : $p" }
    }
}

foreach ($a in $Attachments) {
    $p = Expand-Vars $a $now $effEnv
    if (Test-ShouldAttach $AttachWhen $finalSev) {
        if (Test-Path -LiteralPath $p) { $finalAtt.Add($p) }
        else { Write-Warning "Piece jointe introuvable (ignoree) : $p" }
    }
}

# 11. Envoi (ou WhatIf)
if (-not $PSCmdlet.ShouldProcess($effSubject, 'Envoyer mail')) {
    Write-Host "[WhatIf] Mail non envoye. Severite=$finalSev | Destinataires=$($effTo -join ',') | PJ=$($finalAtt.Count)"
    exit 0
}

if ($effTo.Count -eq 0) { throw "Aucun destinataire configure." }
if (-not $effSmtpSrv)   { throw "SmtpServer non configure." }

$dest = if ($TestAddress) { @($TestAddress) } else { $effTo }

$attempt = 0; $maxAtt = [Math]::Max(1, $effRetry + 1)
while ($attempt -lt $maxAtt) {
    $attempt++
    $mail = $null; $smtp = $null
    try {
        $mail = [System.Net.Mail.MailMessage]::new()
        $mail.From = if ($effFromName) {
            [System.Net.Mail.MailAddress]::new($effFrom, $effFromName)
        } else { [System.Net.Mail.MailAddress]::new($effFrom) }

        foreach ($a in $dest)   { $mail.To.Add($a)  }
        foreach ($a in $effCc)  { $mail.CC.Add($a)  }
        foreach ($a in $effBcc) { $mail.Bcc.Add($a) }

        $mail.Subject = if ($TestAddress) {
            "[TEST - Destinataires reels : $($effTo -join ', ')] $effSubject"
        } else { $effSubject }

        $mail.Body            = $html
        $mail.IsBodyHtml      = $true
        $mail.Priority        = [System.Net.Mail.MailPriority]$effPrio
        $mail.SubjectEncoding = [System.Text.Encoding]::UTF8
        $mail.BodyEncoding    = [System.Text.Encoding]::UTF8

        if ($effDeliv -ne 'Never') {
            $mail.DeliveryNotificationOptions = [System.Net.Mail.DeliveryNotificationOptions]$effDeliv
        }

        foreach ($f in $finalAtt) { $mail.Attachments.Add([System.Net.Mail.Attachment]::new($f)) }

        $smtp = [System.Net.Mail.SmtpClient]::new($effSmtpSrv, $effSmtpPort)
        $smtp.Timeout   = $effTimeout
        $smtp.EnableSsl = ($effSmtpSsl -in @('SslOnConnect','StartTls','StartTlsWhenAvailable'))

        if ($effAuth) {
            switch (Get-Prop $effAuth 'Type' 'None') {
                'WindowsAuth' { $smtp.UseDefaultCredentials = $true }
                'Basic' {
                    $u = Get-Prop $effAuth 'Username' ''
                    $f = Get-Prop $effAuth 'PasswordFile' ''
                    if ($f -and (Test-Path $f)) {
                        $sec = Get-Content $f | ConvertTo-SecureString
                        $smtp.Credentials = [System.Net.NetworkCredential]::new($u, $sec)
                    }
                }
            }
        }

        $smtp.Send($mail)
        Write-Host "Mail envoye : '$effSubject' -> $($dest -join ', ') [Severite=$finalSev | PJ=$($finalAtt.Count)]"
        break
    }
    catch {
        Write-Warning "Tentative $attempt/$maxAtt echouee : $_"
        if ($attempt -lt $maxAtt) { Start-Sleep -Milliseconds $effRetDly }
        else { throw "Impossible d'envoyer le mail apres $maxAtt tentative(s) : $_" }
    }
    finally {
        if ($mail) { $mail.Dispose() }
        if ($smtp) { $smtp.Dispose() }
    }
}
