#!/bin/bash
# CDE Team Toolkit — Setup Verification
# Checks that everything is properly configured after Quick Start.
#
# Usage:
#   bash starter/verify-setup.sh

PASS=0
FAIL=0
WARN=0

echo ""
echo "=== CDE Toolkit Setup Verification ==="
echo ""

# --- Check 1: Node.js ---
if command -v node &>/dev/null; then
  NODE_VER=$(node --version)
  echo "[PASS] Node.js installed ($NODE_VER)"
  ((PASS++))
else
  echo "[FAIL] Node.js not found — required for hooks and MCP servers"
  ((FAIL++))
fi

# --- Check 2: Claude Code CLI ---
if command -v claude &>/dev/null; then
  CLAUDE_VER=$(claude --version 2>/dev/null || echo "unknown")
  echo "[PASS] Claude Code CLI installed ($CLAUDE_VER)"
  ((PASS++))
else
  echo "[WARN] Claude Code CLI not found — OK if using Desktop App or VS Code only"
  ((WARN++))
fi

# --- Check 3: CLAUDE.md ---
CLAUDE_MD="$HOME/.claude/CLAUDE.md"
if [ -f "$CLAUDE_MD" ]; then
  if grep -q "Core Digital Expansion" "$CLAUDE_MD" 2>/dev/null; then
    echo "[PASS] CLAUDE.md found with CDE configuration"
    ((PASS++))
  else
    echo "[WARN] CLAUDE.md exists but doesn't contain CDE config — may be personal config"
    ((WARN++))
  fi
else
  echo "[FAIL] CLAUDE.md not found at $CLAUDE_MD"
  echo "       Run: cp cde-claude-toolkit/starter/CLAUDE.md ~/.claude/CLAUDE.md"
  ((FAIL++))
fi

# --- Check 4: Safety hooks ---
HOOKS_DIR="$HOME/.claude/hooks"
HOOK1="$HOOKS_DIR/check-system-commands.js"
HOOK2="$HOOKS_DIR/check-file-edits.js"

if [ -f "$HOOK1" ] && [ -f "$HOOK2" ]; then
  echo "[PASS] Safety hooks installed (both files present)"
  ((PASS++))
else
  echo "[FAIL] Safety hooks missing"
  [ ! -f "$HOOK1" ] && echo "       Missing: check-system-commands.js"
  [ ! -f "$HOOK2" ] && echo "       Missing: check-file-edits.js"
  echo "       Run: bash starter/hooks/install-hooks.sh"
  ((FAIL++))
fi

# --- Check 5: Hooks configured in settings.json ---
SETTINGS="$HOME/.claude/settings.json"
if [ -f "$SETTINGS" ]; then
  if grep -q '"hooks"' "$SETTINGS" 2>/dev/null; then
    echo "[PASS] Hooks configured in settings.json"
    ((PASS++))
  else
    echo "[FAIL] settings.json exists but no hooks configured"
    echo "       Merge starter/hooks/settings-hooks.json into your settings.json"
    ((FAIL++))
  fi
else
  echo "[FAIL] settings.json not found at $SETTINGS"
  echo "       Run the hook installer: bash starter/hooks/install-hooks.sh"
  ((FAIL++))
fi

# --- Check 6: MCP servers ---
CLAUDE_JSON="$HOME/.claude.json"
MCP_COUNT=0
if [ -f "$CLAUDE_JSON" ]; then
  # Count MCP server entries
  if grep -q "playwright" "$CLAUDE_JSON" 2>/dev/null; then ((MCP_COUNT++)); fi
  if grep -q "supadata" "$CLAUDE_JSON" 2>/dev/null; then ((MCP_COUNT++)); fi
  if grep -q "stitch" "$CLAUDE_JSON" 2>/dev/null; then ((MCP_COUNT++)); fi
fi

# Also check settings.json for mcpServers
if [ -f "$SETTINGS" ]; then
  if grep -q "playwright" "$SETTINGS" 2>/dev/null; then ((MCP_COUNT++)); fi
fi

if [ "$MCP_COUNT" -ge 3 ]; then
  echo "[PASS] Core MCP servers configured ($MCP_COUNT found)"
  ((PASS++))
elif [ "$MCP_COUNT" -ge 1 ]; then
  echo "[WARN] Some MCP servers configured ($MCP_COUNT found, expected 3+)"
  echo "       Run: bash starter/setup-mcp.sh"
  ((WARN++))
else
  echo "[FAIL] No MCP servers found"
  echo "       Run: bash starter/setup-mcp.sh"
  ((FAIL++))
fi

# --- Summary ---
echo ""
echo "=== Results ==="
echo "  PASS: $PASS"
echo "  WARN: $WARN"
echo "  FAIL: $FAIL"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo "All clear! Your CDE toolkit setup is complete."
else
  echo "Fix the failures above and run this script again."
fi
echo ""
