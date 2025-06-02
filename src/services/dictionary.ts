import ky from 'ky'
import { OnlineDictionaryEntry } from '@/types/dictionary'

const API_BASE_URL = 'https://supabase.wordcarve.com/functions/v1'

/**
 * 查询单词的在线词典数据
 * @param word 要查询的单词
 * @returns 词典条目数组
 */
export async function queryWord(word: string): Promise<OnlineDictionaryEntry[]> {
  if (!word.trim()) {
    return []
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒超时

    const response = await ky
      .get(`${API_BASE_URL}/query-word`, {
        searchParams: { query: word.trim() },
        retry: {
          limit: 2,
          methods: ['get'],
          statusCodes: [408, 429, 500, 502, 503, 504],
        },
        timeout: 15000,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .json<OnlineDictionaryEntry[]>()

    clearTimeout(timeoutId)
    return response
  } catch (error) {
    console.error('在线词典查询失败:', error)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('查询超时，请稍后重试')
      }
    }
    throw error
  }
}

/**
 * 词形变化类型映射
 */
export const wordFormMapping: Record<string, string> = {
  p: '过去式',
  d: '过去分词',
  i: '现在分词',
  3: '第三人称单数',
  r: '比较级',
  t: '最高级',
  s: '复数',
}

/**
 * 单词标签映射
 */
export const tagMapping: Record<string, string> = {
  zk: '中考',
  gk: '高考',
  cet4: '四级',
  cet6: '六级',
  ky: '考研',
  toefl: '托福',
  ielts: '雅思',
  gre: 'GRE',
}

/**
 * 外部词典链接
 */
export const externalDictionaries = [
  {
    name: '剑桥词典',
    url: 'https://dictionary.cambridge.org/dictionary/english/',
    icon: 'i-carbon-book',
  },
  {
    name: '柯林斯词典',
    url: 'https://www.collinsdictionary.com/dictionary/english/',
    icon: 'i-carbon-translate',
  },
  {
    name: '有道词典',
    url: 'https://www.youdao.com/result?word=',
    icon: 'i-carbon-translate',
  },
]

/**
 * 根据词频计算词频等级 (1-5)
 * @param frequency 词频值
 * @returns 词频等级 (0-5)
 */
export function calculateFrequencyLevel(frequency?: number): number {
  if (!frequency) return 0
  if (frequency <= 1000) return 5
  if (frequency <= 3000) return 4
  if (frequency <= 6000) return 3
  if (frequency <= 10000) return 2
  return 1
}

/**
 * 获取标签显示名称
 * @param tag 标签代码
 * @returns 标签显示名称
 */
export function getTagDisplay(tag: string): string {
  return tagMapping[tag] || tag
}
