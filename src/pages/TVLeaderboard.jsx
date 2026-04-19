import { useEffect, useState, useRef, useCallback } from 'react'
import { Trophy, Sun, Calendar, TrendingDown, TrendingUp, Minus, BarChart3, Target } from 'lucide-react'
import { supabase, getLeaderboard, getHoleAverages, getAllPhotos } from '../lib/supabase'
 
// ── Rank badge ─────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1) return (
    <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,214,0,0.12)', border:'1.5px solid rgba(255,214,0,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Trophy size={28} color="#FFD600" strokeWidth={1.5}/>
    </div>
  )
  const c = rank === 2
    ? { bg:'rgba(192,192,192,0.07)', border:'rgba(192,192,192,0.15)', col:'#999' }
    : rank === 3
    ? { bg:'rgba(160,100,40,0.07)', border:'rgba(160,100,40,0.15)', col:'#a07040' }
    : { bg:'rgba(255,255,255,0.03)', border:'rgba(255,255,255,0.06)', col:'#2e2e2e' }
  return (
    <div style={{ width:64, height:64, borderRadius:'50%', background:c.bg, border:`1.5px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ fontSize:26, fontWeight:900, color:c.col }}>{rank}</span>
    </div>
  )
}
 
// ── Diff icon for hole overview ────────────────────────────────
function Diff({ avg, par }) {
  if (!avg) return <Minus size={16} color="#252525"/>
  const d = avg - par
  if (d < -0.25) return <TrendingDown size={16} color="#22C55E"/>
  if (d >  0.25) return <TrendingUp   size={16} color="#ef4444"/>
  return <Target size={16} color="#FFD600"/>
}
 
// ── Timer progress bar ─────────────────────────────────────────
function TimerBar({ duration, tabKey, onComplete }) {
  const [pct, setPct] = useState(0)
  const startRef = useRef(null)
  const rafRef   = useRef(null)
 
  useEffect(() => {
    setPct(0)
    startRef.current = performance.now()
    function tick(now) {
      const p = Math.min((now - startRef.current) / duration, 1)
      setPct(p)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
      else onComplete?.()
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tabKey])
 
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, height:5, background:'rgba(255,255,255,0.04)', zIndex:20 }}>
      <div style={{ height:'100%', width:`${pct*100}%`, background:'linear-gradient(90deg,#FFD600 0%,rgba(255,255,255,0.8) 100%)', borderRadius:'0 3px 3px 0', boxShadow:'0 0 12px rgba(255,214,0,0.6)', transition:'width 0.08s linear' }}/>
    </div>
  )
}
 
// ── Hole-in-one full screen takeover ──────────────────────────
function HoleInOneTV({ playerName, playerColor, holeName, onDismiss }) {
  const [visible, setVisible] = useState(true)
  const [countdown, setCountdown] = useState(8)
 
  useEffect(() => {
    const interval = setInterval(() => setCountdown(c => c - 1), 1000)
    const timeout  = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 600) }, 8000)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [])
 
  // Confetti canvas
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    const COLORS = ['#FFD600','#fff','#FFD600','#FFFDE7','#FFC107']
    const particles = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: -30 - Math.random() * 300,
      w: 7 + Math.random() * 10, h: 12 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 360, rs: (Math.random() - 0.5) * 7,
      vx: (Math.random() - 0.5) * 5, vy: 3.5 + Math.random() * 5,
      opacity: 1,
    }))
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = 0
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.rot += p.rs
        if (p.y > canvas.height * 0.65) p.opacity -= 0.012
        if (p.opacity <= 0) continue
        alive++
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot * Math.PI / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h)
        ctx.restore()
      }
      if (alive > 0) rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])
 
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,0.96)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      opacity: visible ? 1 : 0,
      transition:'opacity 0.6s ease',
    }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none' }}/>
 
      {/* Countdown ring */}
      <div style={{ position:'absolute', top:48, right:60 }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
          <circle cx="36" cy="36" r="30" fill="none" stroke="#FFD600" strokeWidth="4"
            strokeDasharray={`${188.5 * (countdown/8)} 188.5`}
            strokeLinecap="round" transform="rotate(-90 36 36)"
            style={{ transition:'stroke-dasharray 1s linear' }}/>
          <text x="36" y="41" textAnchor="middle" fill="#FFD600" fontSize="20" fontWeight="900" fontFamily="Inter,sans-serif">
            {countdown}
          </text>
        </svg>
      </div>
 
      <div style={{ position:'relative', zIndex:1, textAlign:'center', padding:'0 80px' }}>
        {/* Trophy icon */}
        <div style={{ marginBottom:32, animation:'bounceIn 0.7s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="60" fill="rgba(255,214,0,0.10)"/>
            <circle cx="60" cy="60" r="48" fill="rgba(255,214,0,0.06)"/>
            <path d="M36 28h48v32c0 13.25-10.75 24-24 24s-24-10.75-24-24V28z" fill="#FFD600" opacity="0.9"/>
            <path d="M28 28h10v20c0 3.3-2.7 6-6 6h-4V28z" fill="#FFD600" opacity="0.6"/>
            <path d="M82 28h10v26h-4c-3.3 0-6-2.7-6-6V28z" fill="#FFD600" opacity="0.6"/>
            <rect x="50" y="84" width="20" height="8" rx="2" fill="#FFD600" opacity="0.7"/>
            <rect x="40" y="92" width="40" height="6" rx="3" fill="#FFD600" opacity="0.5"/>
          </svg>
        </div>
 
        {/* HOLE IN ONE */}
        <div style={{
          fontSize:96, fontWeight:900, letterSpacing:'-0.04em', lineHeight:1,
          background:'linear-gradient(135deg,#FFD600,#fff,#FFD600)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          marginBottom:16,
          animation:'bounceIn 0.7s 0.1s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          HOLE IN ONE!
        </div>
 
        {/* Player name */}
        <div style={{
          fontSize:64, fontWeight:900, letterSpacing:'-0.03em', color:playerColor,
          marginBottom:16, lineHeight:1,
          animation:'bounceIn 0.6s 0.2s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {playerName}
        </div>
 
        {/* Hole name */}
        {holeName && (
          <div style={{
            fontSize:28, fontWeight:600, color:'rgba(255,255,255,0.4)',
            letterSpacing:'0.02em',
            animation:'fadeUp 0.5s 0.4s both',
          }}>
            {holeName}
          </div>
        )}
 
        {/* Stars */}
        <div style={{ display:'flex', gap:20, justifyContent:'center', marginTop:36, animation:'fadeUp 0.5s 0.5s both' }}>
          {[0,1,2].map(i => (
            <svg key={i} width="48" height="48" viewBox="0 0 24 24" fill="#FFD600"
              style={{ animation:`bounceIn 0.5s ${0.5+i*0.1}s both` }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          ))}
        </div>
      </div>
 
      <style>{`
        @keyframes bounceIn{0%{opacity:0;transform:scale(0.3)}60%{transform:scale(1.08)}80%{transform:scale(0.96)}100%{opacity:1;transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}
 
// ── Main TV Leaderboard ────────────────────────────────────────
const TAB_DURATION = 14000
 
export default function TVLeaderboard() {
  const [bestDay,   setBestDay]   = useState([])
  const [bestWeek,  setBestWeek]  = useState([])
  const [bestAll,   setBestAll]   = useState([])
  const [holeAvgs,  setHoleAvgs]  = useState([])
  const [photos,    setPhotos]    = useState([])
  const [photoIdx,  setPhotoIdx]  = useState(0)
  const [tab,       setTab]       = useState(null)
  const [tabKey,    setTabKey]    = useState(0)
  const [time,      setTime]      = useState(new Date())
  const [holeInOne, setHoleInOne] = useState(null) // { playerName, playerColor, holeName }
 
  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
 
  // Photo rotation
  useEffect(() => {
    if (photos.length < 2) return
    const t = setInterval(() => setPhotoIdx(i => (i + 1) % photos.length), 8000)
    return () => clearInterval(t)
  }, [photos.length])
 
  const load = useCallback(async () => {
    const [d, w, a, h, p] = await Promise.all([
      getLeaderboard('day'), getLeaderboard('week'),
      getLeaderboard('all'), getHoleAverages(), getAllPhotos(30),
    ])
    setBestDay(d); setBestWeek(w); setBestAll(a); setHoleAvgs(h)
    setPhotos(p.map(x => x.storage_path).filter(Boolean))
  }, [])
 
  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
 
    const ch = supabase.channel('tv-main')
      .on('postgres_changes', { event:'*', schema:'public', table:'sessions' }, load)
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'scores' }, async payload => {
        // Check for hole in one from opted-in session
        if (payload.new.strokes !== 1) return
        const { data: session } = await supabase
          .from('sessions')
          .select('players, opt_out_leaderboard')
          .eq('id', payload.new.session_id)
          .single()
        if (!session || session.opt_out_leaderboard) return
        const player = (session.players || []).find(p => p.name === payload.new.player_name)
        const { data: hole } = await supabase
          .from('holes').select('title').eq('id', payload.new.hole_id).single()
        setHoleInOne({
          playerName:  payload.new.player_name,
          playerColor: player?.color || '#FFD600',
          holeName:    hole?.title || '',
        })
        // Also refresh leaderboard after celebration
        setTimeout(load, 9000)
      })
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'scores' }, async payload => {
        if (payload.new.strokes !== 1 || payload.old?.strokes === 1) { load(); return }
        const { data: session } = await supabase
          .from('sessions')
          .select('players, opt_out_leaderboard')
          .eq('id', payload.new.session_id)
          .single()
        if (!session || session.opt_out_leaderboard) { load(); return }
        const player = (session.players || []).find(p => p.name === payload.new.player_name)
        const { data: hole } = await supabase
          .from('holes').select('title').eq('id', payload.new.hole_id).single()
        setHoleInOne({
          playerName:  payload.new.player_name,
          playerColor: player?.color || '#FFD600',
          holeName:    hole?.title || '',
        })
        setTimeout(load, 9000)
      })
      .subscribe()
 
    return () => { clearInterval(t); supabase.removeChannel(ch) }
  }, [load])
 
  // Build visible tabs — only show if they have data
  const allTabs = [
    { id:'day',   label:'Best Today',    Icon:Sun,       data:bestDay,  desc:'Lowest strokes today — full course' },
    { id:'week',  label:'Best Week',     Icon:Calendar,  data:bestWeek, desc:'Lowest strokes this week — full course' },
    { id:'all',   label:'All Time',      Icon:Trophy,    data:bestAll,  desc:'Lowest strokes ever — full course' },
    { id:'holes', label:'Hole Stats',    Icon:BarChart3,  data:[],       desc:'All-time average strokes per hole' },
  ]
  const availableTabs = allTabs.filter(t =>
    t.id === 'holes' ? holeAvgs.length > 0 : t.data.length > 0
  )
 
  // Set initial tab
  useEffect(() => {
    if (availableTabs.length > 0 && tab === null) setTab(availableTabs[0].id)
  }, [availableTabs.length])
 
  function advanceTab() {
    if (availableTabs.length < 2) return
    setTab(prev => {
      const idx  = availableTabs.findIndex(t => t.id === prev)
      const next = availableTabs[(idx + 1) % availableTabs.length]
      return next.id
    })
    setTabKey(k => k + 1)
  }
 
  const current = allTabs.find(t => t.id === tab)
  const hasPhotos = photos.length > 0
  const MAX = 5
 
  return (
    <div style={{ width:'100vw', height:'100vh', background:'#060606', color:'#fff', fontFamily:'Inter,sans-serif', overflow:'hidden', position:'relative', display:'flex', flexDirection:'column' }}>
 
      {/* Hole-in-one takeover */}
      {holeInOne && (
        <HoleInOneTV
          {...holeInOne}
          onDismiss={() => setHoleInOne(null)}
        />
      )}
 
      {/* Background photo — very dim */}
      {hasPhotos && (
        <div style={{ position:'absolute', inset:0, zIndex:0 }}>
          <img key={photoIdx} src={photos[photoIdx]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.05) blur(6px)' }}/>
        </div>
      )}
 
      {/* Timer bar */}
      {tab && availableTabs.length > 1 && (
        <TimerBar duration={TAB_DURATION} tabKey={`${tab}-${tabKey}`} onComplete={advanceTab}/>
      )}
 
      {/* ── HEADER ─────────────────────────────────── */}
      <div style={{
        position:'relative', zIndex:1, flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'28px 56px 20px',
        borderBottom:'1px solid rgba(255,255,255,0.04)',
      }}>
        {/* Left: logo + name */}
        <div style={{ display:'flex', alignItems:'center', gap:24 }}>
          <img src="/logo.png" alt="Putt N Glow" style={{ height:72, objectFit:'contain', filter:'drop-shadow(0 0 20px rgba(0,0,0,0.9))' }}/>
          <div>
            <h1 style={{ fontSize:44, fontWeight:900, letterSpacing:'-0.04em', margin:0, lineHeight:1, color:'#FFD600' }}>
              Putt N Glow
            </h1>
            <p style={{ fontSize:16, color:'#383838', margin:'4px 0 0', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Queenstown
            </p>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
              <div style={{ height:1, width:20, background:'rgba(255,214,0,0.2)' }}/>
              <span style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.14em', color:'#272727' }}>
                Leaderboard
              </span>
              <div style={{ height:1, width:20, background:'rgba(255,214,0,0.2)' }}/>
            </div>
          </div>
        </div>
 
        {/* Centre: tab pills */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {availableTabs.map(v => {
            const active = tab === v.id
            return (
              <button key={v.id} onClick={() => { setTab(v.id); setTabKey(k => k+1) }} style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'10px 24px', borderRadius:50, border:'none',
                background: active ? '#FFD600' : 'rgba(255,255,255,0.05)',
                color: active ? '#000' : '#3a3a3a',
                fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit',
                transition:'all 0.22s',
                boxShadow: active ? '0 4px 28px rgba(255,214,0,0.28)' : 'none',
              }}>
                <v.Icon size={15} strokeWidth={2.5}/>{v.label}
              </button>
            )
          })}
          {/* Rotation dots */}
          {availableTabs.length > 1 && (
            <div style={{ display:'flex', gap:6, marginLeft:8 }}>
              {availableTabs.map(v => (
                <div key={v.id} style={{ width:tab===v.id?22:7, height:7, borderRadius:4, background:tab===v.id?'#FFD600':'rgba(255,255,255,0.07)', transition:'all 0.35s cubic-bezier(0.16,1,0.3,1)' }}/>
              ))}
            </div>
          )}
        </div>
 
        {/* Right: clock */}
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:52, fontWeight:900, color:'#FFD600', margin:0, letterSpacing:'-0.04em', lineHeight:1 }}>
            {time.toLocaleTimeString('en-NZ', { hour:'2-digit', minute:'2-digit' })}
          </p>
          <p style={{ color:'#2e2e2e', fontSize:15, margin:'5px 0 0', fontWeight:600 }}>
            {time.toLocaleDateString('en-NZ', { weekday:'long', day:'numeric', month:'long' })}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:6, justifyContent:'flex-end' }}>
            <TrendingDown size={13} color="#282828" strokeWidth={2.5}/>
            <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#272727' }}>
              Lowest score wins
            </span>
          </div>
        </div>
      </div>
 
      {/* ── MAIN CONTENT ───────────────────────────── */}
      <div style={{ position:'relative', zIndex:1, flex:1, display:'flex', overflow:'hidden' }}>
 
        {/* No data state */}
        {availableTabs.length === 0 && (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Trophy size={36} color="#1e1e1e" strokeWidth={1}/>
            </div>
            <p style={{ fontSize:28, fontWeight:700, color:'#1e1e1e', margin:0 }}>Waiting for players…</p>
            <p style={{ fontSize:16, color:'#181818', margin:0 }}>Complete a full round to appear on the board</p>
          </div>
        )}
 
        {/* ── LEADERBOARD TAB ────────────────────── */}
        {current && tab !== 'holes' && availableTabs.length > 0 && (
          <div style={{ flex:1, display:'flex', gap:0, overflow:'hidden' }}>
 
            {/* Left — rankings */}
            <div style={{ flex:1, padding:'24px 48px 28px 56px', display:'flex', flexDirection:'column', gap:13, overflow:'hidden' }}>
              {/* Subtitle */}
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                <current.Icon size={13} color="#272727" strokeWidth={2}/>
                <span style={{ fontSize:12, color:'#272727', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  {current.desc}
                </span>
              </div>
 
              {/* Column labels */}
              <div style={{ display:'flex', alignItems:'center', gap:24, padding:'0 28px 0 76px' }}>
                <span style={{ flex:1, fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#222' }}>Player</span>
                <span style={{ width:180, textAlign:'right', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,214,0,0.35)' }}>Strokes</span>
                <span style={{ width:130, textAlign:'right', fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#222' }}>Avg / hole</span>
              </div>
 
              {/* Entries */}
              {current.data.slice(0, MAX).map((e, i) => {
                const isFirst = i === 0
                return (
                  <div key={`${e.name}-${i}`} style={{
                    display:'flex', alignItems:'center', gap:24,
                    background: isFirst
                      ? 'linear-gradient(135deg, rgba(255,214,0,0.09) 0%, rgba(255,214,0,0.03) 100%)'
                      : i === 1 ? 'rgba(192,192,192,0.03)' : 'rgba(255,255,255,0.02)',
                    border:`1px solid ${isFirst ? 'rgba(255,214,0,0.20)' : 'rgba(255,255,255,0.04)'}`,
                    borderRadius:18, padding:'20px 28px',
                    animation:`slideIn 0.45s ${i*0.08}s both`,
                    boxShadow: isFirst ? '0 8px 48px rgba(255,214,0,0.06), inset 0 1px 0 rgba(255,214,0,0.07)' : 'none',
                    flexShrink:0,
                  }}>
                    <RankBadge rank={i+1}/>
 
                    {e.color && (
                      <div style={{ width:14, height:14, borderRadius:'50%', background:e.color, flexShrink:0, boxShadow:`0 0 12px ${e.color}70` }}/>
                    )}
 
                    <span style={{ flex:1, fontSize:38, fontWeight:900, letterSpacing:'-0.03em', color:isFirst?'#FFD600':'#ccc', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {e.name}
                    </span>
 
                    {/* Total */}
                    <div style={{ width:180, display:'flex', alignItems:'baseline', gap:8, justifyContent:'flex-end' }}>
                      <span style={{ fontSize:60, fontWeight:900, letterSpacing:'-0.05em', lineHeight:1, color:isFirst?'#FFD600':'#fff' }}>
                        {e.total}
                      </span>
                      <span style={{ fontSize:14, color:isFirst?'rgba(255,214,0,0.38)':'#242424', fontWeight:600, paddingBottom:8 }}>
                        strokes
                      </span>
                    </div>
 
                    {/* Avg */}
                    <div style={{ width:130, textAlign:'right', borderLeft:'1px solid rgba(255,255,255,0.05)', paddingLeft:22 }}>
                      <p style={{ fontSize:30, fontWeight:800, color:'#323232', margin:0, letterSpacing:'-0.02em', lineHeight:1 }}>{e.avg}</p>
                      <p style={{ fontSize:11, color:'#222', margin:'3px 0 0', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>avg/hole</p>
                    </div>
                  </div>
                )
              })}
            </div>
 
            {/* Right — Polaroid photos panel */}
            {hasPhotos && (
              <div style={{
                width:260, flexShrink:0,
                borderLeft:'1px solid rgba(255,255,255,0.04)',
                background:'rgba(0,0,0,0.3)',
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                gap:24, padding:'24px 20px',
              }}>
                <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#1e1e1e', margin:0 }}>
                  Memories
                </p>
                {photos.slice(photoIdx % photos.length, (photoIdx % photos.length) + 3)
                  .concat(photos.slice(0, Math.max(0, 3 - (photos.length - photoIdx % photos.length))))
                  .slice(0, 3)
                  .map((p, i) => (
                    <div key={`${photoIdx}-${i}`} style={{
                      background:'#fff', padding:'8px 8px 32px',
                      borderRadius:4, width:196,
                      boxShadow:'0 12px 48px rgba(0,0,0,0.9)',
                      transform:`rotate(${[-2.5, 1.8, -1.2][i]}deg)`,
                      transition:'transform 0.5s ease',
                      flexShrink:0,
                    }}>
                      <img src={p} alt="" style={{ width:'100%', aspectRatio:'1', objectFit:'cover', display:'block' }}/>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
 
        {/* ── HOLE STATS TAB ─────────────────────── */}
        {tab === 'holes' && holeAvgs.length > 0 && (
          <div style={{ flex:1, padding:'20px 56px 28px', overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:16 }}>
              <BarChart3 size={13} color="#272727" strokeWidth={2}/>
              <span style={{ fontSize:12, color:'#272727', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                All-time average strokes per hole
              </span>
            </div>
 
            <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, overflow:'hidden', alignContent:'start' }}>
              {holeAvgs.map((hole, i) => {
                const par  = hole.par || 3
                const diff = hole.avg !== null ? hole.avg - par : null
                const col  = diff === null ? '#242424' : diff < -0.25 ? '#22C55E' : diff > 0.25 ? '#ef4444' : '#FFD600'
                const barW = hole.avg ? Math.min(100, (hole.avg / (par * 2)) * 100) : 0
                return (
                  <div key={hole.id} style={{
                    display:'flex', alignItems:'center', gap:14,
                    background:'rgba(255,255,255,0.025)',
                    border:'1px solid rgba(255,255,255,0.04)',
                    borderRadius:14, padding:'14px 20px',
                    animation:`slideIn 0.3s ${i*0.02}s both`,
                    position:'relative', overflow:'hidden',
                  }}>
                    {/* Subtle fill bar */}
                    <div style={{ position:'absolute', left:0, top:0, bottom:0, width:`${barW}%`, background:`${col}08`, transition:'width 1s ease' }}/>
                    <span style={{ fontSize:15, fontWeight:900, color:'#2a2a2a', width:26, flexShrink:0 }}>{i+1}</span>
                    <span style={{ flex:1, fontSize:15, fontWeight:600, color:'#4a4a4a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {hole.title}
                    </span>
                    <span style={{ fontSize:26, fontWeight:900, color:col, letterSpacing:'-0.03em', minWidth:48, textAlign:'right' }}>
                      {hole.avg ?? '—'}
                    </span>
                    <span style={{ fontSize:13, color:'#2a2a2a', fontWeight:600, minWidth:30, textAlign:'right' }}>
                      /{par}
                    </span>
                    <Diff avg={hole.avg} par={par}/>
                  </div>
                )
              })}
            </div>
 
            {/* Legend */}
            <div style={{ display:'flex', gap:28, justifyContent:'center', paddingTop:14 }}>
              {[['#22C55E','Under par'],['#FFD600','On par'],['#ef4444','Over par']].map(([c,l])=>(
                <div key={l} style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:c }}/>
                  <span style={{ fontSize:12, color:'#2a2a2a', fontWeight:600 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
 
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:none} }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  )
}
 