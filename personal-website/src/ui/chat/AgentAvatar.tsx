import { useState } from 'react'
import styles from './AgentAvatar.module.css'

/** Place your photo at `public/agent-avatar.png` to replace the placeholder. */
const AVATAR_SRC = '/agent-avatar.png'

export function AgentAvatar() {
  const [hasImage, setHasImage] = useState(true)

  if (!hasImage) {
    return (
      <div className={styles.placeholder} aria-label="Agent avatar placeholder">
        Add photo
      </div>
    )
  }

  return (
    <img
      className={styles.avatar}
      src={AVATAR_SRC}
      alt="AI agent avatar"
      onError={() => setHasImage(false)}
    />
  )
}
