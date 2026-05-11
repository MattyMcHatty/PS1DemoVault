#!/usr/bin/env node
/**
 * Scrapes https://crimson-ceremony.net/demopals/station/index.php
 * and writes src/data/station.json.
 *
 * Run: node scripts/scrape-station.js
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { parse } = require('node-html-parser');

const BASE_URL = 'https://crimson-ceremony.net';
const PAGE_URL = `${BASE_URL}/demopals/station/index.php`;
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'station.json');

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHtml(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchGalleryImages(imgPrefix) {
  const html = await fetchHtml(`${PAGE_URL}?img=${imgPrefix}`);
  const root = parse(html);
  return root.querySelectorAll('img[alt^="Image "]')
    .map(img => BASE_URL + img.getAttribute('src'));
}

// ── Parsing ───────────────────────────────────────────────────────────────────

function parseGames(demoDiv) {
  const games = [];
  if (!demoDiv) return games;
  const dl = demoDiv.querySelector('dl.contents');
  if (!dl) return games;
  let currentCategory = null;
  for (const child of dl.childNodes) {
    if (child.tagName === 'DT') {
      currentCategory = child.text.trim().toLowerCase();
    } else if (child.tagName === 'DD' && currentCategory && currentCategory !== 'notes') {
      const title = child.text.trim();
      if (title) games.push({ title, category: currentCategory });
    }
  }
  return games;
}

function findPrecedingH2(demoDiv) {
  const siblings = demoDiv.parentNode ? demoDiv.parentNode.childNodes : [];
  const idx = siblings.indexOf(demoDiv);
  for (let i = idx - 1; i >= 0; i--) {
    if (siblings[i].tagName === 'H2') {
      const h2 = siblings[i];
      const flagImg = h2.querySelector('img');
      const region = flagImg
        ? (flagImg.getAttribute('title') || flagImg.getAttribute('alt') || null)
        : null;
      const title = h2.text.trim();
      return { id: h2.getAttribute('id') || null, title, region };
    }
  }
  return { id: null, title: null, region: null };
}

function parseVariants(demoDiv, h2) {
  if (!demoDiv) return [];
  const variants = [];

  for (const ul of demoDiv.querySelectorAll('ul.varitem')) {
    const anchor    = ul.querySelector('li.vardisc a');
    const href      = anchor ? anchor.getAttribute('href') : '';
    const match     = href ? href.match(/\?img=([^#&]+)/) : null;
    const imgPrefix = match ? match[1] : null;
    if (!imgPrefix) continue;

    const flagImg = ul.querySelector('li.varflag img');
    const region  = flagImg
      ? (flagImg.getAttribute('title') || flagImg.getAttribute('alt') || null)
      : h2.region;

    const varTitleEl  = ul.querySelector('li.vartitle');
    const codeSpan    = varTitleEl ? varTitleEl.querySelector('span.red') : null;
    const productCode = codeSpan ? codeSpan.text.trim() : h2.id;
    if (!productCode) continue;

    const rawText = varTitleEl ? varTitleEl.text.trim() : '';
    const title   = (rawText.replace(productCode, '').trim() || rawText) || h2.title;

    variants.push({ imgPrefix, region, title, productCode });
  }

  return variants;
}

function parseEntries(html) {
  const root     = parse(html);
  const demoDivs = root.querySelectorAll('div.demo');
  const entries  = [];

  for (const demoDiv of demoDivs) {
    const h2       = findPrecedingH2(demoDiv);
    const games    = parseGames(demoDiv);
    const variants = parseVariants(demoDiv, h2);
    if (variants.length > 0) {
      entries.push({ games, variants });
    }
  }
  return entries;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching page...');
  const html = await fetchHtml(PAGE_URL);

  console.log('Parsing variants...');
  const entries = parseEntries(html);
  const totalVariants = entries.reduce((n, e) => n + e.variants.length, 0);
  console.log(`Found ${entries.length} disc groups, ${totalVariants} variants total.\n`);

  const data = [];
  let id = 1;

  for (const { games, variants } of entries) {
    for (const { imgPrefix, region, title, productCode } of variants) {
      process.stdout.write(`\r  [${id}] Fetching gallery ${imgPrefix}...              `);
      const imageUrls = await fetchGalleryImages(imgPrefix);
      data.push({ id: id++, productCode, region, title, games, imageUrls });
    }
  }

  console.log(`\n\nFetched ${data.length} variants.`);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
