#!/usr/bin/env node
/**
 * Scrapes https://crimson-ceremony.net/demopals/registered/index.php
 * and writes src/data/registered.json.
 *
 * Run: node scripts/scrape-registered.js
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { parse } = require('node-html-parser');

const BASE_URL = 'https://crimson-ceremony.net';
const PAGE_URL = `${BASE_URL}/demopals/registered/index.php`;
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'registered.json');

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
  const galleryHtml = await fetchHtml(`${PAGE_URL}?img=${imgPrefix}`);
  const root = parse(galleryHtml);
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

function parseEntries(html) {
  const root = parse(html);
  const entries = [];

  const h2s = root.querySelectorAll('h2');
  for (const h2 of h2s) {
    const productCode = h2.getAttribute('id');
    if (!productCode) continue;

    // Region from flag img inside H2
    const flagImg = h2.querySelector('img');
    const region = flagImg
      ? (flagImg.getAttribute('title') || flagImg.getAttribute('alt') || null)
      : null;

    // Title: H2 text minus flag img text
    const title = h2.text.trim();

    // Find the next div.demo sibling
    const siblings = h2.parentNode ? h2.parentNode.childNodes : [];
    const idx = siblings.indexOf(h2);
    let demoDiv = null;
    for (let i = idx + 1; i < siblings.length; i++) {
      if (siblings[i].tagName === 'DIV' && siblings[i].getAttribute('class') === 'demo') {
        demoDiv = siblings[i];
        break;
      }
      if (siblings[i].tagName === 'H2') break;
    }
    if (!demoDiv) continue;

    // Image prefix from vardisc anchor href e.g. "?img=01#SCED-00637"
    const anchor = demoDiv.querySelector('li.vardisc a');
    const href = anchor ? anchor.getAttribute('href') : '';
    const match = href ? href.match(/\?img=([^#&]+)/) : null;
    const imgPrefix = match ? match[1] : null;
    if (!imgPrefix) continue;

    const games = parseGames(demoDiv);
    entries.push({ productCode, region, title, imgPrefix, games });
  }

  return entries;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching page...');
  const html = await fetchHtml(PAGE_URL);

  console.log('Parsing entries...');
  const entries = parseEntries(html);
  console.log(`Found ${entries.length} entries.\n`);

  const data = [];
  let id = 1;

  for (const { productCode, region, title, imgPrefix, games } of entries) {
    process.stdout.write(`\r  [${id}] Fetching gallery ${imgPrefix}...              `);
    const imageUrls = await fetchGalleryImages(imgPrefix);
    data.push({ id: id++, productCode, region, title, games, imageUrls });
  }

  console.log(`\n\nFetched ${data.length} entries.`);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
