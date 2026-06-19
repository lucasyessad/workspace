@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ===============================================================================
REM SCHEDULE : IMRDADP1                         JOB : IMR_DADP_CHARGE_IMAGE.bat
REM TITRE    : CHARGEMENT DONNEES PARTENAIRES DADP
REM -------------------------------------------------------------------------------
REM ROLE     : 1) Lance le scenario ODI (qui execute les SQL et exporte le CSV)
REM            2) Deduit le statut global du mail a partir du code retour ODI
REM            3) Envoie la notification HTML via le moteur universel
REM
REM CONTRAT  : le scenario ODI produit le fichier "%DADP_CSV%" (delimiteur ';')
REM            avec au minimum la colonne de rupture "Expediteur".
REM            Le regroupement / les colonnes affichees sont definis dans
REM            "%DADP_CONFIG%" (GroupBy, Columns, Headers) -> rien a coder ici.
REM -------------------------------------------------------------------------------
REM CODE RETOUR ODI : 0 = OK (SUCCES) | 1 = avertissement (WARNING) | >1 = ERREUR
REM ===============================================================================

REM *** HORS MAESTRO ***
@call e:\dsi\exploit\parmlib\Chemin.bat

set "RC=0"
set "SCEN_NAME=IMR_DADP_CHARGE_IMAGE"
set "SCEN_VERS=0_5"
set "SCEN_CTX=CTX_DEV"

REM =====================================================================
REM PARAMETRES  (>>> TODO : adapter les valeurs marquees <...> au site <<<)
REM Bibliotheques %parmlib% / %datalib% / %proclib% definies par Chemin.bat :
REM   JSON de config -> %parmlib%   |  donnees (CSV) -> %datalib%
REM   procedures / outillage (PS1, template HTML) -> %proclib%
REM =====================================================================
set "SMTP_SERVER=<RELAIS_SMTP_INTERNE>"
set "TEMPLATE_PATH=%proclib%\template-notification.html"
set "DADP_CONFIG=%parmlib%\config-dadp.json"
set "SENDNOTIF=%proclib%\SendMailNotificationHTML.ps1"
set "DADP_CSV=%datalib%\DADP_STOCK_EVOL_MAIL.csv"

REM =====================================================================
REM HORODATAGE  (format attendu par le moteur : yyyyMMdd_HHmmss)
REM =====================================================================
set "TS=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TS=%TS: =0%"

REM =====================================================================
REM LANCEMENT DU SCENARIO ODI
REM =====================================================================
pushd "X:\Oracle\ODI12c\user_projects\domains\base_domain\bin"
echo ***** Lancement scenario ODI : %SCEN_NAME% v%SCEN_VERS%
call startscen "%SCEN_NAME%" "%SCEN_VERS%" %SCEN_CTX%
set "RC=%ERRORLEVEL%"
echo Code retour ODI : %RC%
popd

REM =====================================================================
REM STATUT GLOBAL DU MAIL (a partir du code retour ODI)
REM =====================================================================
set "MAIL_STATUS=SUCCES"
if %RC% NEQ 0 set "MAIL_STATUS=ERREUR"
if %RC%==1   set "MAIL_STATUS=WARNING"

REM =====================================================================
REM ENVOI DE LA NOTIFICATION
REM (GroupBy / Columns / Headers viennent de %DADP_CONFIG%)
REM =====================================================================
echo.
echo ***** Envoi notification DADP (RC=%RC%, Statut=%MAIL_STATUS%)
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%SENDNOTIF%" -ConfigFile "%DADP_CONFIG%" -Status "%MAIL_STATUS%" -NomJob "IMR_DADP_CHARGE_IMAGE" -Horodatage "%TS%" -TableCsv "%DADP_CSV%"

if errorlevel 1 echo [DADP] ATTENTION : echec d'envoi du mail (code=%ERRORLEVEL%)
echo [DADP] Termine.

exit /B %RC%
