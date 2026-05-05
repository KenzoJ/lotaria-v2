import common_words from './words'

type StringMap = Record<string, number>
export type SortedWords = Record<number, string[]>

const COMMON_WORD_SET = new Set(
  Object.keys(common_words).map((w) => w.toLowerCase()),
)

export function frequenciesDescending(sorted: SortedWords): number[] {
  return Object.keys(sorted)
    .map(Number)
    .filter((n) => (sorted[n]?.length ?? 0) > 0)
    .sort((a, b) => b - a)
}

export function countWords(words: string): StringMap {
  const result: StringMap = {}
  let word = ''

  const flush = () => {
    if (word.length === 0) return
    if (COMMON_WORD_SET.has(word)) {
      word = ''
      return
    }
    result[word] = (result[word] ?? 0) + 1
    word = ''
  }

  const isDelimiter = (ch: string) => {
    return (
      ch === ' ' ||
      ch === '\n' ||
      ch === '\r' ||
      ch === '\t' ||
      ch === ',' ||
      ch === '.' ||
      ch === '-' ||
      ch === `'` ||
      ch === `"`
    )
  }

  for (let i = 0; i < words.length; i++) {
    const ch = words[i]
    if (ch === undefined) {
      throw new Error('words undefined')
    }
    if (isDelimiter(ch)) {
      flush()
    } else {
      word += ch.toLowerCase()
    }

  }
  flush()
  return result
}

export function sortWords(words: StringMap): SortedWords {
  const result: SortedWords = {}
  for (let word in words) {
    let currNum = words[word]?? 0;
    const bucket = result[currNum]
    if (bucket) {
      bucket.push(word)
    } else {
      result[currNum] = [word]
    }
  }
  return result;
}
