import { Trophy } from 'lucide-react'
import { useGame } from '../../context/GameContext'

export default function LeaderboardStrip() {
  const { leaderboard, playStyle } = useGame()
  const scored = leaderboard.filter(p => p.holesPlayed > 0)
  if (playStyle === 'fun' || scored.length === 0) return null

  return (
    <div style={{
      flexShrink: 0,
      background: '#0f0f0f',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '10px 16px 14px',
    }}>
      {/* Label */}
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:9 }}>
        <Trophy size={11} color="#333" strokeWidth={2.5}/>
        <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'#333' }}>
          Standings
        </span>
      </div>

      {/* Player rows */}
      <div style={{ display:'flex', gap:7, overflowX:'auto', paddingBottom:2, WebkitOverflowScrolling:'touch' }}>
        {scored.map((p, i) => {
          const isFirst = i === 0
          return (
            <div key={p.name} style={{
              display:'flex', alignItems:'center', gap:8, flexShrink:0,
              background: isFirst ? 'rgba(255,214,0,0.09)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${isFirst ? 'rgba(255,214,0,0.30)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius:10, padding:'7px 12px',
              boxShadow: isFirst ? '0 0 16px rgba(255,214,0,0.12)' : 'none',
            }}>
              {/* Rank */}
              <span style={{
                fontSize: 13, fontWeight:900, letterSpacing:'-0.01em',
                color: isFirst ? '#FFD600' : '#333',
                minWidth: 16,
              }}>
                {i + 1}
              </span>

              {/* Colour dot */}
              <div style={{
                width:9, height:9, borderRadius:'50%', background:p.color,
                flexShrink:0,
                boxShadow: isFirst ? `0 0 6px ${p.color}80` : 'none',
              }}/>

              {/* Name */}
              <span style={{
                fontSize:14, fontWeight:800, letterSpacing:'-0.01em',
                color: isFirst ? '#FFD600' : '#fff',
              }}>
                {p.name}
              </span>

              {/* Total strokes — big and clear */}
              <span style={{
                fontSize:18, fontWeight:900, letterSpacing:'-0.02em',
                color: isFirst ? '#FFD600' : '#aaa',
                marginLeft:2,
              }}>
                {p.total}
              </span>

              {/* Avg */}
              {p.avg !== null && (
                <span style={{
                  fontSize:11, color:'#2e2e2e', fontWeight:600,
                  borderLeft:'1px solid rgba(255,255,255,0.05)',
                  paddingLeft:8, marginLeft:2,
                }}>
                  {p.avg} avg
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
