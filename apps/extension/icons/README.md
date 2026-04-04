# Chrome Extension Icons

## Required Icon Sizes

### For manifest.json (Extension Icons)
| Size | Usage | File |
|------|-------|------|
| 16x16 | Toolbar icon | `icon16-16.png` |
| 48x48 | Extension management page | `icon48-48.png` |
| 128x128 | Chrome Web Store detail page | `icon128-128.png` |

### For Chrome Web Store Listing (Promotional Images)
| Size | Usage | Required |
|------|-------|----------|
| 1280x800 | Hero image (small promo tile) | Recommended |
| 1440x560 | Large promo tile | Optional |
| 920x680 | Marquee promo tile | Optional |

## Current Status

**Source Files:** ✅ SVG files exist (icon16.svg, icon48.svg, icon128.svg)

**PNG Files:** ❌ Need to generate

## How to Generate PNG Icons

### Option 1: PowerShell Script (Windows)

```powershell
# From project root
.\apps\extension\scripts\convert-icons.ps1

# Or with auto-install of ImageMagick
.\apps\extension\scripts\convert-icons.ps1 -InstallDependencies
```

### Option 2: Python Script

```bash
# Install dependencies
pip install cairosvg pillow

# Run conversion
python apps/extension/scripts/icon_convert.py
```

### Option 3: Online Converter

Use an online SVG to PNG converter:
- https://cloudconvert.com/svg-to-png
- https://svgtopng.com/

Convert each SVG to the following sizes: 16, 48, 128, 256, 512

## Output Structure

After conversion, your `icons/` folder should look like:

```
icons/
├── icon16.svg
├── icon48.svg
├── icon128.svg
└── png/
    ├── icon16-16.png
    ├── icon16-32.png
    ├── icon16-48.png
    ├── icon16-96.png
    ├── icon16-128.png
    ├── icon16-256.png
    ├── icon16-512.png
    ├── icon48-16.png
    ├── icon48-32.png
    └── ... (similar for icon48 and icon128)
```

## Update manifest.json

After generating PNGs, the manifest already references:
- `icons/png/icon16-16.png`
- `icons/png/icon48-48.png`
- `icons/png/icon128-128.png`

No changes needed if you use the provided scripts!

## Tips

1. **Transparent Background**: Ensure PNGs have transparent backgrounds
2. **High Quality**: Use 100% quality for crisp icons
3. **Square Format**: All icons should be perfectly square
4. **No Text**: Avoid text in small icons (16x16) - it won't be readable

## Testing

After generating icons:

1. Rebuild the extension:
   ```bash
   npm run build
   ```

2. Load in Chrome:
   - Go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

3. Verify icons appear:
   - Toolbar icon (16x16)
   - Extension page (48x48)
   - Chrome Web Store simulation (128x128)
