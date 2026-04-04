#!/usr/bin/env node

/**
 * Icon Generator Script
 * Converts SVG icons to PNG for Chrome Extension
 * 
 * Usage: node scripts/generate-icons.js
 */

import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple PNG placeholder generator (blue gradient with "D")
function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#3B82F6')
  gradient.addColorStop(1, '#2563EB')
  ctx.fillStyle = gradient
  ctx.roundRect(0, 0, size, size, size * 0.1875)
  ctx.fill()
  
  // White "D" letter
  ctx.font = `bold ${size * 0.5625}px Arial`
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('D', size / 2, size / 2 + size * 0.0625)
  
  // Sparkles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.beginPath()
  ctx.arc(size * 0.75, size * 0.25, size * 0.03125, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.beginPath()
  ctx.arc(size * 0.25, size * 0.75, size * 0.0234375, 0, Math.PI * 2)
  ctx.fill()
  
  return canvas.toBuffer('image/png')
}

// Generate icons
const iconsDir = path.join(__dirname, '..', 'icons')
const sizes = [16, 48, 128]

console.log('Generating PNG icons...')

sizes.forEach(size => {
  const png = generateIcon(size)
  const filePath = path.join(iconsDir, `icon${size}.png`)
  fs.writeFileSync(filePath, png)
  console.log(`✓ Generated icon${size}.png`)
})

console.log('\n✅ Icons generated successfully!')
