import { Header } from './ui/layout/Header'
import { Footer } from './ui/layout/Footer'
import { ChatPage } from './ui/chat/ChatPage'
import { DonationPage } from './ui/donation/DonationPage'
import { usePathname } from './lib/hooks/usePathname'
import './App.css'

function App() {
  const pathname = usePathname()

  return (
    <div className="app">
      <Header />
      {pathname === '/donation' ? <DonationPage /> : <ChatPage />}
      <Footer />
    </div>
  )
}

export default App
