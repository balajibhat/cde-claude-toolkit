@echo off
REM CDE Team Toolkit — MCP Server Setup (Windows)
REM Adds the core MCP servers that every team member should have.
REM
REM Usage:
REM   starter\setup-mcp.bat

echo.
echo === CDE MCP Server Setup ===
echo.

REM --- TIER 1: Zero-config servers ---

echo [1/3] Adding Playwright (browser automation)...
claude mcp add playwright -- npx @playwright/mcp@latest 2>nul
if %ERRORLEVEL%==0 (echo   [OK] Playwright added) else (echo   [SKIP] Playwright already configured or error)

echo [2/3] Adding Supadata (transcripts + scraping)...
claude mcp add supadata -- npx -y @supadata/mcp 2>nul
if %ERRORLEVEL%==0 (echo   [OK] Supadata added) else (echo   [SKIP] Supadata already configured or error)

echo [3/3] Adding Stitch (UI design)...
claude mcp add stitch -- npx -y @_davideast/stitch-mcp proxy 2>nul
if %ERRORLEVEL%==0 (echo   [OK] Stitch added) else (echo   [SKIP] Stitch already configured or error)

echo.
echo === Zero-config servers done ===
echo.

REM --- TIER 2: API-key servers ---

set /p SETUP_NANOB="Do you want to set up Nano Banana (Gemini image generation)? [y/N] "
if /i "%SETUP_NANOB%"=="y" (
  claude mcp add nano-banana -- npx -y nano-banana-mcp 2>nul
  echo   [OK] Nano Banana added
  echo.
  echo   After setup, open Claude Code and run:
  echo     configure_gemini_token
  echo   to enter your Gemini API key.
  echo.
)

REM --- TIER 3: Complex setup ---

echo.
echo === Servers NOT auto-installed (require manual setup) ===
echo.
echo   Google Drive   - Requires OAuth. See: Authentication page in toolkit docs
echo   Google Ads     - Requires GCP project + developer token. See: MCP Servers page
echo   CDE Imagen     - Custom server. See: MCP Servers page
echo.

echo === Verify ===
echo Open Claude Code and ask:
echo   "What MCP servers do I have connected?"
echo.
echo You should see at least: playwright, supadata, stitch
echo.
pause
