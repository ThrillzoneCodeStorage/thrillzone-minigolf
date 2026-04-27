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
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      t++
      if (t % 28 === 0) {
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

// ── Hole In One Popup — 3 random animation types ───────────────
export function HoleInOnePopup({ players, onDismiss }) {
  const [visible, setVisible] = useState(true)
  // Pick animation type randomly once
  const animType = useRef(['confetti','fireworks','kiwi'][Math.floor(Math.random() * 3)]).current

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 400) }, 5000)
    return () => clearTimeout(t)
  }, [])

  const multi = players.length > 1

  return (
    <>
      {animType === 'confetti'  && <ConfettiCanvas active={visible}/>}
      {animType === 'fireworks' && <FireworksCanvas active={visible}/>}

      <div onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}
        style={{
          position:'fixed', inset:0, zIndex:9997,
          background:'rgba(0,0,0,0.94)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          cursor:'pointer', backdropFilter:'blur(12px)',
          opacity:visible?1:0, transition:'opacity 0.4s',
          padding:24,
        }}>

        {animType === 'kiwi'    && <KiwiAnimation active={visible}/>}

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
          {multi ? 'HOLE IN ONES!' : 'HOLE IN ONE!'}
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

        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, animation:'fadeIn 0.5s 0.7s both' }}>
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
  useEffect(() => { const t = setTimeout(onDone, 1100); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:300, background:'#000',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10,
      animation:'holeFade 1.1s ease forwards',
    }}>
      <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--yellow)', opacity:0.6 }}>Next up</div>
      <div style={{ fontSize:68, fontWeight:900, color:'var(--yellow)', letterSpacing:'-0.04em', lineHeight:1 }}>
        {String(holeNumber).padStart(2,'0')}
      </div>
      <div style={{ fontSize:20, fontWeight:700, color:'#fff', letterSpacing:'-0.02em' }}>{title}</div>
      <style>{`@keyframes holeFade{0%{opacity:0;transform:scale(1.04)}20%{opacity:1;transform:scale(1)}70%{opacity:1}100%{opacity:0}}`}</style>
    </div>
  )
}
