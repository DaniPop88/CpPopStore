'use strict';

// Ambil URL manifest dari window (sudah di-set di HTML)
const MANIFEST_URL = window.REDEPOP_MANIFEST_URL = "https://cdn.jsdelivr.net/gh/DaniPop88/CpPopStore@e11db3428c4a4474b1a741d27d482edb7a27f6fe/manifest.json";

// Container katalog
const catalog = document.getElementById('catalog');

// Helper buat elemen
function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  return node;
}

// Kartu produk
function buildProductCard({ src, name, isExtra }) {
  const card = el('div', `product-card${isExtra ? ' extra-product' : ''}`);
  const img = el('img', 'product-img', { src, alt: name });
  const title = el('div', 'product-name', { text: name });
  card.appendChild(img);
  card.appendChild(title);
  if (isExtra) card.hidden = true;
  return card;
}

// Bagian tiap tier
function buildTierSection(tier, baseUrl) {
  const section = el('section', 'reward-tier', { 'data-tier': tier.id });
  const header = el('div', 'tier-header', { text: tier.label || tier.id });
  section.appendChild(header);

  const grid = el('div', 'product-grid');
  section.appendChild(grid);

  const showFirst = Number.isInteger(tier.showFirst) ? tier.showFirst : 3;
  const items = Array.isArray(tier.items) ? tier.items : [];

  items.forEach((item, idx) => {
    const src = item.url ? item.url : (baseUrl + item.file);
    const name = item.name || (item.file || item.url || 'Produto');
    const isExtra = idx >= showFirst;
    const card = buildProductCard({ src, name, isExtra });
    grid.appendChild(card);
  });

  // Tombol VEJA MAIS jika ada produk extra
  if (items.length > showFirst) {
    const btn = el('button', 'veja-mais-btn', { 'data-tier': tier.id });
    btn.appendChild(el('span', 'btn-text', { text: 'VEJA MAIS' }));
    btn.appendChild(el('span', 'arrow-icon', { html: '&#9660;' }));
    section.appendChild(btn);

    btn.addEventListener('click', function () {
      const expanded = btn.classList.toggle('expanded');
      const textSpan = btn.querySelector('.btn-text');
      const arrowSpan = btn.querySelector('.arrow-icon');
      textSpan.textContent = expanded ? "VER MENOS" : "VEJA MAIS";
      arrowSpan.innerHTML = expanded ? '&#9650;' : '&#9660;';
      grid.querySelectorAll('.extra-product').forEach(p => p.hidden = !expanded);
    });
  }

  return section;
}

// Load katalog dari manifest
async function loadCatalog() {
  try {
    const res = await fetch(MANIFEST_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const manifest = await res.json();

    const baseUrl = (manifest.baseUrl || '').trim();
    const tiers = Array.isArray(manifest.tiers) ? manifest.tiers : [];
    catalog.innerHTML = '';
    tiers.forEach(tier => {
      const section = buildTierSection(tier, baseUrl);
      catalog.appendChild(section);
    });
  } catch (err) {
    console.error('Gagal memuat manifest:', err);
    catalog.innerHTML = '<p style="color:red;text-align:center">Falha ao carregar catálogo. Tente novamente mais tarde.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadCatalog);
