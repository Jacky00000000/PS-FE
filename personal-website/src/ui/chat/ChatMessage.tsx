import { AgentAvatar } from './AgentAvatar'
import { MessageContent } from './MessageContent'
import styles from './ChatMessage.module.css'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      {role === 'assistant' && (
        <div className={styles.avatarSlot}>
          <AgentAvatar size="sm" />
        </div>
      )}
      <div className={styles.bubble}>
        {role === 'assistant' ? <MessageContent content={content} /> : content}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className={`${styles.message} ${styles.assistant}`}>
      <div className={styles.avatarSlot}>
        <AgentAvatar size="sm" />
      </div>
      <div className={styles.bubble}>
        <span className={styles.typing} aria-label="load緊唔好急">
          load緊唔好急...
        </span>
      </div>
    </div>
  )
}
