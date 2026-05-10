#!/usr/bin/env node
/**
 * Reads assets/essential.db and writes src/data/essential.json
 * Run: node scripts/export-essential-json.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH  = path.join(__dirname, '..', 'assets', 'essential.db');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'essential.json');

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

async function probeImageUrls(primaryUrl) {
  if (!primaryUrl) return [];
  const urls = [primaryUrl];
  const base = primaryUrl.replace(/-1\.jpg$/, '');
  for (let i = 2; i <= 8; i++) {
    if (await headRequest(`${base}-${i}.jpg`)) {
      urls.push(`${base}-${i}.jpg`);
    } else {
      break;
    }
  }
  return urls;
}

async function main() {
  const db = new Database(DB_PATH, { readonly: true });

  const getGames = db.prepare(
    'SELECT title, category FROM games WHERE product_code = ? ORDER BY id'
  );
  const variants = db.prepare(
    'SELECT id, product_code, region, title, image_url FROM discs ORDER BY id'
  ).all();
  db.close();

  console.log(`Probing images for ${variants.length} disc variants...`);
  const data = [];
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const primaryUrl = v.image_url ? v.image_url.replace(/-0\.jpg$/, '-1.jpg') : null;
    const imageUrls = await probeImageUrls(primaryUrl);
    data.push({
      id: v.id,
      productCode: v.product_code,
      region: v.region,
      title: v.title,
      imageUrls,
      games: getGames.all(v.product_code),
    });
    process.stdout.write(`\r[${i + 1}/${variants.length}] ${v.product_code}   `);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2));
  console.log(`\nWrote ${data.length} disc variants to ${OUT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
