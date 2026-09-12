import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ContestLayout from './components/ContestLayout'
import ProblemDetail from './pages/ProblemDetail'
import Scoreboard from './pages/Scoreboard'
import ContestList from './pages/ContestList'
import ProblemList from './pages/ProblemList'
import SubmissionsPage from './pages/SubmissionsPage'
import LoginPage from './pages/LoginPage'
import ContestInfoPage from './pages/ContestInfoPage'

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
              <Route path="problems" element={<ProblemList />} />
              <Route path="problems/:problemId" element={<ProblemDetail />} />
              <Route path="scoreboard" element={<Scoreboard />} />
              <Route path="announcements" element={<ContestInfoPage type="announcements" />} />
              <Route path="editorial" element={<ContestInfoPage type="editorial" />} />
            </Route>
            <Route path="/contests" element={<ContestList />} />
            <Route path="/submissions" element={<Navigate to="/contests/demo/submissions" replace />} />
            <Route path="/contests/:cid/submissions" element={<ContestLayout />}>
              <Route index element={<SubmissionsPage />} />
            </Route>
            <Route path="/ranking" element={<Scoreboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/contests/demo" replace />} />
            <Route path="*" element={<Navigate to="/contests/demo" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    )
}

export default App
