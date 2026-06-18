@echo off
REM ============================================================================
REM Notify.bat - POINT D'ENTREE UNIVERSEL MAIL (appel direct du moteur)
REM ============================================================================
REM Confort optionnel : appelez ce batch depuis N'IMPORTE QUEL traitement pour
REM envoyer une notification sans ecrire la longue ligne PowerShell.
REM Tous les parametres sont passes sous forme CLE=VALEUR et traduits en
REM parametres de SendMailNotificationHTML.ps1 (le moteur). Aucune couche
REM intermediaire : ce .bat appelle directement le moteur.
REM
REM SYNTAXE :
REM   call Notify.bat CONFIG=chemin JOB=nom STATUS=OK [options...]
REM
REM EXEMPLES :
REM   call Notify.bat CONFIG=C:\cfg\job.json JOB=MON_JOB STATUS=OK
REM   call Notify.bat CONFIG=C:\cfg\job.json JOB=MON_JOB STATUS=ERREUR ^
REM        MESSAGE="Echec du chargement" LOGDIR=C:\logs\today AUTOPRIORITY=1
REM   call Notify.bat CONFIG=C:\cfg\dadp.json JOB=DADP STATUS=OK ^
REM        TABLECSV=C:\data\dadp.csv
REM
REM Pour un traitement complet et lisible, un BAT de job peut tout aussi bien
REM appeler le moteur directement (voir DADP/IMR_DADP_CHARGE_IMAGE.bat).
REM ============================================================================
setlocal EnableExtensions EnableDelayedExpansion

REM --- Localiser le moteur (meme repertoire que ce .bat) ---
set "ENGINE=%~dp0SendMailNotificationHTML.ps1"
if not exist "!ENGINE!" (
    echo [ERREUR] SendMailNotificationHTML.ps1 introuvable dans %~dp0
    exit /b 1
)

REM --- Parser tous les parametres CLE=VALEUR ---
set "PS_ARGS="

:parse_loop
if "%~1"=="" goto :end_parse

for /f "tokens=1,* delims==" %%A in ("%~1") do (
    set "KEY=%%A"
    set "VAL=%%B"
)

REM --- Obligatoires ---
if /i "!KEY!"=="CONFIG"        set "PS_ARGS=!PS_ARGS! -ConfigFile "!VAL!""
if /i "!KEY!"=="JOB"           set "PS_ARGS=!PS_ARGS! -NomJob "!VAL!""
if /i "!KEY!"=="STATUS"        set "PS_ARGS=!PS_ARGS! -Status "!VAL!""
REM --- Horodatage ---
if /i "!KEY!"=="HORODATAGE"    set "PS_ARGS=!PS_ARGS! -Horodatage "!VAL!""
REM --- Contenu ---
if /i "!KEY!"=="KV"            set "PS_ARGS=!PS_ARGS! -KeyValues "!VAL!""
if /i "!KEY!"=="KEYVALUES"     set "PS_ARGS=!PS_ARGS! -KeyValues "!VAL!""
if /i "!KEY!"=="ETAPES"        set "PS_ARGS=!PS_ARGS! -Etapes "!VAL!""
if /i "!KEY!"=="STATS"         set "PS_ARGS=!PS_ARGS! -Stats "!VAL!""
if /i "!KEY!"=="MESSAGE"       set "PS_ARGS=!PS_ARGS! -MessageLibre "!VAL!""
if /i "!KEY!"=="MSG"           set "PS_ARGS=!PS_ARGS! -MessageLibre "!VAL!""
if /i "!KEY!"=="SECTIONFILE"   set "PS_ARGS=!PS_ARGS! -SectionFile "!VAL!""
if /i "!KEY!"=="SECTIONS"      set "PS_ARGS=!PS_ARGS! -SectionsInline "!VAL!""
REM --- Tableau CSV + regroupement ---
if /i "!KEY!"=="TABLECSV"      set "PS_ARGS=!PS_ARGS! -TableCsv "!VAL!""
if /i "!KEY!"=="TABLETITLE"    set "PS_ARGS=!PS_ARGS! -TableTitle "!VAL!""
if /i "!KEY!"=="GROUPBY"       set "PS_ARGS=!PS_ARGS! -GroupBy "!VAL!""
if /i "!KEY!"=="STATUSCOL"     set "PS_ARGS=!PS_ARGS! -StatusColumn "!VAL!""
if /i "!KEY!"=="COLUMNS"       set "PS_ARGS=!PS_ARGS! -Columns "!VAL!""
if /i "!KEY!"=="HEADERS"       set "PS_ARGS=!PS_ARGS! -Headers "!VAL!""
REM --- Fichiers ---
if /i "!KEY!"=="FILE"          set "PS_ARGS=!PS_ARGS! -Files "!VAL!""
if /i "!KEY!"=="FILES"         set "PS_ARGS=!PS_ARGS! -Files "!VAL!""
if /i "!KEY!"=="FILEDIR"       set "PS_ARGS=!PS_ARGS! -FileDir "!VAL!""
if /i "!KEY!"=="FILEPATTERN"   set "PS_ARGS=!PS_ARGS! -FilePattern "!VAL!""
if /i "!KEY!"=="AUTOANALYZE"   set "PS_ARGS=!PS_ARGS! -AutoAnalyze"
if /i "!KEY!"=="MAXROWS"       set "PS_ARGS=!PS_ARGS! -MaxCsvRows !VAL!"
REM --- Logs ---
if /i "!KEY!"=="LOGDIR"        set "PS_ARGS=!PS_ARGS! -LogDir "!VAL!""
if /i "!KEY!"=="LOGPATTERN"    set "PS_ARGS=!PS_ARGS! -LogPattern "!VAL!""
if /i "!KEY!"=="LOGTAIL"       set "PS_ARGS=!PS_ARGS! -LogTailLines !VAL!"
if /i "!KEY!"=="LOGATTACH"     set "PS_ARGS=!PS_ARGS! -LogAttach"
REM --- Pieces jointes ---
if /i "!KEY!"=="ATTACH"        set "PS_ARGS=!PS_ARGS! -Attachments "!VAL!""
if /i "!KEY!"=="ATTACHDIR"     set "PS_ARGS=!PS_ARGS! -AttachDir "!VAL!""
if /i "!KEY!"=="ATTACHPATTERN" set "PS_ARGS=!PS_ARGS! -AttachPattern "!VAL!""
REM --- Options ---
if /i "!KEY!"=="DRYRUN"        set "PS_ARGS=!PS_ARGS! -DryRun"
if /i "!KEY!"=="EXPORT"        set "PS_ARGS=!PS_ARGS! -ExportHtml "!VAL!""
if /i "!KEY!"=="PRIORITY"      set "PS_ARGS=!PS_ARGS! -MailPriority "!VAL!""
if /i "!KEY!"=="AUTOPRIORITY"  set "PS_ARGS=!PS_ARGS! -AutoPriority"
if /i "!KEY!"=="OVERRIDETO"    set "PS_ARGS=!PS_ARGS! -OverrideTo "!VAL!""
if /i "!KEY!"=="OVERRIDECC"    set "PS_ARGS=!PS_ARGS! -OverrideCc "!VAL!""
if /i "!KEY!"=="EXTRA"         set "PS_ARGS=!PS_ARGS! -ExtraSubject "!VAL!""
if /i "!KEY!"=="NOFOOTER"      set "PS_ARGS=!PS_ARGS! -NoFooter"
if /i "!KEY!"=="VERBOSE"       set "PS_ARGS=!PS_ARGS! -Verbose2"

shift
goto :parse_loop

:end_parse

REM --- Appel direct du moteur ---
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "!ENGINE!" !PS_ARGS!
set "RC=%ERRORLEVEL%"

if %RC% EQU 0 (
    echo [NOTIFY] Mail envoye avec succes.
) else (
    echo [NOTIFY] ERREUR envoi mail (code=%RC%)
)

exit /b %RC%
