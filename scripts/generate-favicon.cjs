#!/usr/bin/env node
/**
 * Generate favicon.ico for the docs
 */
const sharp = require('sharp');
const { default: pngToIco } = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    console.log('🎨 Generating favicon.ico from logo-icon.svg...\n');

    const logoPath = path.join(__dirname, '..', 'logo-icon.svg');
    const outputDir = path.join(__dirname, '..', 'apps/docs/src');

    const sizes = [16, 32, 48];
    const pngBuffers = [];

    // Convert SVG to PNG at different sizes
    for (const size of sizes) {
      const pngBuffer = await sharp(logoPath)
        .resize(size, size)
        .png()
        .toBuffer();

      pngBuffers.push(pngBuffer);
      console.log(`✅ Generated ${size}x${size} PNG`);
    }

    // Create .ico file
    const icoBuffer = await pngToIco(pngBuffers);
    const icoPath = path.join(outputDir, 'favicon.ico');
    fs.writeFileSync(icoPath, icoBuffer);

    console.log(`\n✨ Created favicon.ico at ${icoPath}`);
    console.log('   Sizes included: 16x16, 32x32, 48x48');

  } catch (error) {
    console.error('❌ Error generating favicon:', error.message);
    process.exit(1);
  }
}

generateFavicon();
