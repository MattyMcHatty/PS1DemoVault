#!/usr/bin/env node
/**
 * Generates Android app icons (ic_launcher + ic_launcher_round) from an SVG disc design.
 * Run: node scripts/generate-icon.js
 */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

function arcText(text, cx, cy, r, fontSize, fill) {
  const chars = text.split('');
  const charAngle = 0.13;
  const totalAngle = charAngle * (chars.length - 1);
  const startAngle = -Math.PI / 2 - totalAngle / 2;
  return chars.map((ch, i) => {
    const angle = startAngle + i * charAngle;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    const rotateDeg = (angle * 180) / Math.PI + 90;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${fill}" opacity="0.92" transform="rotate(${rotateDeg.toFixed(2)},${x.toFixed(1)},${y.toFixed(1)})">${ch === '&' ? '&amp;' : ch}</text>`;
  }).join('\n  ');
}

function buildSvg(transparent) {
  const bg = transparent ? '' : '\n  <rect width="1024" height="1024" fill="#0a0a0a"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="iris" cx="50%" cy="50%" r="50%">
      <stop offset="20%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="52%" stop-color="#1a2860" stop-opacity="0.45"/>
      <stop offset="68%" stop-color="#2d0e50" stop-opacity="0.38"/>
      <stop offset="82%" stop-color="#0e2818" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="edge" cx="50%" cy="50%" r="50%">
      <stop offset="88%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.7"/>
    </radialGradient>
  </defs>
${bg}
  <circle cx="512" cy="512" r="490" fill="#0d0d0d"/>
  <circle cx="512" cy="512" r="490" fill="url(#iris)"/>
  <circle cx="512" cy="512" r="490" fill="url(#edge)"/>
  <circle cx="512" cy="512" r="195" fill="#111111" stroke="#282828" stroke-width="3"/>
  <circle cx="512" cy="512" r="192" fill="#161616"/>
  <circle cx="512" cy="512" r="42" fill="#c0c0c0"/>
  <circle cx="512" cy="512" r="38" fill="#d8d8d8"/>
  <circle cx="512" cy="512" r="34" fill="#b0b0b0"/>
  ${arcText('PS1 DEMO VAULT', 512, 512, 360, 72, '#ffffff')}
</svg>`;
}

// Legacy icon sizes (used as fallback on older Android)
const LEGACY_SIZES = [
  { dir: 'mipmap-mdpi',    size: 48  },
  { dir: 'mipmap-hdpi',    size: 72  },
  { dir: 'mipmap-xhdpi',   size: 96  },
  { dir: 'mipmap-xxhdpi',  size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

// Adaptive icon foreground sizes (108dp per density)
const ADAPTIVE_SIZES = [
  { dir: 'mipmap-mdpi',    size: 108 },
  { dir: 'mipmap-hdpi',    size: 162 },
  { dir: 'mipmap-xhdpi',   size: 216 },
  { dir: 'mipmap-xxhdpi',  size: 324 },
  { dir: 'mipmap-xxxhdpi', size: 432 },
];

const RES_DIR = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

async function main() {
  const svgLegacy = Buffer.from(buildSvg(false));
  const svgFg     = Buffer.from(buildSvg(true));

  // Legacy launcher PNGs (Android < 8 fallback)
  for (const { dir, size } of LEGACY_SIZES) {
    const outDir = path.join(RES_DIR, dir);
    fs.mkdirSync(outDir, { recursive: true });
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png']) {
      const outPath = path.join(outDir, name);
      await sharp(svgLegacy).resize(size, size).png().toFile(outPath);
      console.log(`Wrote ${dir}/${name} (${size}×${size})`);
    }
  }

  // Adaptive foreground PNGs (transparent background, disc only)
  for (const { dir, size } of ADAPTIVE_SIZES) {
    const outDir = path.join(RES_DIR, dir);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'ic_launcher_foreground.png');
    await sharp(svgFg).resize(size, size).png().toFile(outPath);
    console.log(`Wrote ${dir}/ic_launcher_foreground.png (${size}×${size})`);
  }

  // mipmap-anydpi-v26 adaptive icon XMLs
  const anydpiDir = path.join(RES_DIR, 'mipmap-anydpi-v26');
  fs.mkdirSync(anydpiDir, { recursive: true });
  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml);
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml);
  console.log('Wrote mipmap-anydpi-v26/ic_launcher.xml');
  console.log('Wrote mipmap-anydpi-v26/ic_launcher_round.xml');

  // Background colour resource
  const valuesDir = path.join(RES_DIR, 'values');
  const colorsPath = path.join(valuesDir, 'colors.xml');
  fs.writeFileSync(colorsPath, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0a0a0a</color>
</resources>
`);
  console.log('Wrote values/colors.xml');

  // 1024×1024 reference copy
  const srcPath = path.join(__dirname, 'icon-source.png');
  await sharp(svgLegacy).resize(1024, 1024).png().toFile(srcPath);
  console.log('\nSource icon → scripts/icon-source.png');
}

main().catch(err => { console.error(err); process.exit(1); });
