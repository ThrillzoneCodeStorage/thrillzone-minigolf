import { Trophy } from 'lucide-react'
import { useGame } from '../../context/GameContext'

export default function LeaderboardStrip() {
  const { leaderboard, playStyle } = useGame()
  if (playStyle === 'fun' || leaderboard.filter(p => p.holesPlayed > 0).length === 0) return null

  return (
    <div style={{ flexShrink: 0, background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '10px 16px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Trophy size={11} color="var(--text-3)" />
        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)' }}>
          Leaderboard
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2, WebkitOverflowScrolling: 'touch' }}>
        {leaderboard.filter(p => p.holesPlayed > 0).map((p, i) => (
          <div key={p.name} style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            background: i === 0 ? 'var(--yellow-dim)' : 'var(--bg-card-2)',
            border: `1px solid ${i === 0 ? 'var(--border-y)' : 'var(--border)'}`,
            borderRadius: 8, padding: '5px 10px',
            boxShadow: i === 0 ? 'var(--yellow-glow)' : 'none',
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: i === 0 ? 'var(--yellow)' : 'var(--text-3)' }}>#{i + 1}</span>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? 'var(--yellow)' : 'var(--text)', letterSpacing: '-0.01em' }}>{p.name}</span>
            <span style={{ fontSize: 13, fontWeight: 900, color: i === 0 ? 'var(--yellow)' : 'var(--text-2)', letterSpacing: '-0.02em' }}>{p.total}</span>
            {p.avg !== null && (
              <span style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '-0.01em' }}>({p.avg} avg)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
