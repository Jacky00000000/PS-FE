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
        <div className={styles.chatColumn}>
          {!hasMessages && (
            <section className={styles.welcome}>
              <AgentAvatar />
              <h2 className={styles.greeting}>Hi, I&apos;m Jacky</h2>
              <SuggestionChips onSelect={sendMessage} disabled={isLoading} />
            </section>
          )}

          {hasMessages && (
            <div className={styles.messages}>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  sources={msg.sources}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}

          {error && (
            <button className={styles.error} type="button" role="alert" onClick={clearError}>
              {error}
            </button>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <div className={styles.inputBar}>
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}
