import { useState } from 'react'
import { ChevronRight, Check } from 'lucide-react'

const STACK_ROTS = [0, 3, -2.5, 4.5, -3.5]

export default function PlayingCardsRules({ title, rules, accent = '#FFD600', onDone }) {
  const [current, setCurrent]   = useState(0)
  const [flipping, setFlipping] = useState(false)

  const isLast = current === rules.length - 1

  function advance() {
    if (flipping) return
    if (isLast) {
      onDone()
      return
    }
    setFlipping(true)
    setTimeout(() => {
      setCurrent(c => c + 1)
      setFlipping(false)
    }, 320)
  }

  // Only show up to 4 stacked cards
  const visible = rules.slice(current, current + 4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

      {/* Card stack */}
      <div
        style={{ position: 'relative', width: '100%', maxWidth: 340, height: 210, cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none' }}
        onClick={advance}
      >
        {/* Render from bottom to top so top card is last in DOM = highest z */}
        {[...visible].reverse().map((rule, revIdx) => {
          const stackIdx = visible.length - 1 - revIdx  // 0 = top card
          const isTop    = stackIdx === 0
          const rot      = isTop ? 0 : (STACK_ROTS[stackIdx] || 3)
          const yOff     = stackIdx * 5
          const scale    = 1 - stackIdx * 0.025

          return (
            <div
              key={current + stackIdx}
              style={{
                position: 'absolute', inset: 0,
                background: isTop ? '#181818' : '#1e1e1e',
                border: `1.5px solid ${isTop ? accent + '50' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 18,
                padding: '22px 20px 18px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: isTop
                  ? `0 8px 28px rgba(0,0,0,0.55), 0 0 0 1px ${accent}18`
                  : '0 3px 12px rgba(0,0,0,0.4)',
                transform: `rotate(${rot}deg) scale(${scale}) translateY(${yOff}px)`,
                transformOrigin: 'center bottom',
                zIndex: isTop ? 20 : 20 - stackIdx,
                // Only animate the top card
                animation: isTop && flipping
                  ? 'cardFlipAway 0.32s cubic-bezier(0.4,0,0.6,1) forwards'
                  : isTop && current > 0
                  ? 'cardReveal 0.28s cubic-bezier(0.16,1,0.3,1) both'
                  : 'none',
                '--card-rot': `${rot}deg`,
              }}
            >
              {/* Top row — label + counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: isTop ? accent : 'var(--text-3)' }}>
                  {title}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>
                  {current + stackIdx + 1} / {rules.length}
                </span>
              </div>

              {/* Rule text — only show on top card */}
              {isTop && (
                <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.6, flex: 1, display: 'flex', alignItems: 'center' }}>
                  {rule}
                </p>
              )}

              {/* Bottom hint — only on top card */}
              {isTop && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>
                    {isLast ? 'Start game' : 'Tap to continue'}
                  </span>
                  {isLast
                    ? <Check size={13} color="var(--text-3)" />
                    : <ChevronRight size={13} color="var(--text-3)" />
                  }
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dot progress */}
      <div style={{ display: 'flex', gap: 6 }}>
        {rules.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? 20 : 6, height: 6, borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              background: i < current ? accent + '50' : i === current ? accent : 'var(--bg-card-3)',
            }}
          />
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <button
          className="btn btn-ghost"
          style={{ flex: 1 }}
          onClick={e => { e.stopPropagation(); onDone() }}
        >
          Skip rules
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 2 }}
          onClick={e => { e.stopPropagation(); advance() }}
        >
          {isLast ? 'Start game' : 'Next rule'}
          {isLast ? <Check size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  )
}
