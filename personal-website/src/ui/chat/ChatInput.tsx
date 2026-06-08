import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './ChatInput.module.css'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 19V5m0 0-7 7m7-7 7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Ask me anything…',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [hasContent, setHasContent] = useState(false)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [])

  const handleInput = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    setHasContent(el.value.trim().length > 0)
    adjustHeight()
  }, [adjustHeight])

  const handleSubmit = useCallback(() => {
    const el = textareaRef.current
    if (!el) return

    const value = el.value.trim()
    if (!value || disabled) return

    onSend(value)
    el.value = ''
    el.style.height = 'auto'
    setHasContent(false)
  }, [disabled, onSend])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [adjustHeight])

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          rows={1}
          placeholder={placeholder}
          disabled={disabled}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.sendButton} ${hasContent ? styles.sendButtonActive : ''}`}
            onClick={handleSubmit}
            disabled={disabled || !hasContent}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
