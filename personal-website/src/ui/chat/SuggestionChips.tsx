import styles from './SuggestionChips.module.css'

const SUGGESTIONS = [
  'Who are you?',
  'What do you do?',
  'Tell me about your experience',
  'What are your skills?',
  'How can I contact you?',
  'What projects have you worked on?',
]

interface SuggestionChipsProps {
  onSelect: (text: string) => void
  disabled?: boolean
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className={styles.chips}>
      {SUGGESTIONS.map((text) => (
        <button
          key={text}
          type="button"
          className={styles.chip}
          onClick={() => onSelect(text)}
          disabled={disabled}
        >
          {text}
        </button>
      ))}
    </div>
  )
}
