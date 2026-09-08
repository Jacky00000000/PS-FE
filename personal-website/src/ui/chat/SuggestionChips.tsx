import styles from './SuggestionChips.module.css'

const SUGGESTIONS = [
  '尼個乜嘢網站黎 ?',
  '教我 Python',
  '香港近期新聞',
  '幫我寫一個簡單嘅 HTML 網頁',
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
