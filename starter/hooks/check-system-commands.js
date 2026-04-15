// CDE Team Toolkit — Bash Command Guard
// PreToolUse hook: blocks dangerous system commands and destructive operations
// Returns "deny" for catastrophic actions, "ask" for risky ones
//
// Origin: March 2026 incident where unsupervised system commands bricked Windows
//
// Layer 1: Windows system tools (reg, dism, sfc, etc.)
// Layer 2: Destructive file operations (rm -rf, del /s, etc.)
// Layer 3: Credential/secret exfiltration (cat/type on sensitive files)
// Layer 4: Remote code execution patterns (curl|bash, etc.)
// Layer 5: Git destructive operations (force push, hard reset)

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const cmd = (data.tool_input && data.tool_input.command) || '';
    const cmdLower = cmd.toLowerCase();

    // Helper: deny with reason
    function deny(reason) {
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: reason
        }
      }));
      process.exit(0);
    }

    // Helper: ask with reason
    function ask(reason) {
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "ask",
          permissionDecisionReason: reason
        }
      }));
      process.exit(0);
    }

    // ============================================================
    // LAYER 1: Windows system tools (HARD DENY)
    // ============================================================
    const dangerousTools = [
      'reg ', 'reg.exe', 'regedit', 'dism ', 'dism.exe',
      'pnputil', 'bcdedit', 'sfc ', 'sfc.exe',
      'takeown', 'icacls', 'shutdown', 'restart-computer',
      'wmic', 'devcon', 'format ', 'diskpart', 'chkdsk /f',
      'bootrec', 'bcdboot'
    ];

    for (const tool of dangerousTools) {
      if (cmdLower.includes(tool)) {
        deny(`SYSTEM SAFETY: Command contains "${tool.trim()}" which can damage Windows. BLOCKED.`);
      }
    }

    // net stop/start
    if (/\bnet\s+(stop|start)\b/i.test(cmd)) {
      deny("SYSTEM SAFETY: 'net stop/start' can disable critical Windows services. BLOCKED.");
    }

    // sc delete/stop/config/create
    if (/(?:^|\s|[/\\])sc(?:\.exe)?\s+(delete|stop|config|create)\b/i.test(cmd)) {
      deny("SYSTEM SAFETY: 'sc' service control command can break Windows services. BLOCKED.");
    }

    // Commands targeting System32
    if (/C:\\Windows\\System32|\/c\/Windows\/System32|C:\/Windows\/System32/i.test(cmd)) {
      deny("SYSTEM SAFETY: This command targets Windows\\System32. BLOCKED.");
    }

    // PowerShell registry modification
    if (/powershell.*(?:Set-ItemProperty|Remove-ItemProperty|New-ItemProperty).*HKLM/i.test(cmd)) {
      deny("SYSTEM SAFETY: PowerShell registry modification (HKLM). BLOCKED.");
    }

    // ============================================================
    // LAYER 2: Destructive file operations
    // ============================================================

    // rm -rf on broad/critical directories (HARD DENY)
    const protectedDirs = [
      /rm\s+(-[a-z]*r[a-z]*f|(-[a-z]*f[a-z]*r))\s+.*?(\/c\/users|~|\/home|\$home|\/documents|\/desktop|\/downloads|\/appdata)/i,
      /rm\s+(-[a-z]*r[a-z]*f|(-[a-z]*f[a-z]*r))\s+["\s]*[\/~]/i, // rm -rf / or rm -rf ~
      /rmdir\s+\/s.*?(users|documents|desktop|downloads|appdata)/i,
      /del\s+\/s.*?(users|documents|desktop|downloads|appdata)/i,
    ];

    for (const pattern of protectedDirs) {
      if (pattern.test(cmdLower)) {
        deny("DESTRUCTIVE: Recursive delete targeting a critical user directory. BLOCKED.");
      }
    }

    // rm -rf on credentials or Claude config
    if (/rm\s+.*(-r|-f|--force).*?(credentials|\.claude|\.env|\.ssh)/i.test(cmd)) {
      deny("DESTRUCTIVE: Attempting to delete security-critical files. BLOCKED.");
    }

    // Windows del/erase on credential files
    if (/(?:del|erase)\s+.*?(credentials|\.env|secret|token|api[_-]key|oauth)/i.test(cmd)) {
      deny("DESTRUCTIVE: Attempting to delete credential/secret files. BLOCKED.");
    }

    // Any rm -rf gets an ask (even on less critical paths)
    if (/rm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)\b/i.test(cmd)) {
      ask("CAUTION: Recursive force-delete detected. Please confirm the target path is correct.");
    }

    // ============================================================
    // LAYER 3: Credential/secret exfiltration
    // ============================================================

    // Reading credential files via bash (cat, type, head, etc.)
    if (/(?:cat|type|head|tail|more|less)\s+.*?(credentials|api[_-]key|secret.*\.txt|token.*\.txt|\.env|oauth.*\.json|client_secret)/i.test(cmd)) {
      ask("SECURITY: Command reads a file that may contain secrets. Confirm this is intentional.");
    }

    // Piping secrets to network commands
    if (/(?:credentials|secret|token|api[_-]key|\.env).*?\|\s*(?:curl|wget|nc|ncat)/i.test(cmd)) {
      deny("SECURITY: Piping credential data to a network command. BLOCKED.");
    }

    // Outputting env vars with secrets to files or network
    if (/(?:echo|printf).*?\$(?:.*(?:KEY|SECRET|TOKEN|PASSWORD)).*?(?:>|curl|wget)/i.test(cmd)) {
      deny("SECURITY: Exfiltrating environment variable secrets. BLOCKED.");
    }

    // ============================================================
    // LAYER 4: Remote code execution patterns
    // ============================================================

    // curl/wget piped to sh/bash/node/python
    if (/(?:curl|wget)\s+.*?\|\s*(?:bash|sh|node|python|powershell)/i.test(cmd)) {
      deny("SECURITY: Downloading and executing remote code. BLOCKED.");
    }

    // eval with remote content
    if (/eval\s*.*?\$\(.*?(?:curl|wget)/i.test(cmd)) {
      deny("SECURITY: eval with remote content. BLOCKED.");
    }

    // ============================================================
    // LAYER 5: Git destructive operations (ASK)
    // ============================================================

    if (/git\s+push\s+.*--force(?!-with-lease)/i.test(cmd)) {
      ask("GIT SAFETY: Force push detected (not --force-with-lease). This can overwrite remote history.");
    }

    if (/git\s+reset\s+--hard/i.test(cmd)) {
      ask("GIT SAFETY: Hard reset discards uncommitted changes. Confirm this is intentional.");
    }

    if (/git\s+clean\s+-[a-z]*f/i.test(cmd)) {
      ask("GIT SAFETY: git clean -f permanently deletes untracked files.");
    }

    // Safe - allow
    process.exit(0);
  } catch (e) {
    // Parse error - allow through, don't block normal operation
    process.exit(0);
  }
});
