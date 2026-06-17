REM *********** HORS MAESTRO ******************************************************
@call e:\dsi\exploit\parmlib\Chemin.bat
REM *********** HORS MAESTRO ******************************************************

@echo off

SET RC=0
SET SCEN_NAME=IMR_DADP_CHARGE_IMAGE
SET SCEN_VERS=0_5
SET SCEN_CTX=CTX_DEV

REM --- Chemins (adapter selon l'environnement) ---
SET PROCLIB=C:\proclib
SET DADP_CONFIG=%PROCLIB%\CL\DADP\config-dadp.json
SET DADP_REF=%PROCLIB%\CL\DADP\expediteurs-ref.json
SET DADP_CSV=<CHEMIN_CSV_PRODUIT_PAR_ODI>\DADP_STOCK_EVOL_MAIL.csv

SET SMTP_SERVER=<ADRESSE_SERVEUR_SMTP>
SET DADP_TEMPLATE_PATH=%PROCLIB%\CL\DADP\template-dadp.html


pushd "X:\Oracle\ODI12c\user_projects\domains\base_domain\bin"

echo ***** Lancement Scenario ODI : %SCEN_NAME% v%SCEN_VERS%
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
echo [DADP] Erreur ODI - code %RC% - aucun mail envoye
exit /B 1

:FIN
echo.
echo ***** Envoi notification mail DADP
if not exist "%DADP_CSV%" (
    echo [ERREUR] Fichier CSV introuvable : %DADP_CSV%
    echo          Le job ODI doit produire ce fichier avant la fin du traitement.
    exit /B 1
)
powershell -NoProfile -ExecutionPolicy Bypass ^
  -File "%PROCLIB%\CL\PRODUCTION\Generer-Rupture.ps1" ^
  -Source "%DADP_CSV%" ^
  -ColonneRupture "Expediteur" ^
  -ReferenceFile "%DADP_REF%" ^
  -ColonneStatut "Statut" ^
  -ColonneFrequence "Frequence" ^
  -ExclureColonnes "Statut","Frequence" ^
  -ConfigFile "%DADP_CONFIG%" ^
  -NomJob "DADP - Chargement donnees partenaires" ^
  -Status OK
echo [DADP] Notification terminee (code=%ERRORLEVEL%)
exit /B %ERRORLEVEL%
