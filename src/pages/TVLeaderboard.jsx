import { useEffect, useState } from 'react'
import { supabase, getLeaderboard, getLiveLeaderboard, getAllPhotos } from '../lib/supabase'

export default function TVLeaderboard() {
  const [live,     setLive]     = useState([])
  const [bestDay,  setBestDay]  = useState([])
  const [bestWeek, setBestWeek] = useState([])
  const [bestAll,  setBestAll]  = useState([])
  const [photos,   setPhotos]   = useState([])
  const [photoIdx, setPhotoIdx] = useState(0)
  const [tab,      setTab]      = useState('live')
  const [time,     setTime]     = useState(new Date())
  const [ticker,   setTicker]   = useState(0)

  useEffect(() => { const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t) },[])
  useEffect(() => { if(photos.length<2)return; const t=setInterval(()=>setPhotoIdx(i=>(i+1)%photos.length),7000); return()=>clearInterval(t) },[photos.length])

  useEffect(()=>{
    const tabs=['live','day','week','all']
    let i=0; const t=setInterval(()=>{i=(i+1)%tabs.length;setTab(tabs[i]);setTicker(n=>n+1)},12000)
    return()=>clearInterval(t)
  },[])

  async function load() {
    const [l,d,w,a,p]=await Promise.all([getLiveLeaderboard(),getLeaderboard('day'),getLeaderboard('week'),getLeaderboard('all'),getAllPhotos(20)])
    setLive(l);setBestDay(d);setBestWeek(w);setBestAll(a);setPhotos(p.map(x=>x.storage_path).filter(Boolean))
  }
  useEffect(()=>{
    load(); const t=setInterval(load,30000)
    const ch=supabase.channel('tv').on('postgres_changes',{event:'*',schema:'public',table:'scores'},load).on('postgres_changes',{event:'*',schema:'public',table:'sessions'},load).subscribe()
    return()=>{clearInterval(t);supabase.removeChannel(ch)}
  },[])

  const TABS={ live:{label:'🔴 Live Now',data:live}, day:{label:'☀️ Today',data:bestDay}, week:{label:'📆 This Week',data:bestWeek}, all:{label:'🏆 All Time',data:bestAll} }
  const current=TABS[tab]
  const MEDAL=['🥇','🥈','🥉']

  return (
    <div style={{ minHeight:'100vh', background:'#000', color:'#fff', fontFamily:'Inter,sans-serif', overflow:'hidden', position:'relative' }}>

      {/* Background photo */}
      {photos.length>0&&(
        <div style={{ position:'fixed',inset:0,zIndex:0,transition:'opacity 1.5s' }}>
          <img src={photos[photoIdx]} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',filter:'brightness(0.08) blur(3px)' }}/>
        </div>
      )}

      {/* Yellow top bar */}
      <div style={{ position:'relative',zIndex:1,background:'#FFD600',padding:'0 60px',height:6 }}/>

      <div style={{ position:'relative',zIndex:1,padding:'36px 60px',minHeight:'100vh',display:'flex',flexDirection:'column' }}>

        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:36 }}>
          <div style={{ display:'flex',alignItems:'center',gap:24 }}>
            <img src="/logo.png" alt="Thrillzone" style={{ height:68,objectFit:'contain',filter:'drop-shadow(0 2px 16px rgba(0,0,0,0.6))' }}/>
            <div>
              <h1 style={{ fontSize:48,fontWeight:900,letterSpacing:'-0.04em',margin:0,color:'#FFD600' }}>Mini Golf</h1>
              <p style={{ color:'#555',fontSize:17,margin:0,fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase' }}>Leaderboard</p>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:42,fontWeight:900,color:'#FFD600',margin:0,letterSpacing:'-0.03em' }}>
              {time.toLocaleTimeString('en-NZ',{hour:'2-digit',minute:'2-digit'})}
            </p>
            <p style={{ color:'#444',fontSize:15,margin:0,fontWeight:600 }}>
              {time.toLocaleDateString('en-NZ',{weekday:'long',day:'numeric',month:'long'})}
            </p>
          </div>
        </div>

        {/* Tab pills */}
        <div style={{ display:'flex',gap:10,marginBottom:32 }}>
          {Object.entries(TABS).map(([k,v])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              padding:'10px 24px',borderRadius:50,border:'none',
              background:tab===k?'#FFD600':'rgba(255,255,255,0.06)',
              color:tab===k?'#000':'#555',
              fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:'inherit',
              transition:'all 0.25s',letterSpacing:'-0.01em',
              boxShadow:tab===k?'0 4px 20px rgba(255,214,0,0.35)':'none',
            }}>{v.label}</button>
          ))}
        </div>

        {/* Entries */}
        <div style={{ flex:1 }}>
          {current.data.length===0?(
            <div style={{ textAlign:'center',padding:'80px 0',color:'#333' }}>
              <p style={{ fontSize:72,marginBottom:16 }}>⛳</p>
              <p style={{ fontSize:24,fontWeight:700 }}>{tab==='live'?'No active games right now':'No scores yet'}</p>
            </div>
          ):(
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {current.data.slice(0,8).map((e,i)=>(
                <div key={`${e.name}-${i}`} style={{
                  display:'flex',alignItems:'center',gap:20,
                  background:i===0?'rgba(255,214,0,0.08)':'rgba(255,255,255,0.03)',
                  border:`1px solid ${i===0?'rgba(255,214,0,0.3)':'rgba(255,255,255,0.06)'}`,
                  borderRadius:16,padding:'18px 28px',
                  animation:`slideIn 0.5s ${i*0.06}s both`,
                  boxShadow:i===0?'0 0 40px rgba(255,214,0,0.12)':'none',
                }}>
                  <span style={{ fontSize:38,width:48,textAlign:'center',flexShrink:0 }}>
                    {MEDAL[i]||`${i+1}`}
                  </span>
                  {e.color&&<div style={{ width:14,height:14,borderRadius:'50%',background:e.color,flexShrink:0 }}/>}
                  <span style={{ flex:1,fontSize:30,fontWeight:900,letterSpacing:'-0.03em',color:i===0?'#FFD600':'#fff' }}>{e.name}</span>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:40,fontWeight:900,color:i===0?'#FFD600':'#fff',margin:0,letterSpacing:'-0.03em',lineHeight:1 }}>{e.avg}</p>
                    <p style={{ fontSize:13,color:'#444',margin:0,fontWeight:600 }}>avg / hole</p>
                  </div>
                  {e.holes&&<p style={{ fontSize:15,color:'#444',margin:0,minWidth:64,textAlign:'right',fontWeight:600 }}>{e.holes} holes</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div style={{ display:'flex',justifyContent:'center',gap:8,paddingTop:28 }}>
          {Object.keys(TABS).map(k=>(
            <div key={k} style={{ width:tab===k?28:8,height:8,borderRadius:4,background:tab===k?'#FFD600':'rgba(255,255,255,0.15)',transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}/>
          ))}
        </div>
      </div>

      {/* Polaroid strip right */}
      {photos.length>0&&(
        <div style={{ position:'fixed',right:0,top:0,bottom:0,width:190,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,padding:20,zIndex:2 }}>
          {photos.slice(0,3).map((p,i)=>(
            <div key={i} style={{ background:'#fff',padding:'8px 8px 32px',borderRadius:3,boxShadow:'0 8px 40px rgba(0,0,0,0.7)',transform:`rotate(${[-3,2,-1.5][i]}deg)`,width:154,transition:'transform 0.5s' }}>
              <img src={p} alt="" style={{ width:'100%',aspectRatio:'1',objectFit:'cover',display:'block' }}/>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
