// CDE Team Toolkit — Layout Engine
// Injects sidebar navigation into every page

const NAV = [
  { section: 'Start Here' },
  { label: 'Home', icon: '\u2302', href: 'index.html', id: 'home' },
  { label: 'What Is This?', icon: '\u2139', href: 'pages/what-is-this.html', id: 'what-is-this' },
  { label: 'Quick Start', icon: '\u26A1', href: 'pages/quick-start.html', id: 'quick-start' },

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
