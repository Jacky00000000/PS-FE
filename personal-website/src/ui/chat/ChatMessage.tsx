import styles from './ChatMessage.module.css'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      <div className={styles.bubble}>{content}</div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className={`${styles.message} ${styles.assistant}`}>
      <div className={styles.bubble}>
        <span className={styles.typing} aria-label="AI is typing">
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  )
}
