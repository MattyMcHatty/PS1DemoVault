#!/usr/bin/env node
/**
 * Scrapes https://crimson-ceremony.net/demopals/opmspecials/index.php
 * and builds a SQLite database of all OPM Special Issue disc variants.
 *
 * Run: node scripts/scrape-opm-specials.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');
const Database = require('better-sqlite3');

const BASE_URL  = 'https://crimson-ceremony.net';
const PAGE_URL  = `${BASE_URL}/demopals/opmspecials/index.php`;
const IMAGES_DIR = path.join(__dirname, '..', 'assets', 'disc-images');
const DB_PATH   = path.join(__dirname, '..', 'assets', 'opm-specials.db');

// ── Helpers ───────────────────────────────────────────────────────────────────

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBinary(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function extractVarTitle(varTitleEl) {
  if (!varTitleEl) return null;
  const text = varTitleEl.text.split('\n')[0].trim();
  return text || null;
}

// ── HTML Parsing ──────────────────────────────────────────────────────────────

function parseDiscs(html) {
  const root = parse(html);
  const section = root.querySelector('section');
  if (!section) throw new Error('Could not find <section> on page');

  const entries = [];
  const children = section.childNodes;

  let i = 0;
  while (i < children.length) {
    const node = children[i];

    if (node.tagName !== 'H2') { i++; continue; }

    const h2 = node;
    const productCode = h2.getAttribute('id') || '';
    const h2Title = h2.text.trim();

    let j = i + 1;
    while (j < children.length && children[j].tagName !== 'H3') j++;
    let k = j + 1;
    while (k < children.length &&
      !(children[k].tagName === 'DIV' && children[k].classList?.contains('demo'))) k++;
    const demoDiv = k < children.length ? children[k] : null;

    const games = [];
    if (demoDiv) {
      const dl = demoDiv.querySelector('dl.contents');
      if (dl) {
        let currentCategory = null;
        for (const child of dl.childNodes) {
          if (child.tagName === 'DT') {
            currentCategory = child.text.trim().toLowerCase();
          } else if (child.tagName === 'DD' && currentCategory && currentCategory !== 'notes') {
            const title = child.text.trim();
            if (title) games.push({ title, category: currentCategory });
          }
        }
      }
    }

    const variants = [];
    if (demoDiv) {
      const varLists = demoDiv.querySelectorAll('ul.varitem');
      for (const ul of varLists) {
        const discImg   = ul.querySelector('li.vardisc img');
        const flagImg   = ul.querySelector('li.varflag img');
        const varTitleEl = ul.querySelector('li.vartitle');

        const src = discImg ? discImg.getAttribute('src') : null;
        if (!src || src.includes('noimg.jpg')) continue;

        const region = flagImg
          ? (flagImg.getAttribute('title') || flagImg.getAttribute('alt') || null)
          : null;

        const title = extractVarTitle(varTitleEl) || h2Title;

        const fullSrc = src.replace(/-0\.jpg$/, '-1.jpg');
        const imageUrl = fullSrc.startsWith('http') ? fullSrc : `${BASE_URL}${fullSrc}`;
        variants.push({ region, title, imageUrl });
      }
    }

    if (variants.length === 0) {
      variants.push({ region: null, title: h2Title, imageUrl: null });
    }

    entries.push({ productCode, games, variants });
    i = Math.max(j, k) + 1;
  }

  return entries;
}

// ── Database ──────────────────────────────────────────────────────────────────

function setupDatabase(dbPath) {
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS discs (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL,
      region       TEXT,
      title        TEXT NOT NULL,
      image_url    TEXT,
      local_path   TEXT
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_disc_variant
      ON discs(product_code, COALESCE(region, ''));

    CREATE TABLE IF NOT EXISTS games (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT NOT NULL,
      title        TEXT NOT NULL,
      category     TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_game
      ON games(product_code, title, category);
  `);

  return db;
}

function insertData(db, entries) {
  const insertDisc = db.prepare(`
    INSERT OR IGNORE INTO discs (product_code, region, title, image_url, local_path)
    VALUES (?, ?, ?, ?, NULL)
  `);
  const insertGame = db.prepare(`
    INSERT OR IGNORE INTO games (product_code, title, category)
    VALUES (?, ?, ?)
  `);

  const insertAll = db.transaction(entries => {
    for (const { productCode, games, variants } of entries) {
      for (const { region, title, imageUrl } of variants) {
        insertDisc.run(productCode, region, title, imageUrl);
      }
      for (const { title, category } of games) {
        insertGame.run(productCode, title, category);
      }
    }
  });

  insertAll(entries);
}

// ── Image Downloading ─────────────────────────────────────────────────────────

async function downloadImages(db) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const updatePath = db.prepare('UPDATE discs SET local_path = ? WHERE id = ?');
  const images = db.prepare(
    'SELECT id, image_url FROM discs WHERE local_path IS NULL AND image_url IS NOT NULL'
  ).all();

  console.log(`\nDownloading ${images.length} images...`);

  for (let idx = 0; idx < images.length; idx++) {
    const { id, image_url } = images[idx];
    const filename = path.basename(image_url.split('?')[0]);
    const dest = path.join(IMAGES_DIR, filename);

    if (fs.existsSync(dest)) {
      updatePath.run(`assets/disc-images/${filename}`, id);
      process.stdout.write(`\r[${idx + 1}/${images.length}] skipped (cached): ${filename}          `);
      continue;
    }

    try {
      await downloadBinary(image_url, dest);
      updatePath.run(`assets/disc-images/${filename}`, id);
      process.stdout.write(`\r[${idx + 1}/${images.length}] downloaded: ${filename}          `);
    } catch (err) {
      console.error(`\n  Failed: ${image_url} — ${err.message}`);
    }

    await sleep(150);
  }

  console.log('\nImage download complete.');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  console.log('Fetching page...');
  const html = await fetch(PAGE_URL);

  console.log('Parsing disc variants...');
  const entries = parseDiscs(html);
  const totalVariants = entries.reduce((n, e) => n + e.variants.length, 0);
  console.log(`Found ${entries.length} discs, ${totalVariants} regional variants.`);

  console.log('Setting up database...');
  const db = setupDatabase(DB_PATH);

  console.log('Inserting data...');
  insertData(db, entries);

  const discCount = db.prepare('SELECT COUNT(*) as n FROM discs').get().n;
  const gameCount = db.prepare('SELECT COUNT(*) as n FROM games').get().n;
  console.log(`  Disc variants: ${discCount}, Games: ${gameCount}`);

  await downloadImages(db);

  db.close();
  console.log(`\nDone. Database saved to: ${DB_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
