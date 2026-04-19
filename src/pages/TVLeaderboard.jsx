import { useEffect, useState, useRef } from 'react'
import { Trophy, Sun, Calendar, CircleDot, TrendingDown, TrendingUp, Minus, BarChart3 } from 'lucide-react'
import { supabase, getLeaderboard, getHoleAverages, getAllPhotos } from '../lib/supabase'
 
function RankBadge({ rank }) {
  if (rank === 1) return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="24" fill="rgba(255,214,0,0.13)"/>
      <path d="M11 34 L18 16 L24 26 L30 12 L37 34Z" fill="#FFD600" opacity="0.95"/>
      <circle cx="24" cy="36" r="4" fill="#FFD600"/>
    </svg>
  )
  const colors = { 2: { bg:'rgba(192,192,192,0.08)', border:'rgba(192,192,192,0.18)', text:'#aaa' }, 3: { bg:'rgba(160,100,40,0.08)', border:'rgba(160,100,40,0.18)', text:'#b47c3c' } }
  const c = colors[rank] || { bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.07)', text:'#333' }
  return (
    <div style={{ width:48, height:48, borderRadius:'50%', background:c.bg, border:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:22, fontWeight:900, color:c.text, fontFamily:'Inter,sans-serif' }}>{rank}</span>
    </div>
  )
}
 
function DiffIndicator({ avg, par }) {
  if (avg === null) return <Minus size={15} color="#2a2a2a"/>
  const diff = avg - par
  if (diff < -0.2) return <TrendingDown size={15} color="#22C55E"/>
  if (diff >  0.2) return <TrendingUp   size={15} color="#ef4444"/>
  return <Minus size={15} color="#FFD600"/>
}
 
// Tab progress timer bar
function TimerBar({ duration, running, onComplete }) {
  const [progress, setProgress] = useState(0)
  const startRef = useRef(Date.now())
  const rafRef   = useRef(null)
 
  useEffect(() => {
    setProgress(0)
    startRef.current = Date.now()
    if (!running) return
 
    function tick() {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(elapsed / duration, 1)
      setProgress(pct)
      if (pct < 1) rafRef.current = requestAnimationFrame(tick)
      else if (onComplete) onComplete()
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, duration])
 
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'rgba(255,255,255,0.06)' }}>
      <div style={{
        height:'100%',
        width:`${progress * 100}%`,
        background:'linear-gradient(90deg, #FFD600, rgba(255,255,255,0.7))',
        borderRadius:'0 2px 2px 0',
        transition:'width 0.1s linear',
        boxShadow:'0 0 8px rgba(255,214,0,0.5)',
      }}/>
    </div>
  )
}
 
const TAB_DURATION = 14000
 
export default function TVLeaderboard() {
  const [bestDay,  setBestDay]  = useState([])
  const [bestWeek, setBestWeek] = useState([])
  const [bestAll,  setBestAll]  = useState([])
  const [holeAvgs, setHoleAvgs] = useState([])
  const [photos,   setPhotos]   = useState([])
  const [photoIdx, setPhotoIdx] = useState(0)
  const [tab,      setTab]      = useState(null)   // null until data loaded
  const [time,     setTime]     = useState(new Date())
  const [timerKey, setTimerKey] = useState(0)      // reset timer bar on tab change
 
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
 
  useEffect(() => {
    if (photos.length < 2) return
    const t = setInterval(() => setPhotoIdx(i => (i + 1) % photos.length), 7000)
    return () => clearInterval(t)
  }, [photos.length])
 
  async function load() {
    const [d, w, a, h, p] = await Promise.all([
      getLeaderboard('day'), getLeaderboard('week'),
      getLeaderboard('all'), getHoleAverages(), getAllPhotos(20),
    ])
    setBestDay(d); setBestWeek(w); setBestAll(a); setHoleAvgs(h)
    setPhotos(p.map(x => x.storage_path).filter(Boolean))
  }
 
  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    const ch = supabase.channel('tv')
      .on('postgres_changes', { event:'*', schema:'public', table:'scores' }, load)
      .on('postgres_changes', { event:'*', schema:'public', table:'sessions' }, load)
      .subscribe()
    return () => { clearInterval(t); supabase.removeChannel(ch) }
  }, [])
 
  // Build available tabs based on what has data
  const allTabs = [
    { id:'day',   label:'Best Today',    Icon:Sun,      data:bestDay,  desc:'Lowest strokes today' },
    { id:'week',  label:'Best Week',     Icon:Calendar, data:bestWeek, desc:'Lowest strokes this week' },
    { id:'all',   label:'All Time',      Icon:Trophy,   data:bestAll,  desc:'Lowest strokes ever' },
    { id:'holes', label:'Hole Overview', Icon:BarChart3, data:[],       desc:'All-time average per hole' },
  ]
 
  // Only show tabs with data (or holes tab which always shows if holeAvgs loaded)
  const availableTabs = allTabs.filter(t =>
    t.id === 'holes' ? holeAvgs.length > 0 : t.data.length > 0
  )
 
  // Set initial tab once data arrives
  useEffect(() => {
    if (availableTabs.length > 0 && tab === null) {
      setTab(availableTabs[0].id)
    }
  }, [availableTabs.length])
 
  // Auto-advance to next available tab
  function advanceTab() {
    if (availableTabs.length === 0) return
    setTab(prev => {
      const idx = availableTabs.findIndex(t => t.id === prev)
      const next = availableTabs[(idx + 1) % availableTabs.length]
      return next.id
    })
    setTimerKey(k => k + 1)
  }
 
  const current = allTabs.find(t => t.id === tab)
  const hasPhotos = photos.length > 0
  const MAX_PLAYERS = 5
  const dataLoaded = bestDay !== null // after first load
 
  return (
    <div style={{ minHeight:'100vh', background:'#060606', color:'#fff', fontFamily:'Inter,sans-serif', overflow:'hidden', position:'relative' }}>
 
      {/* Background photo */}
      {hasPhotos && (
        <div style={{ position:'fixed', inset:0, zIndex:0 }}>
          <img key={photoIdx} src={photos[photoIdx]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.055) blur(4px)' }}/>
        </div>
      )}
 
      {/* Timer bar — top of screen */}
      {tab && availableTabs.length > 1 && (
        <TimerBar
          key={`${tab}-${timerKey}`}
          duration={TAB_DURATION}
          running={true}
          onComplete={advanceTab}
        />
      )}
 
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', minHeight:'100vh', padding:'36px 60px 28px' }}>
 
        {/* ── Header ──────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:36 }}>
 
          {/* Branding */}
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <img src="/logo.png" alt="Thrillzone" style={{ height:76, objectFit:'contain', filter:'drop-shadow(0 2px 24px rgba(0,0,0,0.8))' }}/>
            <div>
              <h1 style={{ fontSize:42, fontWeight:900, letterSpacing:'-0.04em', margin:0, lineHeight:1, color:'#FFD600' }}>
                Putt N Glow
              </h1>
              <p style={{ fontSize:16, fontWeight:600, color:'#444', margin:'3px 0 0', letterSpacing:'0.04em' }}>
                Queenstown
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
                <div style={{ width:1, height:14, background:'rgba(255,255,255,0.08)' }}/>
                <span style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.12em', color:'#2e2e2e' }}>
                  Leaderboard
                </span>
                <div style={{ width:1, height:14, background:'rgba(255,255,255,0.08)' }}/>
              </div>
            </div>
          </div>
 
          {/* Clock */}
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:48, fontWeight:900, color:'#FFD600', margin:0, letterSpacing:'-0.04em', lineHeight:1 }}>
              {time.toLocaleTimeString('en-NZ', { hour:'2-digit', minute:'2-digit' })}
            </p>
            <p style={{ color:'#383838', fontSize:14, margin:'6px 0 0', fontWeight:600 }}>
              {time.toLocaleDateString('en-NZ', { weekday:'long', day:'numeric', month:'long' })}
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:8, justifyContent:'flex-end' }}>
              <TrendingDown size={13} color="#2e2e2e" strokeWidth={2.5}/>
              <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#2e2e2e' }}>
                Lowest score wins
              </span>
            </div>
          </div>
        </div>
 
        {/* ── No data yet ──────────────────────────── */}
        {availableTabs.length === 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
            <CircleDot size={56} color="#1a1a1a" strokeWidth={1}/>
            <p style={{ fontSize:24, fontWeight:700, color:'#222', margin:0 }}>Waiting for players…</p>
            <p style={{ fontSize:15, color:'#1a1a1a', margin:0 }}>Complete a full round to appear on the board</p>
          </div>
        )}
 
        {/* ── Tab bar + content ────────────────────── */}
        {availableTabs.length > 0 && current && (
          <>
            {/* Tab pills */}
            <div style={{ display:'flex', gap:9, marginBottom:6, alignItems:'center' }}>
              {availableTabs.map(v => {
                const active = tab === v.id
                return (
                  <button key={v.id} onClick={() => { setTab(v.id); setTimerKey(k => k+1) }} style={{
                    display:'flex', alignItems:'center', gap:7,
                    padding:'9px 22px', borderRadius:50, border:'none',
                    background: active ? '#FFD600' : 'rgba(255,255,255,0.04)',
                    color: active ? '#000' : '#3a3a3a',
                    fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit',
                    transition:'all 0.22s',
                    boxShadow: active ? '0 4px 24px rgba(255,214,0,0.25)' : 'none',
                  }}>
                    <v.Icon size={13} strokeWidth={2.5}/>{v.label}
                  </button>
                )
              })}
 
              {/* Dot indicators showing position in rotation */}
              <div style={{ marginLeft:'auto', display:'flex', gap:6, alignItems:'center' }}>
                {availableTabs.map(v => (
                  <div key={v.id} style={{
                    width: tab===v.id ? 20 : 6, height:6, borderRadius:3,
                    background: tab===v.id ? '#FFD600' : 'rgba(255,255,255,0.08)',
                    transition:'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                  }}/>
                ))}
              </div>
            </div>
 
            {/* Subtitle */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:22 }}>
              <current.Icon size={12} color="#2a2a2a" strokeWidth={2}/>
              <p style={{ fontSize:12, color:'#2a2a2a', margin:0, fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase' }}>
                {current.desc}
              </p>
            </div>
 
            {/* ── Leaderboard tabs ─────────────────── */}
            {tab !== 'holes' && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:11 }}>
                {/* Column headers */}
                <div style={{ display:'flex', alignItems:'center', gap:20, padding:'0 24px 0 80px', marginBottom:2 }}>
                  <span style={{ flex:1, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#242424' }}>Player</span>
                  <span style={{ width:160, textAlign:'right', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,214,0,0.4)' }}>Strokes</span>
                  <span style={{ width:120, textAlign:'right', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#242424' }}>Avg / hole</span>
                </div>
 
                {current.data.slice(0, MAX_PLAYERS).map((e, i) => {
                  const isFirst = i === 0
                  return (
                    <div key={`${e.name}-${i}`} style={{
                      display:'flex', alignItems:'center', gap:20,
                      background: isFirst
                        ? 'linear-gradient(135deg, rgba(255,214,0,0.09), rgba(255,214,0,0.04))'
                        : 'rgba(255,255,255,0.025)',
                      border:`1px solid ${isFirst ? 'rgba(255,214,0,0.22)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius:16, padding:'18px 28px',
                      animation:`slideIn 0.4s ${i*0.07}s both`,
                      boxShadow: isFirst ? '0 4px 48px rgba(255,214,0,0.07), inset 0 1px 0 rgba(255,214,0,0.08)' : 'none',
                    }}>
                      <RankBadge rank={i + 1}/>
 
                      {e.color && (
                        <div style={{ width:13, height:13, borderRadius:'50%', background:e.color, flexShrink:0, boxShadow:`0 0 10px ${e.color}60` }}/>
                      )}
 
                      <span style={{ flex:1, fontSize:32, fontWeight:900, letterSpacing:'-0.03em', color:isFirst?'#FFD600':'#ddd' }}>
                        {e.name}
                      </span>
 
                      {/* Total strokes */}
                      <div style={{ width:160, display:'flex', alignItems:'baseline', gap:6, justifyContent:'flex-end' }}>
                        <span style={{ fontSize:52, fontWeight:900, letterSpacing:'-0.05em', lineHeight:1, color:isFirst?'#FFD600':'#fff' }}>
                          {e.total}
                        </span>
                        <span style={{ fontSize:13, color:isFirst?'rgba(255,214,0,0.4)':'#2e2e2e', fontWeight:600, paddingBottom:6 }}>
                          strokes
                        </span>
                      </div>
 
                      {/* Avg */}
                      <div style={{ width:120, textAlign:'right', borderLeft:'1px solid rgba(255,255,255,0.05)', paddingLeft:20 }}>
                        <p style={{ fontSize:26, fontWeight:800, color:'#3a3a3a', margin:0, letterSpacing:'-0.02em', lineHeight:1 }}>{e.avg}</p>
                        <p style={{ fontSize:11, color:'#272727', margin:'3px 0 0', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>avg/hole</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
 
            {/* ── Hole Overview ─────────────────────── */}
            {tab === 'holes' && (
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
                  {holeAvgs.map((hole, i) => {
                    const par  = hole.par || 3
                    const diff = hole.avg !== null ? hole.avg - par : null
                    const col  = diff === null ? '#242424' : diff < -0.2 ? '#22C55E' : diff > 0.2 ? '#ef4444' : '#FFD600'
                    return (
                      <div key={hole.id} style={{
                        display:'flex', alignItems:'center', gap:12,
                        background:'rgba(255,255,255,0.025)',
                        border:'1px solid rgba(255,255,255,0.05)',
                        borderRadius:12, padding:'12px 16px',
                        animation:`slideIn 0.3s ${i*0.025}s both`,
                      }}>
                        <span style={{ fontSize:14, fontWeight:900, color:'#2a2a2a', width:24, flexShrink:0 }}>{i+1}</span>
                        <span style={{ flex:1, fontSize:14, fontWeight:600, color:'#5a5a5a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {hole.title}
                        </span>
                        <span style={{ fontSize:22, fontWeight:900, color:col, letterSpacing:'-0.02em', minWidth:44, textAlign:'right' }}>
                          {hole.avg ?? '—'}
                        </span>
                        <span style={{ fontSize:12, color:'#2e2e2e', fontWeight:600, minWidth:28, textAlign:'right' }}>
                          /{par}
                        </span>
                        <DiffIndicator avg={hole.avg} par={par}/>
                      </div>
                    )
                  })}
                </div>
 
                <div style={{ display:'flex', gap:20, justifyContent:'center', marginTop:16 }}>
                  {[['#22C55E','Under par'],['#FFD600','On par'],['#ef4444','Over par']].map(([c,l])=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:c }}/>
                      <span style={{ fontSize:11, color:'#2e2e2e', fontWeight:600 }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
 
      {/* Polaroid strip */}
      {hasPhotos && (
        <div style={{ position:'fixed', right:0, top:0, bottom:0, width:180, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:16, zIndex:2 }}>
          {photos.slice(0, 3).map((p, i) => (
            <div key={i} style={{ background:'#fff', padding:'7px 7px 28px', borderRadius:3, boxShadow:'0 8px 40px rgba(0,0,0,0.85)', transform:`rotate(${[-3,2,-1.5][i]}deg)`, width:148 }}>
              <img src={p} alt="" style={{ width:'100%', aspectRatio:'1', objectFit:'cover', display:'block' }}/>
            </div>
          ))}
        </div>
      )}
 
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(-14px)} to{opacity:1;transform:none} }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  )
}
 