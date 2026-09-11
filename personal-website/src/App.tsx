import { useState } from 'react'
import { Header } from './ui/layout/Header'
import { Footer } from './ui/layout/Footer'
import { ChatPage } from './ui/chat/ChatPage'
import { DonationPage } from './ui/donation/DonationPage'
import { usePathname } from './lib/hooks/usePathname'
import './App.css'

function App() {
  const pathname = usePathname()
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  function toggleTheme() {
    setIsDarkMode((current) => {
      const next = !current
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <div className={`app ${isDarkMode ? 'dark' : ''}`}>
      <Header isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
      {pathname === '/donation' ? <DonationPage /> : <ChatPage />}
      <Footer />
    </div>
  )
}

export default App
