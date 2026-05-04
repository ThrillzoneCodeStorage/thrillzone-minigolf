import { useRef, useState } from 'react'
import { Download, Share2, X, Image } from 'lucide-react'
import { useTranslation } from '../../lib/TranslationContext'

// ── Generate scorecard image (4:5 or 9:16) ────────────────────
async function generateScorecardPng({ players, holes, scores, skippedHoles, format }) {
  const IS_STORY = format === '9:16'
  const W = 1080
  const H = IS_STORY ? 1920 : 1350  // 9:16 or 4:5

  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Dark gradient background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0a0a08')
  bg.addColorStop(0.5, '#0f0f0a')
  bg.addColorStop(1, '#0a0a00')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Gold accent corner glow
  const glow = ctx.createRadialGradient(W/2, H*0.08, 0, W/2, H*0.08, W*0.7)
  glow.addColorStop(0, 'rgba(255,214,0,0.10)')
  glow.addColorStop(1, 'rgba(255,214,0,0)')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)

  // ── Logo
  const logo = new Image(); logo.crossOrigin = 'anonymous'
  await new Promise(r => { logo.onload=r; logo.onerror=r; logo.src='/logo.png' })

  const PAD = 60
  let y = IS_STORY ? 120 : 70

  // Logo
  if (logo.complete && logo.naturalWidth) {
    const lh = IS_STORY ? 80 : 64
    const lw = (logo.naturalWidth / logo.naturalHeight) * lh
    ctx.drawImage(logo, (W-lw)/2, y, lw, lh)
    y += lh + (IS_STORY ? 24 : 18)
  }

  // ── Header text
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFD600'
  ctx.font = `900 ${IS_STORY ? 52:42}px "Inter", Arial, sans-serif`
  ctx.fillText('Putt N Glow', W/2, y)
  y += IS_STORY ? 36 : 28

  ctx.fillStyle = 'rgba(255,214,0,0.45)'
  ctx.font = `600 ${IS_STORY ? 26:22}px "Inter", Arial, sans-serif`
  ctx.fillText('Queenstown · Mini Golf', W/2, y)
  y += IS_STORY ? 24 : 18

  const date = new Date().toLocaleDateString('en-NZ', { day:'numeric', month:'long', year:'numeric' })
  ctx.fillStyle = '#444'
  ctx.font = `400 ${IS_STORY ? 22:18}px "Inter", Arial, sans-serif`
  ctx.fillText(date, W/2, y)
  y += IS_STORY ? 40 : 30

  // ── Gold divider
  ctx.strokeStyle = '#FFD600'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(PAD+60, y); ctx.lineTo(W-PAD-60, y); ctx.stroke()
  y += IS_STORY ? 40 : 30

  // ── Winner banner
  if (players.length > 0) {
    const lb = [...players].sort((a,b) => {
      const at = holes.reduce((s,h)=>s+(scores[h.id]?.[a.name]||0),0)
      const bt = holes.reduce((s,h)=>s+(scores[h.id]?.[b.name]||0),0)
      return at-bt
    })
    const winner = lb[0]
    const wTotal = holes.reduce((s,h)=>s+(scores[h.id]?.[winner.name]||0),0)

    const bannerH = IS_STORY ? 110 : 90
    // Winner card
    ctx.fillStyle = 'rgba(255,214,0,0.08)'
    roundRect(ctx, PAD, y, W-PAD*2, bannerH, 16)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,214,0,0.3)'; ctx.lineWidth = 1.5
    roundRect(ctx, PAD, y, W-PAD*2, bannerH, 16); ctx.stroke()

    // Trophy emoji replacement — gold circle
    ctx.fillStyle = '#FFD600'
    ctx.font = `900 ${IS_STORY ? 22:18}px "Inter", Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText('🏆  WINNER', PAD+28, y + (IS_STORY ? 36:30))

    ctx.fillStyle = '#FFD600'
    ctx.font = `900 ${IS_STORY ? 40:32}px "Inter", Arial, sans-serif`
    ctx.fillText(`${winner.name}`, PAD+28, y + bannerH - (IS_STORY ? 28:22))

    ctx.textAlign = 'right'
    ctx.fillStyle = '#FFD600'
    ctx.font = `900 ${IS_STORY ? 48:38}px "Inter", Arial, sans-serif`
    ctx.fillText(`${wTotal}`, W-PAD-28, y + bannerH - (IS_STORY ? 28:22))
    ctx.fillStyle = 'rgba(255,214,0,0.5)'
    ctx.font = `600 ${IS_STORY ? 20:16}px "Inter", Arial, sans-serif`
    ctx.fillText('strokes', W-PAD-28, y + (IS_STORY ? 36:30))
    ctx.textAlign = 'center'
    y += bannerH + (IS_STORY ? 32:24)
  }

  // ── Players table
  const rowH      = IS_STORY ? 70 : 58
  const nameColW  = Math.round(W * 0.28)
  const holeCount = Math.min(holes.length, 17)
  const colW      = Math.floor((W - PAD*2 - nameColW - 80) / holeCount)
  const totalColW = 80

  // Table header
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.fillRect(PAD, y, W-PAD*2, rowH*0.75)

  ctx.fillStyle = '#555'
  ctx.font = `700 ${IS_STORY ? 20:16}px "Inter", Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.fillText('PLAYER', PAD+16, y + rowH*0.48)

  holes.slice(0, holeCount).forEach((h, i) => {
    ctx.textAlign = 'center'
    ctx.fillText(String(i+1), PAD + nameColW + i*colW + colW/2, y + rowH*0.48)
  })
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFD600'
  ctx.fillText('TTL', W-PAD-totalColW/2, y + rowH*0.48)
  y += Math.round(rowH*0.75)

  // Divider
  ctx.strokeStyle = 'rgba(255,214,0,0.2)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W-PAD, y); ctx.stroke()

  // Sort by total
  const sorted = [...players].sort((a,b) => {
    const at = holes.reduce((s,h)=>s+(scores[h.id]?.[a.name]||0),0)
    const bt = holes.reduce((s,h)=>s+(scores[h.id]?.[b.name]||0),0)
    return at-bt
  })

  sorted.forEach((player, idx) => {
    const rowY = y + idx * rowH
    const isFirst = idx === 0
    const total = holes.reduce((s,h)=>s+(scores[h.id]?.[player.name]||0),0)

    // Row background
    ctx.fillStyle = isFirst ? 'rgba(255,214,0,0.05)' : idx%2===0 ? 'rgba(255,255,255,0.02)' : 'transparent'
    ctx.fillRect(PAD, rowY, W-PAD*2, rowH)

    // Colour bar
    ctx.fillStyle = player.color
    ctx.fillRect(PAD, rowY, 4, rowH)

    // Avatar circle
    ctx.fillStyle = player.color
    ctx.beginPath(); ctx.arc(PAD+26, rowY+rowH/2, IS_STORY?18:14, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#000'
    ctx.font = `900 ${IS_STORY ? 15:12}px "Inter", Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(player.name[0].toUpperCase(), PAD+26, rowY+rowH/2+5)

    // Name
    ctx.fillStyle = isFirst ? player.color : '#bbb'
    ctx.font = `${isFirst?'900':'600'} ${IS_STORY ? 26:20}px "Inter", Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.fillText(player.name, PAD+52, rowY+rowH/2+8)

    // Hole scores
    holes.slice(0, holeCount).forEach((h, i) => {
      const s = scores[h.id]?.[player.name]
      const x = PAD + nameColW + i*colW + colW/2
      ctx.textAlign = 'center'
      if (!s || skippedHoles?.has(h.id)) {
        ctx.fillStyle = '#333'
        ctx.font = `400 ${IS_STORY?20:16}px "Inter", Arial`
        ctx.fillText('—', x, rowY+rowH/2+7)
      } else {
        ctx.fillStyle = s===1?'#FFD600':s<=(h.par||3)-1?'#34d399':s>(h.par||3)+1?'#f87171':'#fff'
        ctx.font = `${s===1?'900':'700'} ${IS_STORY?22:17}px "Inter", Arial`
        ctx.fillText(String(s), x, rowY+rowH/2+7)
      }
    })

    // Total
    ctx.fillStyle = isFirst ? '#FFD600' : '#fff'
    ctx.font = `900 ${IS_STORY ? 30:24}px "Inter", Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(total > 0 ? String(total) : '—', W-PAD-totalColW/2, rowY+rowH/2+9)

    // Row divider
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(PAD, rowY+rowH); ctx.lineTo(W-PAD, rowY+rowH); ctx.stroke()
  })
  y += sorted.length * rowH + (IS_STORY ? 40:28)

  // ── Bottom gold line + watermark
  ctx.strokeStyle = 'rgba(255,214,0,0.25)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(PAD+60, H-80); ctx.lineTo(W-PAD-60, H-80); ctx.stroke()

  ctx.fillStyle = '#333'
  ctx.font = `400 ${IS_STORY?20:16}px "Inter", Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('putt-n-glow.co.nz · Queenstown, NZ', W/2, H-50)

  return canvas
}

// ── Generate photo collage ─────────────────────────────────────
async function generateCollage(photoUrls) {
  const W = 1080, H = 1350  // 4:5
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // Dark background
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H)

  // Gold top bar
  const topGrad = ctx.createLinearGradient(0,0,W,0)
  topGrad.addColorStop(0,'rgba(255,214,0,0.8)')
  topGrad.addColorStop(0.5,'rgba(255,214,0,1)')
  topGrad.addColorStop(1,'rgba(255,214,0,0.8)')
  ctx.fillStyle = topGrad; ctx.fillRect(0, 0, W, 8)

  // Load all images
  const imgs = await Promise.all(photoUrls.slice(0,6).map(u => new Promise(res => {
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => res(img); img.onerror = () => res(null); img.src = u
  })))
  const loaded = imgs.filter(Boolean)
  const n = loaded.length

  // Layout based on count
  const HEADER = 160, FOOTER = 120, PAD = 14
  const gridH = H - HEADER - FOOTER

  const layouts = {
    1: [[0,0,1,1]],
    2: [[0,0,0.5,1],[0.5,0,0.5,1]],
    3: [[0,0,1,0.55],[0,0.55,0.5,0.45],[0.5,0.55,0.5,0.45]],
    4: [[0,0,0.5,0.5],[0.5,0,0.5,0.5],[0,0.5,0.5,0.5],[0.5,0.5,0.5,0.5]],
    5: [[0,0,0.6,0.55],[0.6,0,0.4,0.55],[0,0.55,0.33,0.45],[0.33,0.55,0.34,0.45],[0.67,0.55,0.33,0.45]],
    6: [[0,0,0.33,0.5],[0.33,0,0.34,0.5],[0.67,0,0.33,0.5],[0,0.5,0.33,0.5],[0.33,0.5,0.34,0.5],[0.67,0.5,0.33,0.5]],
  }

  const cells = layouts[Math.min(n, 6)] || layouts[6]

  cells.forEach((cell, i) => {
    if (!loaded[i]) return
    const [cx, cy, cw, ch] = cell
    const rx = Math.round(PAD/2 + cx*(W-PAD))
    const ry = Math.round(HEADER + PAD/2 + cy*(gridH-PAD))
    const rw = Math.round(cw*(W-PAD) - PAD)
    const rh = Math.round(ch*(gridH-PAD) - PAD)

    ctx.save()
    roundRect(ctx, rx, ry, rw, rh, 10); ctx.clip()

    const img = loaded[i]
    const scale = Math.max(rw/img.naturalWidth, rh/img.naturalHeight)
    const dw = img.naturalWidth*scale, dh = img.naturalHeight*scale
    ctx.drawImage(img, rx+(rw-dw)/2, ry+(rh-dh)/2, dw, dh)

    // Subtle vignette on each cell
    const vg = ctx.createLinearGradient(rx,ry,rx,ry+rh)
    vg.addColorStop(0,'rgba(0,0,0,0.25)')
    vg.addColorStop(0.4,'rgba(0,0,0,0)')
    vg.addColorStop(1,'rgba(0,0,0,0.35)')
    ctx.fillStyle = vg; ctx.fillRect(rx,ry,rw,rh)
    ctx.restore()

    // Cell number badge
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.beginPath(); ctx.arc(rx+22, ry+22, 14, 0, Math.PI*2); ctx.fill()
    ctx.fillStyle = '#FFD600'; ctx.font = 'bold 14px Inter, Arial'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(String(i+1), rx+22, ry+22)
  })

  // Header
  const logo = new Image(); logo.crossOrigin = 'anonymous'
  await new Promise(r => { logo.onload=r; logo.onerror=r; logo.src='/logo.png' })
  if (logo.complete && logo.naturalWidth) {
    const lh = 54, lw = (logo.naturalWidth/logo.naturalHeight)*lh
    ctx.drawImage(logo, (W-lw)/2, 18, lw, lh)
  }
  ctx.fillStyle = '#FFD600'; ctx.font = 'bold 28px Inter, Arial'
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
  ctx.fillText('Putt N Glow Memories', W/2, 114)
  ctx.fillStyle = '#555'; ctx.font = '18px Inter, Arial'
  ctx.fillText(new Date().toLocaleDateString('en-NZ', {day:'numeric',month:'long',year:'numeric'}), W/2, 142)

  // Footer
  ctx.fillStyle = '#333'; ctx.font = '18px Inter, Arial'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('putt-n-glow.co.nz · Queenstown', W/2, H-60)
  // Bottom gold bar
  ctx.fillStyle = topGrad; ctx.fillRect(0, H-8, W, 8)

  return canvas
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x+r, y)
  ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r)
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h)
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r)
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y)
  ctx.closePath()
}

async function shareCanvas(canvas, filename) {
  const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.93))
  const url  = URL.createObjectURL(blob)
  const file = new File([blob], filename, { type:'image/jpeg' })
  try {
    if (navigator.canShare?.({ files:[file] })) {
      await navigator.share({ files:[file], title:'Putt N Glow', text:"Check out our mini golf scorecard!" })
    } else {
      const a = document.createElement('a'); a.href=url; a.download=filename; a.click()
    }
  } finally { setTimeout(()=>URL.revokeObjectURL(url), 2000) }
}

// ── Component ──────────────────────────────────────────────────
export default function ScorecardShare({ players, holes, scores, skippedHoles, photos = [] }) {
  const t = useTranslation()
  const [generating, setGenerating]         = useState(false)
  const [showFormatPicker, setShowFormatPicker] = useState(false)
  const [showPhotoPicker,  setShowPhotoPicker]  = useState(false)
  const [previewUrl, setPreviewUrl]         = useState(null)
  const [previewCanvas, setPreviewCanvas]   = useState(null)
  const [showPreview, setShowPreview]       = useState(false)

  async function generateScorecard(fmt) {
    setShowFormatPicker(false); setGenerating(true)
    try {
      const canvas = await generateScorecardPng({ players, holes, scores, skippedHoles, format:fmt })
      setPreviewCanvas(canvas)
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.93))
      setShowPreview(true)
    } finally { setGenerating(false) }
  }

  async function handleShare() {
    if (!previewCanvas) return
    await shareCanvas(previewCanvas, `putt-n-glow-scorecard-${Date.now()}.jpg`)
  }

  async function generatePhotoCollage() {
    setShowPhotoPicker(false); setGenerating(true)
    try {
      const canvas = await generateCollage(photos)
      setPreviewCanvas(canvas)
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.93))
      setShowPreview(true)
    } finally { setGenerating(false) }
  }

  return (
    <>
      {/* Scorecard share button */}
      <button className="btn btn-ghost btn-full" onClick={() => setShowFormatPicker(true)}
        disabled={generating} style={{ gap:7, marginBottom:8 }}>
        <Share2 size={17}/>{generating ? t.creating : t.shareScorecard}
      </button>

      {/* Photo collage button — only if photos exist */}
      {photos.length >= 2 && (
        <button className="btn btn-ghost btn-full" onClick={() => setShowPhotoPicker(true)}
          disabled={generating} style={{ gap:7, marginBottom:8 }}>
          <Image size={17}/>Share Photo Collage
        </button>
      )}

      {/* Format picker */}
      {showFormatPicker && (
        <div className="modal-center" style={{ zIndex:350 }}>
          <div className="modal-box" style={{ textAlign:'center' }}>
            <h3 style={{ fontSize:19, fontWeight:900, letterSpacing:'-0.02em', marginBottom:6 }}>Share Scorecard</h3>
            <p style={{ fontSize:14, color:'var(--text-2)', marginBottom:22 }}>Choose your format</p>
            <div style={{ display:'flex', gap:12, marginBottom:14 }}>
              {[['4:5','Feed Post','Instagram, Facebook'],['9:16','Story','Instagram, TikTok']].map(([fmt,label,sub])=>(
                <button key={fmt} onClick={()=>generateScorecard(fmt)}
                  style={{ flex:1, background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:14, padding:'16px 10px', cursor:'pointer', fontFamily:'inherit' }}>
                  <div style={{ fontSize:26, fontWeight:900, color:'var(--yellow)', marginBottom:6 }}>{fmt}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>{sub}</div>
                  <div style={{ width:fmt==='4:5'?36:22, height:fmt==='4:5'?45:40, background:'rgba(255,214,0,0.15)', border:'1.5px solid rgba(255,214,0,0.3)', borderRadius:4, margin:'10px auto 0' }}/>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-full btn-sm" onClick={()=>setShowFormatPicker(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Photo collage picker */}
      {showPhotoPicker && (
        <div className="modal-center" style={{ zIndex:350 }}>
          <div className="modal-box" style={{ textAlign:'center' }}>
            <h3 style={{ fontSize:19, fontWeight:900, letterSpacing:'-0.02em', marginBottom:6 }}>Share Photos</h3>
            <p style={{ fontSize:14, color:'var(--text-2)', marginBottom:22 }}>
              You have {photos.length} Polaroid{photos.length!==1?'s':''} from today
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
              {photos.map((url,i)=>(
                <button key={i} onClick={async()=>{
                  setShowPhotoPicker(false); setGenerating(true)
                  try {
                    const img = new Image(); img.crossOrigin='anonymous'
                    await new Promise(r=>{img.onload=r;img.onerror=r;img.src=url})
                    const c = document.createElement('canvas'); c.width=img.naturalWidth; c.height=img.naturalHeight
                    c.getContext('2d').drawImage(img,0,0)
                    await shareCanvas(c, `putt-n-glow-photo-${i+1}.jpg`)
                  } finally { setGenerating(false) }
                }}
                  style={{ display:'flex', alignItems:'center', gap:12, background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
                  <img src={url} alt="" style={{ width:44, height:55, objectFit:'cover', borderRadius:4 }}/>
                  <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>Photo {i+1}</span>
                  <Share2 size={14} style={{ marginLeft:'auto', color:'var(--text-3)' }}/>
                </button>
              ))}
              <button onClick={generatePhotoCollage}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'rgba(255,214,0,0.08)', border:'1px solid rgba(255,214,0,0.25)', borderRadius:10, padding:'12px', cursor:'pointer', fontFamily:'inherit', color:'var(--yellow)', fontWeight:800, fontSize:14 }}>
                <Image size={16}/> All photos as collage
              </button>
            </div>
            <button className="btn btn-ghost btn-full btn-sm" onClick={()=>setShowPhotoPicker(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Preview sheet */}
      {showPreview && previewUrl && (
        <div className="modal-overlay" style={{ zIndex:300 }}>
          <div className="modal-sheet" style={{ maxHeight:'90dvh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ fontSize:18, fontWeight:900, letterSpacing:'-0.02em', margin:0 }}>Preview</h3>
              <button onClick={()=>{setShowPreview(false);setPreviewUrl(null)}} style={{ background:'none',border:'none',color:'var(--text-2)',cursor:'pointer',display:'flex' }}><X size={20}/></button>
            </div>
            <div style={{ borderRadius:10, overflow:'hidden', marginBottom:14 }}>
              <img src={previewUrl} alt="Preview" style={{ width:'100%', display:'block' }}/>
            </div>
            <button className="btn btn-primary btn-full" style={{ gap:8 }} onClick={handleShare}>
              <Share2 size={16}/>{t.share}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
