import { useRef, useState } from 'react'
import { Download, Share2, X } from 'lucide-react'

// Generate scorecard PNG on a canvas
async function generateScorecardPng({ players, holes, scores, skippedHoles }) {
  const CARD_W  = 900
  const PAD     = 36
  const ROW_H   = 44
  const HDR_H   = 120
  const COL_W   = Math.min(52, Math.floor((CARD_W - PAD*2 - 180) / Math.min(holes.length, 17)))
  const TOTAL_H = HDR_H + PAD + (players.length + 1) * ROW_H + PAD * 2

  const canvas = document.createElement('canvas')
  canvas.width  = CARD_W
  canvas.height = TOTAL_H
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, CARD_W, TOTAL_H)

  // Gold accent bar top
  const grad = ctx.createLinearGradient(0, 0, CARD_W, 0)
  grad.addColorStop(0, '#FFD600'); grad.addColorStop(0.5, '#fff'); grad.addColorStop(1, '#FFD600')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CARD_W, 4)

  // Logo
  const logo = new Image()
  logo.crossOrigin = 'anonymous'
  await new Promise(res => { logo.onload = res; logo.onerror = res; logo.src = '/logo.png' })
  if (logo.complete && logo.naturalWidth) {
    const lh = 48, lw = (logo.naturalWidth / logo.naturalHeight) * lh
    ctx.drawImage(logo, PAD, 16, lw, lh)
  }

  // Title
  ctx.fillStyle = '#FFD600'
  ctx.font      = 'bold 26px Inter, Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Putt N Glow', PAD, 86)

  ctx.fillStyle = '#555'
  ctx.font      = '14px Inter, Arial, sans-serif'
  ctx.fillText(`Queenstown · ${new Date().toLocaleDateString('en-NZ', { day:'numeric', month:'long', year:'numeric' })}`, PAD, 108)

  // Table setup
  const tableY   = HDR_H + PAD
  const nameColW = 180
  const holeCount = Math.min(holes.length, 17)

  // Header row
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(PAD, tableY, CARD_W - PAD*2, ROW_H)

  ctx.fillStyle = '#555'
  ctx.font      = 'bold 11px Inter, Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('PLAYER', PAD + 12, tableY + ROW_H/2 + 4)

  holes.slice(0, holeCount).forEach((h, i) => {
    const x = PAD + nameColW + i * COL_W + COL_W/2
    ctx.textAlign = 'center'
    ctx.fillText(String(i+1), x, tableY + ROW_H/2 + 4)
  })
  ctx.textAlign = 'center'
  ctx.fillText('TTL', PAD + nameColW + holeCount * COL_W + 26, tableY + ROW_H/2 + 4)

  // Divider
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(PAD, tableY + ROW_H, CARD_W - PAD*2, 1)

  // Player rows
  const lb = [...players].sort((a, b) => {
    const aTotal = holes.reduce((sum, h) => sum + (scores[h.id]?.[a.name] || 0), 0)
    const bTotal = holes.reduce((sum, h) => sum + (scores[h.id]?.[b.name] || 0), 0)
    return aTotal - bTotal
  })

  lb.forEach((player, idx) => {
    const rowY = tableY + ROW_H + idx * ROW_H
    // Alt row bg
    if (idx % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.02)'
      ctx.fillRect(PAD, rowY, CARD_W - PAD*2, ROW_H)
    }

    // Player colour bar
    ctx.fillStyle = player.color
    ctx.fillRect(PAD, rowY, 3, ROW_H)

    // Avatar circle
    ctx.fillStyle = player.color
    ctx.beginPath()
    ctx.arc(PAD + 18, rowY + ROW_H/2, 11, 0, Math.PI*2)
    ctx.fill()
    ctx.fillStyle = '#000'
    ctx.font      = 'bold 10px Inter, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(player.name[0].toUpperCase(), PAD + 18, rowY + ROW_H/2 + 4)

    // Name
    ctx.fillStyle = idx === 0 ? player.color : '#ccc'
    ctx.font      = `${idx === 0 ? 'bold' : '600'} 14px Inter, Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText(player.name, PAD + 36, rowY + ROW_H/2 + 5)

    // Scores
    let total = 0
    holes.slice(0, holeCount).forEach((h, i) => {
      const s   = scores[h.id]?.[player.name]
      const x   = PAD + nameColW + i * COL_W + COL_W/2
      ctx.textAlign = 'center'
      if (s === undefined || s === null || skippedHoles?.has(h.id)) {
        ctx.fillStyle = '#333'
        ctx.font      = '13px Inter, Arial, sans-serif'
        ctx.fillText('—', x, rowY + ROW_H/2 + 5)
      } else {
        total += s
        ctx.fillStyle = s === 1 ? '#FFD600' : s <= (h.par||3)-1 ? '#34d399' : s > (h.par||3)+1 ? '#f87171' : '#fff'
        ctx.font      = `bold 14px Inter, Arial, sans-serif`
        ctx.fillText(String(s), x, rowY + ROW_H/2 + 5)
      }
    })

    // Total
    ctx.fillStyle = idx === 0 ? '#FFD600' : '#fff'
    ctx.font      = 'bold 16px Inter, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(total), PAD + nameColW + holeCount * COL_W + 26, rowY + ROW_H/2 + 6)

    // Divider
    ctx.fillStyle = '#1e1e1e'
    ctx.fillRect(PAD, rowY + ROW_H - 1, CARD_W - PAD*2, 1)
  })

  // Bottom watermark
  ctx.fillStyle = '#2a2a2a'
  ctx.font      = '12px Inter, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('putt-n-glow.co.nz', CARD_W/2, TOTAL_H - 14)

  return canvas
}

export default function ScorecardShare({ players, holes, scores, skippedHoles }) {
  const [generating, setGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showSheet, setShowSheet]   = useState(false)

  async function generate() {
    setGenerating(true)
    try {
      const canvas = await generateScorecardPng({ players, holes, scores, skippedHoles })
      const url = canvas.toDataURL('image/png')
      setPreviewUrl(url)
      setShowSheet(true)
    } finally { setGenerating(false) }
  }

  async function download() {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href     = previewUrl
    a.download = `putt-n-glow-${Date.now()}.png`
    a.click()
  }

  async function share() {
    if (!previewUrl) return
    try {
      const res  = await fetch(previewUrl)
      const blob = await res.blob()
      const file = new File([blob], 'scorecard.png', { type:'image/png' })
      if (navigator.canShare?.({ files:[file] })) {
        await navigator.share({ files:[file], title:'Putt N Glow Scorecard', text:"Check out our mini golf scores!" })
      } else {
        download()
      }
    } catch { download() }
  }

  return (
    <>
      <button className="btn btn-ghost btn-full" onClick={generate} disabled={generating}
        style={{ gap:7, marginBottom:8 }}>
        <Share2 size={17}/>{generating ? 'Creating…' : 'Share Scorecard'}
      </button>

      {showSheet && previewUrl && (
        <div className="modal-overlay" style={{ zIndex:300 }}>
          <div className="modal-sheet" style={{ maxHeight:'90dvh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontSize:18, fontWeight:900, letterSpacing:'-0.02em', margin:0 }}>Your Scorecard</h3>
              <button onClick={() => setShowSheet(false)} style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', display:'flex' }}>
                <X size={20}/>
              </button>
            </div>
            <div style={{ borderRadius:10, overflow:'hidden', marginBottom:16 }}>
              <img src={previewUrl} alt="Scorecard" style={{ width:'100%', display:'block' }}/>
            </div>
            <div style={{ display:'flex', gap:9 }}>
              <button className="btn btn-ghost" style={{ flex:1, gap:6 }} onClick={download}>
                <Download size={16}/> Download
              </button>
              <button className="btn btn-primary" style={{ flex:2, gap:6 }} onClick={share}>
                <Share2 size={16}/> Share
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
