type StringMap = Record<string, number>
type SortedWords = Record<number, string[]>

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
