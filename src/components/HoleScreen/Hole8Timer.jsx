import { useState, useEffect, useRef } from 'react'
import { Play, RotateCcw } from 'lucide-react'

export default function Hole8Timer({ seconds = 30 }) {
  const t = useTranslation()
  const [phase, setPhase] = useState('idle') // idle | countdown | running | done
  const [count, setCount]  = useState(3)
  const [secs,  setSecs]   = useState(seconds)
  const intervalRef = useRef(null)

  function clearAll() { clearInterval(intervalRef.current) }

  function start() {
    setPhase('countdown')
    setCount(3)
    let c = 3
    intervalRef.current = setInterval(() => {
      c--
      if (c > 0) { setCount(c) }
      else {
        clearAll()
        setPhase('running')
        setSecs(seconds)
        let s = seconds
        intervalRef.current = setInterval(() => {
          s--
          setSecs(s)
          if (s <= 0) { clearAll(); setPhase('done') }
        }, 1000)
      }
    }, 1000)
  }

  function reset() { clearAll(); setPhase('idle'); setCount(3); setSecs(seconds) }

  useEffect(() => () => clearAll(), [])

  const pct = secs / seconds
  const r   = 52
  const circ = 2 * Math.PI * r

  return (
    <div style={{
      background: 'var(--yellow-dim)', border: '1.5px solid var(--border-y)',
      borderRadius: 'var(--radius)', padding: '18px 20px', marginBottom: 12,
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--yellow)', marginBottom: 10 }}>
        Challenge Timer
      </p>

      {phase === 'idle' && (
        <button className="btn btn-primary" onClick={start} style={{ gap: 8 }}>
          <Play size={16}/> Start 30s Timer
        </button>
      )}

      {phase === 'countdown' && (
        <div>
          <div style={{ fontSize: 72, fontWeight: 900, color: 'var(--yellow)', lineHeight: 1, letterSpacing: '-0.04em', animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
            {count}
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginTop: 6 }}>{t.getReady}</p>
        </div>
      )}

      {phase === 'running' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,214,0,0.12)" strokeWidth="8"/>
              <circle cx="60" cy="60" r={r} fill="none" stroke="#FFD600" strokeWidth="8"
                strokeDasharray={`${circ * pct} ${circ}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s linear', filter: 'drop-shadow(0 0 6px rgba(255,214,0,0.5))' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 42, fontWeight: 900, color: secs <= 10 ? 'var(--red)' : 'var(--yellow)', letterSpacing: '-0.03em', transition: 'color 0.3s' }}>
                {secs}
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>{t.secondsRemaining}</p>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--yellow)', marginBottom: 8 }}>{t.timesUp}</p>
          <button className="btn btn-ghost btn-sm" onClick={reset} style={{ gap: 6 }}>
            <RotateCcw size={14}/> Reset
          </button>
        </div>
      )}
    </div>
  )
}
