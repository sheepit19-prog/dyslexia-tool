# Icon Conversion Script for Chrome Extension

#Requires -Version 7.0

param(
    [switch]$InstallDependencies
)

$iconDir = "apps\extension\icons"
$outputDir = "apps\extension\icons\png"

# Create output directory
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    Write-Host "Created output directory: $outputDir" -ForegroundColor Green
}

# Required icon sizes for Chrome Web Store
$sizes = @(16, 32, 48, 96, 128, 256, 512)

Write-Host "=== Chrome Extension Icon Converter ===" -ForegroundColor Cyan
Write-Host "Converting SVG icons to PNG format..." -ForegroundColor Yellow
Write-Host ""

# Check if ImageMagick is installed
$convertPath = $null
try {
    $convertPath = (Get-Command "magick" -ErrorAction Stop).Source
    Write-Host "✓ ImageMagick found: $convertPath" -ForegroundColor Green
} catch {
    try {
        $convertPath = (Get-Command "convert" -ErrorAction Stop).Source
        Write-Host "✓ ImageMagick found: $convertPath" -ForegroundColor Green
    } catch {
        Write-Host "✗ ImageMagick not found" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install ImageMagick:" -ForegroundColor Yellow
        Write-Host "  Option 1: winget install ImageMagick.ImageMagick" -ForegroundColor Cyan
        Write-Host "  Option 2: Download from https://imagemagick.org/" -ForegroundColor Cyan
        Write-Host "  Option 3: Use the Python script (icon_convert.py)" -ForegroundColor Cyan
        Write-Host ""
        
        if ($InstallDependencies) {
            Write-Host "Attempting automatic installation..." -ForegroundColor Yellow
            winget install ImageMagick.ImageMagick --silent --accept-package-agreements --accept-source-agreements
            $convertPath = (Get-Command "magick" -ErrorAction Stop).Source
            Write-Host "✓ ImageMagick installed successfully" -ForegroundColor Green
        } else {
            exit 1
        }
    }
}

# Convert each SVG to PNG at all required sizes
$svgs = @("icon16.svg", "icon48.svg", "icon128.svg")

foreach ($svg in $svgs) {
    $svgPath = Join-Path $iconDir $svg
    
    if (!(Test-Path $svgPath)) {
        Write-Host "✗ SVG not found: $svgPath" -ForegroundColor Red
        continue
    }
    
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($svg)
    
    Write-Host "Converting: $svg" -ForegroundColor Cyan
    
    foreach ($size in $sizes) {
        $outputFile = Join-Path $outputDir "${baseName}-${size}.png"
        
        try {
            & $convertPath convert $svgPath -background none -resize "${size}x${size}" -quality 100 $outputFile
            
            if (Test-Path $outputFile) {
                $fileSize = (Get-Item $outputFile).Length
                Write-Host "  ✓ ${size}x${size} - $([math]::Round($fileSize/1024, 2)) KB" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Failed to create ${size}x${size}" -ForegroundColor Red
            }
        } catch {
            Write-Host "  ✗ Error converting ${size}x${size}: $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== Conversion Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Output directory: $outputDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "Required sizes for manifest.json:" -ForegroundColor Yellow
Write-Host "  - 16x16 (toolbar icon)" -ForegroundColor White
Write-Host "  - 48x48 (extension management page)" -ForegroundColor White
Write-Host "  - 128x128 (Chrome Web Store detail page)" -ForegroundColor White
Write-Host ""
Write-Host "Additional sizes for Chrome Web Store listing:" -ForegroundColor Yellow
Write-Host "  - 256x256 (promo images)" -ForegroundColor White
Write-Host "  - 512x512 (promo images)" -ForegroundColor White
Write-Host ""

# Create a summary file
$summaryPath = Join-Path $outputDir "icon-summary.txt"
@{
    "Generated" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "Source" = $iconDir
    "Output" = $outputDir
    "Sizes" = $sizes -join ", "
    "Files" = (Get-ChildItem $outputDir -Filter "*.png").Count
} | ConvertTo-Json | Set-Content $summaryPath

Write-Host "Summary saved to: $summaryPath" -ForegroundColor Green
