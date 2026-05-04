import { useEffect, useRef, useState } from 'react'

const COLORS = ['#FFD600','#FFFFFF','#FFD600','#FFF9C4','#FFECB3','#fff9e6','#FFD600','#fffde7']

export default function SpinnerWheel({ effects, forcedEffect, onDismiss }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const [spinning, setSpinning] = useState(false)
  const [landed,   setLanded]   = useState(false)
  const [result,   setResult]   = useState(null)
  const [rotation, setRotation] = useState(0)
  const rotRef = useRef(0)

  const list = effects.length > 0 ? effects : [
    { id:1, name:'Score Swap',     description:'Swap your total with any player!' },
    { id:2, name:'Double Trouble', description:'Next hole score counts double.' },
    { id:3, name:'Gift a Stroke',  description:'Give 2 strokes to someone.' },
    { id:4, name:'Steal a Stroke', description:'Remove 1 stroke from your total.' },
    { id:5, name:'Lucky Skip',     description:'Next hole score doesn\'t count.' },
    { id:6, name:'Mulligan',       description:'Delete your worst hole score.' },
    { id:7, name:'Wrong Hand',     description:'Next hole: non-dominant hand only.' },
    { id:8, name:'Free Pass',      description:'Nothing happens. Lucky you!' },
  ]

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const size = 280
    canvas.width = size * dpr; canvas.height = size * dpr
    canvas.style.width = size + 'px'; canvas.style.height = size + 'px'
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr)
    draw(0)
  }, [list])

  function draw(rot) {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const S = canvas.width / dpr, cx = S/2, cy = S/2, r = cx-6
    const n = list.length, slice = (2*Math.PI)/n
    ctx.clearRect(0,0,canvas.width,canvas.height)

    for (let i=0;i<n;i++) {
      const a0 = rot + i*slice, a1 = a0+slice
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,a0,a1); ctx.closePath()
      // Alternating black/yellow
      ctx.fillStyle = i%2===0 ? '#FFD600' : '#1a1a1a'
      ctx.fill()
      ctx.strokeStyle='#0a0a0a'; ctx.lineWidth=2; ctx.stroke()

      ctx.save(); ctx.translate(cx,cy); ctx.rotate(a0+slice/2)
      ctx.textAlign='right'; ctx.fillStyle = i%2===0 ? '#000' : '#FFD600'
      ctx.font=`bold ${n>6?10:12}px Inter,sans-serif`
      const label=list[i].name.length>14?list[i].name.slice(0,13)+'…':list[i].name
      ctx.fillText(label, r-10, 4); ctx.restore()
    }

    // Center circle
    ctx.beginPath(); ctx.arc(cx,cy,22,0,2*Math.PI)
    ctx.fillStyle='#0a0a0a'; ctx.fill()
    ctx.strokeStyle='#FFD600'; ctx.lineWidth=3; ctx.stroke()
    ctx.fillStyle='#FFD600'; ctx.font='bold 14px Inter,sans-serif'
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('⛳',cx,cy)
  }

  function spin() {
    if (spinning||landed) return
    setSpinning(true)
    const target = forcedEffect
      ? (list.find(e=>e.id===forcedEffect.id) || list[Math.floor(Math.random()*list.length)])
      : list[Math.floor(Math.random()*list.length)]
    const idx = list.findIndex(e=>e.id===target.id)
    const n = list.length, slice=(2*Math.PI)/n
    const targetAngle = -Math.PI/2-(idx*slice+slice/2)
    const total = (targetAngle-rotRef.current) + (5+Math.random()*3)*2*Math.PI
    const dur   = 3500+Math.random()*1000
    const start = performance.now()
    const r0    = rotRef.current

    function frame(ts) {
      const t = Math.min((ts-start)/dur,1)
      const eased = 1-Math.pow(1-t,3)
      rotRef.current = r0+total*eased
      draw(rotRef.current)
      if (t<1) { rafRef.current=requestAnimationFrame(frame) }
      else { setSpinning(false); setLanded(true); setResult(list[idx] || target) }
    }
    rafRef.current=requestAnimationFrame(frame)
  }

  useEffect(()=>()=>cancelAnimationFrame(rafRef.current),[])

  return (
    <div className="modal-center">
      <div className="modal-box" style={{ textAlign:'center' }}>
        <div style={{ fontSize:14, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--yellow)', marginBottom:6 }}>Silly Mode</div>
        <h3 style={{ fontSize:24, fontWeight:900, letterSpacing:'-0.03em', marginBottom:4 }}>🎰 Spin the Wheel!</h3>
        <p style={{ fontSize:14, color:'var(--text-2)', marginBottom:20 }}>
          {landed ? 'The wheel has spoken!' : 'Tap to spin!'}
        </p>

        {/* Pointer */}
        <div style={{ position:'relative', width:280, margin:'0 auto 20px' }}>
          <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', color:'var(--yellow)', fontSize:22, zIndex:2, filter:'drop-shadow(0 2px 4px rgba(255,214,0,0.5))' }}>▼</div>
          <canvas ref={canvasRef}
            onClick={spin}
            style={{ borderRadius:'50%', cursor:spinning||landed?'default':'pointer', display:'block',
              width:280, height:280,
              boxShadow: spinning ? '0 0 40px rgba(255,214,0,0.4)' : '0 4px 24px rgba(0,0,0,0.6)',
              transition:'box-shadow 0.3s',
            }} />
        </div>

        {!landed ? (
          <button className="btn btn-primary btn-full btn-lg" onClick={spin} disabled={spinning}>
            {spinning ? '🌀 Spinning…' : '🎰 Spin!'}
          </button>
        ) : result && (
          <div style={{ animation:'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div className="card-yellow" style={{ marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--yellow)', marginBottom:8 }}>Effect</p>
              <p style={{ fontSize:22, fontWeight:900, letterSpacing:'-0.02em', marginBottom:8 }}>{result.name}</p>
              <p style={{ fontSize:15, color:'var(--text-2)', lineHeight:1.55 }}>{result.description}</p>
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={onDismiss}>✓ Got it — Next hole!</button>
          </div>
        )}
      </div>
      <style>{`@keyframes popIn{0%{opacity:0;transform:scale(0.6)}80%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}
