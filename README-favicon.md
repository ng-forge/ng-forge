# Favicon Generation Guide

This directory contains optimized SVG icons for generating favicons and .ico files.

## Files

- `favicon.svg` - 64x64 optimized icon (use for modern browsers)
- `favicon-16.svg` - 16x16 ultra-simplified (for .ico generation)
- `favicon-32.svg` - 32x32 simplified (for .ico generation)
- `favicon-48.svg` - 48x48 simplified (for .ico generation)
- `generate-favicon.js` - Script to convert SVGs to .ico

## Quick Start

### Option 1: Use the Node.js script (Recommended)

```bash
# Install dependencies
npm install -D sharp png-to-ico

# Generate favicon.ico and PNGs
node generate-favicon.js
```

This creates:
- `favicon.ico` (multi-resolution: 16x16, 32x32, 48x48)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-48x48.png`

### Option 2: Online Converters (No installation needed)

Upload `favicon.svg` or the size-specific SVGs to:
- https://realfavicongenerator.net/
- https://favicon.io/favicon-converter/
- https://convertio.co/svg-ico/

### Option 3: Using ImageMagick

If you have ImageMagick installed:

```bash
# Convert individual sizes
convert -background none -resize 16x16 favicon-16.svg favicon-16.png
convert -background none -resize 32x32 favicon-32.svg favicon-32.png
convert -background none -resize 48x48 favicon-48.svg favicon-48.png

# Combine into .ico
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
```

### Option 4: Using Inkscape

```bash
inkscape -w 16 -h 16 favicon-16.svg -o favicon-16.png
inkscape -w 32 -h 32 favicon-32.svg -o favicon-32.png
inkscape -w 48 -h 48 favicon-48.svg -o favicon-48.png
```

Then use an online tool to combine PNGs into .ico

## Using in Your Web App

### Modern approach (SVG favicon):

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="any"><!-- fallback -->
```

### Classic approach:

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
```

### For Angular apps:

Place the favicon files in your `src/` directory and reference in `index.html`:

```html
<!-- src/index.html -->
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="favicon.ico" sizes="any">
```

Update `angular.json` to include the favicon:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              "src/favicon.ico",
              "src/favicon.svg",
              "src/assets"
            ]
          }
        }
      }
    }
  }
}
```

## Design Notes

The favicons are optimized for each size:

- **16x16**: Ultra-simplified - just anvil base and shield outline with minimal detail
- **32x32**: Simplified - anvil, shield, 3 form lines, and checkmark
- **48x48**: More detail - complete anvil shape, shield, form lines, and checkbox
- **64x64**: Full detail - all elements clearly visible

This ensures the icon remains recognizable even at the smallest sizes.
