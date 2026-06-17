@echo off
REM ============================================================================
REM Notify.bat - POINT D'ENTREE UNIVERSEL MAIL v3.0
REM ============================================================================
REM Appelez ce batch depuis N'IMPORTE QUEL traitement pour envoyer un mail.
REM Tous les parametres sont passes sous forme CLE=VALEUR.
REM
REM SYNTAXE :
REM   call Notify.bat CONFIG=chemin JOB=nom STATUS=OK [options...]
REM
REM EXEMPLES RAPIDES :
REM   call Notify.bat CONFIG=C:\config\job.json JOB=MON_JOB STATUS=OK
REM   call Notify.bat CONFIG=C:\config\job.json JOB=MON_JOB STATUS=ERREUR ^
REM        MESSAGE="Echec du chargement" LOGDIR=C:\logs\today
REM   call Notify.bat CONFIG=C:\config\job.json JOB=ETL STATUS=OK ^
REM        MODE=etl FILES=C:\data\result.csv LOGDIR=C:\logs
REM ============================================================================
setlocal EnableExtensions EnableDelayedExpansion

REM --- Localiser le wrapper PS1 (meme repertoire que ce .bat) ---
set "WRAPPER=%~dp0Invoke-MailNotification.ps1"
if not exist "!WRAPPER!" (
    echo [ERREUR] Invoke-MailNotification.ps1 introuvable dans %~dp0
    exit /b 1
)

REM --- Parser tous les parametres CLE=VALEUR ---
set "PS_ARGS="

:parse_loop
if "%~1"=="" goto :end_parse

REM Extraire cle et valeur
for /f "tokens=1,* delims==" %%A in ("%~1") do (
    set "KEY=%%A"
    set "VAL=%%B"
)

REM Mapper les cles vers les parametres PowerShell
if /i "!KEY!"=="CONFIG"       set "PS_ARGS=!PS_ARGS! -ConfigFile "!VAL!""
if /i "!KEY!"=="JOB"          set "PS_ARGS=!PS_ARGS! -NomJob "!VAL!""
if /i "!KEY!"=="STATUS"       set "PS_ARGS=!PS_ARGS! -Status "!VAL!""
if /i "!KEY!"=="MODE"         set "PS_ARGS=!PS_ARGS! -Mode "!VAL!""
if /i "!KEY!"=="FILE"         set "PS_ARGS=!PS_ARGS! -File "!VAL!""
if /i "!KEY!"=="FILES"        set "PS_ARGS=!PS_ARGS! -Files "!VAL!""
if /i "!KEY!"=="FILEDIR"      set "PS_ARGS=!PS_ARGS! -FileDir "!VAL!""
if /i "!KEY!"=="FILEPATTERN"  set "PS_ARGS=!PS_ARGS! -FilePattern "!VAL!""
if /i "!KEY!"=="FILETITLE"    set "PS_ARGS=!PS_ARGS! -FileTitle "!VAL!""
if /i "!KEY!"=="FILEDESC"     set "PS_ARGS=!PS_ARGS! -FileDesc "!VAL!""
if /i "!KEY!"=="LOGDIR"       set "PS_ARGS=!PS_ARGS! -LogDir "!VAL!""
if /i "!KEY!"=="LOGFILE"      set "PS_ARGS=!PS_ARGS! -LogFile "!VAL!""
if /i "!KEY!"=="LOGPATTERN"   set "PS_ARGS=!PS_ARGS! -LogPattern "!VAL!""
if /i "!KEY!"=="LOGTAIL"      set "PS_ARGS=!PS_ARGS! -LogTailLines !VAL!"
if /i "!KEY!"=="LOGATTACH"    set "PS_ARGS=!PS_ARGS! -LogAttach"
if /i "!KEY!"=="KV"           set "PS_ARGS=!PS_ARGS! -KeyValues "!VAL!""
if /i "!KEY!"=="KEYVALUES"    set "PS_ARGS=!PS_ARGS! -KeyValues "!VAL!""
if /i "!KEY!"=="ETAPES"       set "PS_ARGS=!PS_ARGS! -Etapes "!VAL!""
if /i "!KEY!"=="MESSAGE"      set "PS_ARGS=!PS_ARGS! -Message "!VAL!""
if /i "!KEY!"=="MSG"          set "PS_ARGS=!PS_ARGS! -Message "!VAL!""
if /i "!KEY!"=="STATS"        set "PS_ARGS=!PS_ARGS! -Stats "!VAL!""
if /i "!KEY!"=="STEPS"        set "PS_ARGS=!PS_ARGS! -StepsReport "!VAL!""
if /i "!KEY!"=="SECTIONFILE"  set "PS_ARGS=!PS_ARGS! -SectionFile "!VAL!""
if /i "!KEY!"=="SECTIONS"     set "PS_ARGS=!PS_ARGS! -SectionsJson "!VAL!""
if /i "!KEY!"=="ATTACH"       set "PS_ARGS=!PS_ARGS! -Attachments "!VAL!""
if /i "!KEY!"=="ATTACHDIR"    set "PS_ARGS=!PS_ARGS! -AttachDir "!VAL!""
if /i "!KEY!"=="HORODATAGE"   set "PS_ARGS=!PS_ARGS! -Horodatage "!VAL!""
if /i "!KEY!"=="DRYRUN"       set "PS_ARGS=!PS_ARGS! -DryRun"
if /i "!KEY!"=="EXPORT"       set "PS_ARGS=!PS_ARGS! -ExportHtml "!VAL!""
if /i "!KEY!"=="PRIORITY"     set "PS_ARGS=!PS_ARGS! -MailPriority "!VAL!""
if /i "!KEY!"=="AUTOANALYZE"  set "PS_ARGS=!PS_ARGS! -AutoAnalyze"
if /i "!KEY!"=="MAXROWS"      set "PS_ARGS=!PS_ARGS! -MaxCsvRows !VAL!"
if /i "!KEY!"=="OVERRIDETO"   set "PS_ARGS=!PS_ARGS! -OverrideTo "!VAL!""
if /i "!KEY!"=="OVERRIDECC"   set "PS_ARGS=!PS_ARGS! -OverrideCc "!VAL!""
if /i "!KEY!"=="EXTRA"        set "PS_ARGS=!PS_ARGS! -ExtraSubject "!VAL!""
if /i "!KEY!"=="VERBOSE"      set "PS_ARGS=!PS_ARGS! -Verbose2"

shift
goto :parse_loop

:end_parse

REM --- Appel PowerShell ---
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "!WRAPPER!" !PS_ARGS!
set "RC=%ERRORLEVEL%"

if %RC% EQU 0 (
    echo [NOTIFY] Mail envoye avec succes.
) else (
    echo [NOTIFY] ERREUR envoi mail (code=%RC%)
)

exit /b %RC%
