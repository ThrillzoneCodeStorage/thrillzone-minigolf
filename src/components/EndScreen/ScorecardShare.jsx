import { useRef, useState } from 'react'
import { Download, Share2, X } from 'lucide-react'
import { useTranslation } from '../../lib/TranslationContext'

// Generate scorecard PNG on a canvas
async function generateScorecardPng({ players, holes, scores, skippedHoles, format = '4:5' }) {
  // format: '4:5' (feed post) or '9:16' (story)
  const IS_STORY = format === '9:16'
  const CARD_W  = IS_STORY ? 1080 : 1080
  const PAD     = 44
  const ROW_H   = IS_STORY ? 52 : 44
  const HDR_H   = IS_STORY ? 280 : 140
  const COL_W   = Math.min(52, Math.floor((CARD_W - PAD*2 - 200) / Math.min(holes.length, 17)))
  const CONTENT_H = PAD + (players.length + 1) * ROW_H + PAD * 2
  const TOTAL_H = IS_STORY
    ? Math.max(1920, HDR_H + CONTENT_H + 200)  // 9:16
    : Math.max(1350, HDR_H + CONTENT_H + 100)  // 4:5

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
  const t = useTranslation()
  const [generating, setGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showSheet, setShowSheet]   = useState(false)
  const [showFormatPicker, setShowFormatPicker] = useState(false)
  const [format, setFormat]         = useState(null)

  async function generate(fmt) {
    setFormat(fmt)
    setShowFormatPicker(false)
    setGenerating(true)
    try {
      const canvas = await generateScorecardPng({ players, holes, scores, skippedHoles, format: fmt })
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
      <button className="btn btn-ghost btn-full" onClick={() => setShowFormatPicker(true)} disabled={generating}
        style={{ gap:7, marginBottom:8 }}>
        <Share2 size={17}/>{generating ? t.creating : t.shareScorecard}
      </button>

      {/* Format picker modal */}
      {showFormatPicker && (
        <div className="modal-center" style={{ zIndex:350 }}>
          <div className="modal-box" style={{ textAlign:'center' }}>
            <h3 style={{ fontSize:19, fontWeight:900, letterSpacing:'-0.02em', marginBottom:8 }}>Choose format</h3>
            <p style={{ fontSize:14, color:'var(--text-2)', marginBottom:22 }}>What format would you like to share?</p>
            <div style={{ display:'flex', gap:12, marginBottom:14 }}>
              <button onClick={() => generate('4:5')}
                style={{ flex:1, background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 10px', cursor:'pointer', fontFamily:'inherit', transition:'border-color 0.15s' }}>
                <div style={{ fontSize:28, fontWeight:900, color:'var(--yellow)', marginBottom:6, letterSpacing:'-0.03em' }}>4:5</div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', marginBottom:4 }}>Feed Post</div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>Instagram, Facebook</div>
                {/* Preview shape */}
                <div style={{ width:32, height:40, background:'rgba(255,214,0,0.15)', border:'1.5px solid rgba(255,214,0,0.3)', borderRadius:4, margin:'10px auto 0' }}/>
              </button>
              <button onClick={() => generate('9:16')}
                style={{ flex:1, background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 10px', cursor:'pointer', fontFamily:'inherit', transition:'border-color 0.15s' }}>
                <div style={{ fontSize:28, fontWeight:900, color:'var(--yellow)', marginBottom:6, letterSpacing:'-0.03em' }}>9:16</div>
                <div style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', marginBottom:4 }}>Story / Reel</div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>Instagram Stories, TikTok</div>
                {/* Preview shape */}
                <div style={{ width:22, height:40, background:'rgba(255,214,0,0.15)', border:'1.5px solid rgba(255,214,0,0.3)', borderRadius:4, margin:'10px auto 0' }}/>
              </button>
            </div>
            <button className="btn btn-ghost btn-full btn-sm" onClick={() => setShowFormatPicker(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showSheet && previewUrl && (
        <div className="modal-overlay" style={{ zIndex:300 }}>
          <div className="modal-sheet" style={{ maxHeight:'90dvh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontSize:18, fontWeight:900, letterSpacing:'-0.02em', margin:0 }}>{t.yourScorecard}</h3>
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
