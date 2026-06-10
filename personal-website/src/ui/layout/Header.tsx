import type { ReactNode } from 'react'
import { navigate, usePathname } from '../../lib/hooks/usePathname'
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

function DonationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NavItem({
  href,
  label,
  icon,
  isActive,
}: {
  href: string
  label: string
  icon: ReactNode
  isActive: boolean
}) {
  return (
    <a
      href={href}
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
      aria-current={isActive ? 'page' : undefined}
      onClick={(event) => {
        event.preventDefault()
        if (!isActive) navigate(href)
      }}
    >
      {icon}
      <span className={styles.navLabel}>{label}</span>
    </a>
  )
}

export function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isDonation = pathname === '/donation'

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <NavItem href="/" label="Home page" icon={<HomeIcon />} isActive={isHome} />
        <NavItem href="/donation" label="Donation" icon={<DonationIcon />} isActive={isDonation} />
      </div>
    </header>
  )
}
