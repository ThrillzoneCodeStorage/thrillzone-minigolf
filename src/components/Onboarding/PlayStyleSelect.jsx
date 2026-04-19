import { useState } from 'react'
import { ChevronRight, Zap, Trophy, Shuffle, Smile } from 'lucide-react'
import PlayingCardsRules from '../Rules/PlayingCardsRules'
import { useGame } from '../../context/GameContext'

const STYLES = [
  {
    id: 'casual', Icon: Zap, name: 'Casual', tag: 'Classic',
    desc: 'Normal scoring. Relaxed, no pressure — great for all ages.',
    color: '#FFD600', bg: 'rgba(255,214,0,0.07)', border: 'rgba(255,214,0,0.25)',
    rules: [
      'Every shot counts — keep an honest score.',
      'Your ball must stop before you take your next shot.',
      'If your ball leaves the course, add one penalty stroke and place it back.',
      'Lowest total strokes at the end wins!',
    ],
  },
  {
    id: 'competitive', Icon: Trophy, name: 'Competitive', tag: 'One at a time',
    desc: 'Players take turns. You can nudge other balls out of your way.',
    color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.25)',
    rules: [
      'One player takes their full turn before the next person goes.',
      'You are allowed to nudge other players\' balls out of your path.',
      'The ball must come to a complete stop before the next player goes.',
      'Winner of each hole gets to go first on the next one.',
    ],
  },
  {
    id: 'silly', Icon: Shuffle, name: 'Silly', tag: 'Spin the wheel',
    desc: 'Normal scoring, plus a random challenge wheel spins after every hole.',
    color: '#a78bfa', bg: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.25)',
    rules: [
      'Normal scoring applies — every stroke counts.',
      'After completing each hole, someone spins the wheel.',
      'Whatever the wheel lands on must be carried out — no exceptions!',
      'Lowest total strokes still wins, even with all the chaos.',
    ],
  },
  {
    id: 'fun', Icon: Smile, name: 'Just for Fun', tag: 'No scores',
    desc: 'No scoring at all. Read the hole descriptions and enjoy the course.',
    color: '#fb923c', bg: 'rgba(251,146,60,0.07)', border: 'rgba(251,146,60,0.25)',
    rules: [
      'No scores are tracked — there is no winner or loser.',
      'Read each hole\'s description and story as you go.',
      'Take as many shots as you like on each hole.',
      'The only goal is to have a great time with your group.',
    ],
  },
]

export default function PlayStyleSelect() {
  const { setPlayStyle, setOnboardStep } = useGame()
  const [preview, setPreview] = useState(null) // style being previewed

  function selectStyle(style) {
    setPreview(style)
  }

  function confirm() {
    setPlayStyle(preview.id)
    setOnboardStep('optOut')
  }

  return (
    <div className="screen animate-in">
      <div className="screen-content" style={{ paddingBottom: 40 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '28px 0 24px' }}>
          <img src="/logo.png" alt="Thrillzone" style={{ height: 56, objectFit: 'contain', marginBottom: 18 }} />
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>Mini Golf</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Choose your play style</p>
        </div>

        {/* Style list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STYLES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => selectStyle(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: s.bg, border: `1.5px solid ${s.border}`,
                borderRadius: 'var(--radius)', padding: '16px 18px',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                fontFamily: 'inherit',
                animation: `fadeIn 0.35s ${i * 0.06}s both`,
                transition: 'transform 0.12s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onTouchEnd={e => e.currentTarget.style.transform = ''}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.Icon size={22} color={s.color} strokeWidth={2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.name}</span>
                  <span className="pill" style={{ background: s.border, color: s.color, border: 'none' }}>{s.tag}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.45 }}>{s.desc}</p>
              </div>
              <ChevronRight size={18} color="var(--text-3)" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>

      {/* Rules preview sheet */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                  <preview.Icon size={20} color={preview.color} />
                  <h3 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>{preview.name}</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Read the rules, then start</p>
              </div>
              <button onClick={() => setPreview(null)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
                <ChevronRight size={22} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>

            <PlayingCardsRules
              title={preview.name}
              rules={preview.rules}
              accent={preview.color}
              onDone={confirm}
            />
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
