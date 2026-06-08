export interface ChatRecord {
  id: string
  question: string
  answer: string
  created_at: string
}

export interface AskPayload {
  question: string
}
