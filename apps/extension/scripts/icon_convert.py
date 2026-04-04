#!/usr/bin/env python3
"""
Icon Conversion Script for Chrome Extension
Converts SVG icons to PNG format at all required sizes.

Usage:
    python icon_convert.py

Requirements:
    pip install pillow svglib reportlab
"""

import os
from pathlib import Path
from PIL import Image
import cairosvg

# Paths
SCRIPT_DIR = Path(__file__).parent
ICON_DIR = SCRIPT_DIR.parent / "icons"
OUTPUT_DIR = ICON_DIR / "png"

# Required sizes for Chrome Web Store
SIZES = [16, 32, 48, 96, 128, 256, 512]

# Source SVG files
SVG_FILES = ["icon16.svg", "icon48.svg", "icon128.svg"]


def main():
    print("=== Chrome Extension Icon Converter ===")
    print("Converting SVG icons to PNG format...\n")

    # Create output directory
    OUTPUT_DIR.mkdir(exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}\n")

    # Check dependencies
    try:
        import cairosvg

        print("✓ cairosvg found")
    except ImportError:
        print("✗ cairosvg not found")
        print("  Install: pip install cairosvg")
        print("  Or use the PowerShell script: scripts/convert-icons.ps1")
        return

    # Convert each SVG
    for svg_file in SVG_FILES:
        svg_path = ICON_DIR / svg_file

        if not svg_path.exists():
            print(f"✗ SVG not found: {svg_path}")
            continue

        base_name = svg_path.stem
        print(f"Converting: {svg_file}")

        for size in SIZES:
            output_file = OUTPUT_DIR / f"{base_name}-{size}.png"

            try:
                # Convert SVG to PNG
                cairosvg.svg2png(
                    url=str(svg_path),
                    write_to=str(output_file),
                    output_width=size,
                    output_height=size,
                )

                if output_file.exists():
                    file_size = output_file.stat().st_size / 1024
                    print(f"  ✓ {size}x{size} - {file_size:.2f} KB")
                else:
                    print(f"  ✗ Failed to create {size}x{size}")

            except Exception as e:
                print(f"  ✗ Error converting {size}x{size}: {e}")

    print("\n=== Conversion Complete ===\n")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"\nGenerated {len(list(OUTPUT_DIR.glob('*.png')))} PNG files")


if __name__ == "__main__":
    main()
