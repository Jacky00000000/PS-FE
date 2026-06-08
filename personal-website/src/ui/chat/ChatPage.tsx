import { useEffect, useRef } from 'react'
import { useChat } from '../../lib/hooks/useChat'
import { AgentAvatar } from './AgentAvatar'
import { ChatInput } from './ChatInput'
import { ChatMessage, TypingIndicator } from './ChatMessage'
import { SuggestionChips } from './SuggestionChips'
import styles from './ChatPage.module.css'

export function ChatPage() {
  const {
    messages,
    isLoading,
    isInitializing,
    error,
    sendMessage,
    clearError,
    hasMessages,
  } = useChat()

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {!hasMessages && !isInitializing && (
          <section className={styles.welcome}>
            <AgentAvatar />
            <h2 className={styles.greeting}>Hi, I&apos;m your AI twin</h2>
            <SuggestionChips onSelect={sendMessage} disabled={isLoading} />
          </section>
        )}

        {hasMessages && (
          <div className={styles.messages}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        )}

        {error && (
          <div className={styles.error} role="alert" onClick={clearError}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <ChatInput onSend={sendMessage} disabled={isLoading || isInitializing} />
    </div>
  )
}
