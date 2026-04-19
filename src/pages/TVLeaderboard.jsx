import { useEffect, useState } from 'react'
import { Trophy, Wifi, Sun, Calendar, Clock, CircleDot, TrendingDown, Target } from 'lucide-react'
import { supabase, getLeaderboard, getLiveLeaderboard, getAllPhotos } from '../lib/supabase'

// Rank badge — SVG, no emoji
function RankBadge({ rank }) {
  if (rank === 1) return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="rgba(255,214,0,0.15)"/>
      <path d="M8 28 L14 14 L20 22 L26 10 L32 28Z" fill="#FFD600" opacity="0.9"/>
      <circle cx="20" cy="29" r="3" fill="#FFD600"/>
    </svg>
  )
  if (rank === 2) return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="rgba(192,192,192,0.10)"/>
      <text x="20" y="26" textAnchor="middle" fill="#aaaaaa" fontSize="18" fontWeight="900" fontFamily="Inter,sans-serif">2</text>
    </svg>
  )
  if (rank === 3) return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="rgba(180,120,60,0.10)"/>
      <text x="20" y="26" textAnchor="middle" fill="#b47c3c" fontSize="18" fontWeight="900" fontFamily="Inter,sans-serif">3</text>
    </svg>
  )
  return (
    <div style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:18, fontWeight:800, color:'#333', fontFamily:'Inter,sans-serif' }}>{rank}</span>
    </div>
  )
}

export default function TVLeaderboard() {
  const [live,     setLive]     = useState([])
  const [bestDay,  setBestDay]  = useState([])
  const [bestWeek, setBestWeek] = useState([])
  const [bestAll,  setBestAll]  = useState([])
  const [photos,   setPhotos]   = useState([])
  const [photoIdx, setPhotoIdx] = useState(0)
  const [tab,      setTab]      = useState('live')
  const [time,     setTime]     = useState(new Date())

  useEffect(() => { const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t) },[])
  useEffect(() => {
    if (photos.length < 2) return
    const t = setInterval(() => setPhotoIdx(i => (i+1) % photos.length), 7000)
    return () => clearInterval(t)
  }, [photos.length])

  useEffect(() => {
    const tabs = ['live','day','week','all']
    let i = 0
    const t = setInterval(() => { i=(i+1)%tabs.length; setTab(tabs[i]) }, 14000)
    return () => clearInterval(t)
  }, [])

  async function load() {
    const [l,d,w,a,p] = await Promise.all([
      getLiveLeaderboard(), getLeaderboard('day'),
      getLeaderboard('week'), getLeaderboard('all'), getAllPhotos(20)
    ])
    setLive(l); setBestDay(d); setBestWeek(w); setBestAll(a)
    setPhotos(p.map(x => x.storage_path).filter(Boolean))
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    const ch = supabase.channel('tv')
      .on('postgres_changes',{event:'*',schema:'public',table:'scores'},load)
      .on('postgres_changes',{event:'*',schema:'public',table:'sessions'},load)
      .subscribe()
    return () => { clearInterval(t); supabase.removeChannel(ch) }
  }, [])

  const TABS = {
    live: { label:'Live Now',    Icon:Wifi,        data:live,     desc:'Currently playing' },
    day:  { label:'Best Today',  Icon:Sun,         data:bestDay,  desc:'Lowest strokes today' },
    week: { label:'Best Week',   Icon:Calendar,    data:bestWeek, desc:'Lowest strokes this week' },
    all:  { label:'All Time',    Icon:Trophy,      data:bestAll,  desc:'Lowest strokes ever' },
  }
  const current = TABS[tab]
  const hasPhotos = photos.length > 0

  return (
    <div style={{ minHeight:'100vh', background:'#080808', color:'#fff', fontFamily:'Inter,sans-serif', overflow:'hidden', position:'relative' }}>

      {/* Background photo — very dim */}
      {hasPhotos && (
        <div style={{ position:'fixed', inset:0, zIndex:0 }}>
          <img key={photoIdx} src={photos[photoIdx]} alt=""
            style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.06) blur(4px)', transition:'opacity 1.5s' }}/>
        </div>
      )}

      {/* Yellow accent line top */}
      <div style={{ position:'relative', zIndex:1, height:5, background:'linear-gradient(90deg,#FFD600,#fff8,#FFD600)', opacity:0.9 }}/>

      {/* Main layout */}
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', minHeight:'calc(100vh - 70px)', padding:'32px 56px 24px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 }}>

          {/* Logo + title */}
          <div style={{ display:'flex', alignItems:'center', gap:22 }}>
            <img src="/logo.png" alt="Thrillzone" style={{ height:72, objectFit:'contain', filter:'drop-shadow(0 2px 20px rgba(0,0,0,0.7))' }}/>
            <div>
              <h1 style={{ fontSize:46, fontWeight:900, letterSpacing:'-0.04em', margin:0, color:'#FFD600', lineHeight:1 }}>Mini Golf</h1>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                <TrendingDown size={14} color="#444"/>
                <p style={{ color:'#444', fontSize:14, margin:0, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  Lowest score wins
                </p>
              </div>
            </div>
          </div>

          {/* Clock */}
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:44, fontWeight:900, color:'#FFD600', margin:0, letterSpacing:'-0.03em', lineHeight:1 }}>
              {time.toLocaleTimeString('en-NZ',{hour:'2-digit',minute:'2-digit'})}
            </p>
            <p style={{ color:'#444', fontSize:14, margin:0, fontWeight:600, marginTop:4 }}>
              {time.toLocaleDateString('en-NZ',{weekday:'long',day:'numeric',month:'long'})}
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:10, marginBottom:8 }}>
          {Object.entries(TABS).map(([k,v]) => {
            const active = tab === k
            return (
              <button key={k} onClick={()=>setTab(k)} style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'9px 20px', borderRadius:50, border:'none',
                background: active ? '#FFD600' : 'rgba(255,255,255,0.05)',
                color: active ? '#000' : '#444',
                fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit',
                transition:'all 0.25s',
                boxShadow: active ? '0 4px 24px rgba(255,214,0,0.3)' : 'none',
              }}>
                <v.Icon size={14} strokeWidth={2.5}/>
                {v.label}
              </button>
            )
          })}
        </div>

        {/* Subtitle */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
          <current.Icon size={13} color="#333" strokeWidth={2}/>
          <p style={{ fontSize:13, color:'#333', margin:0, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>
            {current.desc}
          </p>
        </div>

        {/* Column headers */}
        {current.data.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:20, padding:'0 28px', marginBottom:8 }}>
            <div style={{ width:40, flexShrink:0 }}/>
            {/* color dot space */}
            <div style={{ width:14, flexShrink:0 }}/>
            <span style={{ flex:1, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#333' }}>Player</span>
            <div style={{ display:'flex', gap:0, alignItems:'center' }}>
              <div style={{ textAlign:'right', minWidth:120 }}>
                <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#FFD600', opacity:0.6 }}>
                  Total strokes
                </span>
              </div>
              <div style={{ textAlign:'right', minWidth:110 }}>
                <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#333' }}>
                  Avg / hole
                </span>
              </div>
              <div style={{ textAlign:'right', minWidth:80 }}>
                <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#333' }}>
                  Holes
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Entries */}
        <div style={{ flex:1 }}>
          {current.data.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', gap:16 }}>
              <CircleDot size={48} color="#222" strokeWidth={1}/>
              <p style={{ fontSize:22, fontWeight:700, color:'#333', margin:0 }}>
                {tab==='live' ? 'No active games right now' : 'No scores recorded yet'}
              </p>
              <p style={{ fontSize:15, color:'#2a2a2a', margin:0 }}>
                {tab==='live' ? 'Scores will appear here as groups play' : 'Completed rounds will show here'}
              </p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {current.data.slice(0,8).map((e,i) => {
                const isFirst = i === 0
                return (
                  <div key={`${e.name}-${i}`} style={{
                    display:'flex', alignItems:'center', gap:20,
                    background: isFirst ? 'rgba(255,214,0,0.07)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${isFirst ? 'rgba(255,214,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius:14, padding:'16px 28px',
                    animation:`slideIn 0.45s ${i*0.06}s both`,
                    boxShadow: isFirst ? '0 0 48px rgba(255,214,0,0.08)' : 'none',
                    position:'relative', overflow:'hidden',
                  }}>
                    {/* Gold shimmer on first */}
                    {isFirst && (
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(255,214,0,0.04),transparent,rgba(255,214,0,0.04))', pointerEvents:'none' }}/>
                    )}

                    {/* Rank */}
                    <div style={{ flexShrink:0, width:40 }}>
                      <RankBadge rank={i+1}/>
                    </div>

                    {/* Player colour dot */}
                    {e.color && (
                      <div style={{ width:14, height:14, borderRadius:'50%', background:e.color, flexShrink:0, boxShadow:`0 0 8px ${e.color}60` }}/>
                    )}

                    {/* Name */}
                    <span style={{ flex:1, fontSize:28, fontWeight:900, letterSpacing:'-0.03em', color:isFirst?'#FFD600':'#fff' }}>
                      {e.name}
                    </span>

                    {/* Stats */}
                    <div style={{ display:'flex', alignItems:'baseline', gap:0 }}>
                      {/* Total strokes — primary */}
                      <div style={{ textAlign:'right', minWidth:120 }}>
                        <div style={{ display:'flex', alignItems:'baseline', gap:6, justifyContent:'flex-end' }}>
                          <span style={{ fontSize:42, fontWeight:900, color:isFirst?'#FFD600':'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>
                            {e.total ?? e.avg}
                          </span>
                          <span style={{ fontSize:13, color:isFirst?'rgba(255,214,0,0.5)':'#333', fontWeight:600, marginBottom:2 }}>
                            strokes
                          </span>
                        </div>
                      </div>

                      {/* Avg per hole — secondary */}
                      <div style={{ textAlign:'right', minWidth:110, borderLeft:'1px solid rgba(255,255,255,0.06)', marginLeft:16, paddingLeft:16 }}>
                        <p style={{ fontSize:22, fontWeight:800, color:'#444', margin:0, letterSpacing:'-0.02em', lineHeight:1 }}>
                          {e.avg}
                        </p>
                        <p style={{ fontSize:11, color:'#2e2e2e', margin:0, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>
                          avg/hole
                        </p>
                      </div>

                      {/* Holes played */}
                      {e.holes && (
                        <div style={{ textAlign:'right', minWidth:80, borderLeft:'1px solid rgba(255,255,255,0.06)', marginLeft:16, paddingLeft:16 }}>
                          <p style={{ fontSize:22, fontWeight:800, color:'#333', margin:0, lineHeight:1 }}>{e.holes}</p>
                          <p style={{ fontSize:11, color:'#2e2e2e', margin:0, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>holes</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, paddingTop:20, paddingBottom:6 }}>
          {Object.keys(TABS).map(k => (
            <div key={k} style={{ width:tab===k?24:7, height:7, borderRadius:4, background:tab===k?'#FFD600':'rgba(255,255,255,0.12)', transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}/>
          ))}
        </div>
      </div>

      {/* Polaroid strip — right side */}
      {hasPhotos && (
        <div style={{ position:'fixed', right:0, top:0, bottom:70, width:180, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:18, padding:16, zIndex:2 }}>
          {photos.slice(photoIdx, photoIdx+3).concat(photos.slice(0, Math.max(0, 3-(photos.length-photoIdx)))).slice(0,3).map((p,i) => (
            <div key={i} style={{ background:'#fff', padding:'7px 7px 28px', borderRadius:3, boxShadow:'0 8px 40px rgba(0,0,0,0.8)', transform:`rotate(${[-3,2,-1.5][i]}deg)`, width:148, transition:'all 0.5s', flexShrink:0 }}>
              <img src={p} alt="" style={{ width:'100%', aspectRatio:'1', objectFit:'cover', display:'block' }}/>
            </div>
          ))}
        </div>
      )}

      {/* URL bar */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:5, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,214,0,0.10)', padding:'10px 48px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#FFD600', animation:'pulse 2s ease infinite' }}/>
          <div>
            <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'rgba(255,214,0,0.5)', margin:0 }}>Player scorecard</p>
            <p style={{ fontSize:16, fontWeight:800, color:'#FFD600', margin:0 }}>{window.location.origin}</p>
          </div>
        </div>
        <div style={{ width:1, height:32, background:'rgba(255,255,255,0.06)' }}/>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'rgba(255,255,255,0.2)', margin:0 }}>This screen</p>
          <p style={{ fontSize:16, fontWeight:800, color:'rgba(255,255,255,0.35)', margin:0 }}>{window.location.origin}/leaderboard</p>
        </div>
        <div style={{ width:1, height:32, background:'rgba(255,255,255,0.06)' }}/>
        <div style={{ textAlign:'right' }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'rgba(255,255,255,0.2)', margin:0 }}>Staff admin</p>
          <p style={{ fontSize:16, fontWeight:800, color:'rgba(255,255,255,0.35)', margin:0 }}>{window.location.origin}/admin</p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:none} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing:border-box; }
      `}</style>
    </div>
  )
}
