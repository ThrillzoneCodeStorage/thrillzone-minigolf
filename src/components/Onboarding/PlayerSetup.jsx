import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useGame } from '../../context/GameContext'

const PLAYER_COLORS_16 = [
  '#FFD600','#60a5fa','#f87171','#a78bfa',
  '#34d399','#fb923c','#f472b6','#38bdf8',
  '#facc15','#4ade80','#fb7185','#818cf8',
  '#2dd4bf','#e879f9','#a3e635','#67e8f9',
]

const STYLE_LABELS = { casual: 'Casual', competitive: 'Competitive', silly: 'Silly', fun: 'Just for Fun' }

export default function PlayerSetup() {
  const { setOnboardStep, playStyle, optOut, startGame, isLoading } = useGame()
  const [names, setNames] = useState([''])

  const add    = () => names.length < 16 && setNames(n => [...n, ''])
  const remove = i  => setNames(n => n.filter((_, j) => j !== i))
  const update = (i, v) => setNames(n => { const c = [...n]; c[i] = v; return c })

  async function start() {
    const valid = names.map(n => n.trim()).filter(Boolean)
    if (!valid.length) return
    await startGame({
      playStyle, optOut,
      players: valid.map((name, i) => ({ name, color: PLAYER_COLORS_16[i % PLAYER_COLORS_16.length] })),
    })
  }

  return (
    <div className="screen animate-in">
      <div className="screen-content" style={{ paddingBottom: 40 }}>
        <button onClick={() => setOnboardStep('optOut')}
          style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: 14, cursor: 'pointer', textAlign: 'left', marginBottom: 28, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, padding: 0 }}>
          <ChevronLeft size={18} /> Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 6 }}>Who's playing?</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Up to 16 players</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
          {names.map((name, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, animation: `fadeIn 0.28s ${i * 0.04}s both` }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: PLAYER_COLORS_16[i % PLAYER_COLORS_16.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: 14 }}>
                {name.trim() ? name.trim()[0].toUpperCase() : i + 1}
              </div>
              <input className="input" placeholder={`Player ${i + 1}`} value={name}
                onChange={e => update(i, e.target.value)}
                maxLength={20} autoComplete="off" autoCapitalize="words"
                onKeyDown={e => e.key === 'Enter' && i === names.length - 1 && add()}
                style={{ flex: 1 }} />
              {names.length > 1 && (
                <button onClick={() => remove(i)}
                  style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-3)', cursor: 'pointer', padding: 7, display: 'flex', minWidth: 34, minHeight: 34 }}>
                  <X size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        {names.length < 16 && (
          <button className="btn btn-ghost btn-full" onClick={add} style={{ marginBottom: 18, gap: 7 }}>
            <Plus size={16} /> Add player
          </button>
        )}

        <div className="card-yellow" style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 5 }}>
            <span style={{ color: 'var(--text-2)' }}>Play style</span>
            <span style={{ fontWeight: 800, color: 'var(--yellow)' }}>{STYLE_LABELS[playStyle] || playStyle}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--text-2)' }}>Leaderboard</span>
            <span style={{ fontWeight: 700, color: optOut ? 'var(--text-3)' : 'var(--yellow)' }}>{optOut ? 'Private' : 'Public'}</span>
          </div>
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={start}
          disabled={!names.some(n => n.trim()) || isLoading}>
          {isLoading ? 'Starting…' : 'Start Game'} {!isLoading && <ChevronRight size={20} />}
        </button>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
