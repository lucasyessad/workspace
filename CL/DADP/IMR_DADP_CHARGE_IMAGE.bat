@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM -------------------------------------------------------------------------------
REM SCHEDULE   : IMRDADP1                          JOB : IMR_DADP_CHARGE_IMAGE.bat
REM TITRE      : CHARGEMENT DONNEES PARTENAIRES DADP
REM -------------------------------------------------------------------------------

REM *** HORS MAESTRO ***
@call e:\dsi\exploit\parmlib\Chemin.bat

set "RC=0"
set "SCEN_NAME=IMR_DADP_CHARGE_IMAGE"
set "SCEN_VERS=0_5"
set "SCEN_CTX=CTX_DEV"

REM =====================================================================
REM PARAMETRES
REM =====================================================================
set "PROCLIB=C:\proclib"
set "SMTP_SERVER=smtp.creditlogement.fr"
set "TEMPLATE_PATH=%PROCLIB%\CL\PRODUCTION\template-notification.html"
set "DADP_CONFIG=%PROCLIB%\CL\DADP\config-dadp.json"
set "SENDNOTIF=%PROCLIB%\CL\PRODUCTION\SendMailNotificationHTML.ps1"
set "DADP_CSV=<CHEMIN_CSV_PRODUIT_PAR_ODI>\DADP_STOCK_EVOL_MAIL.csv"

REM =====================================================================
REM HORODATAGE
REM =====================================================================
set TS=%date:~6,4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TS=%TS: =0%

REM =====================================================================
REM LANCEMENT SCENARIO ODI
REM =====================================================================
pushd "X:\Oracle\ODI12c\user_projects\domains\base_domain\bin"

echo ***** Lancement Scenario ODI : %SCEN_NAME% v%SCEN_VERS%
echo.
call startscen "%SCEN_NAME%" "%SCEN_VERS%" %SCEN_CTX%
set RC=%ERRORLEVEL%

echo Code Retour ODI : %RC%
popd

REM =====================================================================
REM STATUT MAIL (RC=0 succes, RC=1 avertissement, RC>1 erreur)
REM =====================================================================
set "MAIL_STATUS=SUCCES"
if "!RC!" NEQ "0" set "MAIL_STATUS=ERREUR"
if "!RC!"=="1"    set "MAIL_STATUS=WARNING"

REM =====================================================================
REM ENVOI NOTIFICATION MAIL
REM =====================================================================
echo.
echo ***** Envoi notification mail DADP (RC=!RC!, Statut=!MAIL_STATUS!)

powershell -NoLogo -NoProfile -ExecutionPolicy Bypass ^
  -File       "%SENDNOTIF%"    ^
  -ConfigFile "%DADP_CONFIG%"  ^
  -Status     "!MAIL_STATUS!"  ^
  -NomJob     "IMR_DADP_CHARGE_IMAGE" ^
  -Horodatage "!TS!"           ^
  -TableCsv   "%DADP_CSV%"

echo [DADP] Notification terminee (code=%ERRORLEVEL%)
exit /B !RC!
