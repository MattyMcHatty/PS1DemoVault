#!/usr/bin/env node
/**
 * Reads assets/opm-specials.db and writes src/data/opm-specials.json
 * Run: node scripts/export-opm-specials-json.js
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH  = path.join(__dirname, '..', 'assets', 'opm-specials.db');
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'opm-specials.json');

const db = new Database(DB_PATH, { readonly: true });

const getGames = db.prepare(
  'SELECT title, category FROM games WHERE product_code = ? ORDER BY id'
);

const variants = db.prepare(
  'SELECT id, product_code, region, title, image_url FROM discs ORDER BY id'
).all();

const data = variants.map(v => ({
  id: v.id,
  productCode: v.product_code,
  region: v.region,
  title: v.title,
  imageUrl: v.image_url ? v.image_url.replace(/-0\.jpg$/, '-1.jpg') : null,
  games: getGames.all(v.product_code),
}));

db.close();

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(data, null, 2));
console.log(`Wrote ${data.length} disc variants to ${OUT_PATH}`);
