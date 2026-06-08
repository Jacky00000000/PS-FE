import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/client'
import { chatbotApi } from '../api/chatbot'
import type { ChatRecord } from '../api/types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function recordsToMessages(records: ChatRecord[]): ChatMessage[] {
  return records.flatMap((record) => [
    { id: `${record.id}-q`, role: 'user' as const, content: record.question },
    { id: `${record.id}-a`, role: 'assistant' as const, content: record.answer },
  ])
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pendingQuestionRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    chatbotApi
      .getRecords()
      .then((records) => {
        if (!cancelled) {
          setMessages(recordsToMessages(records))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsInitializing(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const sendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || isLoading) return

    const tempUserId = `temp-user-${Date.now()}`
    pendingQuestionRef.current = trimmed

    setMessages((prev) => [
      ...prev,
      { id: tempUserId, role: 'user', content: trimmed },
    ])
    setIsLoading(true)
    setError(null)

    try {
      const record = await chatbotApi.ask({ question: trimmed })
      pendingQuestionRef.current = null

      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== tempUserId),
        { id: `${record.id}-q`, role: 'user', content: record.question },
        { id: `${record.id}-a`, role: 'assistant', content: record.answer },
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
      pendingQuestionRef.current = null
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const clearError = useCallback(() => setError(null), [])

  return {
    messages,
    isLoading,
    isInitializing,
    error,
    sendMessage,
    clearError,
    hasMessages: messages.length > 0,
  }
}
