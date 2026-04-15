@echo off
REM CDE Team Toolkit — Setup Verification (Windows)
REM Checks that everything is properly configured after Quick Start.
REM
REM Usage:
REM   starter\verify-setup.bat

setlocal enabledelayedexpansion
set PASS=0
set FAIL=0
set WARN=0

echo.
echo === CDE Toolkit Setup Verification ===
echo.

REM --- Check 1: Node.js ---
where node >nul 2>nul
if %ERRORLEVEL%==0 (
    for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
    echo [PASS] Node.js installed (!NODE_VER!)
    set /a PASS+=1
) else (
    echo [FAIL] Node.js not found — required for hooks and MCP servers
    set /a FAIL+=1
)

REM --- Check 2: Claude Code CLI ---
where claude >nul 2>nul
if %ERRORLEVEL%==0 (
    echo [PASS] Claude Code CLI installed
    set /a PASS+=1
) else (
    echo [WARN] Claude Code CLI not found — OK if using Desktop App or VS Code only
    set /a WARN+=1
)

REM --- Check 3: CLAUDE.md ---
if exist "%USERPROFILE%\.claude\CLAUDE.md" (
    findstr /c:"Core Digital Expansion" "%USERPROFILE%\.claude\CLAUDE.md" >nul 2>nul
    if !ERRORLEVEL!==0 (
        echo [PASS] CLAUDE.md found with CDE configuration
        set /a PASS+=1
    ) else (
        echo [WARN] CLAUDE.md exists but doesn't contain CDE config
        set /a WARN+=1
    )
) else (
    echo [FAIL] CLAUDE.md not found
    echo        Run: copy cde-claude-toolkit\starter\CLAUDE.md %USERPROFILE%\.claude\CLAUDE.md
    set /a FAIL+=1
)

REM --- Check 4: Safety hooks ---
set HOOKS_OK=1
if not exist "%USERPROFILE%\.claude\hooks\check-system-commands.js" (
    echo        Missing: check-system-commands.js
    set HOOKS_OK=0
)
if not exist "%USERPROFILE%\.claude\hooks\check-file-edits.js" (
    echo        Missing: check-file-edits.js
    set HOOKS_OK=0
)
if !HOOKS_OK!==1 (
    echo [PASS] Safety hooks installed (both files present^)
    set /a PASS+=1
) else (
    echo [FAIL] Safety hooks missing
    echo        Run: starter\hooks\install-hooks.bat
    set /a FAIL+=1
)

REM --- Check 5: Hooks in settings.json ---
if exist "%USERPROFILE%\.claude\settings.json" (
    findstr /c:"hooks" "%USERPROFILE%\.claude\settings.json" >nul 2>nul
    if !ERRORLEVEL!==0 (
        echo [PASS] Hooks configured in settings.json
        set /a PASS+=1
    ) else (
        echo [FAIL] settings.json exists but no hooks configured
        set /a FAIL+=1
    )
) else (
    echo [FAIL] settings.json not found
    echo        Run the hook installer: starter\hooks\install-hooks.bat
    set /a FAIL+=1
)

REM --- Check 6: MCP servers ---
set MCP_COUNT=0
if exist "%USERPROFILE%\.claude.json" (
    findstr /c:"playwright" "%USERPROFILE%\.claude.json" >nul 2>nul && set /a MCP_COUNT+=1
    findstr /c:"supadata" "%USERPROFILE%\.claude.json" >nul 2>nul && set /a MCP_COUNT+=1
    findstr /c:"stitch" "%USERPROFILE%\.claude.json" >nul 2>nul && set /a MCP_COUNT+=1
)
if !MCP_COUNT! GEQ 3 (
    echo [PASS] Core MCP servers configured (!MCP_COUNT! found^)
    set /a PASS+=1
) else if !MCP_COUNT! GEQ 1 (
    echo [WARN] Some MCP servers configured (!MCP_COUNT! found, expected 3+^)
    echo        Run: starter\setup-mcp.bat
    set /a WARN+=1
) else (
    echo [FAIL] No MCP servers found
    echo        Run: starter\setup-mcp.bat
    set /a FAIL+=1
)

REM --- Summary ---
echo.
echo === Results ===
echo   PASS: !PASS!
echo   WARN: !WARN!
echo   FAIL: !FAIL!
echo.
if !FAIL!==0 (
    echo All clear! Your CDE toolkit setup is complete.
) else (
    echo Fix the failures above and run this script again.
)
echo.
pause
