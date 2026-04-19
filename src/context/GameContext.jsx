import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  createSession, updateSession, getSessionByDeviceCode,
  getScoresForSession, upsertScore, uploadPhoto, getSessionPhotos, getHoles
} from '../lib/supabase'

const GameContext = createContext(null)

export const PLAYER_COLORS = [
  '#FFD600', '#60a5fa', '#f87171', '#a78bfa',
  '#34d399', '#fb923c', '#f472b6', '#38bdf8',
]

const DEVICE_CODE_KEY  = 'thrillzone_device_code'
const SESSION_ID_KEY   = 'thrillzone_session_id'

function generateDeviceCode() {
  return `tz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function GameProvider({ children }) {
  const [phase, setPhase]                   = useState('loading')
  const [onboardStep, setOnboardStep]       = useState('playStyle')
  const [playStyle, setPlayStyle]           = useState(null)
  const [optOut, setOptOut]                 = useState(false)
  const [players, setPlayers]               = useState([])
  const [holes, setHoles]                   = useState([])
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0)
  const [scores, setScores]                 = useState({})   // { holeId: { playerName: strokes } }
  const [skippedHoles, setSkippedHoles]     = useState(new Set())  // Set of holeIds skipped
  const [sessionId, setSessionId]           = useState(null)
  const [deviceCode, setDeviceCode]         = useState(null)
  const [photos, setPhotos]                 = useState([])
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)
  const [showSpinner, setShowSpinner]       = useState(false)
  const [spinnerEffect, setSpinnerEffect]   = useState(null)
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [isLoading, setIsLoading]           = useState(false)

  // ── Init / session recovery ─────────────────────
  useEffect(() => {
    async function init() {
      const holesData = await getHoles()
      setHoles(holesData)

      const savedCode      = localStorage.getItem(DEVICE_CODE_KEY)
      const savedSessionId = localStorage.getItem(SESSION_ID_KEY)

      if (savedCode && savedSessionId) {
        const existing = await getSessionByDeviceCode(savedCode)
        if (existing) {
          setSessionId(existing.id)
          setDeviceCode(savedCode)
          setPlayStyle(existing.play_style)
          setOptOut(existing.opt_out_leaderboard)
          setPlayers(existing.players || [])
          setCurrentHoleIndex(existing.current_hole_index || 0)

          const existingScores = await getScoresForSession(existing.id)
          const scoreMap = {}
          for (const s of existingScores) {
            if (!scoreMap[s.hole_id]) scoreMap[s.hole_id] = {}
            scoreMap[s.hole_id][s.player_name] = s.strokes
          }
          setScores(scoreMap)

          const existingPhotos = await getSessionPhotos(existing.id)
          setPhotos(existingPhotos.map(p => p.storage_path))
          setPhase('playing')
          return
        }
      }
      setPhase('onboarding')
    }
    init()
  }, [])

  // ── Start game ──────────────────────────────────
  const startGame = useCallback(async ({ playStyle: ps, optOut: oo, players: pl }) => {
    setIsLoading(true)
    try {
      const code = generateDeviceCode()
      const session = await createSession({
        device_code: code, play_style: ps,
        opt_out_leaderboard: oo, players: pl, current_hole_index: 0,
      })
      setSessionId(session.id); setDeviceCode(code)
      setPlayStyle(ps); setOptOut(oo); setPlayers(pl)
      setCurrentHoleIndex(0); setScores({}); setSkippedHoles(new Set()); setPhotos([])
      localStorage.setItem(DEVICE_CODE_KEY, code)
      localStorage.setItem(SESSION_ID_KEY, session.id)
      setPhase('playing')
    } finally { setIsLoading(false) }
  }, [])

  // ── Save a score ────────────────────────────────
  const saveScore = useCallback(async (holeId, playerName, strokes) => {
    setScores(prev => ({
      ...prev,
      [holeId]: { ...(prev[holeId] || {}), [playerName]: strokes }
    }))
    if (sessionId && holeId) await upsertScore(sessionId, holeId, playerName, strokes)
  }, [sessionId])

  // ── Navigate ────────────────────────────────────
  const goToHole = useCallback(async (index) => {
    const clamped = Math.max(0, Math.min(index, holes.length - 1))
    setCurrentHoleIndex(clamped)
    if (sessionId) await updateSession(sessionId, { current_hole_index: clamped })
  }, [sessionId, holes.length])

  // ── Skip current hole ───────────────────────────
  const skipHole = useCallback(async () => {
    const hole = holes[currentHoleIndex]
    if (hole) setSkippedHoles(prev => new Set([...prev, hole.id]))
    if (currentHoleIndex >= holes.length - 1) {
      if (sessionId) await updateSession(sessionId, { completed_at: new Date().toISOString() })
      setPhase('end')
    } else {
      await goToHole(currentHoleIndex + 1)
      setCurrentTurnIndex(0)
    }
  }, [currentHoleIndex, holes, sessionId, goToHole])

  // ── Next hole (after scoring) ───────────────────
  const nextHole = useCallback(async (spinnerEffectResult) => {
    if (playStyle === 'silly' && spinnerEffectResult) {
      setSpinnerEffect(spinnerEffectResult)
      setShowSpinner(true)
      return
    }
    if (currentHoleIndex >= holes.length - 1) {
      if (sessionId) await updateSession(sessionId, { completed_at: new Date().toISOString() })
      setPhase('end')
    } else {
      const nextIdx = currentHoleIndex + 1
      await goToHole(nextIdx)
      // Winner of this hole goes first on next
      const thisHole = holes[currentHoleIndex]
      if (thisHole) {
        const holeScores = scores[thisHole.id] || {}
        let minStrokes = Infinity, winnerIdx = 0
        players.forEach((p, i) => {
          const s = holeScores[p.name]
          if (s !== undefined && s !== null && s < minStrokes) { minStrokes = s; winnerIdx = i }
        })
        setCurrentTurnIndex(winnerIdx)
      } else {
        setCurrentTurnIndex(0)
      }
    }
  }, [playStyle, currentHoleIndex, holes, sessionId, goToHole, scores, players])

  const dismissSpinner = useCallback(async () => {
    setShowSpinner(false); setSpinnerEffect(null)
    if (currentHoleIndex >= holes.length - 1) {
      if (sessionId) await updateSession(sessionId, { completed_at: new Date().toISOString() })
      setPhase('end')
    } else {
      await goToHole(currentHoleIndex + 1)
      setCurrentTurnIndex(0)
    }
  }, [currentHoleIndex, holes.length, sessionId, goToHole])

  // ── Photos ──────────────────────────────────────
  const addPhoto = useCallback(async (blob) => {
    if (!sessionId) return
    try {
      const url = await uploadPhoto(sessionId, blob)
      setPhotos(prev => [...prev, url])
      return url
    } catch {
      const localUrl = URL.createObjectURL(blob)
      setPhotos(prev => [...prev, localUrl])
      return localUrl
    }
  }, [sessionId])

  // ── Play again ──────────────────────────────────
  const playAgain = useCallback(() => {
    localStorage.removeItem(DEVICE_CODE_KEY)
    localStorage.removeItem(SESSION_ID_KEY)
    setPhase('onboarding'); setOnboardStep('playStyle')
    setPlayStyle(null); setOptOut(false); setPlayers([])
    setCurrentHoleIndex(0); setScores({}); setSkippedHoles(new Set()); setPhotos([])
    setSessionId(null); setDeviceCode(null); setCurrentTurnIndex(0)
  }, [])

  // ── Leaderboard (total + avg, excludes skipped) ─
  const leaderboard = players.map(player => {
    const playerScores = Object.entries(scores)
      .filter(([holeId]) => !skippedHoles.has(holeId))
      .map(([, holeScores]) => holeScores[player.name])
      .filter(s => s !== undefined && s !== null)
    const total = playerScores.reduce((a, b) => a + b, 0)
    const avg   = playerScores.length > 0 ? Math.round((total / playerScores.length) * 10) / 10 : null
    return { ...player, total, avg, holesPlayed: playerScores.length }
  }).sort((a, b) => {
    if (a.holesPlayed === 0 && b.holesPlayed === 0) return 0
    if (a.holesPlayed === 0) return 1
    if (b.holesPlayed === 0) return -1
    return a.total - b.total
  })

  // ── Winner of previous hole (for UI indicator) ──
  const previousHoleWinner = (() => {
    if (currentHoleIndex === 0) return null
    const prevHole = holes[currentHoleIndex - 1]
    if (!prevHole) return null
    const holeScores = scores[prevHole.id]
    if (!holeScores) return null
    let min = Infinity, winner = null
    players.forEach(p => {
      const s = holeScores[p.name]
      if (s !== undefined && s !== null && s < min) { min = s; winner = p }
    })
    return winner
  })()

  const currentHole = holes[currentHoleIndex] || null

  const value = {
    phase, setPhase,
    onboardStep, setOnboardStep,
    playStyle, setPlayStyle,
    optOut, setOptOut,
    players, setPlayers,
    PLAYER_COLORS,
    holes, currentHole, currentHoleIndex,
    scores, saveScore,
    skippedHoles, skipHole,
    sessionId, deviceCode,
    photos, addPhoto,
    showPhotoGallery, setShowPhotoGallery,
    showSpinner, setShowSpinner,
    spinnerEffect, setSpinnerEffect,
    currentTurnIndex, setCurrentTurnIndex,
    leaderboard, previousHoleWinner,
    isLoading,
    startGame, goToHole, nextHole, dismissSpinner, playAgain,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
