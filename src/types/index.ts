export interface Book {
  id: string
  name: string
  word_count: number
}

export interface Word {
  text: string
  meaning: string
}

export interface StudyDataEntry {
  progress: number
  lastStudyTime: string | null // ISO-8601
}

export interface StudyData {
  [wordId: string]: StudyDataEntry
}

export interface DictionaryEntry {
  word: string
  phonetic: string
  definition: string[]
  translation: string[]
  pos: {
    [key: string]: number
  }
  collins?: number
  oxford?: number
  tag?: string[]
  bnc?: number
  frq?: number
  exchange?: {
    p?: string // 过去式（did）
    d?: string // 过去分词（done）
    i?: string // 现在分词（doing）
    3?: string // 第三人称单数（does）
    r?: string // 形容词比较级（-er）
    t?: string // 形容词最高级（-est）
    s?: string // 名词复数形式
    [key: string]: string | undefined
  }
}
