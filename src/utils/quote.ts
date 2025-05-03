import { http } from './http'

export interface DailyQuote {
  id: number
  content: string
  translation: string
  author: string
  origin: string
}

let cachedQuote: DailyQuote | null = null
let cachedAt: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1小时，单位为毫秒

export async function getDailyQuote(): Promise<DailyQuote> {
  const now = Date.now()
  if (cachedQuote && (now - cachedAt < CACHE_DURATION)) {
    // 命中缓存，直接返回
    return cachedQuote
  }

  try {
    const data = await http.get('https://apiv3.shanbay.com/weapps/dailyquote/quote', {
      headers: {
        'Content-Type': 'application/json',
      },
    }).json<DailyQuote>()

    // 更新缓存
    cachedQuote = data
    cachedAt = now
    return data
  }
  catch (error) {
    console.error('获取每日一言失败:', error)
    throw new Error('获取每日一言失败')
  }
}
