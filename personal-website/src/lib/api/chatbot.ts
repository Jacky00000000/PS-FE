import { request } from './client'
import type { AskPayload, ChatRecord, ChatSource } from './types'

const BASE = '/api/chatbot'

function isChatSource(value: unknown): value is ChatSource {
  if (!value || typeof value !== 'object') return false
  const source = value as Record<string, unknown>

  try {
    const url = new URL(String(source.url))
    return (
      typeof source.id === 'string' &&
      typeof source.title === 'string' &&
      (url.protocol === 'http:' || url.protocol === 'https:')
    )
  } catch {
    return false
  }
}

function parseChatRecord(value: unknown): ChatRecord {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid chatbot response')
  }

  const record = value as Record<string, unknown>
  if (
    typeof record.id !== 'string' ||
    typeof record.question !== 'string' ||
    typeof record.answer !== 'string' ||
    typeof record.created_at !== 'string' ||
    !Array.isArray(record.sources) ||
    !record.sources.every(isChatSource)
  ) {
    throw new Error('Invalid chatbot response')
  }

  return record as unknown as ChatRecord
}

export const chatbotApi = {
  ask(payload: AskPayload) {
    return request<unknown>(`${BASE}/ask/`, { method: 'POST', body: payload }).then(
      parseChatRecord,
    )
  },
}
