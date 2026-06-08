import styles from './Header.module.css'

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <a href="/" className={`${styles.navLink} ${styles.navLinkActive}`} aria-current="page">
          <HomeIcon />
          <span className={styles.navLabel}>Home page</span>
        </a>
      </div>
    </header>
  )
}
