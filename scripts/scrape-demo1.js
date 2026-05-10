#!/usr/bin/env node
/**
 * Scrapes https://crimson-ceremony.net/demopals/demo1/index.php
 * and writes src/data/demo1.json directly (no SQLite required).
 *
 * Key fixes vs the old scraper:
 *  - Uses the <a href="?img=verX-eurY"> to derive the image prefix per variant,
 *    not the thumbnail src (which can be shared between variants).
 *  - Reads the per-variant product code from <span class="red"> inside li.vartitle,
 *    not from the parent H2 id (which is only the first code for the group).
 *  - No unique-index collapsing: each physical disc variant gets its own entry.
 *
 * Run: node scripts/scrape-demo1.js
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { parse } = require('node-html-parser');

const BASE_URL = 'https://crimson-ceremony.net';
const PAGE_URL = `${BASE_URL}/demopals/demo1/index.php`;
const IMG_BASE = `${BASE_URL}/demopals/demo1/`;
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'demo1.json');

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

function headRequest(url) {
  return new Promise(resolve => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function probeImages(imgPrefix) {
  const urls = [];
  for (let i = 1; i <= 8; i++) {
    const url = `${IMG_BASE}${imgPrefix}-${i}.jpg`;
    if (await headRequest(url)) {
      urls.push(url);
    } else {
      break;
    }
  }
  return urls;
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
      return { id: siblings[i].getAttribute('id') || null, title: siblings[i].text.trim() };
    }
  }
  return { id: null, title: null };
}

function inferRegion(h2Title) {
  if (!h2Title) return null;
  const t = h2Title.toUpperCase();
  if (t.includes('GER')) return 'Germany';
  if (t.includes('EUR')) return 'Europe';
  if (t.includes('UK') || t.includes('U.K.')) return 'UK';
  if (t.includes('AUS')) return 'Australia';
  return null;
}

function parseVariants(demoDiv, h2) {
  if (!demoDiv) return [];
  const variants = [];

  for (const ul of demoDiv.querySelectorAll('ul.varitem')) {
    // Image prefix from anchor href e.g. "?img=ver5-eur2#SCED-00816"
    const anchor    = ul.querySelector('li.vardisc a');
    const href      = anchor ? anchor.getAttribute('href') : '';
    const match     = href ? href.match(/\?img=([^#&]+)/) : null;
    const imgPrefix = match ? match[1] : null;
    if (!imgPrefix) continue; // no image (unconfirmed variants etc.)

    // Region: from flag img, else infer from H2 title
    const flagImg = ul.querySelector('li.varflag img');
    const region  = flagImg
      ? (flagImg.getAttribute('title') || flagImg.getAttribute('alt') || null)
      : inferRegion(h2.title);

    // Product code: prefer span.red, fall back to H2 id
    const varTitleEl  = ul.querySelector('li.vartitle');
    const codeSpan    = varTitleEl ? varTitleEl.querySelector('span.red') : null;
    const productCode = codeSpan ? codeSpan.text.trim() : h2.id;
    if (!productCode) continue;

    // Title: vartitle text minus the product code, else H2 title
    const rawText = varTitleEl ? varTitleEl.text.trim() : '';
    const title   = (rawText.replace(productCode, '').trim() || rawText) || h2.title;

    variants.push({ imgPrefix, region, title, productCode });
  }

  return variants;
}

function parseEntries(html) {
  const root     = parse(html);
  const demoDivs = root.querySelectorAll('div.demo');

  const entries = [];
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

  console.log('Parsing disc variants...');
  const entries = parseEntries(html);
  const totalVariants = entries.reduce((n, e) => n + e.variants.length, 0);
  console.log(`Found ${entries.length} disc groups, ${totalVariants} variants total.\n`);

  const data = [];
  let id = 1;

  for (const { games, variants } of entries) {
    for (const { imgPrefix, region, title, productCode } of variants) {
      process.stdout.write(`\r  [${id}] Probing ${imgPrefix}...              `);
      const imageUrls = await probeImages(imgPrefix);
      data.push({ id: id++, productCode, region, title, games, imageUrls });
    }
  }

  console.log(`\n\nProbed ${data.length} disc variants.`);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2));
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
