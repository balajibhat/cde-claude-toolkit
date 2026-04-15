#!/bin/bash
# CDE Team Toolkit — MCP Server Setup
# Adds the core MCP servers that every team member should have.
#
# Usage:
#   bash starter/setup-mcp.sh
#
# What it does:
#   - Adds zero-config servers automatically (Playwright, Supadata, Stitch)
#   - Prompts for API keys for optional servers (Nano Banana)
#   - Skips servers that require complex setup (Google Drive, Google Ads)

set -e

echo ""
echo "=== CDE MCP Server Setup ==="
echo ""

# --- TIER 1: Zero-config servers (add automatically) ---

echo "[1/3] Adding Playwright (browser automation)..."
claude mcp add playwright -- npx @playwright/mcp@latest 2>/dev/null && echo "  [OK] Playwright added" || echo "  [SKIP] Playwright already configured or error"

echo "[2/3] Adding Supadata (transcripts + scraping)..."
claude mcp add supadata -- npx -y @supadata/mcp 2>/dev/null && echo "  [OK] Supadata added" || echo "  [SKIP] Supadata already configured or error"

echo "[3/3] Adding Stitch (UI design)..."
claude mcp add stitch -- npx -y @_davideast/stitch-mcp proxy 2>/dev/null && echo "  [OK] Stitch added" || echo "  [SKIP] Stitch already configured or error"

echo ""
echo "=== Zero-config servers done ==="
echo ""

# --- TIER 2: API-key servers (optional) ---

read -p "Do you want to set up Nano Banana (Gemini image generation)? [y/N] " SETUP_NANOB
if [[ "$SETUP_NANOB" =~ ^[Yy]$ ]]; then
  claude mcp add nano-banana -- npx -y nano-banana-mcp 2>/dev/null && echo "  [OK] Nano Banana added" || echo "  [SKIP] Nano Banana already configured or error"
  echo ""
  echo "  After setup, open Claude Code and run:"
  echo "    configure_gemini_token"
  echo "  to enter your Gemini API key."
  echo ""
fi

# --- TIER 3: Complex setup (guide only) ---

echo ""
echo "=== Servers NOT auto-installed (require manual setup) ==="
echo ""
echo "  Google Drive   — Requires OAuth. See: Authentication page in toolkit docs"
echo "  Google Ads     — Requires GCP project + developer token. See: MCP Servers page"
echo "  CDE Imagen     — Custom server. See: MCP Servers page"
echo ""

# --- Verify ---

echo "=== Verify ==="
echo "Open Claude Code and ask:"
echo '  "What MCP servers do I have connected?"'
echo ""
echo "You should see at least: playwright, supadata, stitch"
echo ""
echo "Done!"
