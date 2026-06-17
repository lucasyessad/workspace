REM *********** HORS MAESTRO ******************************************************
@call e:\dsi\exploit\parmlib\Chemin.bat
REM *********** HORS MAESTRO ******************************************************

@chcp 65001 > nul
@echo off

SET RC=0
SET SCEN_NAME=IMR_DADP_CHARGE_IMAGE
SET SCEN_VERS=0_5
SET SCEN_CTX=CTX_DEV

SET PROCLIB=C:\proclib
SET DADP_CONFIG=%PROCLIB%\DADP\config-dadp.json
SET DADP_CSV=<CHEMIN_CSV_PRODUIT_PAR_ODI>\DADP_STOCK_EVOL_MAIL.csv

pushd "X:\Oracle\ODI12c\user_projects\domains\base_domain\bin"

echo ***** Lancement Scénario ODI : %SCEN_NAME% v%SCEN_VERS%
echo.
call startscen "%SCEN_NAME%" "%SCEN_VERS%" %SCEN_CTX%

set RC=%ERRORLEVEL%
echo Code Retour : %RC%
popd

echo.
echo ***** Envoi notification mail DADP (RC=%RC%)

powershell -NoProfile -ExecutionPolicy Bypass ^
  -File "%PROCLIB%\PRODUCTION\Send-MailHTML.ps1" ^
  -Config "%DADP_CONFIG%" ^
  -Subject "Chargement données partenaires" ^
  -Source  "%DADP_CSV%" ^
  -RC      %RC%

echo [DADP] Notification terminée (code=%ERRORLEVEL%)
exit /B %ERRORLEVEL%
