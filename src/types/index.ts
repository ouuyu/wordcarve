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
    [key: string]: string
  }
}
