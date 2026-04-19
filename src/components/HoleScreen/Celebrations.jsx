import { useEffect, useRef, useState } from 'react'

// ── Canvas Confetti ────────────────────────────────────────────
function ConfettiCanvas({ active }) {
  const canvasRef   = useRef(null)
  const particlesRef = useRef([])
  const rafRef      = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const COLORS = ['#FFD600','#FFFFFF','#FFD600','#FFFDE7','#FFC107','#fff','#FFD600']
    particlesRef.current = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 8,
      h: 10 + Math.random() * 6,
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
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }} />
}

// ── Hole In One — supports multiple players ────────────────────
export function HoleInOnePopup({ players, onDismiss }) {
  const [visible, setVisible] = useState(true)

  // auto-dismiss after 5s
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 400) }, 5000)
    return () => clearTimeout(t)
  }, [])

  // players is an array: [{ name, color }]
  const multi = players.length > 1

  return (
    <>
      <ConfettiCanvas active={visible} />
      <div
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9997,
          background: 'rgba(0,0,0,0.94)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', backdropFilter: 'blur(12px)',
          opacity: visible ? 1 : 0, transition: 'opacity 0.4s',
          padding: 24,
        }}
      >
        {/* Golf flag icon (SVG, no emoji) */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none"
          style={{ marginBottom: 20, animation: 'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <circle cx="40" cy="40" r="40" fill="rgba(255,214,0,0.12)" />
          <rect x="34" y="16" width="3" height="44" rx="1.5" fill="#FFD600"/>
          <polygon points="37,16 60,24 37,32" fill="#FFD600"/>
          <circle cx="34" cy="60" r="6" fill="#FFD600" opacity="0.3"/>
        </svg>

        <div style={{
          fontSize: 46, fontWeight: 900, letterSpacing: '-0.04em',
          lineHeight: 1, textAlign: 'center', marginBottom: 10,
          animation: 'bounceIn 0.6s 0.08s cubic-bezier(0.34,1.56,0.64,1) both',
          background: 'linear-gradient(135deg,#FFD600,#fff,#FFD600)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {multi ? 'HOLE IN ONES!' : 'HOLE IN ONE!'}
        </div>

        {/* Player name(s) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 28, animation: 'bounceIn 0.6s 0.16s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          {players.map((p, i) => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.color }} />
              <span style={{ fontSize: 24, fontWeight: 800, color: p.color, letterSpacing: '-0.02em' }}>{p.name}!</span>
            </div>
          ))}
        </div>

        {/* Stars row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, animation: 'bounceIn 0.5s 0.28s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          {[0, 1, 2].map(i => (
            <svg key={i} width="32" height="32" viewBox="0 0 24 24" fill="#FFD600"
              style={{ animation: `bounceIn 0.45s ${0.3 + i * 0.1}s cubic-bezier(0.34,1.56,0.64,1) both` }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, animation: 'fadeIn 0.5s 0.7s both' }}>
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

// ── Floating +/- number ────────────────────────────────────────
export function FloatNumber({ value, x, y, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 680); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 600,
      fontSize: 26, fontWeight: 900,
      color: value > 0 ? 'var(--red)' : 'var(--yellow)',
      animation: 'floatUp 0.68s ease-out forwards',
      transform: 'translate(-50%,-50%)',
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
  return <ConfettiCanvas active={active} />
}

// ── Hole transition wipe ───────────────────────────────────────
export function HoleTransition({ holeNumber, title, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1100); return () => clearTimeout(t) }, [])
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300, background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
      animation: 'holeFade 1.1s ease forwards',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--yellow)', opacity: 0.6 }}>Next up</div>
      <div style={{ fontSize: 68, fontWeight: 900, color: 'var(--yellow)', letterSpacing: '-0.04em', lineHeight: 1 }}>
        {String(holeNumber).padStart(2, '0')}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{title}</div>
      <style>{`@keyframes holeFade{0%{opacity:0;transform:scale(1.04)}20%{opacity:1;transform:scale(1)}70%{opacity:1}100%{opacity:0}}`}</style>
    </div>
  )
}

// ── Score reaction helper (no longer used for display, kept for reference) ─
export function getScoreReaction(strokes, par) {
  if (strokes === 1) return { type: 'holeinone' }
  return null
}
