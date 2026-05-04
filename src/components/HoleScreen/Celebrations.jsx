import { useEffect, useRef, useState } from 'react'

// ── Canvas Confetti ────────────────────────────────────────────
function ConfettiCanvas({ active }) {
  const canvasRef   = useRef(null)
  const rafRef      = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio||1
    canvas.width  = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    canvas.style.width  = window.innerWidth+'px'
    canvas.style.height = window.innerHeight+'px'
    ctx.scale(dpr,dpr)
    const W = window.innerWidth, H = window.innerHeight
    const COLORS = ['#FFD600','#FFFFFF','#FFD600','#FFFDE7','#FFC107','#FF6B35','#a78bfa','#60a5fa']
    const particles = Array.from({ length:220 }, () => ({
      x: Math.random()*W, y: -20 - Math.random()*200,
      w: 6+Math.random()*9, h: 10+Math.random()*7,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      rotation: Math.random()*360, rotSpeed:(Math.random()-0.5)*8,
      vx:(Math.random()-0.5)*4, vy:3+Math.random()*4, opacity:1,
    }))
    function draw() {
      ctx.clearRect(0,0,W,H)
      let alive = 0
      for (const p of particles) {
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.rotation+=p.rotSpeed
        if (p.y > H*0.7) p.opacity -= 0.012
        if (p.opacity<=0) continue; alive++
        ctx.save(); ctx.globalAlpha=Math.max(0,p.opacity)
        ctx.translate(p.x,p.y); ctx.rotate(p.rotation*Math.PI/180)
        ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore()
      }
      if (alive>0) rafRef.current=requestAnimationFrame(draw)
    }
    rafRef.current=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(rafRef.current)
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:9998 }}/>
}

// ── Fireworks Canvas ───────────────────────────────────────────
function FireworksCanvas({ active }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio||1
    canvas.width = window.innerWidth*dpr; canvas.height = window.innerHeight*dpr
    canvas.style.width=window.innerWidth+'px'; canvas.style.height=window.innerHeight+'px'
    ctx.scale(dpr,dpr)
    const W=window.innerWidth, H=window.innerHeight
    const COLORS=['#FFD600','#FF6B35','#fff','#60a5fa','#f87171','#a78bfa','#34d399','#f472b6']
    const particles=[]
    function burst(x,y) {
      const col=COLORS[Math.floor(Math.random()*COLORS.length)]
      for(let i=0;i<70;i++){
        const angle=(Math.PI*2*i)/70, speed=2+Math.random()*7
        particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,alpha:1,col,r:1.5+Math.random()*3.5})
      }
    }
    // Start with multiple immediate bursts
    burst(W*0.25, H*0.2); burst(W*0.75, H*0.25); burst(W*0.5, H*0.15)
    setTimeout(()=>burst(W*0.2,H*0.35),250)
    setTimeout(()=>burst(W*0.8,H*0.3),450)
    let t=0
    function draw() {
      ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fillRect(0,0,W,H)
      t++
      if(t%22===0) burst(80+Math.random()*(W-160), 40+Math.random()*(H*0.5))
      for(let i=particles.length-1;i>=0;i--){
        const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.1; p.alpha-=0.016
        if(p.alpha<=0){particles.splice(i,1);continue}
        ctx.globalAlpha=p.alpha; ctx.fillStyle=p.col
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill()
      }
      ctx.globalAlpha=1; rafRef.current=requestAnimationFrame(draw)
    }
    rafRef.current=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(rafRef.current)
  }, [active])
  if (!active) return null
  return <canvas ref={canvasRef} style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:9998 }}/>
}

// ── Galaxy Burst ───────────────────────────────────────────────
function GalaxyBurstCanvas({ active }) {
  const canvasRef = useRef(null); const rafRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio||1
    canvas.width=window.innerWidth*dpr; canvas.height=window.innerHeight*dpr
    canvas.style.width=window.innerWidth+'px'; canvas.style.height=window.innerHeight+'px'
    ctx.scale(dpr,dpr)
    const W=window.innerWidth, H=window.innerHeight, cx=W/2, cy=H/2
    const stars = Array.from({length:350},()=>{
      const angle=Math.random()*Math.PI*2, speed=0.8+Math.random()*5
      return {x:cx,y:cy,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
        alpha:1,size:0.5+Math.random()*2.5,
        color:['#FFD600','#fff','#ffe066','#FFD600','#a78bfa'][Math.floor(Math.random()*5)]}
    })
    function draw() {
      ctx.fillStyle='rgba(0,0,0,0.06)'; ctx.fillRect(0,0,W,H)
      for(const s of stars){
        s.x+=s.vx; s.y+=s.vy; s.vx*=1.025; s.vy*=1.025; s.alpha-=0.006
        if(s.alpha<=0) continue
        ctx.globalAlpha=Math.max(0,s.alpha)
        ctx.fillStyle=s.color; ctx.beginPath(); ctx.arc(s.x,s.y,s.size,0,Math.PI*2); ctx.fill()
      }
      ctx.globalAlpha=1; rafRef.current=requestAnimationFrame(draw)
    }
    rafRef.current=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(rafRef.current)
  }, [active])
  if (!active) return null
  return <canvas ref={canvasRef} style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:9998 }}/>
}

// ── Streamer Cannon ────────────────────────────────────────────
function StreamerCanvas({ active }) {
  const canvasRef = useRef(null); const rafRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio||1
    canvas.width=window.innerWidth*dpr; canvas.height=window.innerHeight*dpr
    canvas.style.width=window.innerWidth+'px'; canvas.style.height=window.innerHeight+'px'
    ctx.scale(dpr,dpr)
    const W=window.innerWidth, H=window.innerHeight
    const COLORS=['#FFD600','#ff6b6b','#4ecdc4','#a78bfa','#f472b6','#34d399','#60a5fa','#fff','#FF6B35']
    function makeRibbons(x,angleBase,count=18) {
      return Array.from({length:count},()=>({
        x, y:H+10,
        vx:(Math.cos(angleBase)+(Math.random()-0.5)*0.6)*(5+Math.random()*6),
        vy:(Math.sin(angleBase))*(5+Math.random()*6)-3,
        rotation:Math.random()*360, rotSpeed:(Math.random()-0.5)*14,
        w:7+Math.random()*9, h:16+Math.random()*12,
        color:COLORS[Math.floor(Math.random()*COLORS.length)], alpha:1,
      }))
    }
    let ribbons=[...makeRibbons(W*0.1,-Math.PI*0.6),...makeRibbons(W*0.9,-Math.PI*0.4)]
    setTimeout(()=>{ ribbons=[...ribbons,...makeRibbons(W*0.05,-Math.PI*0.65,12),...makeRibbons(W*0.95,-Math.PI*0.35,12)] },350)
    setTimeout(()=>{ ribbons=[...ribbons,...makeRibbons(W*0.5,-Math.PI*0.5,14)] },700)
    function draw() {
      ctx.clearRect(0,0,W,H)
      for(const r of ribbons){
        r.x+=r.vx; r.y+=r.vy; r.vy+=0.2; r.rotation+=r.rotSpeed
        if(r.y>H*0.7) r.alpha-=0.013
        if(r.alpha<=0) continue
        ctx.save(); ctx.globalAlpha=Math.max(0,r.alpha); ctx.translate(r.x,r.y)
        ctx.rotate(r.rotation*Math.PI/180); ctx.fillStyle=r.color
        ctx.beginPath(); ctx.ellipse(0,0,r.w/2,r.h/2,0,0,Math.PI*2); ctx.fill(); ctx.restore()
      }
      rafRef.current=requestAnimationFrame(draw)
    }
    rafRef.current=requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(rafRef.current)
  }, [active])
  if (!active) return null
  return <canvas ref={canvasRef} style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:9998 }}/>
}

// ── Kiwi Bird ─────────────────────────────────────────────────
function KiwiAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <div style={{ position:'absolute', bottom:'16%', animation:'kiwiRun 2.4s ease-in forwards' }}>
        <svg width="110" height="90" viewBox="0 0 110 90" fill="none" style={{ animation:'kiwiWaddle 0.2s ease-in-out infinite alternate' }}>
          {/* Shadow */}
          <ellipse cx="55" cy="86" rx="36" ry="5" fill="rgba(0,0,0,0.25)"/>
          {/* Body */}
          <ellipse cx="50" cy="56" rx="34" ry="26" fill="#7a5c1e"/>
          <ellipse cx="50" cy="54" rx="30" ry="22" fill="#8B6914"/>
          {/* Feather texture */}
          {[[30,45],[42,38],[56,40],[66,46],[28,58],[44,64],[60,62],[38,52],[52,50]].map(([x,y],i)=>(
            <path key={i} d={`M${x} ${y} Q${x+6} ${y-4} ${x+10} ${y}`} stroke="#6B4A0E" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7"/>
          ))}
          {/* Tiny wing bump */}
          <ellipse cx="35" cy="52" rx="12" ry="7" fill="#7A5C10"/>
          {/* Head */}
          <ellipse cx="78" cy="36" rx="17" ry="15" fill="#8B6914"/>
          <ellipse cx="79" cy="35" rx="15" ry="13" fill="#9a7020"/>
          {/* Eye */}
          <circle cx="86" cy="30" r="4" fill="#1a1a1a"/>
          <circle cx="87" cy="29" r="1.5" fill="#fff"/>
          <circle cx="87.5" cy="29.5" r="0.7" fill="#000"/>
          {/* Nostril */}
          <circle cx="80" cy="33" r="1" fill="#6B4A0E"/>
          {/* Long curved beak */}
          <path d="M93 34 Q105 31 112 28 Q116 26 117 23" stroke="#C8A040" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
          <path d="M93 36 Q105 34 112 32" stroke="#a88020" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>
          {/* Legs */}
          <path d="M40 78 L34 90 M34 90 L28 90 M34 90 L36 90" stroke="#C8A040" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M54 80 L60 92 M60 92 L54 92 M60 92 L66 92" stroke="#C8A040" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
      {/* Golf ball */}
      <div style={{ position:'absolute', bottom:'18%', left:'74%', animation:'ballLaunch 2.4s ease-in forwards' }}>
        <svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="14" fill="#fff" stroke="#ddd" strokeWidth="1"/><circle cx="11" cy="11" r="2" fill="#ddd"/><circle cx="18" cy="9" r="2" fill="#ddd"/><circle cx="9" cy="18" r="2" fill="#ddd"/><circle cx="20" cy="19" r="2" fill="#ddd"/><circle cx="15" cy="15" r="2" fill="#ddd"/></svg>
      </div>
      {/* Mini golf flag */}
      <div style={{ position:'absolute', top:'7%', right:'10%', animation:'flagPop 0.5s 1.9s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <svg width="50" height="85" viewBox="0 0 50 85"><rect x="23" y="3" width="3.5" height="72" rx="1.5" fill="#FFD600"/><polygon points="26,3 50,16 26,29" fill="#FFD600"/><ellipse cx="24" cy="78" rx="14" ry="5" fill="rgba(255,214,0,0.2)"/></svg>
      </div>
      {/* Impact stars */}
      <div style={{ position:'absolute', bottom:'24%', left:'68%', animation:'impactStar 0.5s 2s ease-out both' }}>
        <svg width="70" height="70" viewBox="0 0 70 70">
          {[0,40,80,120,160,200,240,300].map((a,i)=>(
            <line key={i} x1="35" y1="35" x2={35+Math.cos(a*Math.PI/180)*30} y2={35+Math.sin(a*Math.PI/180)*30} stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round"/>
          ))}
          <circle cx="35" cy="35" r="6" fill="#FFD600"/>
        </svg>
      </div>
      <style>{`
        @keyframes kiwiRun{0%{left:-130px}72%{left:60%}75%{left:58%}100%{left:60%}}
        @keyframes kiwiWaddle{0%{transform:rotate(-5deg) translateY(0)}100%{transform:rotate(5deg) translateY(-4px)}}
        @keyframes ballLaunch{0%,74%{transform:translate(0,0) rotate(0deg);opacity:1}78%{transform:translate(-6px,0) rotate(0deg)}100%{transform:translate(-130px,-300px) rotate(720deg);opacity:0}}
        @keyframes flagPop{0%{opacity:0;transform:scale(0.3) rotate(-30deg)}100%{opacity:1;transform:none}}
        @keyframes impactStar{0%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1.4)}100%{opacity:0;transform:scale(1.1)}}
      `}</style>
    </div>
  )
}

// ── Golf Swing ────────────────────────────────────────────────
function GolfSwingAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {[...Array(14)].map((_,i)=>(
        <div key={i} style={{ position:'absolute', left:`${16+i*5}%`, top:`${58-i*3.5}%`,
          width:i===13?20:5+i*0.7, height:i===13?20:5+i*0.7, borderRadius:'50%',
          background:i===13?'#fff':'#FFD600', opacity:i===13?1:0.1+i*0.07,
          animation:`trailIn 0.5s ${0.5+i*0.05}s ease-out both` }}/>
      ))}
      <div style={{ position:'absolute', left:'6%', top:'28%', animation:'swingAnim 2s ease-in-out forwards' }}>
        <svg width="100" height="130" viewBox="0 0 100 130" fill="none">
          <ellipse cx="50" cy="125" rx="22" ry="5" fill="rgba(0,0,0,0.2)"/>
          <ellipse cx="50" cy="80" rx="16" ry="24" fill="#FFD600"/>
          <circle cx="50" cy="46" r="16" fill="#FFD600"/>
          <path d="M34 43 Q50 30 66 43" fill="#cc9900"/>
          <rect x="31" y="41" width="38" height="6" rx="3" fill="#cc9900"/>
          <line x1="50" y1="64" x2="86" y2="33" stroke="#FFD600" strokeWidth="6" strokeLinecap="round"/>
          <line x1="86" y1="33" x2="95" y2="80" stroke="#cc9900" strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="42" y1="100" x2="32" y2="128" stroke="#FFD600" strokeWidth="7" strokeLinecap="round"/>
          <line x1="58" y1="100" x2="70" y2="128" stroke="#FFD600" strokeWidth="7" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ position:'absolute', left:'20%', top:'22%', animation:'foreAnim 0.6s 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <span style={{ fontSize:50, fontWeight:900, color:'#FFD600', textShadow:'0 0 30px rgba(255,214,0,0.7)', letterSpacing:'-0.02em' }}>FORE!</span>
      </div>
      <style>{`
        @keyframes trailIn{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
        @keyframes swingAnim{0%{transform:rotate(-45deg) translate(-30px,10px);opacity:0}15%{opacity:1}55%{transform:rotate(0deg)}100%{transform:rotate(18deg) translate(8px,0)}}
        @keyframes foreAnim{from{opacity:0;transform:scale(0.2) rotate(-20deg)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}

// ── Gecko ─────────────────────────────────────────────────────
function GeckoAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <div style={{ position:'absolute', bottom:'15%', animation:'geckoRun 2.5s ease-in forwards' }}>
        <svg width="130" height="65" viewBox="0 0 130 65" fill="none" style={{ animation:'geckoWiggle 0.2s ease-in-out infinite alternate' }}>
          <ellipse cx="65" cy="61" rx="44" ry="5" fill="rgba(0,0,0,0.2)"/>
          {/* Tail */}
          <path d="M16 34 Q8 28 4 20 Q1 14 4 10 Q7 6 6 2" stroke="#4ade80" strokeWidth="10" strokeLinecap="round" fill="none"/>
          <path d="M16 34 Q8 28 4 20 Q1 14 4 10" stroke="#34d399" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7"/>
          {/* Body */}
          <ellipse cx="60" cy="34" rx="36" ry="16" fill="#4ade80"/>
          <ellipse cx="60" cy="32" rx="34" ry="13" fill="#34d399"/>
          {/* Spots/pattern */}
          {[[48,26],[58,22],[70,25],[78,30],[44,34],[60,38],[74,36]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="3.5" fill="#22c55e" opacity="0.6"/>
          ))}
          {/* Side stripes */}
          <path d="M24 28 Q40 22 56 26" stroke="#22c55e" strokeWidth="2" opacity="0.5" fill="none"/>
          <path d="M24 40 Q40 44 56 40" stroke="#22c55e" strokeWidth="2" opacity="0.5" fill="none"/>
          {/* Head */}
          <ellipse cx="96" cy="32" rx="22" ry="15" fill="#4ade80"/>
          <ellipse cx="97" cy="31" rx="20" ry="13" fill="#34d399"/>
          {/* Eye */}
          <circle cx="106" cy="26" r="5" fill="#1a1a1a"/>
          <circle cx="107" cy="25" r="2" fill="#fff"/>
          <circle cx="107.5" cy="25.5" r="1" fill="#000"/>
          <circle cx="109" cy="24" r="1.5" fill="#4ade80" opacity="0.5"/>
          {/* Mouth smile */}
          <path d="M108 34 Q115 38 118 34" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" fill="none"/>
          {/* Tongue */}
          <path d="M118 33 Q126 30 128 27 M125 29 Q128 33 130 31" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          {/* Legs */}
          <path d="M44 46 L36 58 L26 58 M36 58 L36 62" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M64 48 L68 62 L76 64 M68 62 L62 64" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M44 22 L36 10 L26 8 M36 10 L34 4" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M64 20 L66 6 L74 4 M66 6 L60 2" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
      {/* Golf ball */}
      <div style={{ position:'absolute', bottom:'17%', left:'76%', animation:'geckoBall 2.5s ease-in forwards' }}>
        <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="#fff" stroke="#ddd" strokeWidth="1"/><circle cx="10" cy="10" r="2" fill="#ddd"/><circle cx="17" cy="9" r="2" fill="#ddd"/><circle cx="9" cy="17" r="2" fill="#ddd"/><circle cx="18" cy="18" r="2" fill="#ddd"/><circle cx="14" cy="14" r="2" fill="#ddd"/></svg>
      </div>
      {/* Speech bubble — positioned top so it doesn't cover content */}
      <div style={{ position:'absolute', top:'8%', left:'50%', transform:'translateX(-50%)', animation:'churBubble 0.5s 2s cubic-bezier(0.34,1.56,0.64,1) both', whiteSpace:'nowrap' }}>
        <div style={{ background:'#fff', borderRadius:14, padding:'10px 20px', boxShadow:'0 6px 24px rgba(0,0,0,0.5)', border:'2px solid #4ade80', position:'relative' }}>
          <span style={{ fontSize:22, fontWeight:900, color:'#16a34a' }}>Chur bro! 🤙</span>
          <div style={{ position:'absolute', bottom:-12, left:'50%', transform:'translateX(-50%)', width:0, height:0, borderLeft:'10px solid transparent', borderRight:'10px solid transparent', borderTop:'12px solid #fff' }}/>
        </div>
      </div>
      <style>{`
        @keyframes geckoRun{0%{left:-150px}73%{left:64%}76%{left:62%}100%{left:64%}}
        @keyframes geckoWiggle{0%{transform:rotate(-6deg) translateY(0)}100%{transform:rotate(6deg) translateY(-4px)}}
        @keyframes geckoBall{0%,74%{transform:translate(0,0);opacity:1}79%{transform:translate(-8px,0)}100%{transform:translate(-140px,-280px) rotate(600deg);opacity:0}}
        @keyframes churBubble{from{opacity:0;transform:translateX(-50%) scale(0.3) translateY(10px)}to{opacity:1;transform:translateX(-50%) scale(1) translateY(0)}}
      `}</style>
    </div>
  )
}

// ── Lightning Strike ───────────────────────────────────────────
function LightningAnimation({ active }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (!active) return
    // Phase 0: flash, 1: bolt visible, 2: sparks, 3: glow
    const t1 = setTimeout(()=>setPhase(1), 150)
    const t2 = setTimeout(()=>setPhase(2), 600)
    const t3 = setTimeout(()=>setPhase(3), 1100)
    return ()=>{ clearTimeout(t1);clearTimeout(t2);clearTimeout(t3) }
  }, [active])

  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {/* Screen flash */}
      {phase===0 && <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.85)', animation:'flashOut 0.3s ease-out forwards' }}/>}

      {/* Lightning bolt */}
      {phase>=1 && (
        <div style={{ position:'absolute', left:'50%', top:0, transform:'translateX(-55%)', animation:'boltIn 0.3s ease-out both' }}>
          <svg width="140" height="480" viewBox="0 0 140 480" fill="none">
            <defs>
              <filter id="lglow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="lglow2"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {/* Outer glow bolt */}
            <polyline points="70,0 44,180 78,180 22,480" stroke="rgba(255,214,0,0.3)" strokeWidth="20" strokeLinejoin="round" filter="url(#lglow)"/>
            {/* Main white bolt */}
            <polyline points="70,0 44,180 78,180 22,480" stroke="#fff" strokeWidth="7" strokeLinejoin="round" filter="url(#lglow2)"/>
            {/* Yellow core */}
            <polyline points="70,0 44,180 78,180 22,480" stroke="#FFD600" strokeWidth="3" strokeLinejoin="round"/>
            {/* Branch bolts */}
            <polyline points="60,120 82,160 95,145" stroke="#FFD600" strokeWidth="2" strokeLinejoin="round" opacity="0.7"/>
            <polyline points="50,200 28,230 18,220" stroke="#FFD600" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
            <polyline points="55,310 75,345 88,330" stroke="#FFD600" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
          </svg>
        </div>
      )}

      {/* Ground sparks */}
      {phase>=2 && (
        <div style={{ position:'absolute', bottom:'18%', left:'38%', animation:'sparksIn 0.4s ease-out both' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs><filter id="sglow"><feGaussianBlur stdDeviation="4"/></filter></defs>
            <circle cx="60" cy="60" r="30" fill="rgba(255,214,0,0.15)" filter="url(#sglow)"/>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
              <line key={i} x1="60" y1="60"
                x2={60+Math.cos(a*Math.PI/180)*50} y2={60+Math.sin(a*Math.PI/180)*50}
                stroke="#FFD600" strokeWidth={i%3===0?3:1.5} strokeLinecap="round" opacity={i%2===0?1:0.6}/>
            ))}
            <circle cx="60" cy="60" r="10" fill="#FFD600"/>
            <circle cx="60" cy="60" r="6" fill="#fff"/>
          </svg>
        </div>
      )}

      {/* Glowing ball */}
      {phase>=2 && (
        <div style={{ position:'absolute', bottom:'20%', left:'44%', animation:'ballGlowIn 0.5s ease-out both' }}>
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="20" fill="rgba(255,214,0,0.25)" />
            <circle cx="22" cy="22" r="14" fill="rgba(255,214,0,0.4)" />
            <circle cx="22" cy="22" r="10" fill="#fff" stroke="#FFD600" strokeWidth="3"/>
            <circle cx="22" cy="22" r="10" fill="none" stroke="#FFD600" strokeWidth="8" opacity="0.3"/>
          </svg>
        </div>
      )}

      {/* "ZAP!" text */}
      {phase>=3 && (
        <div style={{ position:'absolute', bottom:'38%', left:'55%', animation:'zapText 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <span style={{ fontSize:46, fontWeight:900, color:'#FFD600', textShadow:'0 0 20px rgba(255,214,0,0.8), 0 0 40px rgba(255,214,0,0.4)', letterSpacing:'-0.02em', fontStyle:'italic' }}>ZAP!</span>
        </div>
      )}

      <style>{`
        @keyframes flashOut{0%{opacity:0.85}100%{opacity:0}}
        @keyframes boltIn{0%{opacity:0;transform:translateX(-55%) scaleY(0);transform-origin:top center}70%{opacity:1;transform:translateX(-55%) scaleY(1)}100%{opacity:0.85}}
        @keyframes sparksIn{0%{opacity:0;transform:scale(0)}60%{opacity:1;transform:scale(1.2)}100%{opacity:1;transform:scale(1)}}
        @keyframes ballGlowIn{0%{opacity:0;transform:scale(0.5)}100%{opacity:1;transform:scale(1)}}
        @keyframes zapText{0%{opacity:0;transform:scale(0.3) rotate(-15deg)}100%{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}

// ── 8-bit Pixel Celebration ────────────────────────────────────
function PixelAnimation({ active }) {
  if (!active) return null
  const pixels = Array.from({length:50},(_,i)=>({
    x:Math.random()*100, delay:Math.random()*0.9,
    size:[8,10,12,16,20][Math.floor(Math.random()*5)],
    color:['#FFD600','#FF3B3B','#4ade80','#60a5fa','#f472b6','#fff','#a78bfa','#FF6B35'][Math.floor(Math.random()*8)],
    dx:(Math.random()-0.5)*90, dy:-(20+Math.random()*70),
  }))
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {pixels.map((p,i)=>(
        <div key={i} style={{ position:'absolute', left:`${p.x}%`, top:'25%',
          width:p.size, height:p.size, background:p.color,
          animation:`pixFall 1.4s ${p.delay}s ease-in both`,
          '--dx':`${p.dx}px`, '--dy':`${p.dy}px` }}/>
      ))}
      <div style={{ position:'absolute', bottom:'18%', left:'50%', transform:'translateX(-50%)', animation:'danceBob 0.35s ease-in-out infinite alternate' }}>
        <svg width="52" height="68" viewBox="0 0 52 68" style={{ imageRendering:'pixelated' }}>
          <rect x="18" y="0" width="16" height="16" fill="#FFD600"/>
          <rect x="14" y="16" width="24" height="22" fill="#FFD600"/>
          <rect x="2" y="18" width="12" height="14" fill="#FFD600"/>
          <rect x="38" y="14" width="12" height="14" fill="#FFD600"/>
          <rect x="14" y="38" width="10" height="22" fill="#FFD600"/>
          <rect x="28" y="38" width="10" height="22" fill="#FFD600"/>
          <rect x="20" y="4" width="4" height="4" fill="#000"/>
          <rect x="28" y="4" width="4" height="4" fill="#000"/>
          <rect x="20" y="10" width="12" height="2" fill="#cc9900"/>
          <rect x="38" y="4" width="4" height="32" fill="#cc9900"/>
          <rect x="34" y="32" width="14" height="4" fill="#777"/>
        </svg>
      </div>
      <div style={{ position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', animation:'pixText 0.35s 0.15s ease-out both' }}>
        <span style={{ fontFamily:'"Courier New",monospace', fontSize:30, fontWeight:900, color:'#FFD600',
          textShadow:'3px 3px 0 #cc7700,6px 6px 0 rgba(0,0,0,0.5)', letterSpacing:'0.06em' }}>
          HOLE IN ONE!
        </span>
      </div>
      <div style={{ position:'absolute', top:'21%', left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', animation:'pixText 0.35s 0.4s ease-out both' }}>
        <span style={{ fontFamily:'"Courier New",monospace', fontSize:15, fontWeight:700, color:'#4ade80', letterSpacing:'0.1em' }}>
          ★ ACHIEVEMENT UNLOCKED ★
        </span>
      </div>
      <style>{`
        @keyframes pixFall{0%{opacity:1;transform:translate(0,0) rotate(0deg)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(180deg)}}
        @keyframes danceBob{0%{transform:translateX(-50%) translateY(0) scaleX(1)}100%{transform:translateX(-50%) translateY(-14px) scaleX(-1)}}
        @keyframes pixText{0%{opacity:0;transform:translateX(-50%) scale(0.4)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
      `}</style>
    </div>
  )
}

// ── Hole In One Popup — 9 random animations ───────────────────
export function HoleInOnePopup({ players, onDismiss, enabledAnimations }) {
  const [visible, setVisible]       = useState(true)
  const [canDismiss, setCanDismiss] = useState(false)

  const ALL_ANIMS = ['confetti','fireworks','kiwi','golfswing','galaxy','streamer','gecko','lightning','pixel']
  const pool = enabledAnimations && enabledAnimations.length > 0
    ? ALL_ANIMS.filter(a => enabledAnimations.includes(a))
    : ALL_ANIMS
  const animType = useRef(pool[Math.floor(Math.random()*pool.length)]).current

  useEffect(() => {
    const minT  = setTimeout(()=>setCanDismiss(true), 3000)
    const autoT = setTimeout(()=>{ setVisible(false); setTimeout(onDismiss,400) }, 8000)
    return ()=>{ clearTimeout(minT); clearTimeout(autoT) }
  }, [])

  function handleTap() { if (!canDismiss) return; setVisible(false); setTimeout(onDismiss,300) }

  const multi = players.length > 1
  const headline = animType==='kiwi' ? (multi?'Sweet as! Hole in Ones!':'Sweet as! Hole in One!')
    : animType==='gecko'     ? (multi?'Chur! Hole in Ones!':'Chur bro! Hole in One!')
    : animType==='lightning' ? (multi?'⚡ HOLE IN ONES! ⚡':'⚡ HOLE IN ONE! ⚡')
    : animType==='golfswing' ? (multi?'FORE! Hole in Ones!':'FORE! Hole in One!')
    : animType==='pixel'     ? (multi?'HOLE IN ONES!':'HOLE IN ONE!')
    : (multi?'HOLE IN ONES!':'HOLE IN ONE!')

  return (
    <>
      {animType==='confetti'  && <ConfettiCanvas active={visible}/>}
      {animType==='fireworks' && <FireworksCanvas active={visible}/>}
      {animType==='galaxy'    && <GalaxyBurstCanvas active={visible}/>}
      {animType==='streamer'  && <StreamerCanvas active={visible}/>}

      <div onClick={handleTap} style={{
        position:'fixed', inset:0, zIndex:9997,
        background:'rgba(0,0,0,0.93)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        cursor:canDismiss?'pointer':'default', backdropFilter:'blur(12px)',
        opacity:visible?1:0, transition:'opacity 0.4s', padding:24,
      }}>
        {animType==='kiwi'      && <KiwiAnimation active={visible}/>}
        {animType==='golfswing' && <GolfSwingAnimation active={visible}/>}
        {animType==='gecko'     && <GeckoAnimation active={visible}/>}
        {animType==='lightning' && <LightningAnimation active={visible}/>}
        {animType==='pixel'     && <PixelAnimation active={visible}/>}

        {/* Trophy */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none"
          style={{ marginBottom:18, animation:'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)', position:'relative', zIndex:1 }}>
          <circle cx="40" cy="40" r="40" fill="rgba(255,214,0,0.12)"/>
          <path d="M22 20h36v24c0 9.94-8.06 18-18 18s-18-8.06-18-18V20z" fill="#FFD600" opacity="0.9"/>
          <path d="M14 20h10v15c0 2.76-2.24 5-5 5h-5V20z" fill="#FFD600" opacity="0.6"/>
          <path d="M56 20h10v20h-5c-2.76 0-5-2.24-5-5V20z" fill="#FFD600" opacity="0.6"/>
          <rect x="33" y="62" width="14" height="6" rx="2" fill="#FFD600" opacity="0.7"/>
          <rect x="26" y="68" width="28" height="5" rx="2.5" fill="#FFD600" opacity="0.5"/>
        </svg>

        <div style={{ fontSize:44, fontWeight:900, letterSpacing:'-0.04em', lineHeight:1,
          textAlign:'center', marginBottom:12, position:'relative', zIndex:1,
          animation:'bounceIn 0.6s 0.08s cubic-bezier(0.34,1.56,0.64,1) both',
          background:'linear-gradient(135deg,#FFD600,#fff,#FFD600)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
          {headline}
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginBottom:24,
          position:'relative', zIndex:1,
          animation:'bounceIn 0.6s 0.16s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          {players.map(p=>(
            <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:12, height:12, borderRadius:'50%', background:p.color }}/>
              <span style={{ fontSize:24, fontWeight:800, color:p.color, letterSpacing:'-0.02em' }}>{p.name}!</span>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10, marginBottom:28, position:'relative', zIndex:1,
          animation:'bounceIn 0.5s 0.28s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          {[0,1,2].map(i=>(
            <svg key={i} width="32" height="32" viewBox="0 0 24 24" fill="#FFD600"
              style={{ animation:`bounceIn 0.45s ${0.3+i*0.1}s cubic-bezier(0.34,1.56,0.64,1) both` }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          ))}
        </div>

        <p style={{ color:canDismiss?'rgba(255,255,255,0.35)':'transparent', fontSize:13,
          position:'relative', zIndex:1, transition:'color 0.6s 0.2s' }}>
          Tap anywhere to continue
        </p>
      </div>

      <style>{`
        @keyframes bounceIn{0%{opacity:0;transform:scale(0.3)}60%{transform:scale(1.1)}80%{transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}
      `}</style>
    </>
  )
}

// ── Float number ───────────────────────────────────────────────
export function FloatNumber({ value, x, y, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,680); return ()=>clearTimeout(t) },[])
  return (
    <div style={{ position:'fixed', left:x, top:y, pointerEvents:'none', zIndex:600,
      fontSize:26, fontWeight:900, color:value>0?'var(--red)':'var(--yellow)',
      animation:'floatUp 0.68s ease-out forwards', transform:'translate(-50%,-50%)' }}>
      {value>0?`+${value}`:value}
      <style>{`@keyframes floatUp{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-90px) scale(1.5)}}`}</style>
    </div>
  )
}

export function EndConfetti() {
  const [active, setActive] = useState(true)
  useEffect(()=>{ const t=setTimeout(()=>setActive(false),5000); return ()=>clearTimeout(t) },[])
  return <ConfettiCanvas active={active}/>
}

export function HoleTransition({ holeNumber, title, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,2800); return ()=>clearTimeout(t) },[])
  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'#060606',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14,
      animation:'holeFade 2.8s ease forwards' }}>
      <div style={{ fontSize:12, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,214,0,0.5)' }}>Next up</div>
      <div style={{ fontSize:88, fontWeight:900, color:'#FFD600', letterSpacing:'-0.04em', lineHeight:1, animation:'numPop 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        {String(holeNumber).padStart(2,'0')}
      </div>
      <div style={{ fontSize:24, fontWeight:800, color:'#fff', letterSpacing:'-0.02em', textAlign:'center', maxWidth:280, lineHeight:1.3, animation:'numPop 0.5s 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}>{title}</div>
      <style>{`
        @keyframes holeFade{0%{opacity:0}8%{opacity:1}80%{opacity:1}100%{opacity:0}}
        @keyframes numPop{0%{opacity:0;transform:scale(0.7) translateY(10px)}100%{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}

export const ALL_ANIMATION_NAMES = {
  confetti:  'Confetti',
  fireworks: 'Fireworks',
  kiwi:      'Kiwi Bird',
  golfswing: 'Golf Swing',
  galaxy:    'Galaxy Burst',
  streamer:  'Streamer Cannon',
  gecko:     'Gecko Lizard',
  lightning: 'Lightning Strike',
  pixel:     '8-bit Pixel',
}
