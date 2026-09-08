import { request } from './client'
import type { AskPayload, ChatRecord } from './types'

const BASE = '/api/chatbot'

export const chatbotApi = {
  ask(payload: AskPayload) {
    return request<ChatRecord>(`${BASE}/ask/`, { method: 'POST', body: payload })
  },
}
