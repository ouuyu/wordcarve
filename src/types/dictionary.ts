export interface Pronunciation {
  US: string
  UK: string
}

export interface Definition {
  Chinese: string
  English: string
}

export interface Example {
  English: string
  Chinese: string
}

export interface Idiom {
  idiom: string
  definition: Definition
  examples?: Example[]
}

export interface Sense {
  sense_number: string
  sense_label: string
  definition: Definition
  examples?: Example[]
  grammar_tags?: string[]
  pattern?: string
}

export interface DictionaryDefinition {
  part_of_speech: string
  senses?: Sense[]
  definitions?: string[]
  idioms?: Idiom[]
}

export interface WordForm {
  type: string
  form: string
}

export interface CollocationGroup {
  type: string
  items: string[]
}

export interface SynonymAntonymGroup {
  part_of_speech: string
  items: string[]
}

export interface OnlineDictionaryEntry {
  headword: string
  pronunciations: Pronunciation
  definitions: DictionaryDefinition[]
  collocations?: CollocationGroup[]
  synonyms?: SynonymAntonymGroup[]
  antonyms?: SynonymAntonymGroup[]
  tags?: string[]
  frequency?: number
  wordForms?: WordForm[]
}

export interface ExternalDictionary {
  name: string
  url: string
  icon: string
}

export type DictionarySource = '权威英汉双解' | '英汉' | '英英'

// Dictionary Adapter Types
export interface DictionarySearchResult<T = any> {
  entries: T[]
  source: string
  timestamp: number
  cached?: boolean
  resultType: 'online' | 'local'
}

export interface DictionaryAdapter<T = any> {
  name: string
  displayName: string
  icon: string
  resultType: 'online' | 'local'
  search(query: string): Promise<DictionarySearchResult<T>>
  isAvailable(): Promise<boolean>
}

export interface SearchSuggestion {
  word: string
  frequency?: number
  source: string
}

export interface SearchHistory {
  query: string
  timestamp: number
  results: number
}

// Cambridge Dictionary Types
export interface CambridgePronunciation {
  pos: string
  lang: 'us' | 'uk'
  url: string
  pron: string
}

export interface CambridgeVerb {
  id: number
  type: string
  text: string
}

export interface CambridgeExample {
  id: number
  text: string
  translation: string
}

export interface CambridgeDefinition {
  id: number
  pos: string
  source: string
  text: string
  translation: string
  example: CambridgeExample[]
}

export interface CambridgeDictionaryEntry {
  word: string
  pos: string[]
  verbs?: CambridgeVerb[]
  pronunciation: CambridgePronunciation[]
  definition: CambridgeDefinition[]
}
