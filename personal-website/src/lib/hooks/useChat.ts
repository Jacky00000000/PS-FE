import { useCallback, useState } from 'react'
import { ApiError } from '../api/client'
import { chatbotApi } from '../api/chatbot'
import type { ChatSource } from '../api/types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || isLoading) return

    const tempUserId = `temp-user-${Date.now()}`
    const history = messages
      .slice(-20)
      .map(({ role, content }) => ({ role, content }))

    setMessages((prev) => [
      ...prev,
      { id: tempUserId, role: 'user', content: trimmed },
    ])
    setIsLoading(true)
    setError(null)

    try {
      const record = await chatbotApi.ask({ question: trimmed, history })

      setMessages((prev) => [
        ...prev.map((msg) =>
          msg.id === tempUserId
            ? { id: `${record.id}-q`, role: 'user' as const, content: record.question }
            : msg,
        ),
        {
          id: `${record.id}-a`,
          role: 'assistant',
          content: record.answer,
          sources: record.sources,
        },
      ])
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 502
            ? 'AI service is temporarily unavailable. Please try again.'
            : err.status === 400
              ? 'Please enter a valid question.'
              : 'Something went wrong. Please try again.'
          : 'Network error. Please check your connection.'

      setError(message)
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserId))
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages])

  const clearError = useCallback(() => setError(null), [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError,
    hasMessages: messages.length > 0,
  }
}
