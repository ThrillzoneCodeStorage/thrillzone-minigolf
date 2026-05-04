import { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────
//  SHARED CANVAS HELPER
// ─────────────────────────────────────────────────────────────
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1
  const W = window.innerWidth, H = window.innerHeight
  canvas.width = W * dpr; canvas.height = H * dpr
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr)
  return { ctx, W, H }
}

// ─────────────────────────────────────────────────────────────
//  1. CONFETTI
// ─────────────────────────────────────────────────────────────
function ConfettiCanvas({ active }) {
  const canvasRef = useRef(null); const rafRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const { ctx, W, H } = setupCanvas(canvas)
    const COLORS = ['#FFD600','#fff','#FF6B35','#a78bfa','#60a5fa','#f472b6','#34d399','#ff6b6b','#ffe066']
    const shapes = Array.from({ length: 260 }, () => ({
      x: Math.random() * W, y: -30 - Math.random() * 250,
      w: 5 + Math.random() * 11, h: 8 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 5, vy: 3.5 + Math.random() * 4.5,
      alpha: 1, type: Math.random() > 0.6 ? 'circle' : 'rect',
    }))
    function draw() {
      ctx.clearRect(0, 0, W, H)
      let any = 0
      for (const p of shapes) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.055; p.rot += p.rotV
        if (p.y > H * 0.72) p.alpha -= 0.014
        if (p.alpha <= 0) continue; any++
        ctx.save(); ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180)
        ctx.fillStyle = p.color
        if (p.type === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill() }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (any > 0) rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])
  if (!active) return null
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }} />
}

// ─────────────────────────────────────────────────────────────
//  2. FIREWORKS
// ─────────────────────────────────────────────────────────────
function FireworksCanvas({ active }) {
  const canvasRef = useRef(null); const rafRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const { ctx, W, H } = setupCanvas(canvas)
    const COLORS = ['#FFD600','#FF6B35','#fff','#60a5fa','#f87171','#a78bfa','#34d399','#f472b6','#ffe066']
    const particles = []
    function burst(x, y, col) {
      const c = col || COLORS[Math.floor(Math.random() * COLORS.length)]
      for (let i = 0; i < 80; i++) {
        const a = (Math.PI * 2 * i) / 80, s = 1.5 + Math.random() * 7
        particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, alpha: 1, c, r: 1.5 + Math.random() * 3 })
      }
    }
    burst(W * 0.3, H * 0.22); burst(W * 0.7, H * 0.18); burst(W * 0.5, H * 0.12)
    setTimeout(() => burst(W * 0.2, H * 0.35), 300)
    setTimeout(() => burst(W * 0.8, H * 0.28), 500)
    setTimeout(() => burst(W * 0.5, H * 0.25), 700)
    let t = 0
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(0, 0, W, H); t++
      if (t % 24 === 0) burst(80 + Math.random() * (W - 160), 30 + Math.random() * H * 0.5)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.09; p.alpha -= 0.015
        if (p.alpha <= 0) { particles.splice(i, 1); continue }
        ctx.globalAlpha = p.alpha; ctx.fillStyle = p.c
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1; rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])
  if (!active) return null
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }} />
}

// ─────────────────────────────────────────────────────────────
//  3. GALAXY BURST
// ─────────────────────────────────────────────────────────────
function GalaxyCanvas({ active }) {
  const canvasRef = useRef(null); const rafRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const { ctx, W, H } = setupCanvas(canvas)
    const cx = W / 2, cy = H / 2
    const stars = Array.from({ length: 400 }, () => {
      const a = Math.random() * Math.PI * 2, s = 0.3 + Math.random() * 5.5
      return { x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, alpha: 1,
        size: 0.8 + Math.random() * 2.8, trail: [],
        color: ['#FFD600','#fff','#ffe066','#FFD600','#a78bfa','#60a5fa'][Math.floor(Math.random() * 6)] }
    })
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, W, H)
      for (const s of stars) {
        s.trail.push({ x: s.x, y: s.y, a: s.alpha })
        if (s.trail.length > 5) s.trail.shift()
        s.x += s.vx; s.y += s.vy; s.vx *= 1.022; s.vy *= 1.022; s.alpha -= 0.007
        if (s.alpha <= 0) continue
        // Trail
        s.trail.forEach((pt, i) => {
          ctx.globalAlpha = pt.a * (i / s.trail.length) * 0.4
          ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(pt.x, pt.y, s.size * 0.5, 0, Math.PI * 2); ctx.fill()
        })
        ctx.globalAlpha = Math.max(0, s.alpha); ctx.fillStyle = s.color
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1; rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])
  if (!active) return null
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }} />
}

// ─────────────────────────────────────────────────────────────
//  4. STREAMER CANNON
// ─────────────────────────────────────────────────────────────
function StreamerCanvas({ active }) {
  const canvasRef = useRef(null); const rafRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const { ctx, W, H } = setupCanvas(canvas)
    const COLORS = ['#FFD600','#ff6b6b','#4ecdc4','#a78bfa','#f472b6','#34d399','#60a5fa','#fff','#FF6B35','#ffe066']
    function volley(x, angle, n = 22) {
      return Array.from({ length: n }, () => ({
        x, y: H + 10,
        vx: (Math.cos(angle) + (Math.random() - 0.5) * 0.7) * (5 + Math.random() * 7),
        vy: Math.sin(angle) * (5 + Math.random() * 7) - 2,
        rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 16,
        w: 6 + Math.random() * 10, h: 14 + Math.random() * 14,
        color: COLORS[Math.floor(Math.random() * COLORS.length)], alpha: 1,
      }))
    }
    let ribbons = [...volley(W * 0.08, -Math.PI * 0.6), ...volley(W * 0.92, -Math.PI * 0.4)]
    setTimeout(() => { ribbons = [...ribbons, ...volley(W * 0.04, -Math.PI * 0.65, 14), ...volley(W * 0.96, -Math.PI * 0.35, 14)] }, 350)
    setTimeout(() => { ribbons = [...ribbons, ...volley(W * 0.5, -Math.PI * 0.5, 16)] }, 680)
    setTimeout(() => { ribbons = [...ribbons, ...volley(W * 0.25, -Math.PI * 0.58, 12), ...volley(W * 0.75, -Math.PI * 0.42, 12)] }, 1000)
    function draw() {
      ctx.clearRect(0, 0, W, H)
      for (const r of ribbons) {
        r.x += r.vx; r.y += r.vy; r.vy += 0.22; r.rot += r.rotV
        if (r.y > H * 0.65) r.alpha -= 0.011
        if (r.alpha <= 0) continue
        ctx.save(); ctx.globalAlpha = Math.max(0, r.alpha)
        ctx.translate(r.x, r.y); ctx.rotate(r.rot * Math.PI / 180)
        ctx.fillStyle = r.color; ctx.beginPath()
        ctx.ellipse(0, 0, r.w / 2, r.h / 2, 0, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])
  if (!active) return null
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }} />
}

// ─────────────────────────────────────────────────────────────
//  5. KIWI BIRD — detailed SVG
// ─────────────────────────────────────────────────────────────
function KiwiSVG() {
  return (
    <svg width="190" height="140" viewBox="0 0 190 140" fill="none">
      <ellipse cx="90" cy="134" rx="62" ry="7" fill="rgba(0,0,0,0.28)"/>
      {/* Body layers — dark to light brown */}
      <ellipse cx="88" cy="82" rx="56" ry="48" fill="#2E1A06" stroke="#1a0e04" strokeWidth="2.5"/>
      <ellipse cx="88" cy="78" rx="52" ry="44" fill="#4A2A0A"/>
      <ellipse cx="84" cy="74" rx="47" ry="39" fill="#6B3E12"/>
      <ellipse cx="80" cy="70" rx="42" ry="34" fill="#8B5420"/>
      {/* Hair/feather strokes — radiating outward like reference */}
      {[
        [44,50],[56,42],[70,38],[84,36],[98,38],[112,44],[122,54],[126,66],
        [38,66],[50,58],[66,52],[82,50],[98,52],[114,58],[124,70],
        [40,82],[54,76],[70,70],[86,68],[102,70],[116,76],[124,86],
        [44,98],[60,94],[76,90],[92,88],[108,90],[120,96],
        [52,112],[68,108],[84,106],[100,108],[114,112],
        [64,124],[80,122],[96,124],
      ].map(([x,y],i)=>{
        const angle = Math.atan2(y-82,x-88)
        const len = 12+Math.random()*5
        return <line key={i} x1={x} y1={y} x2={x+Math.cos(angle)*len} y2={y+Math.sin(angle)*len}
          stroke="#1a0e04" strokeWidth="1.8" strokeLinecap="round" opacity="0.65"/>
      })}
      {/* Finer hair layer */}
      {[
        [58,46],[78,40],[100,42],[118,50],[36,74],[128,78],
        [42,92],[128,94],[56,118],[102,120],
      ].map(([x,y],i)=>{
        const angle = Math.atan2(y-82,x-88)
        return <line key={i} x1={x} y1={y} x2={x+Math.cos(angle)*8} y2={y+Math.sin(angle)*8}
          stroke="#1a0e04" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      })}
      {/* Head */}
      <ellipse cx="148" cy="54" rx="28" ry="26" fill="#2E1A06" stroke="#1a0e04" strokeWidth="2.5"/>
      <ellipse cx="148" cy="52" rx="25" ry="23" fill="#4A2A0A"/>
      <ellipse cx="146" cy="50" rx="21" ry="19" fill="#6B3E12"/>
      {/* Head feathers */}
      {[[132,36],[144,30],[158,34],[166,44],[164,58],[152,66],[138,62],[130,52]].map(([x,y],i)=>{
        const angle = Math.atan2(y-54,x-148)
        return <line key={i} x1={x} y1={y} x2={x+Math.cos(angle)*9} y2={y+Math.sin(angle)*9}
          stroke="#1a0e04" strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/>
      })}
      {/* BIG CARTOON EYES — like reference */}
      <circle cx="158" cy="46" r="12" fill="#fff" stroke="#1a0e04" strokeWidth="2.5"/>
      <circle cx="159" cy="46" r="8" fill="#1a0e04"/>
      <circle cx="159" cy="46" r="6" fill="#0a0a0a"/>
      <circle cx="161.5" cy="43" r="3" fill="#fff"/>
      <circle cx="158" cy="49" r="1.2" fill="#fff" opacity="0.5"/>
      {/* BEAK — long, slender, gently curved downward */}
      <path d="M174 52 Q186 54 194 58 Q200 62 202 66" stroke="#B8860B" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M174 50 Q186 52 194 56 Q200 60 202 64" stroke="#DAA520" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M180 51 Q190 54 198 58" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
      {/* Nostril hole */}
      <ellipse cx="182" cy="52" rx="2.5" ry="1.5" fill="#8B6008" transform="rotate(-15 182 52)"/>
      {/* FEET — proper kiwi feet with 3 forward toes + 1 back toe */}
      {/* Left foot */}
      <path d="M72 126 L66 135" stroke="#B8860B" strokeWidth="5" strokeLinecap="round"/>
      {/* 3 forward toes */}
      <path d="M66 135 L56 140" stroke="#B8860B" strokeWidth="4" strokeLinecap="round"/>
      <path d="M66 135 L64 142" stroke="#B8860B" strokeWidth="4" strokeLinecap="round"/>
      <path d="M66 135 L72 141" stroke="#B8860B" strokeWidth="4" strokeLinecap="round"/>
      {/* 1 back toe */}
      <path d="M66 135 L74 133" stroke="#B8860B" strokeWidth="3" strokeLinecap="round"/>
      {/* Right foot */}
      <path d="M94 128 L100 137" stroke="#B8860B" strokeWidth="5" strokeLinecap="round"/>
      <path d="M100 137 L90 142" stroke="#B8860B" strokeWidth="4" strokeLinecap="round"/>
      <path d="M100 137 L100 144" stroke="#B8860B" strokeWidth="4" strokeLinecap="round"/>
      <path d="M100 137 L108 141" stroke="#B8860B" strokeWidth="4" strokeLinecap="round"/>
      <path d="M100 137 L108 134" stroke="#B8860B" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

function KiwiAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>

      {/* Kiwi fruit — sitting still on the right, waiting */}
      <div style={{ position:'absolute', bottom:'17%', right:'12%' }}>
        <svg width="70" height="70" viewBox="0 0 70 70">
          {/* Fuzzy brown skin */}
          <ellipse cx="35" cy="35" rx="32" ry="30" fill="#8B6914" stroke="#6a4e0e" strokeWidth="2"/>
          {/* Fuzzy texture */}
          {[20,40,60,80,100,120,140,160,180,200,220,240,260,280,300,320,340,360].map((a,i)=>(
            <line key={i} x1={35+Math.cos(a*Math.PI/180)*22} y1={35+Math.sin(a*Math.PI/180)*22}
              x2={35+Math.cos(a*Math.PI/180)*30} y2={35+Math.sin(a*Math.PI/180)*30}
              stroke="#6a4e0e" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          ))}
          {/* Cut face — top half green */}
          <ellipse cx="35" cy="28" rx="26" ry="18" fill="#5a8a0a" stroke="#3a5a06" strokeWidth="1.5"/>
          <ellipse cx="35" cy="28" rx="22" ry="14" fill="#6aaa10"/>
          {/* White centre core */}
          <ellipse cx="35" cy="28" rx="6" ry="5" fill="#ece8dc"/>
          {/* Seeds */}
          {[0,36,72,108,144,180,216,252,288,324].map((a,i)=>(
            <ellipse key={i}
              cx={35+Math.cos(a*Math.PI/180)*12} cy={28+Math.sin(a*Math.PI/180)*9}
              rx="2.8" ry="1.4" fill="#1a2a04" opacity="0.9"
              transform={`rotate(${a} ${35+Math.cos(a*Math.PI/180)*12} ${28+Math.sin(a*Math.PI/180)*9})`}/>
          ))}
          {/* Shadow under fruit */}
          <ellipse cx="35" cy="66" rx="24" ry="5" fill="rgba(0,0,0,0.2)"/>
        </svg>
      </div>

      {/* Kiwi bird — runs from left toward fruit */}
      <div style={{ position:'absolute', bottom:'13%', animation:'kiwiRun 2.4s cubic-bezier(0.25,0.46,0.45,0.94) forwards' }}>
        <div style={{ animation:'kiwiWaddle 0.2s ease-in-out infinite alternate' }}>
          <KiwiSVG/>
        </div>
      </div>

      {/* NZ flag pole */}
      <div style={{ position:'absolute', top:'6%', right:'6%', animation:'flagIn 0.5s 2.0s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <svg width="52" height="88" viewBox="0 0 52 88">
          <rect x="23" y="3" width="4" height="76" rx="2" fill="#FFD600"/>
          <polygon points="27,3 52,17 27,31" fill="#FFD600"/>
          <ellipse cx="25" cy="81" rx="15" ry="5" fill="rgba(255,214,0,0.2)"/>
        </svg>
      </div>

      {/* Impact burst when bird reaches fruit */}
      <div style={{ position:'absolute', bottom:'20%', right:'10%', animation:'burst 0.6s 2.05s ease-out both' }}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
            <line key={i} x1="45" y1="45"
              x2={45+Math.cos(a*Math.PI/180)*(i%3===0?42:30)}
              y2={45+Math.sin(a*Math.PI/180)*(i%3===0?42:30)}
              stroke="#FFD600" strokeWidth={i%3===0?3.5:1.8} strokeLinecap="round"/>
          ))}
          <circle cx="45" cy="45" r="9" fill="#FFD600"/>
          <circle cx="45" cy="45" r="4" fill="#fff"/>
        </svg>
      </div>

      <style>{`
        @keyframes kiwiRun{0%{left:-220px}74%{left:56%}77%{left:54%}100%{left:56%}}
        @keyframes kiwiWaddle{0%{transform:rotate(-7deg) translateY(0)}100%{transform:rotate(7deg) translateY(-6px)}}
        @keyframes flagIn{from{opacity:0;transform:scale(0.3) rotate(-30deg)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  6. GOLF SWING
// ─────────────────────────────────────────────────────────────
function GolfSwingAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {/* Ball trail dots */}
      {Array.from({length:12},(_,i)=>(
        <div key={i} style={{ position:'absolute',
          left:`${18+i*5.2}%`, top:`${62-i*4}%`,
          width:i===11?20:3+i, height:i===11?20:3+i, borderRadius:'50%',
          background:i===11?'#fff':'#FFD600',
          opacity:i===11?1:0.06+i*0.08,
          animation:`trailPop 0.35s ${0.6+i*0.04}s ease-out both` }}/>
      ))}

      {/* Golfer silhouette — clean follow-through */}
      <div style={{ position:'absolute', left:'4%', top:'20%', animation:'golferSwing 2.2s ease-in-out forwards' }}>
        <svg width="120" height="185" viewBox="0 0 120 185" fill="none">
          {/* Ground shadow */}
          <ellipse cx="62" cy="180" rx="32" ry="6" fill="rgba(0,0,0,0.22)"/>

          {/* === BACK LEG (left, toe raised) === */}
          <path d="M48 120 Q42 140 40 158 Q38 168 44 174" stroke="#c8b48a" strokeWidth="16" strokeLinecap="round" fill="none"/>
          <path d="M48 120 Q42 140 40 158 Q38 168 44 174" stroke="#d4c09a" strokeWidth="11" strokeLinecap="round" fill="none"/>
          {/* Back shoe */}
          <ellipse cx="46" cy="175" rx="11" ry="6" fill="#f0ece0" stroke="#c8b48a" strokeWidth="1.5" transform="rotate(20 46 175)"/>

          {/* === FRONT LEG (right, planted) === */}
          <path d="M68 120 Q74 140 78 158 Q82 170 78 176" stroke="#c8b48a" strokeWidth="16" strokeLinecap="round" fill="none"/>
          <path d="M68 120 Q74 140 78 158 Q82 170 78 176" stroke="#d4c09a" strokeWidth="11" strokeLinecap="round" fill="none"/>
          {/* Front shoe */}
          <ellipse cx="72" cy="177" rx="13" ry="6" fill="#f0ece0" stroke="#c8b48a" strokeWidth="1.5" transform="rotate(-10 72 177)"/>

          {/* === BODY — green polo ===  */}
          <path d="M38 80 Q44 70 58 68 Q72 66 82 76 Q90 88 86 106 Q80 118 66 120 Q50 122 42 112 Q34 100 38 80 Z"
            fill="#7ab520" stroke="#5a8a10" strokeWidth="2"/>
          {/* Shirt highlight */}
          <path d="M46 76 Q58 72 72 76 Q80 80 82 90" stroke="#8acc28" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.45"/>
          {/* Belt */}
          <path d="M40 114 Q60 118 84 112" stroke="#6a5a30" strokeWidth="3" strokeLinecap="round" fill="none"/>
          {/* Collar V */}
          <path d="M54 70 L60 78 L66 70" stroke="#5a8a10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

          {/* === ARMS — raised in follow-through === */}
          {/* Both arms up, holding club above left shoulder */}
          <path d="M58 80 L46 58 L32 36" stroke="#e0b888" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M58 80 L46 58 L32 36" stroke="#f0cc9a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M66 78 L56 52 L42 30" stroke="#e0b888" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M66 78 L56 52 L42 30" stroke="#f0cc9a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Hands (gloves) */}
          <ellipse cx="30" cy="33" rx="8" ry="7" fill="#fff" stroke="#ddd" strokeWidth="1.5"/>
          <ellipse cx="40" cy="27" rx="8" ry="7" fill="#fff" stroke="#ddd" strokeWidth="1.5"/>

          {/* === CLUB — above head === */}
          <path d="M34 28 L22 6" stroke="#999" strokeWidth="3.5" strokeLinecap="round"/>
          {/* Club head */}
          <path d="M20 4 L14 2 Q10 4 12 8 Q14 12 20 10 Z" fill="#888" stroke="#666" strokeWidth="1"/>

          {/* === HEAD === */}
          {/* Neck */}
          <path d="M56 66 Q60 60 64 66" stroke="#e0b888" strokeWidth="8" strokeLinecap="round" fill="none"/>
          {/* Head */}
          <circle cx="62" cy="46" r="22" fill="#e8c08a" stroke="#d4a870" strokeWidth="2"/>
          {/* Ear */}
          <ellipse cx="41" cy="48" rx="5" ry="7" fill="#e0b888" stroke="#d4a870" strokeWidth="1.5"/>
          {/* Eye */}
          <ellipse cx="52" cy="44" rx="3.5" ry="4" fill="#2a1808"/>
          <circle cx="53" cy="43" r="1.5" fill="#fff"/>
          {/* Eyebrow */}
          <path d="M48 38 Q52 36 57 38" stroke="#8a5a20" strokeWidth="2" strokeLinecap="round" fill="none"/>
          {/* Nose */}
          <path d="M58 48 Q62 51 66 49" stroke="#d4a070" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          {/* Smile — happy! */}
          <path d="M52 56 Q60 62 69 57" stroke="#c07840" strokeWidth="2" strokeLinecap="round" fill="none"/>

          {/* === WHITE CAP === */}
          {/* Cap dome */}
          <path d="M40 40 Q42 18 62 16 Q82 14 84 36 L78 38 Q72 20 62 20 Q50 22 46 38 Z"
            fill="#f5f5f0" stroke="#d8d8d0" strokeWidth="1.5"/>
          {/* Cap brim — sticks out left */}
          <path d="M38 40 Q36 46 44 48 Q54 50 64 46 Q74 42 78 38"
            fill="#f5f5f0" stroke="#d8d8d0" strokeWidth="1.5"/>
          {/* Cap seam */}
          <path d="M42 42 Q60 38 80 40" stroke="#d0d0c8" strokeWidth="1" fill="none" opacity="0.5"/>
        </svg>
      </div>

      {/* FORE! text */}
      <div style={{ position:'absolute', left:'24%', top:'16%', animation:'foreIn 0.65s 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <span style={{ fontSize:56, fontWeight:900, color:'#FFD600', fontStyle:'italic',
          letterSpacing:'-0.03em',
          textShadow:'0 0 40px rgba(255,214,0,0.8), 3px 3px 0 rgba(0,0,0,0.6)' }}>FORE!</span>
      </div>

      <style>{`
        @keyframes trailPop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
        @keyframes golferSwing{0%{transform:rotate(-38deg) translate(-35px,12px);opacity:0}20%{opacity:1}60%{transform:rotate(0deg)}100%{transform:rotate(14deg) translate(8px,-2px)}}
        @keyframes foreIn{from{opacity:0;transform:scale(0.15) rotate(-22deg)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  7. GECKO — detailed SVG
// ─────────────────────────────────────────────────────────────
function GeckoSVG() {
  return (
    <svg width="210" height="88" viewBox="0 0 210 88" fill="none">
      <ellipse cx="105" cy="84" rx="80" ry="6" fill="rgba(0,0,0,0.25)"/>

      {/* ── TAIL — long curved, tapering ── */}
      <path d="M24 50 Q14 44 8 34 Q3 24 6 16 Q9 10 8 4"
        stroke="#3d6b08" strokeWidth="20" strokeLinecap="round" fill="none"/>
      <path d="M24 50 Q14 44 8 34 Q3 24 6 16 Q9 10 8 4"
        stroke="#4f8a0c" strokeWidth="13" strokeLinecap="round" fill="none"/>
      <path d="M24 50 Q14 44 8 34 Q3 24 7 17 Q9 11 8 5"
        stroke="#66aa14" strokeWidth="6" strokeLinecap="round" fill="none"/>

      {/* ── DORSAL SPIKES — triangles along spine, yellow-tipped ── */}
      {[[28,38],[38,30],[48,25],[58,21],[68,18],[78,17],[88,17],[98,18],[108,19],[118,21],[128,23],[138,27],[148,31],[156,36]].map(([x,y],i)=>(
        <g key={i}>
          <polygon points={`${x-4},${y+10} ${x},${y-4} ${x+4},${y+10}`} fill="#e8b800" stroke="#a07800" strokeWidth="0.8"/>
        </g>
      ))}

      {/* ── BODY ── */}
      <ellipse cx="94" cy="54" rx="72" ry="22" fill="#3d6b08" stroke="#2a4a06" strokeWidth="2.5"/>
      <ellipse cx="94" cy="51" rx="69" ry="18" fill="#4f8a0c"/>
      <ellipse cx="90" cy="49" rx="62" ry="14" fill="#66aa14"/>
      {/* Belly lighter */}
      <ellipse cx="94" cy="60" rx="55" ry="10" fill="#88cc28" opacity="0.35"/>
      {/* Scale dots */}
      {[[42,44],[56,40],[70,38],[84,37],[98,38],[112,40],[126,43],[138,46],[150,50],
        [44,54],[58,51],[72,50],[86,49],[100,50],[114,52],[128,55],[140,58],
        [50,63],[64,61],[78,60],[92,59],[106,60],[118,62],[130,65]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="4.5" ry="3.5" fill="#3d6b08" opacity="0.55"/>
      ))}
      {/* Side stripe */}
      <path d="M24 45 Q70 38 100 42 Q130 46 162 52" stroke="#88cc28" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
      <path d="M24 58 Q70 64 100 62 Q130 60 162 56" stroke="#88cc28" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35"/>

      {/* ── HEAD ── */}
      <path d="M158 34 Q174 26 192 28 Q204 30 208 40 Q210 50 202 56 Q192 62 175 60 Q162 58 156 50 Z"
        fill="#3d6b08" stroke="#2a4a06" strokeWidth="2.5"/>
      <path d="M160 36 Q174 29 190 31 Q200 33 204 42 Q204 51 196 55 Q186 59 172 57 Q162 54 160 47 Z"
        fill="#66aa14"/>
      {/* Head scales */}
      {[[168,36],[180,32],[190,36],[176,44],[188,44],[196,40]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="4.5" ry="3.5" fill="#3d6b08" opacity="0.55"/>
      ))}

      {/* ── EYE ── */}
      <circle cx="198" cy="36" r="9" fill="#fff" stroke="#2a4a06" strokeWidth="2"/>
      <circle cx="198" cy="36" r="7" fill="#3a5a0a"/>
      <circle cx="198" cy="36" r="5" fill="#111"/>
      <ellipse cx="198" cy="36" rx="1.5" ry="4" fill="#050505"/>
      <circle cx="200" cy="33.5" r="2.2" fill="#fff"/>
      <circle cx="196.5" cy="38.5" r="1" fill="#fff" opacity="0.4"/>

      {/* Nostril */}
      <circle cx="206" cy="42" r="2" fill="#2d5006"/>
      {/* Mouth line */}
      <path d="M204 48 Q196 56 188 55" stroke="#2a4a06" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* ── TONGUE — forked ── */}
      <path d="M204 47 L212 40 M212 40 L216 35 M212 40 L216 45"
        stroke="#f87171" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* ── LEGS ── */}
      {/* Front left */}
      <path d="M56 70 L44 82 M44 82 L34 85 M44 82 L38 88 M44 82 L46 88"
        stroke="#3d6b08" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M56 70 L44 82" stroke="#66aa14" strokeWidth="4" strokeLinecap="round"/>
      {/* Front right */}
      <path d="M88 72 L92 84 M92 84 L84 88 M92 84 L98 88 M92 84 L94 88"
        stroke="#3d6b08" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M88 72 L92 84" stroke="#66aa14" strokeWidth="4" strokeLinecap="round"/>
      {/* Back left */}
      <path d="M56 36 L44 24 M44 24 L34 21 M44 24 L38 18 M44 24 L46 18"
        stroke="#3d6b08" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M56 36 L44 24" stroke="#66aa14" strokeWidth="4" strokeLinecap="round"/>
      {/* Back right */}
      <path d="M88 34 L90 20 M90 20 L82 16 M90 20 L96 16 M90 20 L92 14"
        stroke="#3d6b08" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M88 34 L90 20" stroke="#66aa14" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  )
}

function GeckoAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Gecko running in */}
      <div style={{ position: 'absolute', bottom: '14%', animation: 'geckoRun 2.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards' }}>
        <div style={{ animation: 'geckoWiggle 0.17s ease-in-out infinite alternate' }}>
          <GeckoSVG />
        </div>
      </div>
      {/* Golf ball */}
      <div style={{ position: 'absolute', bottom: '16%', left: '78%', animation: 'geckoBall 2.7s ease-in forwards' }}>
        <svg width="30" height="30" viewBox="0 0 30 30">
          <defs><radialGradient id="bg2" cx="35%" cy="32%"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#e8e8e8"/></radialGradient></defs>
          <circle cx="15" cy="15" r="14" fill="url(#bg2)" stroke="#ccc" strokeWidth="0.5"/>
          {[[10,9],[17,8],[8,16],[19,17],[14,13],[11,20]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="1.8" fill="#d0d0d0"/>
          ))}
        </svg>
      </div>
      {/* Speech bubble — top of screen, never overlaps content */}
      <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%)',
        animation: 'churBubble 0.5s 2.1s cubic-bezier(0.34,1.56,0.64,1) both', whiteSpace: 'nowrap', zIndex: 2 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '12px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)', border: '2.5px solid #4ade80', position: 'relative' }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#16a34a', letterSpacing: '-0.01em' }}>Chur bro! 🤙</span>
          <div style={{ position: 'absolute', bottom: -14, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent',
            borderTop: '14px solid #fff' }}/>
        </div>
      </div>
      {/* Impact */}
      <div style={{ position: 'absolute', bottom: '22%', left: '72%', animation: 'burst 0.5s 2.2s ease-out both' }}>
        <svg width="70" height="70" viewBox="0 0 70 70">
          {[0,45,90,135,180,225,270,315].map((a,i)=>(
            <line key={i} x1="35" y1="35" x2={35+Math.cos(a*Math.PI/180)*30} y2={35+Math.sin(a*Math.PI/180)*30}
              stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"/>
          ))}
          <circle cx="35" cy="35" r="7" fill="#4ade80"/>
        </svg>
      </div>
      <style>{`
        @keyframes geckoRun{0%{left:-190px}72%{left:64%}75%{left:62%}100%{left:64%}}
        @keyframes geckoWiggle{0%{transform:rotate(-7deg) translateY(0)}100%{transform:rotate(7deg) translateY(-5px)}}
        @keyframes geckoBall{0%,73%{transform:translate(0,0);opacity:1}78%{transform:translate(-10px,2px)}100%{transform:translate(-150px,-290px) rotate(660deg);opacity:0}}
        @keyframes churBubble{from{opacity:0;transform:translateX(-50%) scale(0.3)}to{opacity:1;transform:translateX(-50%) scale(1)}}
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  8. LIGHTNING STRIKE — multi-phase
// ─────────────────────────────────────────────────────────────
function LightningAnimation({ active }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (!active) return
    const t1 = setTimeout(() => setPhase(1), 120)
    const t2 = setTimeout(() => setPhase(2), 650)
    const t3 = setTimeout(() => setPhase(3), 1200)
    const t4 = setTimeout(() => setPhase(4), 2000)
    return () => { [t1,t2,t3,t4].forEach(clearTimeout) }
  }, [active])
  if (!active) return null
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Phase 0: white flash */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)',
        opacity: phase === 0 ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: 'none' }}/>
      {/* Phase 1+: bolt */}
      {phase >= 1 && (
        <div style={{ position: 'absolute', left: '46%', top: 0, transform: 'translateX(-50%)',
          animation: 'boltDrop 0.35s ease-out both' }}>
          <svg width="160" height="520" viewBox="0 0 160 520" fill="none">
            <defs>
              <filter id="lglow"><feGaussianBlur stdDeviation="10" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="lglow2"><feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {/* Outer glow */}
            <polyline points="80,0 52,190 88,190 24,520" stroke="rgba(255,214,0,0.25)" strokeWidth="28" strokeLinejoin="round" filter="url(#lglow)"/>
            {/* White core bolt */}
            <polyline points="80,0 52,190 88,190 24,520" stroke="rgba(255,255,255,0.9)" strokeWidth="8" strokeLinejoin="round" filter="url(#lglow2)"/>
            {/* Gold core */}
            <polyline points="80,0 52,190 88,190 24,520" stroke="#FFD600" strokeWidth="4" strokeLinejoin="round"/>
            {/* Branches */}
            <polyline points="68,110 90,155 108,140" stroke="#ffe066" strokeWidth="2.5" strokeLinejoin="round" opacity="0.8"/>
            <polyline points="58,230 32,265 18,255" stroke="#FFD600" strokeWidth="2" strokeLinejoin="round" opacity="0.6"/>
            <polyline points="70,340 95,380 110,365" stroke="#ffe066" strokeWidth="2" strokeLinejoin="round" opacity="0.6"/>
            <polyline points="45,420 20,450 10,440" stroke="#FFD600" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
          </svg>
        </div>
      )}
      {/* Phase 2: ground sparks */}
      {phase >= 2 && (
        <div style={{ position: 'absolute', bottom: '16%', left: '34%',
          animation: 'sparksIn 0.4s ease-out both' }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <defs><filter id="sg"><feGaussianBlur stdDeviation="5"/></filter></defs>
            <circle cx="70" cy="70" r="40" fill="rgba(255,214,0,0.12)" filter="url(#sg)"/>
            {[0,24,48,72,96,120,144,168,192,216,240,264,288,312,336].map((a,i)=>(
              <line key={i} x1="70" y1="70"
                x2={70+Math.cos(a*Math.PI/180)*(i%3===0?58:42)}
                y2={70+Math.sin(a*Math.PI/180)*(i%3===0?58:42)}
                stroke="#FFD600" strokeWidth={i%3===0?3.5:1.8} strokeLinecap="round" opacity={i%2===0?1:0.6}/>
            ))}
            <circle cx="70" cy="70" r="13" fill="#FFD600"/>
            <circle cx="70" cy="70" r="7" fill="#fff"/>
            <circle cx="70" cy="70" r="3" fill="#FFD600"/>
          </svg>
        </div>
      )}
      {/* Phase 2: glowing ball */}
      {phase >= 2 && (
        <div style={{ position: 'absolute', bottom: '18%', left: '41%',
          animation: 'ballGlow 0.5s ease-out both' }}>
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="24" fill="rgba(255,214,0,0.2)"/>
            <circle cx="26" cy="26" r="18" fill="rgba(255,214,0,0.35)"/>
            <circle cx="26" cy="26" r="13" fill="#fff" stroke="#FFD600" strokeWidth="3"/>
            <circle cx="26" cy="26" r="13" fill="none" stroke="#FFD600" strokeWidth="10" opacity="0.25"/>
            {[[19,17],[26,15],[20,23]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="2" fill="#e0e0e0"/>
            ))}
          </svg>
        </div>
      )}
      {/* Phase 3: ZAP text */}
      {phase >= 3 && (
        <div style={{ position: 'absolute', bottom: '38%', left: '52%',
          animation: 'zapIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <span style={{ fontSize: 54, fontWeight: 900, color: '#FFD600', fontStyle: 'italic',
            textShadow: '0 0 30px rgba(255,214,0,0.9), 0 0 60px rgba(255,214,0,0.4), 3px 3px 0 rgba(0,0,0,0.5)',
            letterSpacing: '-0.02em' }}>ZAP!</span>
        </div>
      )}
      {/* Phase 4: electricity arc across */}
      {phase >= 4 && (
        <div style={{ position: 'absolute', bottom: '25%', left: '10%', right: '10%',
          animation: 'arcIn 0.3s ease-out both' }}>
          <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="none">
            <path d="M0 20 Q50 5 100 20 Q150 35 200 20 Q250 5 300 20 Q350 35 400 20"
              stroke="#FFD600" strokeWidth="2" fill="none" opacity="0.5"/>
            <path d="M0 20 Q50 5 100 20 Q150 35 200 20 Q250 5 300 20 Q350 35 400 20"
              stroke="#fff" strokeWidth="1" fill="none" opacity="0.3"/>
          </svg>
        </div>
      )}
      <style>{`
        @keyframes boltDrop{0%{opacity:0;transform:translateX(-50%) scaleY(0);transform-origin:top}70%{opacity:1;transform:translateX(-50%) scaleY(1)}100%{opacity:0.9}}
        @keyframes sparksIn{0%{opacity:0;transform:scale(0)}60%{opacity:1;transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}
        @keyframes ballGlow{0%{opacity:0;transform:scale(0.4)}100%{opacity:1;transform:scale(1)}}
        @keyframes zapIn{0%{opacity:0;transform:scale(0.3) rotate(-18deg)}100%{opacity:1;transform:none}}
        @keyframes arcIn{from{opacity:0}to{opacity:1}}
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  9. 8-BIT PIXEL
// ─────────────────────────────────────────────────────────────
function PixelAnimation({ active }) {
  if (!active) return null
  const pixels = Array.from({ length: 60 }, (_, i) => ({
    x: Math.random() * 100, delay: Math.random() * 1.0,
    size: [8, 10, 14, 18, 22][Math.floor(Math.random() * 5)],
    color: ['#FFD600','#FF3B3B','#4ade80','#60a5fa','#f472b6','#fff','#a78bfa','#FF6B35','#ffe066'][Math.floor(Math.random()*9)],
    dx: (Math.random() - 0.5) * 100, dy: -(25 + Math.random() * 75),
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Pixel confetti */}
      {pixels.map((p, i) => (
        <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: '28%',
          width: p.size, height: p.size, background: p.color,
          animation: `pixFall 1.5s ${p.delay}s ease-in both`,
          '--dx': `${p.dx}px`, '--dy': `${p.dy}px` }} />
      ))}
      {/* 8-bit golfer dancing */}
      <div style={{ position: 'absolute', bottom: '14%', left: '50%', transform: 'translateX(-50%)',
        animation: 'danceBob 0.32s ease-in-out infinite alternate' }}>
        <svg width="60" height="76" viewBox="0 0 60 76" style={{ imageRendering: 'pixelated' }}>
          {/* Head */}
          <rect x="20" y="0" width="20" height="20" fill="#FFD600"/>
          {/* Eyes */}
          <rect x="23" y="5" width="5" height="5" fill="#000"/>
          <rect x="32" y="5" width="5" height="5" fill="#000"/>
          {/* Smile */}
          <rect x="23" y="12" width="14" height="3" fill="#cc7700"/>
          {/* Cap */}
          <rect x="18" y="0" width="24" height="4" fill="#cc9900"/>
          <rect x="14" y="0" width="6" height="4" fill="#cc9900"/>
          {/* Body */}
          <rect x="14" y="20" width="32" height="26" fill="#FFD600"/>
          {/* Shirt details */}
          <rect x="14" y="24" width="32" height="3" fill="#cc9900" opacity="0.4"/>
          {/* Left arm up */}
          <rect x="2" y="18" width="12" height="16" fill="#FFD600"/>
          <rect x="2" y="14" width="10" height="6" fill="#FFD600"/>
          {/* Right arm — holding club up */}
          <rect x="46" y="16" width="12" height="16" fill="#FFD600"/>
          <rect x="48" y="4" width="5" height="40" fill="#cc9900"/>
          <rect x="44" y="40" width="16" height="5" fill="#777"/>
          {/* Legs */}
          <rect x="14" y="46" width="13" height="26" fill="#FFD600"/>
          <rect x="33" y="46" width="13" height="26" fill="#FFD600"/>
          {/* Shoes */}
          <rect x="10" y="68" width="18" height="8" fill="#cc9900"/>
          <rect x="32" y="68" width="18" height="8" fill="#cc9900"/>
        </svg>
      </div>
      {/* Pixel text — HOLE IN ONE! */}
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        whiteSpace: 'nowrap', animation: 'pixText 0.4s 0.12s ease-out both' }}>
        <span style={{ fontFamily: '"Courier New",Courier,monospace', fontSize: 32, fontWeight: 900,
          color: '#FFD600', letterSpacing: '0.04em',
          textShadow: '4px 4px 0 #cc7700, 7px 7px 0 rgba(0,0,0,0.6)' }}>
          HOLE IN ONE!
        </span>
      </div>
      {/* Achievement unlocked */}
      <div style={{ position: 'absolute', top: '21%', left: '50%', transform: 'translateX(-50%)',
        whiteSpace: 'nowrap', animation: 'pixText 0.4s 0.42s ease-out both' }}>
        <span style={{ fontFamily: '"Courier New",Courier,monospace', fontSize: 15, fontWeight: 700,
          color: '#4ade80', letterSpacing: '0.12em',
          textShadow: '2px 2px 0 #166534' }}>
          ★ ACHIEVEMENT UNLOCKED ★
        </span>
      </div>
      {/* Score display */}
      <div style={{ position: 'absolute', top: '29%', left: '50%', transform: 'translateX(-50%)',
        animation: 'pixText 0.4s 0.7s ease-out both', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,0,0,0.6)', border: '2px solid #FFD600',
          padding: '6px 18px', borderRadius: 0 }}>
          <span style={{ fontFamily: '"Courier New",monospace', fontSize: 14, color: '#fff', letterSpacing: '0.08em' }}>SCORE:</span>
          <span style={{ fontFamily: '"Courier New",monospace', fontSize: 18, fontWeight: 900, color: '#FFD600' }}>1</span>
          <span style={{ fontFamily: '"Courier New",monospace', fontSize: 14, color: '#fff', letterSpacing: '0.08em' }}>STROKE</span>
        </div>
      </div>
      <style>{`
        @keyframes pixFall{0%{opacity:1;transform:translate(0,0) rotate(0deg)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(180deg)}}
        @keyframes danceBob{0%{transform:translateX(-50%) translateY(0) scaleX(1)}100%{transform:translateX(-50%) translateY(-16px) scaleX(-1)}}
        @keyframes pixText{0%{opacity:0;transform:translateX(-50%) scale(0.3)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  HOLE IN ONE POPUP — wraps all animations
// ─────────────────────────────────────────────────────────────
export function HoleInOnePopup({ players, onDismiss, enabledAnimations }) {
  const [visible, setVisible]       = useState(true)
  const [canDismiss, setCanDismiss] = useState(false)

  const ALL = ['confetti','fireworks','kiwi','golfswing','galaxy','streamer','gecko','lightning','pixel']
  const pool = (enabledAnimations && enabledAnimations.length > 0)
    ? ALL.filter(a => enabledAnimations.includes(a))
    : ALL
  const animType = useRef(pool[Math.floor(Math.random() * pool.length)]).current

  useEffect(() => {
    const minT  = setTimeout(() => setCanDismiss(true), 3000)
    const autoT = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 400) }, 9000)
    return () => { clearTimeout(minT); clearTimeout(autoT) }
  }, [])

  function handleTap() {
    if (!canDismiss) return
    setVisible(false); setTimeout(onDismiss, 300)
  }

  const multi = players.length > 1
  const headline =
    animType === 'kiwi'      ? (multi ? 'Sweet as! Hole in Ones!' : 'Sweet as! Hole in One!')
    : animType === 'gecko'   ? (multi ? 'Chur! Hole in Ones!' : 'Chur bro! Hole in One!')
    : animType === 'lightning'? (multi ? '⚡ HOLE IN ONES! ⚡' : '⚡ HOLE IN ONE! ⚡')
    : animType === 'golfswing'? (multi ? 'FORE! Hole in Ones!' : 'FORE! Hole in One!')
    : (multi ? 'HOLE IN ONES!' : 'HOLE IN ONE!')

  return (
    <>
      {/* Canvas overlays — behind popup */}
      {animType === 'confetti'  && <ConfettiCanvas active={visible} />}
      {animType === 'fireworks' && <FireworksCanvas active={visible} />}
      {animType === 'galaxy'    && <GalaxyCanvas active={visible} />}
      {animType === 'streamer'  && <StreamerCanvas active={visible} />}

      {/* Main popup */}
      <div onClick={handleTap} style={{
        position: 'fixed', inset: 0, zIndex: 9997,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: canDismiss ? 'pointer' : 'default',
        backdropFilter: 'blur(14px)',
        opacity: visible ? 1 : 0, transition: 'opacity 0.4s',
        padding: '24px 20px',
      }}>
        {/* In-popup animations */}
        {animType === 'kiwi'      && <KiwiAnimation active={visible} />}
        {animType === 'golfswing' && <GolfSwingAnimation active={visible} />}
        {animType === 'gecko'     && <GeckoAnimation active={visible} />}
        {animType === 'lightning' && <LightningAnimation active={visible} />}
        {animType === 'pixel'     && <PixelAnimation active={visible} />}

        {/* Content — sits above animation layers */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {/* Trophy */}
          <svg width="76" height="76" viewBox="0 0 76 76" fill="none"
            style={{ marginBottom: 16, animation: 'bounceIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both',
              filter: 'drop-shadow(0 0 24px rgba(255,214,0,0.5))' }}>
            <circle cx="38" cy="38" r="38" fill="rgba(255,214,0,0.10)"/>
            <path d="M20 19h36v24c0 9.94-8.06 18-18 18s-18-8.06-18-18V19z" fill="#FFD600" opacity="0.92"/>
            <path d="M14 19h10v14c0 2.76-2.24 5-5 5h-5V19z" fill="#FFD600" opacity="0.55"/>
            <path d="M52 19h10v18h-4c-3.31 0-6-2.69-6-6V19z" fill="#FFD600" opacity="0.55"/>
            <path d="M32 37l3 3 6-6" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="31" y="61" width="14" height="6" rx="2" fill="#FFD600" opacity="0.7"/>
            <rect x="24" y="67" width="28" height="5" rx="2.5" fill="#FFD600" opacity="0.45"/>
          </svg>

          {/* Headline */}
          <div style={{
            fontSize: Math.min(44, 10 + 34 / Math.max(1, headline.length / 12)),
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
            textAlign: 'center', marginBottom: 12, padding: '0 8px',
            animation: 'bounceIn 0.55s 0.08s cubic-bezier(0.34,1.56,0.64,1) both',
            background: 'linear-gradient(135deg,#FFD600 0%,#fff 50%,#FFD600 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {headline}
          </div>

          {/* Player names */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 22,
            animation: 'bounceIn 0.55s 0.16s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            {players.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: p.color,
                  boxShadow: `0 0 12px ${p.color}80` }} />
                <span style={{ fontSize: 26, fontWeight: 800, color: p.color,
                  letterSpacing: '-0.02em', textShadow: `0 0 20px ${p.color}60` }}>{p.name}!</span>
              </div>
            ))}
          </div>

          {/* Stars */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28,
            animation: 'bounceIn 0.5s 0.28s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            {[0, 1, 2].map(i => (
              <svg key={i} width="30" height="30" viewBox="0 0 24 24" fill="#FFD600"
                style={{ animation: `bounceIn 0.4s ${0.32 + i * 0.09}s cubic-bezier(0.34,1.56,0.64,1) both`,
                  filter: 'drop-shadow(0 0 8px rgba(255,214,0,0.6))' }}>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            ))}
          </div>

          {/* Tap to skip — appears after 3s */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: canDismiss ? 1 : 0, transition: 'opacity 0.8s',
            animation: canDismiss ? 'tapPulse 2s ease-in-out infinite' : 'none',
          }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👆</div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em' }}>
              Tap anywhere to continue
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounceIn{0%{opacity:0;transform:scale(0.3)}60%{transform:scale(1.12)}80%{transform:scale(0.96)}100%{opacity:1;transform:scale(1)}}
        @keyframes tapPulse{0%,100%{opacity:0.5}50%{opacity:0.9}}
        @keyframes burst{0%{opacity:0;transform:scale(0)}55%{opacity:1;transform:scale(1.3)}100%{opacity:0;transform:scale(1.1)}}
      `}</style>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
//  FLOAT NUMBER
// ─────────────────────────────────────────────────────────────
export function FloatNumber({ value, x, y, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 680); return () => clearTimeout(t) }, [])
  return (
    <div style={{ position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 600,
      fontSize: 26, fontWeight: 900, color: value > 0 ? 'var(--red)' : 'var(--yellow)',
      animation: 'floatUp 0.68s ease-out forwards', transform: 'translate(-50%,-50%)' }}>
      {value > 0 ? `+${value}` : value}
      <style>{`@keyframes floatUp{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-90px) scale(1.5)}}`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  END CONFETTI
// ─────────────────────────────────────────────────────────────
export function EndConfetti() {
  const [active, setActive] = useState(true)
  useEffect(() => { const t = setTimeout(() => setActive(false), 5500); return () => clearTimeout(t) }, [])
  return <ConfettiCanvas active={active} />
}

// ─────────────────────────────────────────────────────────────
//  HOLE TRANSITION
// ─────────────────────────────────────────────────────────────
export function HoleTransition({ holeNumber, title, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t) }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#060606',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
      animation: 'holeFade 2.8s ease forwards' }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,214,0,0.45)' }}>
        Next up
      </div>
      <div style={{ fontSize: 96, fontWeight: 900, color: '#FFD600', letterSpacing: '-0.05em', lineHeight: 1,
        animation: 'numPop 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both',
        textShadow: '0 0 60px rgba(255,214,0,0.3)' }}>
        {String(holeNumber).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
        textAlign: 'center', maxWidth: 300, lineHeight: 1.3, padding: '0 24px',
        animation: 'numPop 0.5s 0.22s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        {title}
      </div>
      <style>{`
        @keyframes holeFade{0%{opacity:0}8%{opacity:1}78%{opacity:1}100%{opacity:0}}
        @keyframes numPop{0%{opacity:0;transform:scale(0.65) translateY(12px)}100%{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  ANIMATION NAMES EXPORT (for admin)
// ─────────────────────────────────────────────────────────────
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
