import { useState } from 'react'
import styles from './AgentAvatar.module.css'

/** Uses the icon photo at `public/icons.jpeg` as the agent avatar. */
const AVATAR_SRC = '/iconAi.png'

interface AgentAvatarProps {
  size?: 'lg' | 'sm'
}

export function AgentAvatar({ size = 'lg' }: AgentAvatarProps) {
  const [hasImage, setHasImage] = useState(true)
  const sizeClass = size === 'sm' ? styles.sm : styles.lg

  if (!hasImage) {
    return (
      <div
        className={`${styles.placeholder} ${sizeClass}`}
        aria-label="Agent avatar placeholder"
      >
        Add photo
      </div>
    )
  }

  return (
    <img
      className={`${styles.avatar} ${sizeClass}`}
      src={AVATAR_SRC}
      alt="AI agent avatar"
      onError={() => setHasImage(false)}
    />
  )
}
