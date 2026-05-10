#!/usr/bin/env node
/**
 * Removes white backgrounds from disc cover JPEGs using a BFS flood-fill
 * from every edge pixel, then saves the results as PNGs into the Android
 * assets folder so they can be loaded via file:///android_asset/ URIs.
 *
 * Run: node scripts/process-images.js
 */

const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const SRC_DIR  = path.join(__dirname, '..', 'assets', 'disc-images');
const DEST_DIR = path.join(__dirname, '..', 'assets', 'disc-images');

// Pixels with all three channels above this value are treated as background.
const WHITE_THRESHOLD = 230;

function isBackground(data, idx) {
  return data[idx] > WHITE_THRESHOLD &&
         data[idx + 1] > WHITE_THRESHOLD &&
         data[idx + 2] > WHITE_THRESHOLD;
}

async function processImage(srcPath, destPath) {
  const image = await Jimp.read(srcPath);
  const { width, height, data } = image.bitmap;

  const visited = new Uint8Array(width * height); // 0 = unvisited
  const queue = [];

  const enqueue = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    if (isBackground(data, idx * 4)) queue.push(idx);
  };

  // Seed from all four edges
  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }

  // BFS flood fill
  while (queue.length > 0) {
    const idx = queue.pop();
    data[idx * 4 + 3] = 0; // set alpha to 0 (transparent)

    const x = idx % width;
    const y = Math.floor(idx / width);

    if (x > 0)          enqueue(x - 1, y);
    if (x < width - 1)  enqueue(x + 1, y);
    if (y > 0)          enqueue(x, y - 1);
    if (y < height - 1) enqueue(x, y + 1);
  }

  await image.writeAsync(destPath);
}

async function main() {
  fs.mkdirSync(DEST_DIR, { recursive: true });

  const files = fs.readdirSync(SRC_DIR).filter(f => /\.(jpg|jpeg)$/i.test(f));
  console.log(`Processing ${files.length} images...`);

  let done = 0;
  for (const file of files) {
    const srcPath  = path.join(SRC_DIR, file);
    const destName = file.replace(/\.(jpg|jpeg)$/i, '.png');
    const destPath = path.join(DEST_DIR, destName);

    try {
      await processImage(srcPath, destPath);
    } catch (err) {
      console.error(`\n  Failed: ${file} — ${err.message}`);
    }

    done++;
    process.stdout.write(`\r[${done}/${files.length}] ${destName}          `);
  }

  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
