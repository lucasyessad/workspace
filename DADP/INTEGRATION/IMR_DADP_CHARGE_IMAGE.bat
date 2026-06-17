REM *********** HORS MAESTRO ******************************************************
@call e:\dsi\exploit\parmlib\Chemin.bat
REM *********** HORS MAESTRO ******************************************************

@echo off

SET RC=0
SET SCEN_NAME=IMR_DADP_CHARGE_IMAGE
SET SCEN_VERS=0_5
SET SCEN_CTX=CTX_DEV

REM --- Chemins notification mail ---
SET PROCLIB=C:\proclib
SET CONFIG=%PROCLIB%\config-dadp.json
SET DADP_CSV=<CHEMIN_CSV_PRODUIT_PAR_ODI>\DADP_STOCK_EVOL_MAIL.csv


pushd "X:\Oracle\ODI12c\user_projects\domains\base_domain\bin"

echo ***** Lancement Scenario ODI
echo.
call startscen "%SCEN_NAME%" "%SCEN_VERS%" %SCEN_CTX%

set RC=%ERRORLEVEL%
echo Code Retour : %RC%
popd

if .%RC%.==.-1. goto ERR_SCEN
echo %SCEN_NAME% : RC=%RC%

if %RC% NEQ 0 goto ERR
goto FIN


:ERR_SCEN
echo Scenario Error 7000

:ERR
echo Error %RC%
exit /B 1

:FIN
echo ***** Envoi notification mail DADP
if not exist "%DADP_CSV%" (
    echo [ERREUR] Fichier CSV introuvable : %DADP_CSV%
    exit /B 1
)
powershell -NoProfile -ExecutionPolicy Bypass ^
  -File "%PROCLIB%\Generer-Rupture.ps1" ^
  -Source "%DADP_CSV%" ^
  -ColonneRupture "Expediteur" ^
  -ConfigFile "%CONFIG%" ^
  -NomJob DADP_CHARGEMENT ^
  -Status OK
exit /B %ERRORLEVEL%
