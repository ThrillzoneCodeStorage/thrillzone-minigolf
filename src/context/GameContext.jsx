import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  createSession, updateSession, getSessionByDeviceCode,
  getScoresForSession, upsertScore, uploadPhoto, getSessionPhotos, getHoles
} from '../lib/supabase'

const GameContext = createContext(null)

export const PLAYER_COLORS = [
  '#FFD600',
  '#60a5fa',
  '#a78bfa',
  '#34d399',
  '#fb923c',
  '#f472b6',
  '#38bdf8',
  '#facc15',
  '#4ade80',
  '#818cf8',
  '#2dd4bf',
  '#e879f9',
  '#a3e635',
  '#67e8f9',
  '#fb7185',
  '#f87171',
]

const DEVICE_CODE_KEY = 'thrillzone_device_code'
const SESSION_ID_KEY  = 'thrillzone_session_id'

function generateDeviceCode() {
  return `tz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function GameProvider({ children }) {
  const [phase, setPhase]                     = useState('loading')
  const [onboardStep, setOnboardStep]         = useState('playStyle')  // playStyle | players | rules | optOut
  const [playStyle, setPlayStyle]             = useState(null)
  const [optOut, setOptOut]                   = useState(false)
  const [players, setPlayers]                 = useState([])
  const [pendingPlayers, setPendingPlayers]     = useState([])
  const [holes, setHoles]                     = useState([])
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0)
  const [scores, setScores]                   = useState({})
  const [skippedHoles, setSkippedHoles]       = useState(new Set())
  const [sessionId, setSessionId]             = useState(null)
  const [deviceCode, setDeviceCode]           = useState(null)
  const [photos, setPhotos]                   = useState([])
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)
  const [showSpinner, setShowSpinner]         = useState(false)
  const [spinnerEffect, setSpinnerEffect]     = useState(null)
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [isLoading, setIsLoading]             = useState(false)
  // New state
  const [spinnerPreference, setSpinnerPreference] = useState('digital') // 'digital' | 'physical'
  const [language, setLanguage]                   = useState(() => localStorage.getItem('tz_lang') || 'en')
  const [showPostHole8Camera, setShowPostHole8Camera] = useState(false)

  // Resume session on mount
  useEffect(() => {
    async function init() {
      const holesData = await getHoles()
      setHoles(holesData)
      const savedCode      = localStorage.getItem(DEVICE_CODE_KEY)
      const savedSessionId = localStorage.getItem(SESSION_ID_KEY)
      if (savedCode && savedSessionId) {
        const existing = await getSessionByDeviceCode(savedCode)
        if (existing) {
          setSessionId(existing.id); setDeviceCode(savedCode)
          setPlayStyle(existing.play_style); setOptOut(existing.opt_out_leaderboard)
          setPlayers(existing.players || []); setCurrentHoleIndex(existing.current_hole_index || 0)
          setSpinnerPreference('digital')
          const existingScores = await getScoresForSession(existing.id)
          const scoreMap = {}
          for (const s of existingScores) {
            if (!scoreMap[s.hole_id]) scoreMap[s.hole_id] = {}
            scoreMap[s.hole_id][s.player_name] = s.strokes
          }
          setScores(scoreMap)
          const existingPhotos = await getSessionPhotos(existing.id)
          setPhotos(existingPhotos.map(p => p.storage_path))
          setPhase('playing'); return
        }
      }
      setPhase('onboarding')
    }
    init()
  }, [])

  const startGame = useCallback(async ({ playStyle: ps, optOut: oo, players: pl, spinnerPreference: sp = 'digital' }) => {
    const finalPlayers = pl || pendingPlayers
    setIsLoading(true)
    try {
      const code = generateDeviceCode()
      const session = await createSession({
        device_code: code, play_style: ps,
        opt_out_leaderboard: oo, players: finalPlayers,
        current_hole_index: 0,
      })
      setSessionId(session.id); setDeviceCode(code)
      setPlayStyle(ps); setOptOut(oo); setPlayers(finalPlayers)
      setSpinnerPreference(sp)
      setCurrentHoleIndex(0); setScores({}); setSkippedHoles(new Set()); setPhotos([])
      localStorage.setItem(DEVICE_CODE_KEY, code)
      localStorage.setItem(SESSION_ID_KEY, session.id)
      setPhase('playing')
    } finally { setIsLoading(false) }
  }, [])

  // Change play style mid-game
  const changePlayStyle = useCallback(async (newStyle) => {
    setPlayStyle(newStyle)
    if (sessionId) await updateSession(sessionId, { play_style: newStyle })
  }, [sessionId])

  const saveScore = useCallback(async (holeId, playerName, strokes) => {
    setScores(prev => ({ ...prev, [holeId]: { ...(prev[holeId] || {}), [playerName]: strokes } }))
    if (sessionId && holeId) await upsertScore(sessionId, holeId, playerName, strokes)
  }, [sessionId])

  const goToHole = useCallback(async (index) => {
    const clamped = Math.max(0, Math.min(index, holes.length - 1))
    setCurrentHoleIndex(clamped)
    if (sessionId) await updateSession(sessionId, { current_hole_index: clamped })
  }, [sessionId, holes.length])

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

  const nextHole = useCallback(async (spinnerEffectResult) => {
    if (playStyle === 'silly' && spinnerEffectResult) {
      setSpinnerEffect(spinnerEffectResult); setShowSpinner(true); return
    }
    const isLast = currentHoleIndex >= holes.length - 1
    if (isLast) {
      if (sessionId) await updateSession(sessionId, { completed_at: new Date().toISOString() })
      setPhase('end')
    } else {
      // Post hole 8 camera popup
      if (currentHoleIndex === 7) setShowPostHole8Camera(true)
      const nextIdx = currentHoleIndex + 1
      await goToHole(nextIdx)
      // Winner of this hole goes first
      const thisHole = holes[currentHoleIndex]
      if (thisHole) {
        const holeScores = scores[thisHole.id] || {}
        let minStrokes = Infinity, winnerIdx = 0
        players.forEach((p, i) => {
          const s = holeScores[p.name]
          if (s !== undefined && s !== null && s < minStrokes) { minStrokes = s; winnerIdx = i }
        })
        setCurrentTurnIndex(winnerIdx)
      } else { setCurrentTurnIndex(0) }
    }
  }, [playStyle, currentHoleIndex, holes, sessionId, goToHole, scores, players])

  const dismissSpinner = useCallback(async () => {
    setShowSpinner(false); setSpinnerEffect(null)
    const isLast = currentHoleIndex >= holes.length - 1
    if (isLast) {
      if (sessionId) await updateSession(sessionId, { completed_at: new Date().toISOString() })
      setPhase('end')
    } else {
      if (currentHoleIndex === 7) setShowPostHole8Camera(true)
      await goToHole(currentHoleIndex + 1)
      setCurrentTurnIndex(0)
    }
  }, [currentHoleIndex, holes.length, sessionId, goToHole])

  const addPhoto = useCallback(async (blob) => {
    if (!sessionId) return
    try {
      const url = await uploadPhoto(sessionId, blob)
      setPhotos(prev => [...prev, url]); return url
    } catch {
      const localUrl = URL.createObjectURL(blob)
      setPhotos(prev => [...prev, localUrl]); return localUrl
    }
  }, [sessionId])

  const playAgain = useCallback(() => {
    localStorage.removeItem(DEVICE_CODE_KEY); localStorage.removeItem(SESSION_ID_KEY)
    setPhase('onboarding'); setOnboardStep('playStyle')
    setPlayStyle(null); setOptOut(false); setPlayers([])
    setCurrentHoleIndex(0); setScores({}); setSkippedHoles(new Set()); setPhotos([])
    setSessionId(null); setDeviceCode(null); setCurrentTurnIndex(0)
    setSpinnerPreference('digital')
  }, [])

  const leaderboard = (() => {
    const entries = players.map(player => {
      const playerScores = Object.entries(scores)
        .filter(([holeId]) => !skippedHoles.has(holeId))
        .map(([, holeScores]) => holeScores[player.name])
        .filter(s => s !== undefined && s !== null)
      const total = playerScores.reduce((a, b) => a + b, 0)
      const avg   = playerScores.length > 0 ? Math.round((total / playerScores.length) * 10) / 10 : null
      return { ...player, total, avg, holesPlayed: playerScores.length }
    })

    // Sort: lowest total first, tiebreak by most recent holes (earlier holes = lower index)
    return entries.sort((a, b) => {
      if (a.holesPlayed === 0 && b.holesPlayed === 0) return 0
      if (a.holesPlayed === 0) return 1
      if (b.holesPlayed === 0) return -1
      if (a.total !== b.total) return a.total - b.total
      // Tiebreaker: compare hole scores from most recent completed hole backwards
      for (let i = holes.length - 1; i >= 0; i--) {
        const hole = holes[i]
        if (!hole) continue
        const aScore = scores[hole.id]?.[a.name]
        const bScore = scores[hole.id]?.[b.name]
        if (aScore !== undefined && bScore !== undefined && aScore !== bScore) {
          return aScore - bScore
        }
      }
      return 0
    })
  })()

  const previousHoleWinner = (() => {
    if (currentHoleIndex === 0) return null
    const prevHole = holes[currentHoleIndex - 1]
    if (!prevHole) return null
    const holeScores = scores[prevHole.id]
    if (!holeScores) return null
    let min = Infinity, winners = []
    players.forEach(p => {
      const s = holeScores[p.name]
      if (s === undefined || s === null) return
      if (s < min) { min = s; winners = [p] }
      else if (s === min) { winners.push(p) }
    })
    if (winners.length === 1) return winners[0]
    // Tiebreak winners using scores from earlier holes
    for (let i = currentHoleIndex - 2; i >= 0; i--) {
      const tieHole = holes[i]
      if (!tieHole) continue
      const tieScores = scores[tieHole.id]
      if (!tieScores) continue
      let tieMin = Infinity, tieWinners = []
      winners.forEach(p => {
        const s = tieScores[p.name]
        if (s === undefined || s === null) return
        if (s < tieMin) { tieMin = s; tieWinners = [p] }
        else if (s === tieMin) { tieWinners.push(p) }
      })
      if (tieWinners.length === 1) return tieWinners[0]
      winners = tieWinners
    }
    return winners[0] || null
  })()

  const currentHole = holes[currentHoleIndex] || null

  const value = {
    phase, setPhase,
    onboardStep, setOnboardStep,
    playStyle, setPlayStyle, changePlayStyle,
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
    spinnerPreference, setSpinnerPreference,
    showPostHole8Camera, setShowPostHole8Camera,
    startGame, goToHole, nextHole, dismissSpinner, playAgain,
    pendingPlayers, setPendingPlayers,
    language, setLanguage: (lang) => { localStorage.setItem('tz_lang', lang); setLanguage(lang) },
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
