export interface ChatRecord {
  id: string
  question: string
  answer: string
  created_at: string
}

export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AskPayload {
  question: string
  history?: HistoryMessage[]
}
