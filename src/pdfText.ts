import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

// Served from /public via sync script (.js avoids hosts that mishandle .mjs or return SPA HTML for missing files).
GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.js`

/** Extract plain text from a PDF (all pages), for word counting only. */
export async function extractTextFromPdf(file: File): Promise<string> {
  const data = await file.arrayBuffer()
  const pdf = await getDocument({ data }).promise
  const pageTexts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const parts: string[] = []
    for (const item of content.items) {
      if (item && typeof item === 'object' && 'str' in item && typeof item.str === 'string') {
        parts.push(item.str)
      }
    }
    const pagePlain = parts.join(' ').replace(/\s+/g, ' ').trim()
    if (pagePlain) pageTexts.push(pagePlain)
  }

  if (pageTexts.length === 0) {
    throw new Error('No extractable text was found in this PDF.')
  }

  return pageTexts.join('\n\n')
}
