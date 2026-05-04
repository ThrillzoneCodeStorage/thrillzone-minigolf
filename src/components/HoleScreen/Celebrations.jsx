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
    <svg width="200" height="130" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="85" cy="124" rx="60" ry="7" fill="rgba(0,0,0,0.3)" />

      {/* ── KIWI FRUIT (replaces golf ball) ── */}
      {/* Fruit half bottom */}
      <ellipse cx="22" cy="105" rx="20" ry="12" fill="#8B6914" stroke="#5a4010" strokeWidth="2"/>
      {/* Fruit half top — cut face showing green */}
      <ellipse cx="22" cy="88" rx="20" ry="20" fill="#5a8a0a" stroke="#3a5a06" strokeWidth="2.5"/>
      <ellipse cx="22" cy="88" rx="16" ry="16" fill="#6aaa10"/>
      {/* White centre */}
      <ellipse cx="22" cy="88" rx="5" ry="5" fill="#e8e8e0"/>
      {/* Seeds radiating out */}
      {[0,40,80,120,160,200,240,280,320].map((a,i)=>(
        <ellipse key={i} cx={22+Math.cos(a*Math.PI/180)*9} cy={88+Math.sin(a*Math.PI/180)*9}
          rx="2.5" ry="1.2" fill="#1a2a06"
          transform={`rotate(${a} ${22+Math.cos(a*Math.PI/180)*9} ${88+Math.sin(a*Math.PI/180)*9})`}/>
      ))}
      {/* Fuzzy skin texture on bottom half */}
      <ellipse cx="22" cy="105" rx="20" ry="12" fill="none" stroke="#7a5a08" strokeWidth="1" opacity="0.5"/>

      {/* ── KIWI BIRD ── */}
      {/* Body — large round fluffy */}
      <ellipse cx="100" cy="82" rx="54" ry="46" fill="#3D2408" stroke="#2a1804" strokeWidth="2.5"/>
      <ellipse cx="100" cy="78" rx="50" ry="42" fill="#5C3910"/>
      <ellipse cx="96" cy="74" rx="46" ry="38" fill="#7a5220"/>
      {/* Fluffy feather strokes — radiating from center outward */}
      {[
        [70,52],[82,46],[96,44],[110,47],[122,54],[132,64],
        [64,66],[76,60],[92,57],[108,58],[120,64],[130,74],
        [66,80],[78,76],[94,73],[110,74],[122,80],[130,90],
        [70,94],[84,92],[98,90],[112,91],[124,96],
        [76,106],[92,104],[106,106],[118,108],
      ].map(([x,y],i)=>{
        const angle = Math.atan2(y-82, x-100)
        const len = 10 + Math.random()*4
        return <line key={i} x1={x} y1={y}
          x2={x+Math.cos(angle)*len} y2={y+Math.sin(angle)*len}
          stroke="#2a1804" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      })}
      {/* Extra fine feather texture */}
      {[
        [88,50],[104,47],[118,52],[128,60],[58,70],[128,82],
        [60,88],[130,98],[72,112],[108,114],
      ].map(([x,y],i)=>{
        const angle = Math.atan2(y-82, x-100)
        return <line key={i} x1={x} y1={y}
          x2={x+Math.cos(angle)*7} y2={y+Math.sin(angle)*7}
          stroke="#2a1804" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      })}

      {/* Head — separate round fluffy ball */}
      <ellipse cx="154" cy="52" rx="26" ry="24" fill="#3D2408" stroke="#2a1804" strokeWidth="2.5"/>
      <ellipse cx="154" cy="50" rx="23" ry="21" fill="#5C3910"/>
      {/* Head feather strokes */}
      {[[140,36],[152,32],[164,36],[170,46],[168,58],[156,64],[144,60],[136,50]].map(([x,y],i)=>{
        const angle = Math.atan2(y-52, x-154)
        return <line key={i} x1={x} y1={y}
          x2={x+Math.cos(angle)*8} y2={y+Math.sin(angle)*8}
          stroke="#2a1804" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      })}

      {/* ── BIG CARTOON EYES ── */}
      {/* Eye white */}
      <circle cx="162" cy="44" r="11" fill="#fff" stroke="#2a1804" strokeWidth="2"/>
      {/* Iris */}
      <circle cx="163" cy="44" r="7" fill="#3D2408"/>
      {/* Pupil */}
      <circle cx="163" cy="44" r="5" fill="#000"/>
      {/* Catchlight */}
      <circle cx="165" cy="41" r="2.5" fill="#fff"/>
      <circle cx="161" cy="46" r="1" fill="#fff" opacity="0.5"/>

      {/* Beak — long, curved, pointy */}
      <path d="M174 52 Q186 48 193 42 Q198 37 198 32" stroke="#C8A040" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M174 54 Q186 51 193 46" stroke="#a07820" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M182 46 Q188 43 193 40" stroke="#e8c870" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      {/* Nostril */}
      <circle cx="180" cy="49" r="2" fill="#a07820"/>

      {/* Legs */}
      <path d="M84 122 L76 130 M76 130 L66 130 M76 130 L72 132 M76 130 L80 132" stroke="#C8A040" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M106 124 L112 132 M112 132 L102 132 M112 132 L116 130 M112 132 L118 134" stroke="#C8A040" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function KiwiAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Kiwi running in */}
      <div style={{ position: 'absolute', bottom: '14%', animation: 'kiwiRun 2.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards' }}>
        <div style={{ animation: 'kiwiWaddle 0.18s ease-in-out infinite alternate' }}>
          <KiwiSVG />
        </div>
      </div>
      {/* Kiwi fruit (gets hit!) */}
      <div style={{ position: 'absolute', bottom: '16%', left: '74%', animation: 'kiwiball 2.6s ease-in forwards' }}>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <ellipse cx="22" cy="22" rx="20" ry="20" fill="#6aaa10" stroke="#3a5a06" strokeWidth="2.5"/>
          <ellipse cx="22" cy="22" rx="16" ry="16" fill="#7abf14"/>
          <ellipse cx="22" cy="22" rx="5" ry="5" fill="#e8e8e0"/>
          {[0,40,80,120,160,200,240,280,320].map((a,i)=>(
            <ellipse key={i} cx={22+Math.cos(a*Math.PI/180)*9} cy={22+Math.sin(a*Math.PI/180)*9}
              rx="2.5" ry="1.2" fill="#1a2a06"
              transform={`rotate(${a} ${22+Math.cos(a*Math.PI/180)*9} ${22+Math.sin(a*Math.PI/180)*9})`}/>
          ))}
        </svg>
      </div>
      {/* NZ flag mini */}
      <div style={{ position: 'absolute', top: '8%', right: '8%', animation: 'flagIn 0.5s 2.1s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <svg width="54" height="90" viewBox="0 0 54 90">
          <rect x="24" y="4" width="4" height="78" rx="2" fill="#FFD600"/>
          <polygon points="28,4 54,18 28,32" fill="#FFD600"/>
          <ellipse cx="26" cy="84" rx="16" ry="5" fill="rgba(255,214,0,0.18)"/>
        </svg>
      </div>
      {/* Impact burst */}
      <div style={{ position: 'absolute', bottom: '22%', left: '70%', animation: 'burst 0.5s 2.15s ease-out both' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          {[0,36,72,108,144,180,216,252,288,324].map((a,i)=>(
            <line key={i} x1="40" y1="40" x2={40+Math.cos(a*Math.PI/180)*35} y2={40+Math.sin(a*Math.PI/180)*35} stroke="#FFD600" strokeWidth={i%2===0?3:1.5} strokeLinecap="round"/>
          ))}
          <circle cx="40" cy="40" r="7" fill="#FFD600"/>
          <circle cx="40" cy="40" r="3" fill="#fff"/>
        </svg>
      </div>
      <style>{`
        @keyframes kiwiRun{0%{left:-180px}70%{left:58%}73%{left:56%}100%{left:58%}}
        @keyframes kiwiWaddle{0%{transform:rotate(-6deg) translateY(0)}100%{transform:rotate(6deg) translateY(-5px)}}
        @keyframes kiwiball{0%,71%{transform:translate(0,0) rotate(0deg);opacity:1}76%{transform:translate(-10px,2px)}100%{transform:translate(-160px,-320px) rotate(800deg);opacity:0}}
        @keyframes flagIn{0%{opacity:0;transform:scale(0.3) rotate(-25deg)}100%{opacity:1;transform:none}}
        @keyframes burst{0%{opacity:0;transform:scale(0)}55%{opacity:1;transform:scale(1.3)}100%{opacity:0;transform:scale(1)}}
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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Ball trail */}
      {Array.from({length:14},(_,i)=>(
        <div key={i} style={{ position:'absolute', left:`${14+i*5.5}%`, top:`${60-i*3.8}%`,
          width:i===13?22:4+i, height:i===13?22:4+i, borderRadius:'50%',
          background:i===13?'#fff':'#FFD600', opacity:i===13?1:0.08+i*0.07,
          animation:`trailPop 0.4s ${0.55+i*0.04}s ease-out both` }}/>
      ))}
      {/* Golfer — proper follow-through like reference image */}
      <div style={{ position:'absolute', left:'3%', top:'18%', animation:'golferSwing 2s ease-in-out forwards' }}>
        <svg width="130" height="190" viewBox="0 0 130 190" fill="none">
          {/* Shadow */}
          <ellipse cx="72" cy="184" rx="38" ry="7" fill="rgba(0,0,0,0.25)"/>

          {/* ── CLUB — trailing behind in follow-through ── */}
          <path d="M26 22 L42 58" stroke="#888" strokeWidth="3" strokeLinecap="round"/>
          <path d="M24 20 L44 60" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          {/* Club head */}
          <path d="M22 18 Q18 12 24 10 Q32 8 36 16 Q38 22 32 24 Z" fill="#777" stroke="#555" strokeWidth="1"/>

          {/* ── LEFT ARM (raised high — follow through) ── */}
          <path d="M54 68 L38 44 L28 24" stroke="#d4a876" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M54 68 L38 44 L28 24" stroke="#e8c090" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          {/* Left glove hand */}
          <ellipse cx="25" cy="20" rx="7" ry="6" fill="#fff" stroke="#ddd" strokeWidth="1"/>

          {/* ── RIGHT ARM ── */}
          <path d="M70 72 L60 52 L42 30" stroke="#d4a876" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M70 72 L60 52 L42 30" stroke="#e8c090" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          <ellipse cx="40" cy="27" rx="7" ry="6" fill="#fff" stroke="#ddd" strokeWidth="1"/>

          {/* ── TORSO — green polo shirt, twisted in follow-through ── */}
          {/* Shirt body */}
          <path d="M44 74 Q52 65 68 68 Q80 70 86 82 Q90 92 82 106 Q72 116 58 114 Q44 112 40 98 Q36 86 44 74 Z"
            fill="#7ab520" stroke="#5a8a10" strokeWidth="2"/>
          {/* Shirt shading */}
          <path d="M50 74 Q58 68 70 72 Q78 75 82 84" stroke="#5a8a10" strokeWidth="2" fill="none" opacity="0.5"/>
          <path d="M46 90 Q50 84 58 84 Q68 84 74 90" stroke="#5a8a10" strokeWidth="1.5" fill="none" opacity="0.4"/>
          {/* Collar */}
          <path d="M54 74 Q62 68 68 72" stroke="#5a8a10" strokeWidth="3" strokeLinecap="round" fill="none"/>
          {/* Belt/waist line */}
          <path d="M42 108 Q60 112 80 106" stroke="#4a4a2a" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <ellipse cx="62" cy="109" rx="4" ry="3" fill="#888" stroke="#666" strokeWidth="1"/>

          {/* ── PANTS — khaki/beige ── */}
          {/* Right leg — planted/forward */}
          <path d="M70 112 Q76 130 80 152 Q82 166 78 176 Q72 182 66 180"
            stroke="#c8b898" strokeWidth="18" strokeLinecap="round" fill="none"/>
          <path d="M70 112 Q76 130 80 152 Q82 166 78 176"
            stroke="#d8c8a8" strokeWidth="14" strokeLinecap="round" fill="none"/>
          {/* Right shoe */}
          <path d="M66 180 Q58 184 52 182 Q46 180 48 176 Q54 174 62 176 Z"
            fill="#f8f0e8" stroke="#c8b898" strokeWidth="1.5"/>

          {/* Left leg — back leg, raised on toe */}
          <path d="M52 112 Q46 132 44 152 Q42 166 48 176 Q54 182 60 180"
            stroke="#c8b898" strokeWidth="18" strokeLinecap="round" fill="none"/>
          <path d="M52 112 Q46 132 44 152 Q42 166 48 176"
            stroke="#d8c8a8" strokeWidth="14" strokeLinecap="round" fill="none"/>
          {/* Left shoe */}
          <path d="M60 180 Q68 184 74 182 Q78 180 76 175 Q70 173 64 175 Z"
            fill="#f8f0e8" stroke="#c8b898" strokeWidth="1.5"/>

          {/* ── HEAD ── */}
          {/* Neck */}
          <rect x="56" y="48" width="16" height="20" rx="8" fill="#e8c090"/>
          {/* Face */}
          <ellipse cx="62" cy="38" rx="22" ry="22" fill="#e8c090" stroke="#d4a876" strokeWidth="1.5"/>
          {/* Ear */}
          <ellipse cx="40" cy="40" rx="5" ry="7" fill="#e8c090" stroke="#d4a876" strokeWidth="1"/>
          {/* Eye */}
          <ellipse cx="54" cy="36" rx="3" ry="3.5" fill="#2a1a0a"/>
          <circle cx="55" cy="35" r="1.2" fill="#fff"/>
          {/* Eyebrow */}
          <path d="M50 31 Q54 29 58 31" stroke="#8a5a30" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          {/* Nose */}
          <path d="M60 40 Q63 42 66 40" stroke="#d4a876" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          {/* Mouth — smile */}
          <path d="M54 48 Q62 53 70 48" stroke="#c8904a" strokeWidth="2" strokeLinecap="round" fill="none"/>

          {/* ── CAP — white with brim ── */}
          {/* Cap body */}
          <path d="M40 30 Q42 10 62 8 Q82 6 84 26 Q80 22 62 20 Q44 22 40 30 Z"
            fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5"/>
          {/* Cap brim */}
          <path d="M38 30 Q40 38 50 38 Q60 38 70 36 Q80 34 84 28"
            fill="#f0f0f0" stroke="#d0d0d0" strokeWidth="1.5"/>
          {/* Cap button top */}
          <circle cx="64" cy="10" r="3" fill="#d0d0d0"/>
          {/* Cap strap/brim shadow */}
          <path d="M40 32 Q55 35 70 32" stroke="#c0c0c0" strokeWidth="1" fill="none" opacity="0.6"/>
        </svg>
      </div>
      {/* FORE! */}
      <div style={{ position:'absolute', left:'22%', top:'18%', animation:'foreIn 0.6s 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <span style={{ fontSize:58, fontWeight:900, color:'#FFD600', fontStyle:'italic', letterSpacing:'-0.03em',
          textShadow:'0 0 40px rgba(255,214,0,0.7), 3px 3px 0 rgba(0,0,0,0.5)' }}>FORE!</span>
      </div>
      <style>{`
        @keyframes trailPop{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
        @keyframes golferSwing{0%{transform:rotate(-50deg) translate(-40px,15px);opacity:0}18%{opacity:1}58%{transform:rotate(0deg)}100%{transform:rotate(20deg) translate(10px,0)}}
        @keyframes foreIn{from{opacity:0;transform:scale(0.2) rotate(-20deg)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  7. GECKO — detailed SVG
// ─────────────────────────────────────────────────────────────
function GeckoSVG() {
  return (
    <svg width="220" height="100" viewBox="0 0 220 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="110" cy="96" rx="85" ry="6" fill="rgba(0,0,0,0.28)"/>

      {/* ── TAIL — long, tapering, curved upward at end ── */}
      <path d="M28 58 Q16 52 10 42 Q4 32 6 22 Q8 14 12 10 Q14 6 13 2"
        stroke="#4a7a0a" strokeWidth="18" strokeLinecap="round" fill="none"/>
      <path d="M28 58 Q16 52 10 42 Q4 32 6 22 Q8 14 12 10"
        stroke="#5a9a10" strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M28 58 Q16 52 10 42 Q4 32 7 23 Q9 16 12 12"
        stroke="#6aaa14" strokeWidth="6" strokeLinecap="round" fill="none"/>

      {/* ── DORSAL SPIKES along spine ── */}
      {[[32,44],[42,38],[52,34],[62,30],[72,27],[82,26],[92,26],[102,27],[112,28],[122,30],[132,33],[142,36],[150,40]].map(([x,y],i)=>(
        <polygon key={i} points={`${x},${y} ${x-4},${y+10} ${x+4},${y+10}`}
          fill="#e8b800" stroke="#b88a00" strokeWidth="0.8"
          transform={`rotate(-10 ${x} ${y+10})`}/>
      ))}

      {/* ── BODY — iguana shape, wider in middle ── */}
      <ellipse cx="95" cy="58" rx="68" ry="24" fill="#4a7a0a" stroke="#2a4a06" strokeWidth="2.5"/>
      <ellipse cx="95" cy="55" rx="65" ry="20" fill="#5a9a10"/>
      <ellipse cx="90" cy="52" rx="58" ry="16" fill="#6aaa14"/>
      {/* Belly — lighter */}
      <ellipse cx="92" cy="62" rx="52" ry="12" fill="#8acc28" opacity="0.4"/>
      {/* Scale texture */}
      {[[48,48],[60,44],[72,42],[84,42],[96,42],[108,44],[120,46],[132,48],[144,52],
        [50,58],[62,56],[74,54],[86,54],[98,54],[110,56],[122,58],[136,60],
        [56,68],[68,66],[80,65],[92,65],[104,66],[118,66]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="4" ry="3" fill="#4a7a0a" opacity="0.5"/>
      ))}

      {/* ── HEAD ── */}
      <path d="M155 38 Q175 30 192 32 Q205 34 210 42 Q212 50 204 56 Q196 62 178 60 Q162 58 155 50 Z"
        fill="#4a7a0a" stroke="#2a4a06" strokeWidth="2.5"/>
      <path d="M157 40 Q175 33 190 35 Q202 37 206 44 Q206 51 198 55 Q188 59 172 57 Q159 54 157 47 Z"
        fill="#6aaa14"/>
      {/* Head scales */}
      {[[168,38],[180,35],[192,38],[176,46],[188,46],[196,43]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="4" ry="3" fill="#4a7a0a" opacity="0.55"/>
      ))}
      {/* Dewlap/chin */}
      <path d="M165 55 Q175 65 185 58" stroke="#8acc28" strokeWidth="3" fill="none" opacity="0.6"/>

      {/* ── EYE ── */}
      <circle cx="198" cy="38" r="9" fill="#fff" stroke="#2a4a06" strokeWidth="2"/>
      <circle cx="198" cy="38" r="6.5" fill="#3a5a0a"/>
      <circle cx="198" cy="38" r="4.5" fill="#1a1a1a"/>
      <circle cx="198" cy="38" r="3" fill="#0a0a0a"/>
      {/* Slit pupil */}
      <ellipse cx="198" cy="38" rx="1.2" ry="3" fill="#050505"/>
      {/* Catchlight */}
      <circle cx="200" cy="35.5" r="2" fill="#fff"/>
      <circle cx="196" cy="40" r="1" fill="#fff" opacity="0.4"/>

      {/* Nostril */}
      <circle cx="206" cy="42" r="2" fill="#3a6008"/>
      {/* Mouth line */}
      <path d="M204 48 Q200 54 192 54" stroke="#2a4a06" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* ── TONGUE — forked ── */}
      <path d="M210 46 L218 38 M218 38 L222 33 M218 38 L222 43"
        stroke="#f87171" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* ── LEGS ── */}
      {/* Front left leg */}
      <path d="M60 74 L48 86 M48 86 L38 90 M48 86 L42 92 M48 86 L50 94"
        stroke="#4a7a0a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M60 74 L48 86" stroke="#6aaa14" strokeWidth="4" strokeLinecap="round"/>
      {/* Front right leg */}
      <path d="M90 76 L94 90 M94 90 L86 94 M94 90 L100 94 M94 90 L96 98"
        stroke="#4a7a0a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M90 76 L94 90" stroke="#6aaa14" strokeWidth="4" strokeLinecap="round"/>
      {/* Back left leg */}
      <path d="M60 42 L48 30 M48 30 L38 26 M48 30 L42 22 M48 30 L50 20"
        stroke="#4a7a0a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M60 42 L48 30" stroke="#6aaa14" strokeWidth="4" strokeLinecap="round"/>
      {/* Back right leg */}
      <path d="M90 40 L92 26 M92 26 L84 20 M92 26 L98 20 M92 26 L94 16"
        stroke="#4a7a0a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M90 40 L92 26" stroke="#6aaa14" strokeWidth="4" strokeLinecap="round"/>
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
