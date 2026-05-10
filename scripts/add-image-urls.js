#!/usr/bin/env node
/**
 * Migrates existing JSON data files from { imageUrl: string|null }
 * to { imageUrls: string[] } by probing for all full-size images per variant.
 *
 * Works without any SQLite database — reads and rewrites the JSON files directly.
 *
 * Run: node scripts/add-image-urls.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const FILES = [
  path.join(__dirname, '..', 'src', 'data', 'demos.json'),
  path.join(__dirname, '..', 'src', 'data', 'opm-specials.json'),
  path.join(__dirname, '..', 'src', 'data', 'essential.json'),
  path.join(__dirname, '..', 'src', 'data', 'demo1.json'),
].filter(f => fs.existsSync(f));

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

async function migrateFile(filePath) {
  const name = path.basename(filePath);
  const entries = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`\n${name}: migrating ${entries.length} entries...`);

  const result = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // Already migrated — re-probe from the first URL
    const primaryUrl = Array.isArray(entry.imageUrls)
      ? entry.imageUrls[0] ?? null
      : entry.imageUrl ?? null;

    const imageUrls = await probeImageUrls(primaryUrl);

    const { imageUrl: _dropped, ...rest } = entry;
    result.push({ ...rest, imageUrls });

    process.stdout.write(`\r  [${i + 1}/${entries.length}] ${entry.productCode}   `);
  }

  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
  const multi = result.filter(e => e.imageUrls.length > 1).length;
  console.log(`\n  Done. ${multi} entries have multiple images.`);
}

async function main() {
  if (FILES.length === 0) {
    console.error('No data JSON files found. Run the scrape + export scripts first.');
    process.exit(1);
  }

  for (const file of FILES) {
    await migrateFile(file);
  }

  console.log('\nAll files migrated.');
}

main().catch(err => { console.error(err); process.exit(1); });
