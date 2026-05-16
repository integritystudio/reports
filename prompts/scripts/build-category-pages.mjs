#!/usr/bin/env node
// Generate individual static HTML pages, one per prompt category.
// Output: prompts/category/<slug>.html

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'category');

const CATEGORY_LABELS = {
  'image-visual': 'Image & Visual',
  'technology-ai': 'Technology & AI',
  'business-professional': 'Business & Professional',
  'multilingual': 'Multilingual',
  'education-teaching': 'Education & Teaching',
  'research-analysis': 'Research & Analysis',
  'writing-creative': 'Writing & Creative',
  'games-entertainment': 'Games & Entertainment',
  'social-media-marketing': 'Social Media & Marketing',
  'legal-finance': 'Legal & Finance',
  'personal-development': 'Personal Development',
  'lifestyle-home': 'Lifestyle & Home',
  'health-wellness': 'Health & Wellness',
  'roleplay-character': 'Role-Play & Characters',
  'role-play-character': 'Role-Play & Characters',
  'travel-culture': 'Travel & Culture',
  'language-translation': 'Language & Translation',
  'developer': 'Developer',
  'other': 'Other',
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const slugify = (s) => s.replace(/[^a-z0-9]/g, '-');

function loadCatalog() {
  const path = resolve(ROOT, 'metadata/catalog.json');
  return JSON.parse(readFileSync(path, 'utf8'));
}

function groupPrompts(catalog) {
  const groups = new Map();
  const dev = catalog.developer_prompts || [];
  groups.set('developer', dev.map((p) => ({ ...p, category: 'developer' })));

  const general = (catalog.general_prompts || {}).general || [];
  for (const p of general) {
    const cat = p.category || 'other';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(p);
  }
  return groups;
}

function renderCard(prompt) {
  const label = CATEGORY_LABELS[prompt.category] || prompt.category;
  const contributor = prompt.contributor
    ? `<p class="prompt-meta">by ${esc(prompt.contributor)}</p>`
    : '';
  const file = prompt.file || '';
  const link = file
    ? `<a class="prompt-link" href="../prompt.html?file=${encodeURIComponent(file)}">
        View prompt
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>`
    : '';

  return `      <article class="prompt-card" role="listitem" data-title="${esc((prompt.title || '').toLowerCase())}">
        <span class="prompt-cat-badge">${esc(label)}</span>
        <p class="prompt-title">${esc(prompt.title || '')}</p>
        ${contributor}
        ${link}
      </article>`;
}

function renderSidebar(groups, activeSlug) {
  const total = Array.from(groups.values()).reduce((n, arr) => n + arr.length, 0);
  const devCount = (groups.get('developer') || []).length;

  const allClass = activeSlug === 'all' ? ' active' : '';
  const devClass = activeSlug === 'developer' ? ' active' : '';

  const browseSection = `      <div class="sidebar-section">
        <div class="sidebar-label">Browse</div>
        <a class="cat-btn${allClass}" href="../index.html">
          All Prompts
          <span class="cat-count">${total}</span>
        </a>
        <a class="cat-btn${devClass}" href="developer.html">
          Developer
          <span class="cat-count">${devCount}</span>
        </a>
      </div>`;

  const generalEntries = Array.from(groups.entries())
    .filter(([slug]) => slug !== 'developer')
    .sort((a, b) => b[1].length - a[1].length);

  const generalLinks = generalEntries
    .map(([slug, items]) => {
      const label = CATEGORY_LABELS[slug] || slug;
      const cls = slug === activeSlug ? ' active' : '';
      return `        <a class="cat-btn${cls}" href="${slug}.html">${esc(label)}<span class="cat-count">${items.length}</span></a>`;
    })
    .join('\n');

  return `${browseSection}
      <div class="sidebar-section">
        <div class="sidebar-label">General</div>
${generalLinks}
      </div>`;
}

function renderPage({ slug, label, prompts, groups }) {
  const cards = prompts.map(renderCard).join('\n');
  const sidebar = renderSidebar(groups, slug);
  const count = prompts.length;

  return `<!DOCTYPE html>
<html lang="en" data-brand="hub">
<head>
  <script src="../../js/gtag.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(label)} Prompts — AI Prompt Library</title>
  <link rel="stylesheet" href="../../css/portal-base.css">
  <link rel="stylesheet" href="../../css/theme.css">
  <link rel="stylesheet" href="../prompts-layout.css">
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>

  <header class="page-header">
    <h1>${esc(label)} <span>prompts.chat</span></h1>

    <div class="search-wrap">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="search" id="search-input" placeholder="Search ${esc(label.toLowerCase())} prompts…" aria-label="Search prompts" autocomplete="off">
    </div>

    <span class="result-count" id="result-count" aria-live="polite">${count.toLocaleString()} prompt${count === 1 ? '' : 's'}</span>

    <a href="../index.html" class="back-link">← All Prompts</a>
  </header>

  <div class="page-body" id="main">
    <nav class="sidebar" aria-label="Categories">
${sidebar}
    </nav>

    <main class="main-content">
      <div class="cards-grid" id="cards-grid" role="list" aria-label="${esc(label)} prompt cards">
${cards}
      </div>
    </main>
  </div>

  <script>
    const searchEl = document.getElementById('search-input');
    const countEl  = document.getElementById('result-count');
    const cards    = Array.from(document.querySelectorAll('.prompt-card'));
    const grid     = document.getElementById('cards-grid');

    function applyFilter() {
      const q = searchEl.value.trim().toLowerCase();
      let visible = 0;
      for (const card of cards) {
        const show = !q || card.dataset.title.includes(q);
        card.hidden = !show;
        if (show) visible++;
      }
      countEl.textContent = visible.toLocaleString() + ' prompt' + (visible === 1 ? '' : 's');

      let empty = grid.querySelector('.empty-state');
      if (visible === 0) {
        if (!empty) {
          empty = document.createElement('p');
          empty.className = 'empty-state';
          grid.appendChild(empty);
        }
        empty.textContent = q ? 'No prompts match "' + q + '"' : 'No prompts in this category.';
      } else if (empty) {
        empty.remove();
      }
    }

    searchEl.addEventListener('input', applyFilter);
  </script>
</body>
</html>
`;
}

function main() {
  const catalog = loadCatalog();
  const groups = groupPrompts(catalog);
  mkdirSync(OUT_DIR, { recursive: true });

  let written = 0;
  for (const [slug, prompts] of groups) {
    if (!prompts.length) continue;
    const label = CATEGORY_LABELS[slug] || slug;
    const sortedPrompts = [...prompts].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    );
    const html = renderPage({ slug, label, prompts: sortedPrompts, groups });
    const filename = `${slugify(slug)}.html`;
    writeFileSync(resolve(OUT_DIR, filename), html);
    written++;
    console.log(`wrote category/${filename} (${prompts.length} prompts)`);
  }
  console.log(`\nGenerated ${written} category pages in ${OUT_DIR}`);
}

main();
