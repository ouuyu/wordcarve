import type { DictionaryEntry } from '@/types'
import type { PronunciationType } from '@/utils/audio'
import { playWordPronunciation } from '@/utils/audio'
import { Message } from '@arco-design/web-vue'
import { computed, ref } from 'vue'

interface UseDictionaryEntryProps {
  word: DictionaryEntry
  mode?: 'normal' | 'mini'
  clickable?: boolean
}

interface MeaningGroup {
  part_of_speech: string
  meanings: string[]
  allExamples: { meaning: string, examples: any[] }[]
}

export function useDictionaryEntry(props: UseDictionaryEntryProps, emit: {
  (e: 'click', word: DictionaryEntry): void
  (e: 'example-click', example: any): void
}) {
  const displayMode = ref(props.mode || 'normal')
  const isMiniMode = computed(() => displayMode.value === 'mini')

  const tagMapping: Record<string, string> = {
    zk: '中考',
    gk: '高考',
    cet4: '四级',
    cet6: '六级',
    ky: '考研',
    toefl: '托福',
    ielts: '雅思',
    gre: 'GRE',
  }

  const shortTranslation = computed(() => {
    if (props.word.translation && props.word.translation.length > 0) {
      return props.word.translation[0].length > 30
        ? `${props.word.translation[0].substring(0, 30)}...`
        : props.word.translation[0]
    }
    return ''
  })

  const mergedMeanings = computed<MeaningGroup[]>(() => {
    if (!props.word.meanings || props.word.meanings.length === 0)
      return []
    const map: Record<string, MeaningGroup> = {}
    props.word.meanings.forEach((m) => {
      if (!map[m.part_of_speech]) {
        map[m.part_of_speech] = { part_of_speech: m.part_of_speech, meanings: [], allExamples: [] }
      }
      map[m.part_of_speech].meanings.push(m.meaning)
      if (m.examples && m.examples.length > 0) {
        map[m.part_of_speech].allExamples.push({ meaning: m.meaning, examples: m.examples })
      }
    })
    return Object.values(map)
  })

  // Track selected meaning: { groupIdx, meaningIdx } or null if none selected
  const selectedMeaning = ref<{ groupIdx: number, meaningIdx: number } | null>(null)

  function selectMeaning(groupIdx: number, meaningIdx: number) {
    selectedMeaning.value = { groupIdx, meaningIdx }
  }

  function isMeaningSelected(groupIdx: number, meaningIdx: number): boolean {
    return (
      selectedMeaning.value?.groupIdx === groupIdx
      && selectedMeaning.value?.meaningIdx === meaningIdx
    )
  }

  function getTagDisplay(tag: string): string {
    return tagMapping[tag] || tag
  }

  async function playPronunciation(type: PronunciationType, event?: Event) {
    if (event)
      event.stopPropagation()
    try {
      await playWordPronunciation(props.word.word, type)
    }
    catch {
      Message.error('播放发音失败')
    }
  }

  function handleClick() {
    if (props.clickable)
      emit('click', props.word)
  }

  function handleExampleClick(example: any, event: Event) {
    event.stopPropagation()
    emit('example-click', example)
  }

  return {
    displayMode,
    isMiniMode,
    shortTranslation,
    mergedMeanings,
    selectedMeaning,
    selectMeaning,
    isMeaningSelected,
    getTagDisplay,
    playPronunciation,
    handleClick,
    handleExampleClick,
  }
}
