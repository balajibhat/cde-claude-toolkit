#!/bin/bash
# CDE Team Toolkit — Hook Installer
# Run this from the cde-claude-toolkit directory after cloning the repo
#
# What it does:
#   1. Creates ~/.claude/hooks/ if it doesn't exist
#   2. Copies the two guard scripts into ~/.claude/hooks/
#   3. Shows you what to add to settings.json (you merge it manually)
#
# Usage:
#   bash starter/hooks/install-hooks.sh

set -e

HOOKS_DIR="$HOME/.claude/hooks"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "=== CDE Safety Hooks Installer ==="
echo ""

# Step 1: Create hooks directory
if [ ! -d "$HOOKS_DIR" ]; then
  mkdir -p "$HOOKS_DIR"
  echo "[OK] Created $HOOKS_DIR"
else
  echo "[OK] $HOOKS_DIR already exists"
fi

# Step 2: Copy hook scripts
cp "$SCRIPT_DIR/check-system-commands.js" "$HOOKS_DIR/check-system-commands.js"
echo "[OK] Copied check-system-commands.js"

cp "$SCRIPT_DIR/check-file-edits.js" "$HOOKS_DIR/check-file-edits.js"
echo "[OK] Copied check-file-edits.js"

# Step 3: Check if settings.json exists and guide the user
SETTINGS_FILE="$HOME/.claude/settings.json"

echo ""
if [ -f "$SETTINGS_FILE" ]; then
  echo "Your settings file exists at: $SETTINGS_FILE"
  echo ""

  # Check if hooks are already configured
  if grep -q '"hooks"' "$SETTINGS_FILE" 2>/dev/null; then
    echo "[WARN] Your settings.json already has a 'hooks' section."
    echo "       Please manually verify it matches the config below."
  else
    echo "[ACTION NEEDED] Add the hooks config to your settings.json."
  fi
else
  echo "[INFO] No settings.json found at $SETTINGS_FILE"
  echo "       Creating one with the hooks configuration..."

  cat > "$SETTINGS_FILE" << 'SETTINGS'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOME/.claude/hooks/check-system-commands.js\"",
            "timeout": 5,
            "statusMessage": "Checking for dangerous commands..."
          }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOME/.claude/hooks/check-file-edits.js\"",
            "timeout": 5,
            "statusMessage": "Checking file edit safety..."
          }
        ]
      }
    ]
  }
}
SETTINGS
  echo "[OK] Created settings.json with hooks configuration."
fi

echo ""
echo "=== Hook configuration to add to settings.json ==="
echo ""
cat "$SCRIPT_DIR/settings-hooks.json"
echo ""
echo ""
echo "=== Verify ==="
echo "Open Claude Code and run any bash command."
echo "You should see 'Checking for dangerous commands...' in the status."
echo ""
echo "Done!"
