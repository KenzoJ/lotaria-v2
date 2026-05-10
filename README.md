# Lotaria's Program

**Lotaria’s Program** is a Vue app that lists words by how often they appear, influenced by Lotaria's own program in the 1979 book: *If on a Winter’s Night a Traveler*. You can load a **PDF**, an **EPUB**, or **paste text**. All processing is done in the browser. 

## Features

- **Inputs:** Paste text, upload a PDF or EPUB, or load one of the bundled sample EPUBs.
- **Results:** Words grouped into **buckets by count** (highest frequency first)
- **Display modes:** Three bucket layouts
  - Versions **1** and **2** omit a bundled **common-word** list for clarity
  - **ver 3** counts those words again for a more accurate picture.
- **Book excerpt:** After the main view, you can scroll to an  typing passage from what inspired the program

## How it works

1. **Text extraction** — PDFs are read in the browser with pdf.js; EPUBs are unpacked and their text content is pulled out as plain text.
2. **Tokenization** — The pipeline walks the string, lowercases letters, and splits tokens on spaces, line breaks, and simple punctuation (for example commas, periods, hyphens, and straight quotes). Anything between those boundaries is treated as one word.
3. **Counting and filtering** — Each token’s occurrences are tallied. For ver **1** and **2**, tokens that appear in the app’s common-word list are skipped; ver **3** keeps them.
4. **Buckets** — Words that share the same count are grouped together, then buckets are ordered from the largest count downward for display.

## Stack

Vue 3, Vite, TypeScript, [pdf.js](https://mozilla.github.io/pdf.js/), JSZip. 

Note: The logic and text extraction was done by me, while the more boring stuff (UI, css, basic JS) was handled by Cursor.

## Requirements
Node.js **^20.19.0** or **≥22.12.0**.

## Setup

```sh
npm install
```

## Scripts

- `npm run dev` — local dev server (`postinstall` / dev sync the PDF worker)
- `npm run build` — type-check and production build
- `npm run preview` — serve the production build locally
- `npm run test:unit` — unit tests (Vitest)
- `npm run lint` — ESLint and oxlint
- `npm run format` — Prettier on `src/`
