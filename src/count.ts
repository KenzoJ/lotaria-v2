type StringMap = Record<string, number>
export type SortedWords = Record<number, string[]>

/** Largest frequency present in buckets (0 if empty). */
export function maxFrequency(sorted: SortedWords): number {
  const keys = Object.keys(sorted)
  if (keys.length === 0) return 0
  return Math.max(...keys.map(Number))
}

/** Frequencies that have at least one word, highest first — use this iteration order in the UI. */
export function frequenciesDescending(sorted: SortedWords): number[] {
  return Object.keys(sorted)
    .map(Number)
    .filter((n) => (sorted[n]?.length ?? 0) > 0)
    .sort((a, b) => b - a)
}

export function countWords(words: string): StringMap {
  //
  const length: number = words.length - 1
  const result: StringMap = {}
  let word = ''
  for (let i = 0; i < length; i++) {
    const ch = words[i]
    if (ch === undefined) {
      throw new Error('words undefined')
    }
    if (ch !== ' ' && ch !== ',') {
      word += ch.toLowerCase()
    }
    if (ch === ' ') {
      const n = result[word]
      if (n !== undefined) {
        result[word] = n + 1
        word = ''
      }
      result[word] = 1
      word = ''
    }
  }
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
