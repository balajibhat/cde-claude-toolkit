@echo off
REM CDE Team Toolkit — Hook Installer (Windows)
REM Run this from the cde-claude-toolkit directory after cloning the repo
REM
REM What it does:
REM   1. Creates %USERPROFILE%\.claude\hooks\ if it doesn't exist
REM   2. Copies the two guard scripts into %USERPROFILE%\.claude\hooks\
REM   3. Shows you what to add to settings.json
REM
REM Usage:
REM   starter\hooks\install-hooks.bat

echo.
echo === CDE Safety Hooks Installer (Windows) ===
echo.

set HOOKS_DIR=%USERPROFILE%\.claude\hooks
set SCRIPT_DIR=%~dp0

REM Step 1: Create hooks directory
if not exist "%HOOKS_DIR%" (
    mkdir "%HOOKS_DIR%"
    echo [OK] Created %HOOKS_DIR%
) else (
    echo [OK] %HOOKS_DIR% already exists
)

REM Step 2: Copy hook scripts
copy /Y "%SCRIPT_DIR%check-system-commands.js" "%HOOKS_DIR%\check-system-commands.js" >nul
echo [OK] Copied check-system-commands.js

copy /Y "%SCRIPT_DIR%check-file-edits.js" "%HOOKS_DIR%\check-file-edits.js" >nul
echo [OK] Copied check-file-edits.js

echo.

REM Step 3: Check settings.json
set SETTINGS_FILE=%USERPROFILE%\.claude\settings.json

if exist "%SETTINGS_FILE%" (
    echo Your settings file exists at: %SETTINGS_FILE%
    echo.
    echo [ACTION NEEDED] Add the hooks config from settings-hooks.json to your settings.json
    echo Reference file: %SCRIPT_DIR%settings-hooks.json
) else (
    echo [INFO] No settings.json found. Creating one with hooks configuration...
    copy /Y "%SCRIPT_DIR%settings-hooks.json" "%SETTINGS_FILE%" >nul
    echo [OK] Created settings.json with hooks configuration.
)

echo.
echo === Verify ===
echo Open Claude Code and run any bash command.
echo You should see "Checking for dangerous commands..." in the status.
echo.
echo Done!
pause
