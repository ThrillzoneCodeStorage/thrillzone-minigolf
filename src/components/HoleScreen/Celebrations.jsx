import { useEffect, useRef, useState } from 'react'

// ── Canvas Confetti ────────────────────────────────────────────
function ConfettiCanvas({ active, colors }) {
  const canvasRef   = useRef(null)
  const particlesRef = useRef([])
  const rafRef      = useRef(null)
  const COLORS = colors || ['#FFD600','#FFFFFF','#FFD600','#FFFDE7','#FFC107']

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    particlesRef.current = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 8, h: 10 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 4,
      vy: 3 + Math.random() * 4,
      opacity: 1,
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = 0
      for (const p of particlesRef.current) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06
        p.rotation += p.rotationSpeed
        if (p.y > canvas.height * 0.7) p.opacity -= 0.015
        if (p.opacity <= 0) continue
        alive++
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (alive > 0) rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998 }}/>
}

// ── Fireworks Canvas ───────────────────────────────────────────
function FireworksCanvas({ active }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    const particles = []
    const COLORS = ['#FFD600','#FF6B35','#fff','#60a5fa','#f87171','#a78bfa','#34d399']

    function burst(x, y) {
      const col = COLORS[Math.floor(Math.random() * COLORS.length)]
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60
        const speed = 2 + Math.random() * 6
        particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, alpha:1, col, r: 2+Math.random()*3 })
      }
    }

    let t = 0
    // Immediate first bursts
    burst(canvas.width*0.3, canvas.height*0.25)
    burst(canvas.width*0.7, canvas.height*0.35)
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      t++
      if (t % 22 === 0) {
        burst(
          100 + Math.random() * (canvas.width - 200),
          50  + Math.random() * (canvas.height * 0.55)
        )
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy
        p.vy += 0.12; p.alpha -= 0.018
        if (p.alpha <= 0) { particles.splice(i, 1); continue }
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.col
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998 }}/>
}

// ── Kiwi Bird running into a golf ball ────────────────────────
function KiwiAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {/* Kiwi runs across the bottom, hits golf ball, ball flies up */}
      <div style={{ position:'absolute', bottom:'18%', animation:'kiwiRun 2.2s ease-in forwards' }}>
        {/* Kiwi SVG */}
        <svg width="90" height="80" viewBox="0 0 90 80" fill="none" style={{ animation:'kiwiWaddle 0.22s ease-in-out infinite alternate' }}>
          {/* Body */}
          <ellipse cx="42" cy="46" rx="28" ry="22" fill="#8B6914"/>
          {/* Head */}
          <ellipse cx="68" cy="30" rx="14" ry="12" fill="#8B6914"/>
          {/* Eye */}
          <circle cx="74" cy="26" r="3" fill="#fff"/>
          <circle cx="75" cy="26" r="1.5" fill="#111"/>
          {/* Long beak */}
          <path d="M80 30 Q96 32 100 34" stroke="#C8A040" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
          {/* Tiny wing bump */}
          <ellipse cx="32" cy="42" rx="10" ry="6" fill="#7A5C10"/>
          {/* Left leg */}
          <path d="M36 64 L32 74 L28 74" stroke="#C8A040" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Right leg */}
          <path d="M46 64 L50 74 L54 74" stroke="#C8A040" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* Feather texture lines */}
          <path d="M28 36 Q38 32 48 36" stroke="#6B4A0E" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6"/>
          <path d="M24 46 Q36 42 50 46" stroke="#6B4A0E" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6"/>
        </svg>
      </div>

      {/* Golf ball — sitting still, then gets launched */}
      <div style={{ position:'absolute', bottom:'20%', left:'72%', animation:'ballLaunch 2.2s ease-in forwards' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" fill="#fff" stroke="#e0e0e0" strokeWidth="1"/>
          {/* Dimples */}
          <circle cx="10" cy="10" r="2" fill="#ddd"/>
          <circle cx="17" cy="8" r="2" fill="#ddd"/>
          <circle cx="8" cy="17" r="2" fill="#ddd"/>
          <circle cx="19" cy="17" r="2" fill="#ddd"/>
          <circle cx="14" cy="14" r="2" fill="#ddd"/>
          <circle cx="13" cy="21" r="1.5" fill="#ddd"/>
        </svg>
      </div>

      {/* Mini golf flag at the top right */}
      <div style={{ position:'absolute', top:'8%', right:'12%', animation:'flagAppear 0.4s 1.8s ease-out both' }}>
        <svg width="48" height="80" viewBox="0 0 48 80" fill="none">
          <rect x="22" y="4" width="3" height="68" rx="1.5" fill="#FFD600"/>
          <polygon points="25,4 48,16 25,28" fill="#FFD600"/>
          <ellipse cx="23" cy="74" rx="12" ry="4" fill="rgba(255,214,0,0.2)"/>
        </svg>
      </div>

      {/* Stars burst on impact */}
      <div style={{ position:'absolute', bottom:'25%', left:'68%', animation:'starBurst 0.6s 1.85s ease-out both' }}>
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          {[0,45,90,135,180,225,270,315].map((angle, i) => (
            <line key={i}
              x1="30" y1="30"
              x2={30 + Math.cos(angle*Math.PI/180)*26}
              y2={30 + Math.sin(angle*Math.PI/180)*26}
              stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round"/>
          ))}
          <circle cx="30" cy="30" r="5" fill="#FFD600"/>
        </svg>
      </div>

      <style>{`
        @keyframes kiwiRun {
          0%   { left: -120px; }
          75%  { left: 62%; }
          82%  { left: 60%; transform: scaleX(1); }
          100% { left: 60%; transform: scaleX(1); }
        }
        @keyframes kiwiWaddle {
          0%   { transform: rotate(-4deg) translateY(0); }
          100% { transform: rotate(4deg) translateY(-3px); }
        }
        @keyframes ballLaunch {
          0%   { transform: translate(0,0) rotate(0deg); opacity:1; }
          80%  { transform: translate(0,0) rotate(0deg); opacity:1; }
          85%  { transform: translate(-8px, 0) rotate(0deg); opacity:1; }
          100% { transform: translate(-120px, -280px) rotate(720deg); opacity:0; }
        }
        @keyframes flagAppear {
          0%   { opacity:0; transform: scale(0.5) rotate(-20deg); }
          100% { opacity:1; transform: scale(1) rotate(0deg); }
        }
        @keyframes starBurst {
          0%   { opacity:0; transform: scale(0); }
          50%  { opacity:1; transform: scale(1.3); }
          100% { opacity:0; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// ── Golf Swing Silhouette ─────────────────────────────────────
function GolfSwingAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {/* Ball trail stars */}
      {[...Array(12)].map((_,i) => (
        <div key={i} style={{
          position:'absolute',
          left: `${18 + i*5.5}%`, top: `${55 - i*3.5}%`,
          width: i===11?18:6+i*0.5, height: i===11?18:6+i*0.5,
          borderRadius:'50%',
          background: i===11 ? '#fff' : '#FFD600',
          opacity: i===11 ? 1 : 0.15+i*0.07,
          animation: `starTrail 0.8s ${0.6+i*0.06}s ease-out both`,
        }}/>
      ))}
      {/* Golfer silhouette */}
      <div style={{ position:'absolute', left:'8%', top:'35%', animation:'golferSwing 1.8s ease-in-out forwards' }}>
        <svg width="90" height="120" viewBox="0 0 90 120" fill="none">
          {/* Body */}
          <ellipse cx="45" cy="72" rx="14" ry="22" fill="#FFD600" opacity="0.9"/>
          {/* Head */}
          <circle cx="45" cy="40" r="14" fill="#FFD600" opacity="0.9"/>
          {/* Cap */}
          <path d="M31 38 Q45 26 59 38" fill="#cc9900"/>
          <rect x="28" y="36" width="34" height="5" rx="2" fill="#cc9900"/>
          {/* Arm + club follow through */}
          <line x1="45" y1="58" x2="78" y2="30" stroke="#FFD600" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
          <line x1="78" y1="30" x2="88" y2="72" stroke="#cc9900" strokeWidth="3" strokeLinecap="round"/>
          {/* Legs */}
          <line x1="38" y1="90" x2="30" y2="116" stroke="#FFD600" strokeWidth="6" strokeLinecap="round"/>
          <line x1="52" y1="90" x2="62" y2="116" stroke="#FFD600" strokeWidth="6" strokeLinecap="round"/>
        </svg>
      </div>
      {/* "FORE!" text */}
      <div style={{ position:'absolute', left:'18%', top:'28%', animation:'foreText 0.5s 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <span style={{ fontSize:42, fontWeight:900, color:'#FFD600', textShadow:'0 0 20px rgba(255,214,0,0.6)', letterSpacing:'-0.02em' }}>FORE!</span>
      </div>
      <style>{`
        @keyframes golferSwing{0%{transform:rotate(-40deg) translateX(-20px);opacity:0}15%{opacity:1}60%{transform:rotate(0deg)}100%{transform:rotate(15deg) translateX(10px)}}
        @keyframes starTrail{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}
        @keyframes foreText{from{opacity:0;transform:scale(0.3) rotate(-15deg)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}

// ── Galaxy Burst ───────────────────────────────────────────────
function GalaxyBurstCanvas({ active }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const cx = canvas.width/2, cy = canvas.height/2
    const stars = Array.from({ length: 300 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 1.5 + Math.random() * 6
      const size  = 1 + Math.random() * 3
      const hue   = [0, 51, 60][Math.floor(Math.random()*3)] // gold, yellow, white
      return { x:cx, y:cy, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed, alpha:1, size, hue }
    })

    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(0,0,canvas.width,canvas.height)
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy; s.vx *= 1.03; s.vy *= 1.03; s.alpha -= 0.008
        if (s.alpha <= 0) continue
        ctx.globalAlpha = Math.max(0, s.alpha)
        ctx.fillStyle = s.hue === 0 ? '#FFD600' : s.hue === 51 ? '#fff' : '#ffe066'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI*2); ctx.fill()
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998 }}/>
}

// ── Streamer Cannon ───────────────────────────────────────────
function StreamerCanvas({ active }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const W = canvas.width, H = canvas.height
    const COLORS = ['#FFD600','#ff6b6b','#4ecdc4','#a78bfa','#f472b6','#34d399','#60a5fa','#fff']

    function makeStreamer(x, angle) {
      return Array.from({length:14}, (_,i) => ({
        x, y: H+10,
        vx: Math.cos(angle) * (4+Math.random()*5),
        vy: Math.sin(angle) * (4+Math.random()*5) - 2,
        rotation: Math.random()*360,
        rotSpeed: (Math.random()-0.5)*12,
        w: 6+Math.random()*8, h: 14+Math.random()*10,
        color: COLORS[Math.floor(Math.random()*COLORS.length)],
        alpha:1,
      }))
    }

    let ribbons = [
      ...makeStreamer(W*0.05, -Math.PI*0.55),
      ...makeStreamer(W*0.95, -Math.PI*0.45),
    ]
    setTimeout(() => {
      ribbons = ribbons.concat([
        ...makeStreamer(W*0.15, -Math.PI*0.6),
        ...makeStreamer(W*0.85, -Math.PI*0.4),
      ])
    }, 400)

    function draw() {
      ctx.clearRect(0,0,W,H)
      for (const r of ribbons) {
        r.x += r.vx; r.y += r.vy; r.vy += 0.18
        r.rotation += r.rotSpeed
        if (r.y > H*0.6) r.alpha -= 0.014
        if (r.alpha <= 0) continue
        ctx.save()
        ctx.globalAlpha = Math.max(0, r.alpha)
        ctx.translate(r.x, r.y)
        ctx.rotate(r.rotation * Math.PI/180)
        ctx.fillStyle = r.color
        ctx.beginPath()
        ctx.ellipse(0, 0, r.w/2, r.h/2, 0, 0, Math.PI*2)
        ctx.fill()
        ctx.restore()
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998 }}/>
}

// ── Gecko ──────────────────────────────────────────────────────
function GeckoAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      <div style={{ position:'absolute', bottom:'18%', animation:'geckoRun 2.4s ease-in forwards' }}>
        <svg width="110" height="60" viewBox="0 0 110 60" fill="none" style={{ animation:'geckoWiggle 0.18s ease-in-out infinite alternate' }}>
          {/* Body */}
          <ellipse cx="50" cy="32" rx="32" ry="14" fill="#4ade80"/>
          <ellipse cx="50" cy="32" rx="30" ry="12" fill="#34d399" opacity="0.6"/>
          {/* Spots */}
          {[[35,28],[50,24],[65,28],[42,36],[58,36]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#22c55e" opacity="0.7"/>
          ))}
          {/* Head */}
          <ellipse cx="82" cy="30" rx="18" ry="12" fill="#4ade80"/>
          {/* Eye */}
          <circle cx="91" cy="26" r="4" fill="#000"/>
          <circle cx="92" cy="25" r="1.5" fill="#fff"/>
          {/* Tongue */}
          <path d="M99 30 Q106 28 108 26 M106 28 Q108 32 110 31" stroke="#f87171" strokeWidth="2" strokeLinecap="round" fill="none"/>
          {/* Tail */}
          <path d="M18 32 Q8 28 2 22 Q-2 18 0 14" stroke="#4ade80" strokeWidth="8" strokeLinecap="round" fill="none"/>
          {/* Legs */}
          <path d="M38 42 L30 54 L22 54" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M55 44 L60 56 L68 58" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M38 22 L30 10 L24 8" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M55 20 L58 8 L66 6" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
      {/* Golf ball */}
      <div style={{ position:'absolute', bottom:'20%', left:'74%', animation:'geckoball 2.4s ease-in forwards' }}>
        <svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="#fff" stroke="#e0e0e0" strokeWidth="1"/><circle cx="9" cy="9" r="2" fill="#ddd"/><circle cx="16" cy="8" r="2" fill="#ddd"/><circle cx="8" cy="16" r="2" fill="#ddd"/><circle cx="17" cy="16" r="2" fill="#ddd"/><circle cx="13" cy="13" r="2" fill="#ddd"/></svg>
      </div>
      {/* Speech bubble */}
      <div style={{ position:'absolute', bottom:'40%', left:'18%', animation:'chur 0.4s 1.9s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div style={{ background:'#fff', borderRadius:12, padding:'8px 14px', position:'relative', boxShadow:'0 4px 16px rgba(0,0,0,0.4)' }}>
          <span style={{ fontSize:18, fontWeight:900, color:'#000', letterSpacing:'-0.01em' }}>Chur bro! 🤙</span>
          <div style={{ position:'absolute', bottom:-8, left:20, width:0, height:0, borderLeft:'8px solid transparent', borderRight:'8px solid transparent', borderTop:'8px solid #fff' }}/>
        </div>
      </div>
      <style>{`
        @keyframes geckoRun{0%{left:-130px}75%{left:62%}100%{left:62%}}
        @keyframes geckoWiggle{0%{transform:rotate(-5deg) translateY(0)}100%{transform:rotate(5deg) translateY(-3px)}}
        @keyframes geckoball{0%,78%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(-100px,-260px) rotate(540deg);opacity:0}}
        @keyframes chur{from{opacity:0;transform:scale(0.3)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  )
}

// ── Lightning Strike ───────────────────────────────────────────
function LightningAnimation({ active }) {
  if (!active) return null
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {/* Flash */}
      <div style={{ position:'absolute', inset:0, background:'#fff', animation:'flashBurst 0.25s ease-out forwards' }}/>
      {/* Lightning bolt SVG */}
      <div style={{ position:'absolute', left:'50%', top:0, transform:'translateX(-50%)', animation:'boltStrike 0.4s 0.1s ease-out both' }}>
        <svg width="120" height="420" viewBox="0 0 120 420" fill="none">
          <filter id="glow"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <polyline points="60,0 35,160 65,160 20,420" stroke="#fff" strokeWidth="6" strokeLinejoin="round" filter="url(#glow)" opacity="0.9"/>
          <polyline points="60,0 35,160 65,160 20,420" stroke="#FFD600" strokeWidth="3" strokeLinejoin="round" filter="url(#glow)"/>
        </svg>
      </div>
      {/* Impact sparks at ball position */}
      <div style={{ position:'absolute', bottom:'22%', left:'46%', animation:'sparkBurst 0.5s 0.35s ease-out both' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          {[0,45,90,135,180,225,270,315].map((a,i) => (
            <line key={i} x1="40" y1="40"
              x2={40+Math.cos(a*Math.PI/180)*36} y2={40+Math.sin(a*Math.PI/180)*36}
              stroke="#FFD600" strokeWidth="3" strokeLinecap="round"/>
          ))}
          <circle cx="40" cy="40" r="8" fill="#FFD600"/>
        </svg>
      </div>
      {/* Golf ball glowing */}
      <div style={{ position:'absolute', bottom:'22%', left:'50%', transform:'translateX(-50%)', animation:'ballGlow 1.5s 0.4s ease-out both' }}>
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="#fff" stroke="#FFD600" strokeWidth="2"/>
          <circle cx="18" cy="18" r="16" fill="none" stroke="#FFD600" strokeWidth="8" opacity="0.3"/>
        </svg>
      </div>
      <style>{`
        @keyframes flashBurst{0%{opacity:0.7}100%{opacity:0}}
        @keyframes boltStrike{0%{opacity:0;transform:translateX(-50%) scaleY(0);transform-origin:top}60%{opacity:1;transform:translateX(-50%) scaleY(1)}100%{opacity:0}}
        @keyframes sparkBurst{0%{opacity:0;transform:scale(0)}60%{opacity:1;transform:scale(1.3)}100%{opacity:0}}
        @keyframes ballGlow{0%{opacity:0;transform:translateX(-50%) scale(0.5)}40%{opacity:1;transform:translateX(-50%) scale(1.4)}100%{transform:translateX(-50%) scale(1);opacity:0.6}}
      `}</style>
    </div>
  )
}

// ── 8-bit Pixel Celebration ────────────────────────────────────
function PixelAnimation({ active }) {
  if (!active) return null
  const pixels = Array.from({length:40}, (_,i) => ({
    x: Math.random()*100, delay: Math.random()*0.8,
    size: [8,10,12,16][Math.floor(Math.random()*4)],
    color: ['#FFD600','#FF3B3B','#4ade80','#60a5fa','#f472b6','#fff'][Math.floor(Math.random()*6)],
    dx: (Math.random()-0.5)*80, dy: -(20+Math.random()*60),
  }))

  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', imageRendering:'pixelated' }}>
      {/* Pixel confetti squares */}
      {pixels.map((p,i) => (
        <div key={i} style={{
          position:'absolute', left:`${p.x}%`, top:'30%',
          width:p.size, height:p.size, background:p.color,
          animation:`pixFall 1.2s ${p.delay}s ease-in both`,
          '--dx': `${p.dx}px`, '--dy': `${p.dy}px`,
        }}/>
      ))}
      {/* 8-bit golfer doing victory dance */}
      <div style={{ position:'absolute', bottom:'15%', left:'50%', transform:'translateX(-50%)', animation:'danceJump 0.4s ease-in-out infinite alternate' }}>
        <svg width="48" height="64" viewBox="0 0 48 64" style={{ imageRendering:'pixelated' }}>
          {/* Pixelated golfer — block style */}
          <rect x="16" y="0" width="16" height="16" fill="#FFD600"/> {/* head */}
          <rect x="12" y="16" width="24" height="20" fill="#FFD600"/> {/* body */}
          <rect x="4" y="18" width="8" height="12" fill="#FFD600"/> {/* left arm */}
          <rect x="36" y="16" width="8" height="12" fill="#FFD600"/> {/* right arm up */}
          <rect x="12" y="36" width="10" height="20" fill="#FFD600"/> {/* left leg */}
          <rect x="26" y="36" width="10" height="20" fill="#FFD600"/> {/* right leg */}
          {/* Eyes */}
          <rect x="18" y="4" width="4" height="4" fill="#000"/>
          <rect x="26" y="4" width="4" height="4" fill="#000"/>
          {/* Club */}
          <rect x="36" y="4" width="4" height="28" fill="#cc9900"/>
          <rect x="32" y="28" width="12" height="4" fill="#888"/>
        </svg>
      </div>
      {/* HOLE IN ONE text pixelated style */}
      <div style={{ position:'absolute', top:'12%', left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', animation:'pixelText 0.3s 0.2s ease-out both' }}>
        <span style={{ fontFamily:'"Courier New",monospace', fontSize:28, fontWeight:900, color:'#FFD600', textShadow:'3px 3px 0 #cc7700, 6px 6px 0 rgba(0,0,0,0.5)', letterSpacing:'0.08em', textTransform:'uppercase' }}>
          HOLE IN ONE!
        </span>
      </div>
      <div style={{ position:'absolute', top:'22%', left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', animation:'pixelText 0.3s 0.45s ease-out both' }}>
        <span style={{ fontFamily:'"Courier New",monospace', fontSize:16, fontWeight:700, color:'#4ade80', letterSpacing:'0.12em' }}>
          ★ ACHIEVEMENT UNLOCKED ★
        </span>
      </div>
      <style>{`
        @keyframes pixFall{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(90deg)}}
        @keyframes danceJump{0%{transform:translateX(-50%) translateY(0) scaleX(1)}100%{transform:translateX(-50%) translateY(-12px) scaleX(-1)}}
        @keyframes pixelText{0%{opacity:0;transform:translateX(-50%) scale(0.5)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
      `}</style>
    </div>
  )
}

// ── Hole In One Popup — 3 random animation types ───────────────
export function HoleInOnePopup({ players, onDismiss }) {
  const [visible, setVisible]       = useState(true)
  const [canDismiss, setCanDismiss] = useState(false)
  const animType = useRef(['confetti','fireworks','kiwi','golfswing','galaxy','streamer','gecko','lightning','pixel'][Math.floor(Math.random() * 9)]).current

  useEffect(() => {
    // Allow dismiss after 3s minimum so it's always seen
    const minT = setTimeout(() => setCanDismiss(true), 3000)
    // Auto dismiss after 7s
    const autoT = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 400) }, 7000)
    return () => { clearTimeout(minT); clearTimeout(autoT) }
  }, [])

  function handleTap() {
    if (!canDismiss) return
    setVisible(false); setTimeout(onDismiss, 300)
  }

  const multi = players.length > 1

  return (
    <>
      {animType === 'confetti'  && <ConfettiCanvas active={visible}/>}
      {animType === 'fireworks' && <FireworksCanvas active={visible}/>}
      {animType === 'galaxy'    && <GalaxyBurstCanvas active={visible}/>}
      {animType === 'streamer'  && <StreamerCanvas active={visible}/>}

      <div onClick={handleTap}
        style={{
          position:'fixed', inset:0, zIndex:9997,
          background:'rgba(0,0,0,0.94)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          cursor:'pointer', backdropFilter:'blur(12px)',
          opacity:visible?1:0, transition:'opacity 0.4s',
          padding:24,
        }}>

        {animType === 'kiwi'      && <KiwiAnimation active={visible}/>}
        {animType === 'golfswing' && <GolfSwingAnimation active={visible}/>}
        {animType === 'gecko'     && <GeckoAnimation active={visible}/>}
        {animType === 'lightning' && <LightningAnimation active={visible}/>}
        {animType === 'pixel'     && <PixelAnimation active={visible}/>}

        {/* Trophy SVG */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none"
          style={{ marginBottom:20, animation:'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <circle cx="40" cy="40" r="40" fill="rgba(255,214,0,0.12)"/>
          <path d="M22 20h36v24c0 9.94-8.06 18-18 18s-18-8.06-18-18V20z" fill="#FFD600" opacity="0.9"/>
          <path d="M14 20h10v15c0 2.76-2.24 5-5 5h-5V20z" fill="#FFD600" opacity="0.6"/>
          <path d="M56 20h10v20h-5c-2.76 0-5-2.24-5-5V20z" fill="#FFD600" opacity="0.6"/>
          <rect x="33" y="62" width="14" height="6" rx="2" fill="#FFD600" opacity="0.7"/>
          <rect x="26" y="68" width="28" height="5" rx="2.5" fill="#FFD600" opacity="0.5"/>
        </svg>

        <div style={{
          fontSize:46, fontWeight:900, letterSpacing:'-0.04em', lineHeight:1,
          textAlign:'center', marginBottom:10,
          animation:'bounceIn 0.6s 0.08s cubic-bezier(0.34,1.56,0.64,1) both',
          background:'linear-gradient(135deg,#FFD600,#fff,#FFD600)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>
          {animType === 'kiwi'
            ? (multi ? 'Sweet as! Hole in Ones!' : 'Sweet as! Hole in One!')
            : animType === 'gecko'
            ? (multi ? 'Chur! Hole in Ones!' : 'Chur bro! Hole in One!')
            : animType === 'pixel'
            ? (multi ? 'HOLE IN ONES!' : 'HOLE IN ONE!')
            : animType === 'lightning'
            ? (multi ? '⚡ HOLE IN ONES! ⚡' : '⚡ HOLE IN ONE! ⚡')
            : animType === 'golfswing'
            ? (multi ? 'FORE! Hole in Ones!' : 'FORE! Hole in One!')
            : (multi ? 'HOLE IN ONES!' : 'HOLE IN ONE!')}
        </div>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginBottom:28, animation:'bounceIn 0.6s 0.16s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          {players.map(p => (
            <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:12, height:12, borderRadius:'50%', background:p.color }}/>
              <span style={{ fontSize:24, fontWeight:800, color:p.color, letterSpacing:'-0.02em' }}>{p.name}!</span>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10, marginBottom:32, animation:'bounceIn 0.5s 0.28s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          {[0,1,2].map(i => (
            <svg key={i} width="32" height="32" viewBox="0 0 24 24" fill="#FFD600"
              style={{ animation:`bounceIn 0.45s ${0.3+i*0.1}s cubic-bezier(0.34,1.56,0.64,1) both` }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          ))}
        </div>

        <p style={{ color:canDismiss?'rgba(255,255,255,0.3)':'transparent', fontSize:13, transition:'color 0.5s' }}>
          Tap anywhere to continue
        </p>
      </div>

      <style>{`
        @keyframes bounceIn{0%{opacity:0;transform:scale(0.3)}60%{transform:scale(1.1)}80%{transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
    </>
  )
}

// ── Float number ───────────────────────────────────────────────
export function FloatNumber({ value, x, y, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 680); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position:'fixed', left:x, top:y, pointerEvents:'none', zIndex:600,
      fontSize:26, fontWeight:900,
      color: value > 0 ? 'var(--red)' : 'var(--yellow)',
      animation:'floatUp 0.68s ease-out forwards',
      transform:'translate(-50%,-50%)',
    }}>
      {value > 0 ? `+${value}` : value}
      <style>{`@keyframes floatUp{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-90px) scale(1.5)}}`}</style>
    </div>
  )
}

// ── End confetti ───────────────────────────────────────────────
export function EndConfetti() {
  const [active, setActive] = useState(true)
  useEffect(() => { const t = setTimeout(() => setActive(false), 5000); return () => clearTimeout(t) }, [])
  return <ConfettiCanvas active={active}/>
}

// ── Hole transition wipe ───────────────────────────────────────
export function HoleTransition({ holeNumber, title, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:300, background:'#060606',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14,
      animation:'holeFade 2.8s ease forwards',
    }}>
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
