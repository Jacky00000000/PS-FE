import { AgentAvatar } from './AgentAvatar'
import { MessageContent } from './MessageContent'
import type { ChatSource } from '../../lib/api/types'
import styles from './ChatMessage.module.css'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
}

export function ChatMessage({ role, content, sources }: ChatMessageProps) {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      {role === 'assistant' && (
        <div className={styles.avatarSlot}>
          <AgentAvatar size="sm" />
        </div>
      )}
      <div className={styles.bubble}>
        {role === 'assistant' ? (
          <MessageContent content={content} sources={sources} />
        ) : (
          content
        )}
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
        <span className={styles.typing} aria-label="諗緊唔好急">
          諗緊唔好急...
        </span>
      </div>
    </div>
  )
}
