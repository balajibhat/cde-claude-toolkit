// CDE Team Toolkit — File Edit Guard
// PreToolUse hook: blocks edits to sensitive files
// Targets: Edit, Write tools
// Returns "deny" for critical files, "ask" for borderline cases

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = (data.tool_input && (data.tool_input.file_path || data.tool_input.path || ''));
    const normalized = filePath.toLowerCase().replace(/\\/g, '/');

    // === HARD DENY: credentials and secrets ===
    const denyPatterns = [
      // Credential files
      /\/credentials\//,
      /\/\.env($|\.)/,
      /\.env\.local/,
      /\.env\.production/,
      /\.env\.development/,
      /credentials\.json/,
      /client_secret.*\.json/,
      /oauth.*\.json/,
      /\.gdrive-server-credentials/,
      /gcp-oauth\.keys/,
      /api[_-]key/,
      /secret.*\.txt/,
      /token.*\.txt/,
      // Claude security infrastructure
      /\.claude\/hooks\//,
      /\.claude\/settings\.json/,
      /\.claude\/settings\.local\.json/,
      // Windows system files
      /\/windows\//,
      /\/system32\//,
      /\/syswow64\//,
      /\/program files\//,
      /\/programdata\//,
    ];

    for (const pattern of denyPatterns) {
      if (pattern.test(normalized)) {
        console.log(JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: `SECURITY: Editing this file is blocked. Path matches protected pattern: ${pattern.source}`
          }
        }));
        process.exit(0);
      }
    }

    // === ASK: sensitive but sometimes legitimate ===
    const askPatterns = [
      { pattern: /\/\.claude\//, reason: "Claude configuration directory" },
      { pattern: /\.pem$/, reason: "certificate/key file" },
      { pattern: /\.key$/, reason: "key file" },
      { pattern: /\.p12$/, reason: "certificate store" },
      { pattern: /id_rsa/, reason: "SSH private key" },
      { pattern: /id_ed25519/, reason: "SSH private key" },
      { pattern: /known_hosts/, reason: "SSH known hosts" },
      { pattern: /\.ssh\//, reason: "SSH directory" },
      { pattern: /\.gitconfig/, reason: "git configuration" },
      { pattern: /\.npmrc/, reason: "npm config (may contain tokens)" },
    ];

    for (const { pattern, reason } of askPatterns) {
      if (pattern.test(normalized)) {
        console.log(JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "ask",
            permissionDecisionReason: `SECURITY: This is a ${reason}. Please confirm this edit is intentional.`
          }
        }));
        process.exit(0);
      }
    }

    // Safe - allow
    process.exit(0);
  } catch (e) {
    // Parse error - allow through
    process.exit(0);
  }
});
