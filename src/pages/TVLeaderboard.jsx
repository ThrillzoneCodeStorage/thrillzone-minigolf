import { useEffect, useState } from 'react'
import { Trophy, Sun, Calendar, CircleDot, TrendingDown, TrendingUp, Minus, BarChart3 } from 'lucide-react'
import { supabase, getLeaderboard, getHoleAverages, getAllPhotos } from '../lib/supabase'

function RankBadge({ rank }) {
  if (rank === 1) return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="22" fill="rgba(255,214,0,0.12)"/>
      <path d="M10 32 L16 16 L22 25 L28 11 L34 32Z" fill="#FFD600" opacity="0.9"/>
      <circle cx="22" cy="33" r="3.5" fill="#FFD600"/>
    </svg>
  )
  return (
    <div style={{ width:44, height:44, borderRadius:'50%', background:rank===2?'rgba(180,180,180,0.08)':rank===3?'rgba(160,100,40,0.08)':'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid ${rank===2?'rgba(180,180,180,0.2)':rank===3?'rgba(160,100,40,0.2)':'rgba(255,255,255,0.06)'}` }}>
      <span style={{ fontSize:20, fontWeight:900, color:rank===2?'#aaa':rank===3?'#b47c3c':'#333', fontFamily:'Inter,sans-serif' }}>{rank}</span>
    </div>
  )
}

// Difficulty indicator relative to par
function DiffIndicator({ avg, par }) {
  if (avg === null) return <span style={{ color:'#333', fontSize:12 }}>—</span>
  const diff = avg - par
  if (diff < -0.3) return <TrendingDown size={16} color="#22C55E"/>
  if (diff > 0.3)  return <TrendingUp   size={16} color="#ef4444"/>
  return <Minus size={16} color="#FFD600"/>
}

export default function TVLeaderboard() {
  const [bestDay,  setBestDay]  = useState([])
  const [bestWeek, setBestWeek] = useState([])
  const [bestAll,  setBestAll]  = useState([])
  const [holeAvgs, setHoleAvgs] = useState([])
  const [photos,   setPhotos]   = useState([])
  const [photoIdx, setPhotoIdx] = useState(0)
  const [tab,      setTab]      = useState('day')
  const [time,     setTime]     = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (photos.length < 2) return
    const t = setInterval(() => setPhotoIdx(i => (i + 1) % photos.length), 7000)
    return () => clearInterval(t)
  }, [photos.length])

  // Auto-rotate tabs every 14s
  useEffect(() => {
    const tabs = ['day', 'week', 'all', 'holes']
    let i = 0
    const t = setInterval(() => { i = (i + 1) % tabs.length; setTab(tabs[i]) }, 14000)
    return () => clearInterval(t)
  }, [])

  async function load() {
    const [d, w, a, h, p] = await Promise.all([
      getLeaderboard('day'),
      getLeaderboard('week'),
      getLeaderboard('all'),
      getHoleAverages(),
      getAllPhotos(20),
    ])
    setBestDay(d); setBestWeek(w); setBestAll(a)
    setHoleAvgs(h)
    setPhotos(p.map(x => x.storage_path).filter(Boolean))
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    const ch = supabase.channel('tv')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scores' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, load)
      .subscribe()
    return () => { clearInterval(t); supabase.removeChannel(ch) }
  }, [])

  const TABS = {
    day:   { label: 'Best Today',   Icon: Sun,      data: bestDay,  desc: 'Lowest strokes today — full course only' },
    week:  { label: 'Best Week',    Icon: Calendar, data: bestWeek, desc: 'Lowest strokes this week — full course only' },
    all:   { label: 'All Time',     Icon: Trophy,   data: bestAll,  desc: 'Lowest strokes ever — full course only' },
    holes: { label: 'Hole Overview',Icon: BarChart3, data: [],       desc: 'All-time average score per hole' },
  }
  const current = TABS[tab]
  const hasPhotos = photos.length > 0
  const MAX_PLAYERS = 5

  return (
    <div style={{ minHeight:'100vh', background:'#080808', color:'#fff', fontFamily:'Inter,sans-serif', overflow:'hidden', position:'relative' }}>

      {/* Background photo */}
      {hasPhotos && (
        <div style={{ position:'fixed', inset:0, zIndex:0 }}>
          <img key={photoIdx} src={photos[photoIdx]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.06) blur(4px)' }}/>
        </div>
      )}

      {/* Top accent */}
      <div style={{ position:'relative', zIndex:1, height:5, background:'linear-gradient(90deg,#FFD600,rgba(255,255,255,0.5),#FFD600)' }}/>

      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', minHeight:'calc(100vh - 5px)', padding:'28px 52px 24px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <img src="/logo.png" alt="Thrillzone" style={{ height:68, objectFit:'contain', filter:'drop-shadow(0 2px 20px rgba(0,0,0,0.7))' }}/>
            <div>
              <h1 style={{ fontSize:44, fontWeight:900, letterSpacing:'-0.04em', margin:0, color:'#FFD600', lineHeight:1 }}>Mini Golf</h1>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:5 }}>
                <TrendingDown size={13} color="#555" strokeWidth={2.5}/>
                <p style={{ color:'#555', fontSize:13, margin:0, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>Lowest score wins</p>
              </div>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:42, fontWeight:900, color:'#FFD600', margin:0, letterSpacing:'-0.03em', lineHeight:1 }}>
              {time.toLocaleTimeString('en-NZ', { hour:'2-digit', minute:'2-digit' })}
            </p>
            <p style={{ color:'#444', fontSize:14, margin:0, fontWeight:600, marginTop:4 }}>
              {time.toLocaleDateString('en-NZ', { weekday:'long', day:'numeric', month:'long' })}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:9, marginBottom:6 }}>
          {Object.entries(TABS).map(([k, v]) => {
            const active = tab === k
            return (
              <button key={k} onClick={() => setTab(k)} style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'9px 20px', borderRadius:50, border:'none',
                background: active ? '#FFD600' : 'rgba(255,255,255,0.05)',
                color: active ? '#000' : '#555',
                fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit',
                transition:'all 0.22s',
                boxShadow: active ? '0 4px 24px rgba(255,214,0,0.28)' : 'none',
              }}>
                <v.Icon size={13} strokeWidth={2.5}/>{v.label}
              </button>
            )
          })}
        </div>

        {/* Subtitle */}
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:20 }}>
          <current.Icon size={12} color="#333" strokeWidth={2}/>
          <p style={{ fontSize:12, color:'#333', margin:0, fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase' }}>
            {current.desc}
          </p>
        </div>

        {/* ── Leaderboard tabs ─────────────────────────── */}
        {tab !== 'holes' && (
          <>
            {/* Column headers */}
            {current.data.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:20, padding:'0 24px', marginBottom:9 }}>
                <div style={{ width:44, flexShrink:0 }}/>
                <div style={{ width:14, flexShrink:0 }}/>
                <span style={{ flex:1, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#2e2e2e' }}>Player</span>
                <span style={{ minWidth:140, textAlign:'right', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,214,0,0.5)' }}>Total strokes</span>
                <span style={{ minWidth:110, textAlign:'right', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#2e2e2e' }}>Avg / hole</span>
              </div>
            )}

            <div style={{ flex:1 }}>
              {current.data.length === 0 ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 0', gap:14 }}>
                  <CircleDot size={44} color="#1e1e1e" strokeWidth={1}/>
                  <p style={{ fontSize:22, fontWeight:700, color:'#2a2a2a', margin:0 }}>No completed rounds yet</p>
                  <p style={{ fontSize:14, color:'#222', margin:0 }}>Players must complete all holes to appear here</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {current.data.slice(0, MAX_PLAYERS).map((e, i) => {
                    const isFirst = i === 0
                    return (
                      <div key={`${e.name}-${i}`} style={{
                        display:'flex', alignItems:'center', gap:20,
                        background: isFirst ? 'rgba(255,214,0,0.07)' : 'rgba(255,255,255,0.025)',
                        border:`1px solid ${isFirst ? 'rgba(255,214,0,0.22)' : 'rgba(255,255,255,0.05)'}`,
                        borderRadius:14, padding:'15px 24px',
                        animation:`slideIn 0.4s ${i * 0.07}s both`,
                        boxShadow: isFirst ? '0 0 40px rgba(255,214,0,0.07)' : 'none',
                        position:'relative', overflow:'hidden',
                      }}>
                        {isFirst && <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(255,214,0,0.03),transparent)', pointerEvents:'none' }}/>}

                        <RankBadge rank={i + 1}/>

                        {e.color && <div style={{ width:13, height:13, borderRadius:'50%', background:e.color, flexShrink:0, boxShadow:`0 0 8px ${e.color}55` }}/>}

                        <span style={{ flex:1, fontSize:30, fontWeight:900, letterSpacing:'-0.03em', color:isFirst?'#FFD600':'#fff' }}>
                          {e.name}
                        </span>

                        {/* Total strokes — primary */}
                        <div style={{ textAlign:'right', minWidth:140 }}>
                          <div style={{ display:'flex', alignItems:'baseline', gap:5, justifyContent:'flex-end' }}>
                            <span style={{ fontSize:44, fontWeight:900, letterSpacing:'-0.04em', lineHeight:1, color:isFirst?'#FFD600':'#fff' }}>
                              {e.total}
                            </span>
                            <span style={{ fontSize:13, color:isFirst?'rgba(255,214,0,0.45)':'#333', fontWeight:600, paddingBottom:4 }}>strokes</span>
                          </div>
                        </div>

                        {/* Avg — secondary */}
                        <div style={{ textAlign:'right', minWidth:110, borderLeft:'1px solid rgba(255,255,255,0.05)', paddingLeft:16, marginLeft:4 }}>
                          <p style={{ fontSize:24, fontWeight:800, color:'#3a3a3a', margin:0, letterSpacing:'-0.02em', lineHeight:1 }}>{e.avg}</p>
                          <p style={{ fontSize:11, color:'#2a2a2a', margin:'2px 0 0', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>avg/hole</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Hole Overview tab ────────────────────────── */}
        {tab === 'holes' && (
          <div style={{ flex:1, overflow:'hidden' }}>
            {holeAvgs.length === 0 ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'60px 0' }}>
                <p style={{ color:'#2a2a2a', fontSize:20, fontWeight:700 }}>No hole data yet</p>
              </div>
            ) : (
              <>
                {/* Header row */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {/* Column headers */}
                  <div style={{ display:'flex', gap:8, padding:'0 14px', marginBottom:6 }}>
                    <span style={{ flex:1, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#2e2e2e' }}>Hole</span>
                    <span style={{ width:60, textAlign:'center', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'rgba(255,214,0,0.5)' }}>Avg</span>
                    <span style={{ width:40, textAlign:'center', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#2e2e2e' }}>Par</span>
                    <span style={{ width:36, textAlign:'center', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#2e2e2e' }}></span>
                  </div>
                  <div style={{ display:'flex', gap:8, padding:'0 14px', marginBottom:6 }}>
                    <span style={{ flex:1, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#2e2e2e' }}>Hole</span>
                    <span style={{ width:60, textAlign:'center', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'rgba(255,214,0,0.5)' }}>Avg</span>
                    <span style={{ width:40, textAlign:'center', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#2e2e2e' }}>Par</span>
                    <span style={{ width:36, textAlign:'center', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'#2e2e2e' }}></span>
                  </div>
                </div>

                {/* Two-column grid of holes */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {holeAvgs.map((hole, i) => {
                    const diff = hole.avg !== null ? hole.avg - (hole.par || 3) : null
                    const barColor = diff === null ? '#222' : diff < -0.2 ? '#22C55E' : diff > 0.2 ? '#ef4444' : '#FFD600'
                    const barPct   = hole.avg !== null ? Math.min(100, (hole.avg / ((hole.par || 3) * 2)) * 100) : 0

                    return (
                      <div key={hole.id} style={{
                        display:'flex', alignItems:'center', gap:10,
                        background:'rgba(255,255,255,0.025)',
                        border:'1px solid rgba(255,255,255,0.05)',
                        borderRadius:10, padding:'10px 14px',
                        animation:`slideIn 0.35s ${i*0.03}s both`,
                      }}>
                        {/* Number */}
                        <span style={{ fontSize:13, fontWeight:800, color:'#333', width:22, flexShrink:0 }}>{i+1}</span>

                        {/* Name */}
                        <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#888', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {hole.title}
                        </span>

                        {/* Avg score */}
                        <span style={{ fontSize:20, fontWeight:900, color:barColor, width:52, textAlign:'right', letterSpacing:'-0.02em' }}>
                          {hole.avg ?? '—'}
                        </span>

                        {/* Par */}
                        <span style={{ fontSize:13, color:'#2e2e2e', width:32, textAlign:'center', fontWeight:600 }}>
                          {hole.par || 3}
                        </span>

                        {/* Trend icon */}
                        <div style={{ width:20, flexShrink:0, display:'flex', justifyContent:'center' }}>
                          <DiffIndicator avg={hole.avg} par={hole.par || 3}/>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div style={{ display:'flex', gap:20, justifyContent:'center', marginTop:12 }}>
                  {[['#22C55E','Under par (easy)'],['#FFD600','Around par'],['#ef4444','Over par (hard)']].map(([c,l])=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:c }}/>
                      <span style={{ fontSize:11, color:'#333', fontWeight:600 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Progress dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, paddingTop:16 }}>
          {Object.keys(TABS).map(k => (
            <div key={k} style={{ width:tab===k?24:7, height:7, borderRadius:4, background:tab===k?'#FFD600':'rgba(255,255,255,0.10)', transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}/>
          ))}
        </div>
      </div>

      {/* Polaroid strip */}
      {hasPhotos && (
        <div style={{ position:'fixed', right:0, top:0, bottom:0, width:175, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:18, padding:14, zIndex:2 }}>
          {photos.slice(0, 3).map((p, i) => (
            <div key={i} style={{ background:'#fff', padding:'7px 7px 26px', borderRadius:3, boxShadow:'0 8px 40px rgba(0,0,0,0.8)', transform:`rotate(${[-3,2,-1.5][i]}deg)`, width:144 }}>
              <img src={p} alt="" style={{ width:'100%', aspectRatio:'1', objectFit:'cover', display:'block' }}/>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:none} }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  )
}
