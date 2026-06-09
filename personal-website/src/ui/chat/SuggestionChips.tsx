import styles from './SuggestionChips.module.css'

const SUGGESTIONS = [
  '尼個乜嘢網站黎 ?',
  '自我介紹下',
  '搵到工未 ?',
  '你幾多歲 ?',
  '教我揼code',
  '幫我揼下Leetcode第39題',
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
