import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const workerSrc = join('node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs')
const workerDest = join('public', 'workers', 'pdf.worker.min.mjs')

if (!existsSync(workerSrc)) {
  console.warn('pdf.worker.min.mjs not found — pdfjs-dist may not be installed yet.')
  process.exit(0)
}

mkdirSync(join('public', 'workers'), { recursive: true })
copyFileSync(workerSrc, workerDest)
console.log('pdf.worker.min.mjs copied to public/workers/')
