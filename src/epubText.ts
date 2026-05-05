import JSZip from 'jszip'

const OPF_NS = 'http://www.idpf.org/2007/opf'

function joinZipPath(dir: string, href: string): string {
  const stack = dir ? dir.split('/').filter(Boolean) : []
  for (const seg of href.split('/')) {
    if (seg === '..') stack.pop()
    else if (seg && seg !== '.') stack.push(seg)
  }
  return stack.join('/')
}

function htmlToPlain(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script, style').forEach((el) => el.remove())
  return (doc.body?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function xhtmlToPlain(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const err = doc.querySelector('parsererror')
  if (err) return htmlToPlain(xml)
  doc.querySelectorAll('script, style').forEach((el) => el.remove())
  return (doc.documentElement?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function isHtmlishChapter(mediaType: string, href: string): boolean {
  const h = href.toLowerCase()
  if (h.endsWith('.xhtml') || h.endsWith('.html') || h.endsWith('.htm')) return true
  const mt = mediaType.toLowerCase()
  return mt.includes('html') || mt.includes('xhtml+xml')
}

function collectManifest(
  opfDoc: Document,
): { idToHref: Map<string, string>; idToMedia: Map<string, string> } {
  const idToHref = new Map<string, string>()
  const idToMedia = new Map<string, string>()
  const tryCollect = (items: HTMLCollectionOf<Element> | Iterable<Element>) => {
    for (const el of items) {
      const id = el.getAttribute('id')
      const href = el.getAttribute('href')
      const mt = el.getAttribute('media-type')
      if (id && href) {
        idToHref.set(id, href)
        if (mt) idToMedia.set(id, mt)
      }
    }
  }
  tryCollect(opfDoc.getElementsByTagNameNS(OPF_NS, 'item'))
  if (idToHref.size === 0) tryCollect(opfDoc.getElementsByTagName('item'))
  return { idToHref, idToMedia }
}

function spineIdrefs(opfDoc: Document): string[] {
  const refs: string[] = []
  const add = (nodes: HTMLCollectionOf<Element> | Iterable<Element>) => {
    for (const el of nodes) {
      const idref = el.getAttribute('idref')
      if (idref) refs.push(idref)
    }
  }
  add(opfDoc.getElementsByTagNameNS(OPF_NS, 'itemref'))
  if (refs.length === 0) add(opfDoc.getElementsByTagName('itemref'))
  return refs
}

/** Pull readable text from an EPUB file (spine XHTML/HTML). */
export async function extractTextFromEpub(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buf)
  const containerEntry = zip.file('META-INF/container.xml')
  if (!containerEntry) throw new Error('Not a valid EPUB (missing META-INF/container.xml).')
  const containerXml = await containerEntry.async('string')
  const rootfile = containerXml.match(/full-path\s*=\s*["']([^"']+)["']/i)
  const opfPath = rootfile?.[1]
  if (!opfPath) throw new Error('Could not find package document in EPUB.')

  const opfEntry = zip.file(opfPath)
  if (!opfEntry) throw new Error('EPUB package file is missing from archive.')
  const opfXml = await opfEntry.async('string')
  const opfDir = opfPath.includes('/') ? opfPath.replace(/\/[^/]+$/, '') : ''

  const opfDoc = new DOMParser().parseFromString(opfXml, 'application/xml')
  const { idToHref, idToMedia } = collectManifest(opfDoc)
  const idrefs = spineIdrefs(opfDoc)
  if (idrefs.length === 0) throw new Error('EPUB spine is empty.')

  const chunks: string[] = []
  for (const idref of idrefs) {
    const href = idToHref.get(idref)
    if (!href) continue
    const mediaType = idToMedia.get(idref) ?? ''
    const lower = href.toLowerCase()
    if (!isHtmlishChapter(mediaType, href)) continue

    const path = joinZipPath(opfDir, href)
    const entry = zip.file(path)
    if (!entry) continue
    const raw = await entry.async('string')
    const useXhtml =
      lower.endsWith('.xhtml') || mediaType.toLowerCase().includes('xhtml') || mediaType.includes('+xml')
    const plain = useXhtml ? xhtmlToPlain(raw) : htmlToPlain(raw)
    if (plain) chunks.push(plain)
  }

  if (chunks.length === 0) throw new Error('No readable chapter HTML was found in this EPUB.')
  return chunks.join('\n\n')
}
