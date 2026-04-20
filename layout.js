// CDE Team Toolkit — Layout Engine
// Injects sidebar navigation into every page

const NAV = [
  { section: 'Start Here' },
  { label: 'Home', icon: '\u2302', href: 'index.html', id: 'home' },
  { label: 'What Is This?', icon: '\u2139', href: 'pages/what-is-this.html', id: 'what-is-this' },
  { label: 'Quick Start', icon: '\u26A1', href: 'pages/quick-start.html', id: 'quick-start' },
  { label: 'Day 1 Workflows', icon: '\u25B6', href: 'pages/workflows.html', id: 'workflows' },

  { section: 'Setup Guides' },
  { label: 'Installing Claude Code', icon: '\u2193', href: 'pages/installing.html', id: 'installing' },
  { label: 'MCP Servers', icon: '\u2699', href: 'pages/mcp-servers.html', id: 'mcp-servers' },
  { label: 'Authentication', icon: '\u26BF', href: 'pages/authentication.html', id: 'authentication' },

  { section: 'How It Works' },
  { label: 'Architecture', icon: '\u25CE', href: 'pages/architecture.html', id: 'architecture' },
  { label: 'Agents', icon: '\u2604', href: 'pages/agents.html', id: 'agents' },
  { label: 'Hooks & Safety', icon: '\u26D4', href: 'pages/hooks-safety.html', id: 'hooks-safety' },

  { section: 'Protocols' },
  { label: 'Proposal Template', icon: '\u2630', href: 'pages/proposal-protocol.html', id: 'proposal-protocol' },
  { label: 'Shopping Feeds', icon: '\u26C1', href: 'pages/shopping-feed-protocol.html', id: 'shopping-feed-protocol' },
  { label: 'Writing Standards', icon: '\u270E', href: 'pages/writing-standards.html', id: 'writing-standards' },
  { label: 'Knowledge Routing', icon: '\u2B95', href: 'pages/knowledge-routing.html', id: 'knowledge-routing' },

  { section: 'Reference' },
  { label: 'Security Policy', icon: '\u26A0', href: 'pages/security.html', id: 'security' },
  { label: 'Costs & Billing', icon: '\u0024', href: 'pages/costs.html', id: 'costs' },
  { label: 'Troubleshooting', icon: '\u2699', href: 'pages/troubleshooting.html', id: 'troubleshooting' },
];

function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../';
  return '';
}

function buildSidebar(activeId) {
  const base = getBasePath();
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';

  let html = `
    <div class="sidebar-brand">
      <h1>Core Digital Expansion</h1>
      <div class="badge">Team Toolkit</div>
    </div>
    <nav>
  `;

  let sectionOpen = false;
  for (const item of NAV) {
    if (item.section) {
      if (sectionOpen) html += `</div>`;
      html += `<div class="nav-section"><div class="nav-section-label">${item.section}</div>`;
      sectionOpen = true;
      continue;
    }
    const isActive = item.id === activeId;
    const href = base + item.href;
    html += `<a class="nav-link${isActive ? ' active' : ''}" href="${href}">
      <span class="nav-icon">${item.icon}</span>
      ${item.label}
    </a>`;
  }

  if (sectionOpen) html += `</div>`;
  html += `</nav>`;
  html += `
    <div style="padding: 16px 20px; border-top: 1px solid var(--border); margin-top: auto;">
      <button onclick="downloadPDF()" style="
        width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px;
        background: var(--card); color: var(--text); font-size: 12px; font-weight: 600;
        cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
        transition: all 0.15s ease;
      " onmouseover="this.style.background='#1e2130';this.style.borderColor='var(--cyan)'"
         onmouseout="this.style.background='var(--card)';this.style.borderColor='var(--border)'">
        <span style="font-size: 14px;">\u2913</span> Download PDF
      </button>
    </div>
  `;
  sidebar.innerHTML = html;
  return sidebar;
}

function buildMobileHeader() {
  const header = document.createElement('div');
  header.className = 'mobile-header';
  header.innerHTML = `
    <h1>CDE Toolkit</h1>
    <button class="menu-btn" onclick="document.getElementById('sidebar').classList.toggle('open')">Menu</button>
  `;
  return header;
}

function initLayout(activeId) {
  const body = document.body;
  const content = body.innerHTML;

  body.innerHTML = '';
  const layout = document.createElement('div');
  layout.className = 'layout';

  layout.appendChild(buildMobileHeader());
  layout.appendChild(buildSidebar(activeId));

  const main = document.createElement('main');
  main.className = 'main';
  main.innerHTML = content;
  layout.appendChild(main);

  body.appendChild(layout);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

// Download all pages as a single PDF via browser print
async function downloadPDF() {
  const btn = document.querySelector('[onclick="downloadPDF()"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span style="font-size:14px;">&#8987;</span> Building PDF...';
  btn.disabled = true;

  const base = getBasePath();
  const pages = NAV.filter(item => item.href);

  try {
    const sections = [];
    for (const page of pages) {
      const url = base + page.href;
      const resp = await fetch(url);
      const html = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const content = doc.body.innerHTML
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<link[\s\S]*?>/gi, '');
      sections.push({ title: page.label, content });
    }

    const brandTitle = document.querySelector('.sidebar-brand h1')?.textContent || 'Playbook';
    const brandBadge = document.querySelector('.sidebar-brand .badge')?.textContent || '';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<!DOCTYPE html>
<html><head>
<title>${brandTitle} — ${brandBadge}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: #1a1a1a; line-height: 1.6; padding: 40px; }
  .pdf-section { page-break-before: always; padding: 20px 0; }
  .pdf-section:first-child { page-break-before: avoid; }
  .page-header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .page-header .page-desc, .page-header p { font-size: 12px; color: #666; margin-bottom: 16px; }
  h2 { font-size: 17px; font-weight: 600; margin: 24px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
  h3 { font-size: 14px; font-weight: 600; margin: 16px 0 6px; }
  p, li, td { font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
  th, td { padding: 6px 10px; border: 1px solid #ddd; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  tr:nth-child(even) { background: #fafafa; }
  .note, .note.warn, .note.green { padding: 10px 14px; border-left: 3px solid #3b82f6; background: #f0f7ff; margin: 12px 0; font-size: 11px; border-radius: 4px; }
  .note.warn { border-left-color: #f59e0b; background: #fffbeb; }
  .note.green { border-left-color: #22c55e; background: #f0fdf4; }
  .note.red { border-left-color: #ef4444; background: #fef2f2; }
  .kpi-grid, .bucket-grid, .naming-grid, .page-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
  .kpi-card, .page-card { border: 1px solid #ddd; border-radius: 6px; padding: 12px; }
  .kpi-label { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #666; }
  .kpi-value { font-size: 14px; font-weight: 700; margin-top: 2px; }
  code { font-family: monospace; font-size: 11px; background: #f0f0f0; padding: 1px 4px; border-radius: 3px; }
  .code-block { font-family: monospace; font-size: 11px; background: #f5f5f5; padding: 12px; border-radius: 6px; margin: 8px 0; white-space: pre-wrap; }
  .logic-box { border: 1px solid #ddd; border-radius: 6px; padding: 12px; margin: 12px 0; overflow-x: auto; }
  .mockup { border: 1px solid #ddd; border-radius: 6px; padding: 16px; margin: 12px 0; }
  .mockup-header { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  .priority { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
  .bold { font-weight: 600; }
  .section { margin: 24px 0; }
  .section-desc { font-size: 12px; color: #666; margin-bottom: 12px; }
  .footer, .page-grid, .card-icon, .card-tag, .step-list { display: block; }
  .step-list { padding-left: 20px; }
  .step-list li { margin-bottom: 8px; }
  ul, ol { padding-left: 20px; margin: 8px 0; }
  li { margin-bottom: 4px; }
  a { color: #2563eb; }
  .pdf-cover { text-align: center; padding: 120px 40px; }
  .pdf-cover h1 { font-size: 32px; margin-bottom: 8px; }
  .pdf-cover p { font-size: 14px; color: #666; }
  @media print {
    body { padding: 20px; }
    .pdf-section { page-break-before: always; }
    .pdf-section:first-child { page-break-before: avoid; }
  }
</style>
</head><body>
<div class="pdf-cover">
  <h1>${brandTitle}</h1>
  <p>${brandBadge}</p>
  <p style="margin-top: 24px; font-size: 12px; color: #999;">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
</div>
${sections.map(s => `<div class="pdf-section">${s.content}</div>`).join('\n')}
</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 800);
  } catch (err) {
    alert('PDF generation failed: ' + err.message);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}
