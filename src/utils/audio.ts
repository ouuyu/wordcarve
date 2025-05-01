export enum PronunciationType {
  US = 0,  // 美式发音
  UK = 1   // 英式发音
}

/**
 * 获取有道词典发音URL
 * @param word 要发音的单词
 * @param type 发音类型（0：美音，1：英音）
 * @returns 发音音频URL
 */
export function getYoudaoPronunciationUrl(word: string, type: PronunciationType = PronunciationType.US): string {
  return `http://dict.youdao.com/dictvoice?type=${type}&audio=${encodeURIComponent(word)}`
}

/**
 * 播放单词发音
 * @param word 要发音的单词
 * @param type 发音类型（0：美音，1：英音）
 */
export async function playWordPronunciation(word: string, type: PronunciationType = PronunciationType.US): Promise<void> {
  try {
    const audio = new Audio(getYoudaoPronunciationUrl(word, type))
    await audio.play()
  } catch (error) {
    console.error('播放发音失败:', error)
    throw new Error('播放发音失败')
  }
}