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
//  3. STAR WARS CRAWL
// ─────────────────────────────────────────────────────────────
function StarWarsCanvas({ active }) {
  const canvasRef = useRef(null); const rafRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const { ctx, W, H } = setupCanvas(canvas)
    // Stars
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8, twinkle: Math.random() * Math.PI * 2,
      speed: 0.03 + Math.random() * 0.05,
    }))
    let t = 0
    function draw() {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
      // Twinkling stars
      for (const s of stars) {
        s.twinkle += s.speed
        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle))
        ctx.globalAlpha = alpha; ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
      t++
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])
  if (!active) return null
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998 }}/>
}

function StarWarsCrawl({ active }) {
  if (!active) return null
  // Use a fixed overlay for the crawl so it's never clipped by the popup
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999, pointerEvents:'none',
      overflow:'hidden', perspective:'500px', perspectiveOrigin:'50% 40%',
      background:'transparent',
    }}>
      {/* "A long time ago…" fades in first */}
      <div style={{
        position:'absolute', top:'12%', left:0, right:0, textAlign:'center',
        animation:'swIntro 1.8s ease forwards',
      }}>
        <span style={{ color:'#4fc3f7', fontSize:16, fontFamily:'Georgia,serif',
          fontStyle:'italic', letterSpacing:'0.08em' }}>
          A long time ago on a mini golf course far, far away….
        </span>
      </div>

      {/* The crawl — 3D perspective, starts below screen, rolls up */}
      <div style={{
        position:'absolute', bottom:0, left:'8%', right:'8%',
        transformOrigin:'50% 100%',
        animation:'swCrawl 7s 1.2s linear both',
      }}>
        {/* EPISODE title */}
        <div style={{ textAlign:'center', marginBottom:28, paddingBottom:16,
          borderBottom:'1px solid rgba(255,214,0,0.2)' }}>
          <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.5em', color:'#FFD600',
            textTransform:'uppercase', marginBottom:10, fontFamily:'Georgia,serif', opacity:0.8 }}>
            Episode I
          </div>
          <div style={{ fontSize:42, fontWeight:900, color:'#FFD600', letterSpacing:'0.04em',
            lineHeight:1.05, fontFamily:'Georgia,serif',
            textShadow:'0 0 40px rgba(255,214,0,0.7), 0 0 80px rgba(255,214,0,0.3)' }}>
            HOLE IN ONE
          </div>
        </div>
        {/* Body text */}
        {[
          'A single stroke of genius',
          'has echoed across the galaxy.',
          '',
          'In a move that defied the',
          'laws of mini golf physics,',
          'the ball rolled with perfect',
          'precision into the hole with',
          'just ONE stroke.',
          '',
          'The crowd went wild.',
          'A new legend was born.',
          '',
          '✦  ✦  ✦',
          '',
          'May the golf be with you.',
        ].map((line, i) => (
          <p key={i} style={{
            color: line === '✦  ✦  ✦' ? 'rgba(255,214,0,0.6)' : '#FFD600',
            fontSize: line === '✦  ✦  ✦' ? 20 : 17,
            textAlign:'center', lineHeight:1.85, margin:0,
            letterSpacing:'0.04em', fontFamily:'Georgia,serif',
            opacity: line ? 1 : 0,
          }}>
            {line || ' '}
          </p>
        ))}
        {/* Extra space at bottom so text fully scrolls off */}
        <div style={{ height:300 }}/>
      </div>

      {/* Fade edges top/bottom */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'22%',
        background:'linear-gradient(to bottom, #000 0%, transparent 100%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'15%',
        background:'linear-gradient(to top, #000 0%, transparent 100%)', pointerEvents:'none' }}/>

      <style>{`
        @keyframes swIntro{0%{opacity:1}60%{opacity:1}100%{opacity:0}}
        @keyframes swCrawl{
          0%  {transform:rotateX(22deg) translateY(0%);opacity:1}
          100%{transform:rotateX(22deg) translateY(-82%);opacity:0.5}
        }
      `}</style>
    </div>
  )
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
// ─────────────────────────────────────────────────────────────
//  6. VOLCANO ERUPTION
// ─────────────────────────────────────────────────────────────
function VolcanoAnimation({ active }) {
  const [phase, setPhase] = useState(0)
  // 0=rumble, 1=eruption, 2=ball in air, 3=landed
  useEffect(() => {
    if (!active) return
    const t1 = setTimeout(() => setPhase(1), 600)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => setPhase(3), 2800)
    return () => [t1,t2,t3].forEach(clearTimeout)
  }, [active])
  if (!active) return null

  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>

      {/* Lava glow — grows with eruption */}
      {phase >= 1 && (
        <div style={{
          position:'absolute', bottom:0, left:'15%', right:'40%', height:'45%',
          background:'radial-gradient(ellipse at 50% 100%, rgba(255,80,0,0.35) 0%, transparent 70%)',
          animation:'lavaGlow 0.4s ease-out both',
        }}/>
      )}

      {/* ── VOLCANO SVG ── */}
      <div style={{
        position:'absolute', bottom:0, left:'-2%',
        animation: phase===0 ? 'rumble 0.15s ease-in-out infinite' : 'none',
      }}>
        <svg width="320" height="280" viewBox="0 0 320 280" fill="none">
          {/* Volcano body — dark layered mountain */}
          <path d="M0 280 L80 120 L160 60 L240 120 L320 280 Z" fill="#3a2810"/>
          <path d="M20 280 L90 130 L160 72 L230 130 L300 280 Z" fill="#4a3418"/>
          <path d="M40 280 L100 140 L160 84 L220 140 L280 280 Z" fill="#5a3e20"/>
          {/* Rock layers */}
          <path d="M0 280 Q80 260 160 270 Q240 260 320 280" fill="#2a1c0a" opacity="0.4"/>
          <path d="M30 280 Q100 255 160 262 Q220 255 290 280" fill="#6a4a28" opacity="0.3"/>
          {/* Crater rim */}
          <ellipse cx="160" cy="68" rx="42" ry="16" fill="#2a1c0a" stroke="#1a0e04" strokeWidth="2"/>
          <ellipse cx="160" cy="66" rx="38" ry="12" fill="#3a2810"/>
          {/* Crater inside */}
          <ellipse cx="160" cy="64" rx="30" ry="9" fill="#8a0000"/>
          <ellipse cx="160" cy="62" rx="22" ry="7" fill="#cc2200"/>
          <ellipse cx="160" cy="61" rx="14" ry="5" fill="#ff4400"/>
          <ellipse cx="160" cy="60" rx="8" ry="3" fill="#ff8800" opacity="0.9"/>

          {/* Snow cap — classic volcano look */}
          <path d="M140 68 Q160 48 180 68 Q170 58 160 56 Q150 58 140 68 Z" fill="#f0f0f0" opacity="0.8"/>

          {/* Rock texture */}
          {[[70,180],[90,160],[110,200],[140,175],[180,170],[200,195],[220,165],[240,185]].map(([x,y],i)=>(
            <ellipse key={i} cx={x} cy={y} rx="12" ry="7" fill="#2a1c0a" opacity="0.3" transform={`rotate(${i*15} ${x} ${y})`}/>
          ))}
        </svg>
      </div>

      {/* ── ERUPTION — lava blobs shoot up ── */}
      {phase >= 1 && (
        <>
          {/* Smoke puffs */}
          {[[-30,0],[0,-20],[30,0],[-15,-35],[15,-30]].map(([dx,dy],i)=>(
            <div key={i} style={{
              position:'absolute', bottom:'52%', left:`calc(30% + ${dx}px)`,
              width:50+i*12, height:50+i*12, borderRadius:'50%',
              background:`rgba(${80+i*10},${80+i*10},${80+i*10},0.5)`,
              filter:'blur(8px)',
              animation:`smokePuff 2s ${i*0.12}s ease-out both`,
              '--dy': `${-120+dy}px`,
            }}/>
          ))}
          {/* Lava blobs */}
          {[0,1,2,3,4,5].map(i=>(
            <div key={i} style={{
              position:'absolute', bottom:'50%', left:`calc(30% + ${(i-2.5)*22}px)`,
              width:14+i%3*8, height:14+i%3*8, borderRadius:'50%',
              background:['#ff4400','#ff8800','#ffaa00','#ff6600','#ff3300','#ffd700'][i],
              animation:`lavaBlob${i%3} 1.4s ${i*0.08}s cubic-bezier(0.25,0.46,0.45,0.94) both`,
              '--vx': `${(i-2.5)*18}px`,
            }}/>
          ))}
        </>
      )}

      {/* ── GOLF BALL launching from crater ── */}
      {phase >= 1 && (
        <div style={{
          position:'absolute', bottom:'50%', left:'30%',
          animation:'ballLaunchV 1.8s cubic-bezier(0.2,0.8,0.4,1) forwards',
        }}>
          <svg width="34" height="34" viewBox="0 0 34 34"
            style={{ animation:'ballSpinV 1.8s linear forwards', filter:'drop-shadow(0 0 10px rgba(255,150,0,0.8))' }}>
            <circle cx="17" cy="17" r="16" fill="#fff" stroke="#eee" strokeWidth="0.5"/>
            {[[11,10],[19,9],[9,17],[22,19],[16,16]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="2" fill="#d0d0d0"/>
            ))}
          </svg>
        </div>
      )}

      {/* ── HOLE on right ── */}
      <div style={{ position:'absolute', bottom:'12%', right:'10%' }}>
        <div style={{ width:52, height:20, borderRadius:'50%', background:'#0a0a0a',
          border:'2px solid #333', position:'relative' }}/>
        <svg width="30" height="66" viewBox="0 0 30 66" style={{ position:'absolute', top:-56, left:16 }}>
          <rect x="12" y="0" width="3" height="62" rx="1.5" fill="#888"/>
          <polygon points="15,2 30,12 15,22" fill="#e74c3c"/>
        </svg>
      </div>

      {/* ── IT'S GONNA BLOW! text ── */}
      {phase === 0 && (
        <div style={{ position:'absolute', top:'8%', left:'50%', transform:'translateX(-50%)',
          animation:'rumbleText 0.12s ease-in-out infinite alternate', whiteSpace:'nowrap' }}>
          <span style={{ fontSize:28, fontWeight:900, color:'#ff6600',
            textShadow:'0 0 20px rgba(255,100,0,0.8)', letterSpacing:'0.04em' }}>
            IT'S GONNA BLOW! 🌋
          </span>
        </div>
      )}

      {/* ── BOOM! after eruption ── */}
      {phase >= 2 && (
        <div style={{ position:'absolute', top:'6%', left:'50%', transform:'translateX(-50%)',
          animation:'boomIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both', whiteSpace:'nowrap' }}>
          <span style={{ fontSize:48, fontWeight:900, color:'#ff4400', fontStyle:'italic',
            textShadow:'0 0 30px rgba(255,80,0,0.9), 3px 3px 0 rgba(0,0,0,0.6)',
            letterSpacing:'-0.02em' }}>BOOM! 💥</span>
        </div>
      )}

      {/* Landing spark */}
      {phase >= 3 && (
        <div style={{ position:'absolute', bottom:'18%', right:'8%',
          animation:'burst 0.5s ease-out both' }}>
          <svg width="70" height="70" viewBox="0 0 70 70">
            {[0,45,90,135,180,225,270,315].map((a,i)=>(
              <line key={i} x1="35" y1="35"
                x2={35+Math.cos(a*Math.PI/180)*30} y2={35+Math.sin(a*Math.PI/180)*30}
                stroke="#ff8800" strokeWidth="2.5" strokeLinecap="round"/>
            ))}
            <circle cx="35" cy="35" r="7" fill="#ff8800"/>
            <circle cx="35" cy="35" r="3" fill="#fff"/>
          </svg>
        </div>
      )}

      <style>{`
        @keyframes rumble{0%{transform:translate(-1px,-1px)}50%{transform:translate(2px,1px)}100%{transform:translate(-1px,0)}}
        @keyframes rumbleText{0%{transform:translateX(-50%) translate(-2px,0)}100%{transform:translateX(-50%) translate(2px,-1px)}}
        @keyframes lavaGlow{from{opacity:0}to{opacity:1}}
        @keyframes smokePuff{0%{opacity:0;transform:translateY(0) scale(0.3)}40%{opacity:0.7;transform:translateY(var(--dy)) scale(1)}100%{opacity:0;transform:translateY(calc(var(--dy) - 60px)) scale(1.5)}}
        @keyframes lavaBlob0{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--vx),-180px) scale(0.4)}}
        @keyframes lavaBlob1{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--vx),-220px) scale(0.3)}}
        @keyframes lavaBlob2{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--vx),-150px) scale(0.5)}}
        @keyframes ballLaunchV{0%{transform:translate(0,0)}50%{transform:translate(160px,-380px)}100%{transform:translate(320px,-80px)}}
        @keyframes ballSpinV{0%{transform:rotate(0)}100%{transform:rotate(1080deg)}}
        @keyframes boomIn{from{opacity:0;transform:translateX(-50%) scale(0.2)}to{opacity:1;transform:translateX(-50%) scale(1)}}
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  6b. PINBALL MACHINE
// ─────────────────────────────────────────────────────────────
function PinballAnimation({ active }) {
  const [phase, setPhase] = useState(0)
  // 0=launch, 1=bouncing, 2=letters lighting, 3=jackpot
  useEffect(() => {
    if (!active) return
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1200)
    const t3 = setTimeout(() => setPhase(3), 2600)
    return () => [t1,t2,t3].forEach(clearTimeout)
  }, [active])
  if (!active) return null

  const letters = ['H','O','L','E',' ','I','N',' ','O','N','E','!']
  const litCount = phase >= 2 ? Math.min(letters.length, Math.floor((Date.now() % 1400) / 116) + 1) : 0

  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>

      {/* Pinball machine frame */}
      <div style={{ position:'absolute', inset:'4% 4% 4% 4%',
        border:'4px solid #FFD600', borderRadius:16,
        background:'rgba(0,0,20,0.7)',
        boxShadow:'0 0 30px rgba(255,214,0,0.3), inset 0 0 60px rgba(0,0,40,0.8)' }}/>

      {/* Machine title */}
      <div style={{ position:'absolute', top:'7%', left:'50%', transform:'translateX(-50%)',
        whiteSpace:'nowrap' }}>
        <span style={{ fontSize:15, fontWeight:900, letterSpacing:'0.3em', color:'#FFD600',
          textShadow:'0 0 15px rgba(255,214,0,0.8)', textTransform:'uppercase' }}>
          ★ MINI GOLF MANIA ★
        </span>
      </div>

      {/* HOLE IN ONE letters — light up one by one */}
      <div style={{ position:'absolute', top:'16%', left:'50%', transform:'translateX(-50%)',
        display:'flex', gap:4, whiteSpace:'nowrap' }}>
        {letters.map((l, i) => (
          <div key={i} style={{
            width: l===' ' ? 10 : 28, height:36, borderRadius:6,
            background: (phase>=2 && i < litCount)
              ? (i<4?'#ff2222':i>4&&i<7?'#22aaff':'#FFD600')
              : 'rgba(255,255,255,0.06)',
            border: l===' ' ? 'none' : `2px solid ${(phase>=2&&i<litCount)?'rgba(255,255,255,0.5)':'rgba(255,255,255,0.1)'}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:15, fontWeight:900, color:'#fff',
            textShadow: (phase>=2&&i<litCount) ? '0 0 12px #fff' : 'none',
            boxShadow: (phase>=2&&i<litCount) ? '0 0 16px currentColor, inset 0 0 8px rgba(255,255,255,0.3)' : 'none',
            transition:'all 0.12s',
          }}>
            {l!==' '?l:''}
          </div>
        ))}
      </div>

      {/* Bumpers */}
      {[[28,38],[50,32],[72,38],[38,55],[62,52],[85,44]].map(([x,y],i)=>(
        <div key={i} style={{
          position:'absolute', left:`${x}%`, top:`${y}%`,
          width:44, height:44, borderRadius:'50%',
          background: phase>=1 && i<phase+1 ? '#ff2244' : '#1a1a3a',
          border:'3px solid',
          borderColor: phase>=1&&i<phase+1 ? '#ff6688' : '#333366',
          boxShadow: phase>=1&&i<phase+1 ? '0 0 20px #ff2244, inset 0 0 10px rgba(255,100,120,0.4)' : 'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:18, transition:'all 0.1s',
        }}>
          <span style={{ fontSize:16 }}>★</span>
        </div>
      ))}

      {/* Flippers */}
      <div style={{ position:'absolute', bottom:'12%', left:'14%', width:'28%', height:12,
        background:'linear-gradient(90deg, #FFD600, #cc9900)',
        borderRadius:'0 6px 6px 0', transformOrigin:'0% 50%',
        transform: phase>=1 ? 'rotate(-30deg)' : 'rotate(30deg)',
        transition:'transform 0.15s', boxShadow:'0 0 12px rgba(255,214,0,0.6)' }}/>
      <div style={{ position:'absolute', bottom:'12%', right:'14%', width:'28%', height:12,
        background:'linear-gradient(90deg, #cc9900, #FFD600)',
        borderRadius:'6px 0 0 6px', transformOrigin:'100% 50%',
        transform: phase>=1 ? 'rotate(30deg)' : 'rotate(-30deg)',
        transition:'transform 0.15s', boxShadow:'0 0 12px rgba(255,214,0,0.6)' }}/>

      {/* Launch lane on right */}
      <div style={{ position:'absolute', right:'6%', top:'20%', bottom:'14%', width:28,
        background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:8 }}/>

      {/* Ball */}
      <div style={{
        position:'absolute',
        animation: phase===0 ? 'pinLaunch 0.4s ease-out forwards'
          : phase===1 ? 'pinBounce 0.8s ease-in-out infinite alternate'
          : phase===2 ? 'pinScatter 1.4s ease-in-out forwards'
          : 'pinDrain 0.8s ease-in forwards',
        right:'7.5%', bottom:'18%',
      }}>
        <div style={{ width:22, height:22, borderRadius:'50%',
          background:'radial-gradient(circle at 35% 32%, #fff, #e0e0e0)',
          boxShadow:'0 0 10px rgba(255,255,255,0.8)', border:'1px solid #ccc' }}/>
      </div>

      {/* Score display */}
      <div style={{ position:'absolute', bottom:'7%', left:'50%', transform:'translateX(-50%)',
        display:'flex', gap:16, alignItems:'center' }}>
        {['1','0','0','0','0','0'].map((d,i)=>(
          <div key={i} style={{
            fontSize:22, fontWeight:900, fontFamily:'monospace',
            color: phase>=3 ? '#FFD600' : '#ff4444',
            textShadow: phase>=3 ? '0 0 16px rgba(255,214,0,0.8)' : '0 0 8px rgba(255,80,80,0.6)',
            transition:'color 0.3s, text-shadow 0.3s',
          }}>{d}</div>
        ))}
      </div>

      {/* JACKPOT! */}
      {phase >= 3 && (
        <div style={{ position:'absolute', top:'60%', left:'50%', transform:'translate(-50%,-50%)',
          animation:'jackpotPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          whiteSpace:'nowrap' }}>
          <span style={{ fontSize:44, fontWeight:900, color:'#FFD600',
            textShadow:'0 0 30px rgba(255,214,0,1), 3px 3px 0 rgba(0,0,0,0.7)',
            letterSpacing:'-0.02em' }}>JACKPOT! 🎰</span>
        </div>
      )}

      {/* Flashing lights at corners */}
      {[['8%','8%'],['88%','8%'],['8%','88%'],['88%','88%']].map(([l,t],i)=>(
        <div key={i} style={{
          position:'absolute', left:l, top:t, width:18, height:18, borderRadius:'50%',
          background:['#ff2244','#22aaff','#FFD600','#22ff88'][i],
          boxShadow:`0 0 14px ${['#ff2244','#22aaff','#FFD600','#22ff88'][i]}`,
          animation:`cornerBlink 0.4s ${i*0.1}s ease-in-out infinite alternate`,
        }}/>
      ))}

      <style>{`
        @keyframes pinLaunch{from{bottom:18%}to{bottom:70%}}
        @keyframes pinBounce{0%{transform:translate(0,0)}25%{transform:translate(-180px,-40px)}50%{transform:translate(-80px,-120px)}75%{transform:translate(-260px,-80px)}100%{transform:translate(-140px,-160px)}}
        @keyframes pinScatter{0%{transform:translate(-140px,-160px)}50%{transform:translate(-220px,-60px)}100%{transform:translate(-50px,80px)}}
        @keyframes pinDrain{from{transform:translate(-50px,80px);opacity:1}to{transform:translate(-50px,200px);opacity:0}}
        @keyframes jackpotPop{from{opacity:0;transform:translate(-50%,-50%) scale(0.2) rotate(-10deg)}to{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0deg)}}
        @keyframes cornerBlink{0%{opacity:0.3;transform:scale(0.8)}100%{opacity:1;transform:scale(1.2)}}
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  7. GECKO / KEA
// // ─────────────────────────────────────────────────────────────
//  7. GECKO — detailed SVG
// ─────────────────────────────────────────────────────────────
function KeaSVG() {
  // Kea: NZ alpine parrot — olive green, hooked orange beak, red under-wings, cheeky
  return (
    <svg width="180" height="120" viewBox="0 0 180 120" fill="none">
      <ellipse cx="90" cy="114" rx="62" ry="7" fill="rgba(0,0,0,0.28)"/>

      {/* ── TAIL feathers fanning out ── */}
      {[-30,-15,0,15,30].map((a,i)=>(
        <path key={i}
          d={`M70 78 L${70+Math.sin(a*Math.PI/180)*40} ${78+Math.cos(a*Math.PI/180)*44}`}
          stroke={i===2?'#4a6b08':'#3a5a06'} strokeWidth={i===2?12:8} strokeLinecap="round"/>
      ))}
      {/* Tail tip blue-purple shimmer */}
      {[-30,-15,0,15,30].map((a,i)=>(
        <path key={i}
          d={`M${70+Math.sin(a*Math.PI/180)*28} ${78+Math.cos(a*Math.PI/180)*28} L${70+Math.sin(a*Math.PI/180)*40} ${78+Math.cos(a*Math.PI/180)*44}`}
          stroke="#6a4fb8" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
      ))}

      {/* ── WINGS — red-orange underneath, olive on top ── */}
      {/* Left wing */}
      <path d="M62 60 Q40 50 22 58 Q10 64 14 76 Q20 84 36 80 Q52 76 62 68 Z"
        fill="#5a8208" stroke="#3a5808" strokeWidth="2"/>
      <path d="M62 62 Q44 55 28 62 Q18 68 22 76 Q28 80 42 76 Q56 72 62 66 Z"
        fill="#e85c18" opacity="0.85"/>
      {/* Wing feather detail */}
      {[[30,64],[38,62],[46,62],[54,64]].map(([x,y],i)=>(
        <line key={i} x1={x} y1={y} x2={x+6} y2={y+12} stroke="#c04010" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      ))}
      {/* Right wing hint */}
      <path d="M100 62 Q118 55 130 60 Q138 68 132 76 Q124 80 112 76 Q104 72 100 66 Z"
        fill="#5a8208" stroke="#3a5808" strokeWidth="1.5" opacity="0.7"/>

      {/* ── BODY — stocky parrot ── */}
      <ellipse cx="84" cy="72" rx="34" ry="30" fill="#4a6b08" stroke="#2e4606" strokeWidth="2.5"/>
      <ellipse cx="84" cy="68" rx="30" ry="26" fill="#5a8a0c"/>
      <ellipse cx="80" cy="64" rx="26" ry="22" fill="#6aaa14"/>
      {/* Feather scale texture */}
      {[[66,56],[76,52],[88,52],[98,56],[62,66],[74,63],[86,62],[96,64],[106,68],
        [64,76],[76,74],[88,73],[98,75],[108,78]].map(([x,y],i)=>(
        <path key={i} d={`M${x} ${y} Q${x+5} ${y-4} ${x+10} ${y}`}
          stroke="#3a5a08" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.6"/>
      ))}
      {/* Red-orange breast/belly hint */}
      <ellipse cx="82" cy="82" rx="18" ry="12" fill="#e85c18" opacity="0.25"/>

      {/* ── HEAD — round parrot head ── */}
      <circle cx="124" cy="46" r="28" fill="#4a6b08" stroke="#2e4606" strokeWidth="2.5"/>
      <circle cx="124" cy="44" r="25" fill="#5a8a0c"/>
      <circle cx="122" cy="42" r="21" fill="#6aaa14"/>
      {/* Head feather detail */}
      {[[108,30],[120,26],[132,28],[140,36],[140,50],[132,58],[120,60],[108,55],[104,44]].map(([x,y],i)=>{
        const a = Math.atan2(y-46, x-124)
        return <line key={i} x1={x} y1={y} x2={x+Math.cos(a)*8} y2={y+Math.sin(a)*8}
          stroke="#3a5a08" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      })}
      {/* Orange eye-ring (kea characteristic) */}
      <circle cx="136" cy="36" r="10" fill="#e8780a" opacity="0.8"/>
      <circle cx="136" cy="36" r="9" fill="#1a1a1a"/>
      <circle cx="136" cy="36" r="7" fill="#0a0a0a"/>
      <circle cx="138" cy="33.5" r="3" fill="#fff"/>
      <circle cx="135" cy="38" r="1.2" fill="#fff" opacity="0.4"/>

      {/* ── HOOKED ORANGE BEAK — kea's signature ── */}
      {/* Upper mandible */}
      <path d="M148 42 Q162 38 170 34 Q175 30 172 26 Q168 24 164 28 Q158 34 148 40"
        fill="#e8780a" stroke="#c05808" strokeWidth="1.5"/>
      {/* Hook at tip */}
      <path d="M172 26 Q178 22 176 18 Q174 16 170 20 Q168 24 170 28"
        fill="#e8780a" stroke="#c05808" strokeWidth="1"/>
      {/* Lower mandible */}
      <path d="M148 44 Q160 42 165 40 Q168 42 166 46 Q162 50 152 48 Q148 46 148 44 Z"
        fill="#d06808" stroke="#c05808" strokeWidth="1"/>
      {/* Beak line */}
      <path d="M148 43 Q162 40 172 36" stroke="#c05808" strokeWidth="1" fill="none" opacity="0.6"/>
      {/* Nostril */}
      <ellipse cx="154" cy="40" rx="2.5" ry="1.5" fill="#c05808" transform="rotate(-20 154 40)"/>

      {/* ── FEET — parrot claws (2 forward, 2 back = zygodactyl) ── */}
      {/* Left foot */}
      <path d="M74 96 L68 108" stroke="#8B6008" strokeWidth="5" strokeLinecap="round"/>
      <path d="M68 108 L58 114 M68 108 L64 116 M68 108 L74 116 M68 108 L76 110" stroke="#8B6008" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Right foot */}
      <path d="M94 98 L100 110" stroke="#8B6008" strokeWidth="5" strokeLinecap="round"/>
      <path d="M100 110 L90 116 M100 110 L98 118 M100 110 L108 115 M100 110 L108 108" stroke="#8B6008" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  )
}

function GeckoAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>

      {/* Hop 1 — enters from left */}
      <div style={{ position:'absolute', bottom:'12%', left:'8%',
        animation:'keaHop1 0.5s 0.1s ease-in-out forwards' }}>
        <div style={{ animation:'keaWiggle 0.25s ease-in-out infinite alternate' }}>
          <KeaSVG/>
        </div>
      </div>

      {/* Hop 2 — middle */}
      <div style={{ position:'absolute', bottom:'12%', left:'30%',
        opacity:0, animation:'keaHop2 0.5s 0.8s ease-in-out forwards' }}>
        <div style={{ animation:'keaWiggle 0.25s ease-in-out infinite alternate' }}>
          <KeaSVG/>
        </div>
      </div>

      {/* Hop 3 — reaches ball */}
      <div style={{ position:'absolute', bottom:'12%', left:'54%',
        opacity:0, animation:'keaHop3 0.5s 1.5s ease-in-out forwards' }}>
        <div style={{ animation:'keaWiggle 0.25s ease-in-out infinite alternate' }}>
          <KeaSVG/>
        </div>
      </div>

      {/* Arc shadows — show the hop paths */}
      <svg style={{ position:'absolute', bottom:'14%', left:0, right:0, width:'100%', height:80, overflow:'visible' }}
        viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M60 70 Q100 10 140 70" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" strokeDasharray="4 4"/>
        <path d="M140 70 Q200 10 240 70" stroke="rgba(255,255,255,0.08)" strokeWidth="2" fill="none" strokeDasharray="4 4"/>
      </svg>

      {/* Golf ball */}
      <div style={{ position:'absolute', bottom:'17%', right:'14%' }}>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <defs><radialGradient id="bg3" cx="35%" cy="32%"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#e8e8e8"/></radialGradient></defs>
          <circle cx="22" cy="22" r="21" fill="url(#bg3)" stroke="#ccc" strokeWidth="0.5"/>
          {[[14,13],[23,11],[11,20],[27,23],[20,20],[14,28]].map(([x,y],i)=>(
            <circle key={i} cx={x} cy={y} r="2.2" fill="#d0d0d0"/>
          ))}
        </svg>
      </div>

      {/* Speech bubble */}
      <div style={{ position:'absolute', top:'6%', left:'50%', transform:'translateX(-50%)',
        animation:'churBubble 0.5s 1.8s cubic-bezier(0.34,1.56,0.64,1) both', whiteSpace:'nowrap', zIndex:2 }}>
        <div style={{ background:'#fff', borderRadius:16, padding:'10px 22px',
          boxShadow:'0 8px 32px rgba(0,0,0,0.6)', border:'2.5px solid #e8780a', position:'relative' }}>
          <span style={{ fontSize:22, fontWeight:900, color:'#c05808' }}>Ka-kaa! 🦜 Hole in One!</span>
          <div style={{ position:'absolute', bottom:-14, left:'50%', transform:'translateX(-50%)',
            width:0, height:0, borderLeft:'12px solid transparent', borderRight:'12px solid transparent',
            borderTop:'14px solid #fff' }}/>
        </div>
      </div>

      {/* Impact burst */}
      <div style={{ position:'absolute', bottom:'20%', right:'12%', animation:'burst 0.6s 2.0s ease-out both' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
            <line key={i} x1="40" y1="40"
              x2={40+Math.cos(a*Math.PI/180)*(i%3===0?38:26)}
              y2={40+Math.sin(a*Math.PI/180)*(i%3===0?38:26)}
              stroke="#e8780a" strokeWidth={i%3===0?3:1.5} strokeLinecap="round"/>
          ))}
          <circle cx="40" cy="40" r="8" fill="#e8780a"/>
          <circle cx="40" cy="40" r="4" fill="#fff"/>
        </svg>
      </div>

      <style>{`
        @keyframes keaWiggle{0%{transform:rotate(-10deg) scaleX(1)}100%{transform:rotate(10deg) scaleX(1)}}
        @keyframes keaHop1{
          0%  {opacity:1;transform:translateY(0)}
          30% {opacity:1;transform:translateY(-50px)}
          60% {opacity:1;transform:translateY(0)}
          80% {opacity:0;transform:translateY(0)}
          100%{opacity:0}
        }
        @keyframes keaHop2{
          0%  {opacity:1;transform:translateY(0)}
          30% {opacity:1;transform:translateY(-55px)}
          60% {opacity:1;transform:translateY(0)}
          80% {opacity:0}
          100%{opacity:0}
        }
        @keyframes keaHop3{
          0%  {opacity:1;transform:translateY(0)}
          40% {opacity:1;transform:translateY(-45px)}
          70% {opacity:1;transform:translateY(0)}
          100%{opacity:1}
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  8. LIGHTNING → BALL INTO HOLE
// ─────────────────────────────────────────────────────────────
function LightningAnimation({ active }) {
  const [phase, setPhase] = useState(0)
  // 0: flash, 1: bolt+ball, 2: ball rolling, 3: hole, 4: celebrate
  useEffect(() => {
    if (!active) return
    const t1 = setTimeout(() => setPhase(1), 100)
    const t2 = setTimeout(() => setPhase(2), 700)
    const t3 = setTimeout(() => setPhase(3), 2000)
    const t4 = setTimeout(() => setPhase(4), 2800)
    return () => [t1,t2,t3,t4].forEach(clearTimeout)
  }, [active])
  if (!active) return null

  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>

      {/* Sky flash */}
      {phase === 0 && (
        <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.85)',
          animation:'flashOut 0.25s ease-out forwards' }}/>
      )}

      {/* Lightning bolt from top striking the ball */}
      {phase >= 1 && phase < 3 && (
        <div style={{ position:'absolute', left:'40%', top:0, transform:'translateX(-50%)',
          animation:'boltDrop 0.35s ease-out both' }}>
          <svg width="100" height="420" viewBox="0 0 100 420" fill="none">
            <defs>
              <filter id="lb1"><feGaussianBlur stdDeviation="10" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="lb2"><feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {/* Glow */}
            <polyline points="50,0 32,160 62,160 18,420" stroke="rgba(200,230,255,0.3)" strokeWidth="30" strokeLinejoin="round" filter="url(#lb1)"/>
            {/* White bolt */}
            <polyline points="50,0 32,160 62,160 18,420" stroke="#fff" strokeWidth="8" strokeLinejoin="round" filter="url(#lb2)"/>
            {/* Blue-white core */}
            <polyline points="50,0 32,160 62,160 18,420" stroke="#c8e8ff" strokeWidth="4" strokeLinejoin="round"/>
            {/* Branches */}
            <polyline points="40,100 60,135 74,122" stroke="#c8e8ff" strokeWidth="2" strokeLinejoin="round" opacity="0.7"/>
            <polyline points="36,200 16,228 6,218" stroke="#c8e8ff" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
            <polyline points="40,310 62,342 78,328" stroke="#c8e8ff" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
          </svg>
        </div>
      )}

      {/* Golf ball being struck — phase 1 (glowing) */}
      {phase === 1 && (
        <div style={{ position:'absolute', bottom:'25%', left:'32%',
          animation:'ballGlow 0.5s ease-out both' }}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="26" fill="rgba(200,230,255,0.3)"/>
            <circle cx="28" cy="28" r="20" fill="rgba(200,230,255,0.5)"/>
            <circle cx="28" cy="28" r="14" fill="#fff" stroke="#c8e8ff" strokeWidth="3"/>
            {[[20,18],[28,16],[22,24]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="2" fill="#e0e0e0"/>
            ))}
          </svg>
        </div>
      )}

      {/* Ball rolling across the green — phase 2 */}
      {phase === 2 && (
        <>
          {/* Green grass strip */}
          <div style={{ position:'absolute', bottom:'20%', left:0, right:0, height:40,
            background:'linear-gradient(180deg, #2d7a1e, #1e5a14)',
            borderTop:'3px solid #4aaa28' }}/>
          {/* Ball rolling */}
          <div style={{ position:'absolute', bottom:'21.5%', left:0,
            animation:'ballRoll 1.3s cubic-bezier(0.45,0,0.55,1) forwards' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" style={{ animation:'ballSpin 1.3s linear forwards' }}>
              <circle cx="20" cy="20" r="19" fill="#fff" stroke="#ddd" strokeWidth="1"/>
              {[[13,12],[22,10],[10,20],[26,22],[18,18],[14,26]].map(([x,y],i)=>(
                <circle key={i} cx={x} cy={y} r="2.5" fill="#d0d0d0"/>
              ))}
            </svg>
          </div>
          {/* Rolling trail shadow */}
          <div style={{ position:'absolute', bottom:'20%', left:0, right:'38%', height:6,
            background:'linear-gradient(90deg, transparent, rgba(0,0,0,0.15))',
            animation:'trailFade 1.3s ease forwards' }}/>
        </>
      )}

      {/* Mini golf hole — phase 2+ */}
      {phase >= 2 && (
        <div style={{ position:'absolute', bottom:'17%', right:'14%' }}>
          {/* Hole shadow */}
          <div style={{ width:54, height:22, borderRadius:'50%', background:'#111',
            position:'absolute', top:8, left:0 }}/>
          {/* Hole opening */}
          <div style={{ width:54, height:22, borderRadius:'50%', background:'#0a0a0a',
            border:'3px solid #333', position:'relative', zIndex:1 }}/>
          {/* Flag */}
          <svg width="32" height="70" viewBox="0 0 32 70" style={{ position:'absolute', top:-60, left:18 }}>
            <rect x="13" y="0" width="3" height="65" rx="1.5" fill="#888"/>
            <polygon points="16,2 32,12 16,22" fill="#e74c3c"/>
          </svg>
        </div>
      )}

      {/* Ball dropping in — phase 3 */}
      {phase === 3 && (
        <div style={{ position:'absolute', bottom:'20%', right:'16.5%',
          animation:'ballDrop 0.8s cubic-bezier(0.5,0,0.5,1) forwards' }}>
          <svg width="34" height="34" viewBox="0 0 34 34">
            <circle cx="17" cy="17" r="16" fill="#fff" stroke="#ddd" strokeWidth="1"/>
            {[[11,10],[18,9],[9,17],[22,19],[16,16]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="2" fill="#d0d0d0"/>
            ))}
          </svg>
        </div>
      )}

      {/* Celebration pop — phase 4 */}
      {phase >= 4 && (
        <>
          {/* Stars burst from hole */}
          {[0,45,90,135,180,225,270,315].map((a,i)=>(
            <div key={i} style={{
              position:'absolute', bottom:'22%', right:'17%',
              width:8, height:8, borderRadius:'50%', background:'#FFD600',
              animation:`starPop${i%4} 0.6s ease-out both`,
              '--dx': `${Math.cos(a*Math.PI/180)*60}px`,
              '--dy': `${Math.sin(a*Math.PI/180)*60}px`,
            }}/>
          ))}
          {/* IN THE HOLE! */}
          <div style={{ position:'absolute', bottom:'30%', right:'5%',
            animation:'holeText 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <span style={{ fontSize:28, fontWeight:900, color:'#FFD600',
              textShadow:'0 0 20px rgba(255,214,0,0.8), 2px 2px 0 rgba(0,0,0,0.6)',
              letterSpacing:'-0.02em', whiteSpace:'nowrap' }}>IN THE HOLE! ⚡</span>
          </div>
        </>
      )}

      <style>{`
        @keyframes flashOut{0%{opacity:0.85}100%{opacity:0}}
        @keyframes boltDrop{0%{opacity:0;transform:translateX(-50%) scaleY(0);transform-origin:top}70%{opacity:1;transform:translateX(-50%) scaleY(1)}100%{opacity:0.85}}
        @keyframes ballGlow{0%{opacity:0;transform:scale(0.5)}100%{opacity:1;transform:scale(1)}}
        @keyframes ballRoll{0%{left:0}100%{left:calc(86% - 40px)}}
        @keyframes ballSpin{0%{transform:rotate(0)}100%{transform:rotate(720deg)}}
        @keyframes trailFade{0%{right:99%}100%{right:14%}}
        @keyframes ballDrop{0%{transform:translateY(0) scale(1)}80%{transform:translateY(18px) scale(0.7)}100%{transform:translateY(24px) scale(0);opacity:0}}
        @keyframes starPop0{0%{transform:translate(0,0) scale(0);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.5);opacity:0}}
        @keyframes starPop1{0%{transform:translate(0,0) scale(0);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.5);opacity:0}}
        @keyframes starPop2{0%{transform:translate(0,0) scale(0);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.5);opacity:0}}
        @keyframes starPop3{0%{transform:translate(0,0) scale(0);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(1.5);opacity:0}}
        @keyframes holeText{0%{opacity:0;transform:scale(0.3) rotate(-10deg)}100%{opacity:1;transform:none}}
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

  const ALL = ['confetti','fireworks','kiwi','galaxy','streamer','gecko','lightning','pixel','volcano','pinball']
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
    : animType === 'gecko'   ? (multi ? 'Ka-kaa! Hole in Ones!' : 'Ka-kaa! Hole in One! 🦜')
    : animType === 'lightning'? (multi ? '⚡ HOLE IN ONES! ⚡' : '⚡ HOLE IN ONE! ⚡')
    : animType === 'golfswing'? (multi ? 'FORE! Hole in Ones!' : 'FORE! Hole in One!')
    : animType === 'volcano' ? (multi ? '🌋 HOLE IN ONES!' : '🌋 HOLE IN ONE!')
    : animType === 'pinball' ? (multi ? 'JACKPOT! HOLE IN ONES!' : 'JACKPOT! HOLE IN ONE! 🎰')
    : (multi ? 'HOLE IN ONES!' : 'HOLE IN ONE!')

  return (
    <>
      {/* Canvas overlays — behind popup */}
      {animType === 'confetti'  && <ConfettiCanvas active={visible} />}
      {animType === 'fireworks' && <FireworksCanvas active={visible} />}
      {animType === 'galaxy'    && <StarWarsCanvas active={visible} />}
      {animType === 'streamer'  && <StreamerCanvas active={visible} />}
      {animType === 'volcano'   && <ConfettiCanvas active={visible} />}

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
        {animType === 'gecko'     && <GeckoAnimation active={visible} />}
        {animType === 'lightning' && <LightningAnimation active={visible} />}
        {animType === 'pixel'     && <PixelAnimation active={visible} />}
        {animType === 'galaxy'    && <StarWarsCrawl active={visible} />}
        {animType === 'volcano'   && <VolcanoAnimation active={visible} />}
        {animType === 'pinball'   && <PinballAnimation active={visible} />}

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
  galaxy:    'Star Wars',
  streamer:  'Streamer Cannon',
  gecko:     'Kea Parrot',
  lightning: 'Ball in Hole',
  pixel:     '8-bit Pixel',
  volcano:   'Volcano Eruption',
  pinball:   'Pinball Machine',
}
