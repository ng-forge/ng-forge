#!/usr/bin/env node

/**
 * Generate favicon.ico from your logo-icon.svg and optimized versions
 */

const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  try {
    let sharp, pngToIco;

    try {
      sharp = require('sharp');
      pngToIco = require('png-to-ico');
    } catch (err) {
      console.error('❌ Required packages not installed.');
      console.error('📦 Run: npm install -D sharp png-to-ico\n');
      console.error('Or use online converter:');
      console.error('   1. Upload logo-icon.svg to: https://convertio.co/svg-ico/');
      console.error('   2. Or use: https://cloudconvert.com/svg-to-ico\n');
      process.exit(1);
    }

    console.log('🎨 Generating favicon.ico from your icon...\n');

    const conversions = [
      { input: 'icon-16.svg', size: 16 },
      { input: 'icon-32.svg', size: 32 },
      { input: 'icon-48.svg', size: 48 },
    ];

    const pngFiles = [];

    for (const { input, size } of conversions) {
      const svgPath = path.join(__dirname, input);
      const pngPath = path.join(__dirname, `icon-${size}x${size}.png`);

      if (!fs.existsSync(svgPath)) {
        console.warn(`⚠️  ${input} not found, skipping...`);
        continue;
      }

      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);

      pngFiles.push(pngPath);
      console.log(`✅ Generated icon-${size}x${size}.png`);
    }

    if (pngFiles.length === 0) {
      throw new Error('No PNG files generated');
    }

    // Create .ico
    const icoPath = path.join(__dirname, 'favicon.ico');
    const pngBuffers = pngFiles.map(file => fs.readFileSync(file));
    const icoBuffer = await pngToIco(pngBuffers);
    fs.writeFileSync(icoPath, icoBuffer);

    console.log(`✅ Generated favicon.ico (${pngFiles.length} sizes)\n`);
    console.log('✨ Files created:');
    console.log('   - favicon.ico');
    pngFiles.forEach(f => console.log(`   - ${path.basename(f)}`));
    console.log('\n💡 Use favicon.ico in your HTML:');
    console.log('   <link rel="icon" href="/favicon.ico" sizes="any">');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateFavicons();
