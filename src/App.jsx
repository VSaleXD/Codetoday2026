import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ContestLayout from './components/ContestLayout'
import ProblemDetail from './pages/ProblemDetail'
import Scoreboard from './pages/Scoreboard'

const queryClient = new QueryClient()

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('codetoday-theme') || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('codetoday-theme', theme)
  }, [theme])

  return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Navbar theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          <Routes>
            <Route path="/contests/:cid" element={<ContestLayout />}>
              <Route index element={<Navigate to="problems" replace />} />
              <Route path="problems" element={<Navigate to="A" replace />} />
              <Route path="problems/:problemId" element={<ProblemDetail />} />
              <Route path="scoreboard" element={<Scoreboard />} />
              <Route path="announcements" element={<div className="placeholder-page"><h1>Announcements</h1><p>Pengumuman kontes akan tampil di sini.</p></div>} />
              <Route path="editorial" element={<div className="placeholder-page"><h1>Editorial</h1><p>Editorial soal akan tampil di sini.</p></div>} />
            </Route>
            <Route path="/" element={<Navigate to="/contests/1" replace />} />
            <Route path="*" element={<Navigate to="/contests/1" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    )
}

export default App
