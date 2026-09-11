import { useEffect, useState } from 'react'
import characterHit from '../../assets/char-hit.png'
import characterMoney from '../../assets/char-money-v2.png'
import character from '../../assets/char.png'
import moneyButtonImage from '../../assets/money-btn.png'
import styles from './DonationPage.module.css'

type CharacterState = 'normal' | 'money' | 'hit'

export function DonationPage() {
  const [characterState, setCharacterState] = useState<CharacterState>('normal')

  useEffect(() => {
    if (characterState === 'normal') {
      return
    }

    const showCharacterTimer = window.setTimeout(() => {
      setCharacterState('normal')
    }, 1500)

    return () => window.clearTimeout(showCharacterTimer)
  }, [characterState])

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.gameArea}>
            <button
              type="button"
              className={styles.avatarButton}
              aria-label="點擊人物"
              title="點擊人物"
              onClick={() => setCharacterState('hit')}
            >
              <img
                src={character}
                alt="API 小助手"
                className={`${styles.avatar} ${
                  characterState === 'normal' ? styles.avatarVisible : ''
                }`}
              />
              <img
                src={characterMoney}
                alt=""
                aria-hidden="true"
                className={`${styles.avatar} ${
                  characterState === 'money' ? styles.avatarVisible : ''
                }`}
              />
              <img
                src={characterHit}
                alt=""
                aria-hidden="true"
                className={`${styles.avatar} ${
                  characterState === 'hit' ? styles.avatarVisible : ''
                }`}
              />
            </button>

            <button
              type="button"
              className={styles.moneyButton}
              aria-label="送出虛擬金錢"
              title="送出虛擬金錢"
              onClick={() => setCharacterState('money')}
            >
              <img src={moneyButtonImage} alt="" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
