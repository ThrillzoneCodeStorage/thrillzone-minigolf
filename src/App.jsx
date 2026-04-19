import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import PlayerApp from './pages/PlayerApp'
import TVLeaderboard from './pages/TVLeaderboard'
import AdminPanel from './pages/AdminPanel'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <GameProvider>
            <PlayerApp />
          </GameProvider>
        } />
        <Route path="/leaderboard" element={<TVLeaderboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}
