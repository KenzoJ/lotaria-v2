import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
const destDir = path.join(root, 'public')
const dest = path.join(destDir, 'pdf.worker.min.js')

if (!fs.existsSync(src)) {
  console.warn('[sync-pdf-worker] pdfjs-dist not installed; skip')
  process.exit(0)
}

fs.mkdirSync(destDir, { recursive: true })
fs.copyFileSync(src, dest)
