# Dyslexia Tool - Screenshot Capture Script
# Run this in PowerShell, then follow the guided steps

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Dyslexia Tool Screenshot Capture  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$screenshotDir = "apps\extension\docs\screenshots"

if (!(Test-Path $screenshotDir)) {
    New-Item -ItemType Directory -Path $screenshotDir -Force | Out-Null
    Write-Host "Created: $screenshotDir" -ForegroundColor Green
}

Write-Host "Screenshots will be saved to: $screenshotDir" -ForegroundColor Yellow
Write-Host ""

Write-Host "INSTRUCTIONS:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host ""

# Step 1: Load extension
Write-Host "STEP 1: Load Extension in Chrome" -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Gray
Write-Host "1. Open Chrome" -ForegroundColor White
Write-Host "2. Go to: chrome://extensions/" -ForegroundColor White
Write-Host "3. Enable 'Developer mode' (top right)" -ForegroundColor White
Write-Host "4. Click 'Load unpacked'" -ForegroundColor White
Write-Host "5. Select folder: $((Get-Location).Path)\apps\extension\dist" -ForegroundColor White
Write-Host ""

Read-Host "Press ENTER when extension is loaded"

# Screenshot 1: Popup
Write-Host ""
Write-Host "STEP 2: Capture Extension Popup" -ForegroundColor Green
Write-Host "--------------------------------" -ForegroundColor Gray
Write-Host "1. Open google.com in a new tab" -ForegroundColor White
Write-Host "2. Click the Dyslexia Tool icon in toolbar" -ForegroundColor White
Write-Host "3. Press F12 to open DevTools" -ForegroundColor White
Write-Host "4. Press Ctrl+Shift+P, type 'screenshot'" -ForegroundColor White
Write-Host "5. Select 'Capture area screenshot'" -ForegroundColor White
Write-Host "6. Select the full popup window" -ForegroundColor White
Write-Host "7. Save as: screenshot-1-popup.png" -ForegroundColor Yellow
Write-Host "   Location: $screenshotDir" -ForegroundColor Gray
Write-Host ""

Read-Host "Press ENTER when screenshot 1 is captured"

# Screenshot 2: Companion
Write-Host ""
Write-Host "STEP 3: Capture Companion Notification" -ForegroundColor Green
Write-Host "---------------------------------------" -ForegroundColor Gray
Write-Host "1. Open gmail.com and click 'Compose'" -ForegroundColor White
Write-Host "2. Type a few words in the email" -ForegroundColor White
Write-Host "3. Press Backspace 3+ times repeatedly" -ForegroundColor White
Write-Host "4. Wait for notification to appear" -ForegroundColor White
Write-Host "5. Press F12, Ctrl+Shift+P, type 'screenshot'" -ForegroundColor White
Write-Host "6. Select 'Capture full size screenshot'" -ForegroundColor White
Write-Host "7. Save as: screenshot-2-companion.png" -ForegroundColor Yellow
Write-Host "   Location: $screenshotDir" -ForegroundColor Gray
Write-Host ""

Read-Host "Press ENTER when screenshot 2 is captured"

# Screenshot 3: Suggestions
Write-Host ""
Write-Host "STEP 4: Capture Spelling Suggestions" -ForegroundColor Green
Write-Host "-------------------------------------" -ForegroundColor Gray
Write-Host "1. Keep the Gmail compose window open" -ForegroundColor White
Write-Host "2. Type a misspelled word like 'becuase'" -ForegroundColor White
Write-Host "3. Trigger companion (backspace 3x)" -ForegroundColor White
Write-Host "4. Click 'Show suggestions' if needed" -ForegroundColor White
Write-Host "5. Capture the suggestion panel" -ForegroundColor White
Write-Host "6. Save as: screenshot-3-suggestions.png" -ForegroundColor Yellow
Write-Host "   Location: $screenshotDir" -ForegroundColor Gray
Write-Host ""

Read-Host "Press ENTER when screenshot 3 is captured"

# Screenshot 4: Reading Features
Write-Host ""
Write-Host "STEP 5: Capture Reading Features" -ForegroundColor Green
Write-Host "---------------------------------" -ForegroundColor Gray
Write-Host "1. Open a news article (e.g., bbc.com/news)" -ForegroundColor White
Write-Host "2. Click Dyslexia Tool icon" -ForegroundColor White
Write-Host "3. Enable 'Reading Ruler' toggle" -ForegroundColor White
Write-Host "4. Move mouse to show the blue highlight line" -ForegroundColor White
Write-Host "5. Press F12, Ctrl+Shift+P, type 'screenshot'" -ForegroundColor White
Write-Host "6. Select 'Capture full size screenshot'" -ForegroundColor White
Write-Host "7. Save as: screenshot-4-reading.png" -ForegroundColor Yellow
Write-Host "   Location: $screenshotDir" -ForegroundColor Gray
Write-Host ""

Read-Host "Press ENTER when screenshot 4 is captured"

# Done
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  All Screenshots Captured!         " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "-----------" -ForegroundColor Gray
Write-Host "1. Review screenshots in: $screenshotDir" -ForegroundColor White
Write-Host "2. Edit if needed (add callouts, arrows)" -ForegroundColor White
Write-Host "3. Upload to Chrome Web Store" -ForegroundColor White
Write-Host ""
Write-Host "Recommended editing tools:" -ForegroundColor Yellow
Write-Host "  - Canva (free, online)" -ForegroundColor White
Write-Host "  - Figma (free, online)" -ForegroundColor White
Write-Host "  - Paint.NET (free, Windows)" -ForegroundColor White
Write-Host ""
