import styles from './SuggestionChips.module.css'

const SUGGESTIONS = [
  '尼個乜嘢網站黎 ?',
  'Python 新手教學',
  '幫我寫一個簡單嘅 Python 程式',
  '香港近期新聞',
  'idle 10大熱門歌曲',
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
