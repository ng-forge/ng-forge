#!/usr/bin/env node

/**
 * Generate favicon.ico from SVG
 *
 * Usage:
 *   npm install -D sharp png-to-ico
 *   node generate-favicon.js
 *
 * This will create:
 *   - favicon.ico (multi-resolution icon for browsers)
 *   - favicon-16x16.png
 *   - favicon-32x32.png
 *   - favicon-48x48.png
 */

const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  try {
    // Check if required packages are installed
    let sharp, pngToIco;
    try {
      sharp = require('sharp');
      pngToIco = require('png-to-ico');
    } catch (err) {
      console.error('❌ Required packages not installed.');
      console.error('📦 Please run: npm install -D sharp png-to-ico');
      console.error('\nOr use an online converter:');
      console.error('   https://realfavicongenerator.net/');
      console.error('   https://favicon.io/favicon-converter/');
      process.exit(1);
    }

    console.log('🎨 Generating favicons from SVG...\n');

    const sizes = [
      { size: 16, file: 'favicon-16.svg' },
      { size: 32, file: 'favicon-32.svg' },
      { size: 48, file: 'favicon-48.svg' }
    ];

    const pngFiles = [];

    // Convert each SVG to PNG
    for (const { size, file } of sizes) {
      const svgPath = path.join(__dirname, file);
      const pngPath = path.join(__dirname, `favicon-${size}x${size}.png`);

      if (!fs.existsSync(svgPath)) {
        console.warn(`⚠️  ${file} not found, skipping...`);
        continue;
      }

      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);

      pngFiles.push(pngPath);
      console.log(`✅ Generated favicon-${size}x${size}.png`);
    }

    if (pngFiles.length === 0) {
      throw new Error('No PNG files were generated');
    }

    // Create .ico file from PNGs
    const icoPath = path.join(__dirname, 'favicon.ico');
    const pngBuffers = pngFiles.map(file => fs.readFileSync(file));

    const icoBuffer = await pngToIco(pngBuffers);
    fs.writeFileSync(icoPath, icoBuffer);

    console.log(`✅ Generated favicon.ico (${pngFiles.length} sizes)`);
    console.log('\n✨ Done! Generated files:');
    console.log('   - favicon.ico');
    pngFiles.forEach(file => console.log(`   - ${path.basename(file)}`));

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
