import { useGame } from '../../context/GameContext'

export default function LeaderboardStrip() {
  const { leaderboard, playStyle } = useGame()
  const scored = leaderboard.filter(p => p.holesPlayed > 0)
  if (playStyle === 'fun' || scored.length === 0) return null

  return (
    <div style={{ flexShrink:0, background:'#0f0f0f', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'8px 14px 12px' }}>
      <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'#282828', marginBottom:8 }}>
        Standings
      </p>
      <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2, WebkitOverflowScrolling:'touch' }}>
        {scored.map((p, i) => {
          const isFirst = i === 0
          return (
            <div key={p.name} style={{
              display:'flex', alignItems:'center', gap:7, flexShrink:0,
              background:isFirst?'rgba(255,214,0,0.09)':'rgba(255,255,255,0.04)',
              border:`1.5px solid ${isFirst?'rgba(255,214,0,0.28)':'rgba(255,255,255,0.07)'}`,
              borderRadius:10, padding:'6px 11px',
            }}>
              {/* Rank */}
              <span style={{ fontSize:11, fontWeight:900, color:isFirst?'var(--yellow)':'#2e2e2e', minWidth:14 }}>
                {i+1}
              </span>
              {/* Dot */}
              <div style={{ width:7, height:7, borderRadius:'50%', background:p.color, flexShrink:0 }}/>
              {/* Name */}
              <span style={{ fontSize:13, fontWeight:800, color:isFirst?'var(--yellow)':'#ccc', letterSpacing:'-0.01em', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {p.name}
              </span>
              {/* Total — primary */}
              <span style={{ fontSize:16, fontWeight:900, color:isFirst?'var(--yellow)':'#aaa', letterSpacing:'-0.02em' }}>
                {p.total}
              </span>
              {/* Avg — secondary */}
              {p.avg !== null && (
                <span style={{ fontSize:10, color:'#2a2a2a', fontWeight:600, borderLeft:'1px solid rgba(255,255,255,0.05)', paddingLeft:7 }}>
                  {p.avg}avg
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
