import { request } from './client'
import type { AskPayload, ChatRecord } from './types'

const BASE = '/api/chatbot'

export const chatbotApi = {
  ask(payload: AskPayload) {
    return request<ChatRecord>(`${BASE}/ask/`, { method: 'POST', body: payload })
  },

  getRecords() {
    return request<ChatRecord[]>(`${BASE}/records/`)
  },

  getRecord(id: string) {
    return request<ChatRecord>(`${BASE}/records/${id}/`)
  },

  deleteRecord(id: string) {
    return request<void>(`${BASE}/records/${id}/`, { method: 'DELETE' })
  },
}
