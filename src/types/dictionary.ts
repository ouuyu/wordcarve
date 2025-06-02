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

export interface Sense {
  sense_number: string
  sense_label: string
  definition: Definition
  examples?: Example[]
}

export interface DictionaryDefinition {
  part_of_speech: string
  senses?: Sense[]
  definitions?: string[]
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
  definitions: {
    权威英汉双解?: DictionaryDefinition[]
    英汉?: DictionaryDefinition[]
    英英?: DictionaryDefinition[]
  }
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
