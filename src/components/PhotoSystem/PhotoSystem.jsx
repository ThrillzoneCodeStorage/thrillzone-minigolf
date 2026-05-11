import { useRef, useState, useEffect } from 'react'
import { Camera, X, RotateCcw, Check, SwitchCamera, Zap, ZapOff } from 'lucide-react'
import { useGame } from '../../context/GameContext'
import { useTranslation } from '../../lib/TranslationContext'

// ── Polaroid composer — fixed 4:5, big logo + date ─────────────
const POLAROID_W = 1080
const POLAROID_H = 1350
const SIDE       = 36    // side + top white border
const BOT        = 220   // bottom label height — bigger for logo/date
const PHOTO_W    = POLAROID_W - SIDE * 2
const PHOTO_H    = POLAROID_H - SIDE - BOT

export function composePolaroid(photoBlob, isFrontCamera = false) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(photoBlob)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = POLAROID_W; canvas.height = POLAROID_H
      const ctx = canvas.getContext('2d')

      // ── White polaroid background
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, POLAROID_W, POLAROID_H)

      // ── Photo — cover-crop centred
      ctx.save()
      ctx.beginPath(); ctx.rect(SIDE, SIDE, PHOTO_W, PHOTO_H); ctx.clip()
      const iw = img.naturalWidth || img.width
      const ih = img.naturalHeight || img.height
      const scale = Math.max(PHOTO_W / iw, PHOTO_H / ih)
      const dw = iw * scale, dh = ih * scale
      const dx = SIDE + (PHOTO_W - dw) / 2
      const dy = SIDE + (PHOTO_H - dh) / 2
      if (isFrontCamera) { ctx.translate(POLAROID_W, 0); ctx.scale(-1, 1) }
      ctx.drawImage(img, isFrontCamera ? -(POLAROID_W - dx - dw) : dx, dy, dw, dh)
      ctx.restore()

      // ── Subtle inner shadow on photo edges
      const shadow = ctx.createLinearGradient(SIDE, SIDE, SIDE, SIDE + 60)
      shadow.addColorStop(0, 'rgba(0,0,0,0.18)'); shadow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = shadow; ctx.fillRect(SIDE, SIDE, PHOTO_W, 60)

      // ── Photo frame border
      ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1.5
      ctx.strokeRect(SIDE, SIDE, PHOTO_W, PHOTO_H)

      // ── Label area
      const labelY = SIDE + PHOTO_H
      const mid    = POLAROID_W / 2

      // Date — large and clear
      const dateStr = new Date().toLocaleDateString('en-NZ', { day:'numeric', month:'long', year:'numeric' })
      ctx.fillStyle = '#555'
      ctx.font = 'bold 32px Georgia, "Times New Roman", serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(dateStr, mid, labelY + 18)

      // Thin gold divider
      ctx.strokeStyle = '#FFD600'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(SIDE + 60, labelY + 66); ctx.lineTo(POLAROID_W - SIDE - 60, labelY + 66); ctx.stroke()

      // Logo
      const logo = new Image(); logo.crossOrigin = 'anonymous'
      logo.onload = () => {
        const maxH = 88, maxW = POLAROID_W - SIDE * 5
        const r = logo.naturalWidth / logo.naturalHeight
        let lw = maxH * r, lh = maxH
        if (lw > maxW) { lw = maxW; lh = lw / r }
        ctx.drawImage(logo, (POLAROID_W - lw) / 2, labelY + 80, lw, lh)

        // Venue line
        ctx.fillStyle = '#bbb'
        ctx.font = '22px Inter, Arial, sans-serif'
        ctx.textBaseline = 'bottom'
        ctx.fillText('Putt N Glow · Queenstown', mid, POLAROID_H - 16)

        canvas.toBlob(b => {
          if (b) resolve(b)
          else reject(new Error('Canvas toBlob returned null'))
        }, 'image/jpeg', 0.92)
      }
      logo.onerror = () => {
        // Fallback text logo
        ctx.fillStyle = '#111'; ctx.font = 'bold 44px Georgia, serif'
        ctx.textBaseline = 'middle'; ctx.textAlign = 'center'
        ctx.fillText('PUTT N GLOW', mid, labelY + 120)
        canvas.toBlob(b => {
          if (b) resolve(b)
          else reject(new Error('Canvas toBlob returned null'))
        }, 'image/jpeg', 0.92)
      }
      logo.src = '/logo.png'
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

// ── Leaderboard photo composer — same shape, no logo, bigger date ──
export function composeLeaderboardPhoto(photoBlob, isFrontCamera = false) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(photoBlob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = POLAROID_W; canvas.height = POLAROID_H
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, POLAROID_W, POLAROID_H)

      ctx.save()
      ctx.beginPath(); ctx.rect(SIDE, SIDE, PHOTO_W, PHOTO_H); ctx.clip()
      const iw = img.naturalWidth || img.width
      const ih = img.naturalHeight || img.height
      const scale = Math.max(PHOTO_W / iw, PHOTO_H / ih)
      const dw = iw * scale, dh = ih * scale
      const dx = SIDE + (PHOTO_W - dw) / 2
      const dy = SIDE + (PHOTO_H - dh) / 2
      if (isFrontCamera) { ctx.translate(POLAROID_W, 0); ctx.scale(-1, 1) }
      ctx.drawImage(img, isFrontCamera ? -(POLAROID_W - dx - dw) : dx, dy, dw, dh)
      ctx.restore()

      ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1.5
      ctx.strokeRect(SIDE, SIDE, PHOTO_W, PHOTO_H)

      const labelY = SIDE + PHOTO_H
      const mid    = POLAROID_W / 2

      // Bigger date, no logo — centred in the label
      const dateStr = new Date().toLocaleDateString('en-NZ', { day:'numeric', month:'long', year:'numeric' })
      ctx.fillStyle = '#333'
      ctx.font = 'bold 48px Georgia, "Times New Roman", serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(dateStr, mid, labelY + BOT / 2)

      // Gold line accent
      ctx.strokeStyle = '#FFD600'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(SIDE + 60, labelY + BOT / 2 + 38); ctx.lineTo(POLAROID_W - SIDE - 60, labelY + BOT / 2 + 38); ctx.stroke()

      canvas.toBlob(b => {
        if (b) resolve(b)
        else reject(new Error('Canvas toBlob returned null'))
      }, 'image/jpeg', 0.92)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}


// ── Polaroid composer — always 4:5 (1080×1350) ───────────────

export function CameraNavButton({ onClick, photoCount }) {
  return (
    <button onClick={onClick} aria-label="Open photo gallery"
      style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, background:'var(--bg-card-2)', border:'1.5px solid var(--border)', borderRadius:12, padding:'10px 14px', cursor:'pointer', minHeight:52, minWidth:60, flexShrink:0 }}>
      <Camera size={20} color="var(--text-2)" strokeWidth={1.75}/>
      <span style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', letterSpacing:'0.02em' }}>Photos</span>
      {photoCount > 0 && (
        <span style={{ position:'absolute', top:-5, right:-5, background:'var(--yellow)', color:'#000', fontSize:10, fontWeight:900, width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--bg)' }}>
          {photoCount}
        </span>
      )}
    </button>
  )
}

// ── Full-screen camera ────────────────────────────────────────
function FullScreenCamera({ onCapture, onClose }) {
  const t = useTranslation()
  const videoRef      = useRef(null)
  const streamRef     = useRef(null)
  const [facingMode, setFacingMode] = useState('user')  // user = front, environment = back
  const [flashOn,    setFlashOn]    = useState(false)
  const [hasBack,    setHasBack]    = useState(false)
  const [flashSupported, setFlashSupported] = useState(false)
  const [error,      setError]      = useState(null)
  const [starting,   setStarting]   = useState(true)
  const [flashing,   setFlashing]   = useState(false)

  async function startCamera(facing) {
    setStarting(true)
    streamRef.current?.getTracks().forEach(t => t.stop())
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width:{ ideal:1920 }, height:{ ideal:1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      // Check torch support
      const track = stream.getVideoTracks()[0]
      const caps  = track.getCapabilities?.() || {}
      setFlashSupported(!!caps.torch)
      // Check if back camera exists
      const devices = await navigator.mediaDevices.enumerateDevices()
      setHasBack(devices.filter(d => d.kind === 'videoinput').length > 1)
    } catch (err) {
      let msg = 'Could not access camera.'
      if (err.name === 'NotAllowedError')  msg = 'Camera permission denied. Tap Allow in your browser settings.'
      if (err.name === 'NotFoundError')    msg = t.cameraNotFound
      if (err.name === 'NotReadableError') msg = 'Camera is in use by another app.'
      if (location.protocol !== 'https:' && location.hostname !== 'localhost')
        msg = 'Camera requires HTTPS. Use the live site URL.'
      setError(msg)
    } finally { setStarting(false) }
  }

  useEffect(() => {
    startCamera('user')
    return () => streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  async function toggleFlash() {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const next = !flashOn
    try { await track.applyConstraints({ advanced: [{ torch: next }] }) } catch {}
    setFlashOn(next)
  }

  async function flipCamera() {
    const next = facingMode === 'user' ? 'environment' : 'user'
    if (flashOn) {
      const track = streamRef.current?.getVideoTracks()[0]
      try { await track?.applyConstraints({ advanced: [{ torch: false }] }) } catch {}
      setFlashOn(false)
    }
    setFacingMode(next)
    await startCamera(next)
  }

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

    // Flash effect
    setFlashing(true)
    setTimeout(() => setFlashing(false), 250)

    const canvas = document.createElement('canvas')
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')

    // Mirror only front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(blob => {
      onCapture(blob, facingMode === 'user')
    }, 'image/jpeg', 0.94)
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'#000', display:'flex', flexDirection:'column' }}>
      {/* Flash overlay */}
      {flashing && <div style={{ position:'absolute', inset:0, background:'#fff', zIndex:10, opacity:0.85, pointerEvents:'none', transition:'opacity 0.25s' }}/>}

      {/* Video */}
      <video ref={videoRef} playsInline muted
        style={{ flex:1, width:'100%', objectFit:'cover', display:'block', transform: facingMode==='user' ? 'scaleX(-1)' : 'none' }}
      />

      {/* Top controls */}
      <div style={{ position:'absolute', top:0, left:0, right:0, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
        <button onClick={onClose}
          style={{ width:40, height:40, borderRadius:'50%', background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <X size={20}/>
        </button>

        <div style={{ display:'flex', gap:12 }}>
          {/* Flash toggle — only show if supported and back camera */}
          {flashSupported && facingMode === 'environment' && (
            <button onClick={toggleFlash}
              style={{ width:40, height:40, borderRadius:'50%', background:flashOn?'rgba(255,214,0,0.3)':'rgba(0,0,0,0.5)', border:`1px solid ${flashOn?'rgba(255,214,0,0.6)':'rgba(255,255,255,0.2)'}`, color:flashOn?'#FFD600':'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {flashOn ? <Zap size={18} fill="#FFD600"/> : <ZapOff size={18}/>}
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:32, textAlign:'center', background:'#000' }}>
          <Camera size={48} color="#555" style={{ marginBottom:16 }}/>
          <p style={{ color:'#aaa', fontSize:15, lineHeight:1.65, marginBottom:20 }}>{error}</p>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      )}

      {/* Bottom controls */}
      {!error && (
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'24px 32px 40px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
          {/* Flip camera */}
          {hasBack ? (
            <button onClick={flipCamera}
              style={{ width:48, height:48, borderRadius:'50%', background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <SwitchCamera size={22}/>
            </button>
          ) : <div style={{ width:48 }}/>}

          {/* Shutter */}
          <button onClick={capture} disabled={starting}
            style={{ width:80, height:80, borderRadius:'50%', background:'#fff', border:'5px solid rgba(255,255,255,0.4)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.1s', opacity:starting?0.5:1 }}
            onTouchStart={e => e.currentTarget.style.transform='scale(0.9)'}
            onTouchEnd={e => e.currentTarget.style.transform=''}
          >
            <div style={{ width:62, height:62, borderRadius:'50%', background:'#fff', border:'3px solid #ddd' }}/>
          </button>

          {/* Spacer to balance layout */}
          <div style={{ width:48 }}/>
        </div>
      )}

      {/* Viewfinder corners */}
      {!error && ['tl','tr','bl','br'].map(pos => (
        <div key={pos} style={{
          position:'absolute',
          top:    pos.startsWith('t') ? 70  : undefined,
          bottom: pos.startsWith('b') ? 100 : undefined,
          left:   pos.endsWith('l')   ? 20  : undefined,
          right:  pos.endsWith('r')   ? 20  : undefined,
          width:22, height:22,
          borderTop:    pos.startsWith('t') ? '2px solid rgba(255,255,255,0.5)' : 'none',
          borderBottom: pos.startsWith('b') ? '2px solid rgba(255,255,255,0.5)' : 'none',
          borderLeft:   pos.endsWith('l')   ? '2px solid rgba(255,255,255,0.5)' : 'none',
          borderRight:  pos.endsWith('r')   ? '2px solid rgba(255,255,255,0.5)' : 'none',
        }}/>
      ))}
    </div>
  )
}

// ── Polaroid preview card ─────────────────────────────────────
function PolaroidPreview({ url, label }) {
  return (
    <div style={{ background:'#fff', padding:'10px 10px 0', borderRadius:4, boxShadow:'0 8px 32px rgba(0,0,0,0.5)', maxWidth:320, margin:'0 auto' }}>
      <img src={url} alt="Preview" style={{ width:'100%', display:'block', borderRadius:2 }}/>
      <div style={{ padding:'10px 0 12px', textAlign:'center' }}>
        {label && <p style={{ fontSize:11, color:'#aaa', fontFamily:'Georgia,serif', marginBottom:6 }}>{label}</p>}
        <img src="/logo.png" alt="logo" style={{ maxWidth:'75%', maxHeight:44, objectFit:'contain', display:'block', margin:'0 auto' }}/>
      </div>
    </div>
  )
}

// ── Collage generator ────────────────────────────────────────
async function buildCollage(photoUrls) {
  const W = 1080, H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')

  // Dark branded background
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H)
  const topGrad = ctx.createLinearGradient(0,0,W,0)
  topGrad.addColorStop(0,'#cc9900'); topGrad.addColorStop(0.5,'#FFD600'); topGrad.addColorStop(1,'#cc9900')
  ctx.fillStyle = topGrad; ctx.fillRect(0, 0, W, 8)
  ctx.fillRect(0, H-8, W, 8)

  const imgs = await Promise.all(photoUrls.slice(0,6).map(u => new Promise(res => {
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => res(img); img.onerror = () => res(null); img.src = u
  })))
  const loaded = imgs.filter(Boolean)
  const n = loaded.length

  const HEADER = 150, FOOTER = 100, PAD = 10
  const gridH = H - HEADER - FOOTER
  const layouts = {
    2: [[0,0,0.5,1],[0.5,0,0.5,1]],
    3: [[0,0,1,0.5],[0,0.5,0.5,0.5],[0.5,0.5,0.5,0.5]],
    4: [[0,0,0.5,0.5],[0.5,0,0.5,0.5],[0,0.5,0.5,0.5],[0.5,0.5,0.5,0.5]],
    5: [[0,0,0.6,0.55],[0.6,0,0.4,0.55],[0,0.55,0.33,0.45],[0.33,0.55,0.34,0.45],[0.67,0.55,0.33,0.45]],
    6: [[0,0,0.33,0.5],[0.33,0,0.34,0.5],[0.67,0,0.33,0.5],[0,0.5,0.33,0.5],[0.33,0.5,0.34,0.5],[0.67,0.5,0.33,0.5]],
  }
  const cells = layouts[Math.min(n,6)] || layouts[6]

  // Round rect helper
  function rr(x,y,w,h,r) {
    ctx.beginPath(); ctx.moveTo(x+r,y)
    ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r)
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r)
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath()
  }

  cells.forEach(([cx,cy,cw,ch],i) => {
    if (!loaded[i]) return
    const rx = Math.round(PAD + cx*(W-PAD*2))
    const ry = Math.round(HEADER + PAD + cy*(gridH-PAD*2))
    const rw = Math.round(cw*(W-PAD*2) - PAD)
    const rh = Math.round(ch*(gridH-PAD*2) - PAD)
    ctx.save(); rr(rx,ry,rw,rh,8); ctx.clip()
    const img = loaded[i]
    const scale = Math.max(rw/img.naturalWidth, rh/img.naturalHeight)
    const dw = img.naturalWidth*scale, dh = img.naturalHeight*scale
    ctx.drawImage(img, rx+(rw-dw)/2, ry+(rh-dh)/2, dw, dh)
    // Subtle vignette
    const vg = ctx.createLinearGradient(rx,ry,rx,ry+rh)
    vg.addColorStop(0,'rgba(0,0,0,0.2)'); vg.addColorStop(0.5,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.3)')
    ctx.fillStyle=vg; ctx.fillRect(rx,ry,rw,rh)
    ctx.restore()
  })

  // Load logo for header
  const logo = new Image(); logo.crossOrigin = 'anonymous'
  await new Promise(r => { logo.onload=r; logo.onerror=r; logo.src='/logo.png' })
  if (logo.complete && logo.naturalWidth) {
    const lh=50, lw=(logo.naturalWidth/logo.naturalHeight)*lh
    ctx.drawImage(logo, (W-lw)/2, 16, lw, lh)
  }
  // Header text
  ctx.fillStyle='#FFD600'; ctx.font='bold 30px Inter,Arial'; ctx.textAlign='center'; ctx.textBaseline='alphabetic'
  ctx.fillText('Putt N Glow Memories', W/2, 108)
  ctx.fillStyle='#555'; ctx.font='18px Inter,Arial'
  ctx.fillText(new Date().toLocaleDateString('en-NZ',{day:'numeric',month:'long',year:'numeric'}), W/2, 136)

  return new Promise(r => canvas.toBlob(b => r(b), 'image/jpeg', 0.92))
}

function CollageButton({ photos }) {
  const [building, setBuilding] = useState(false)
  const [error,    setError]    = useState(null)

  async function generate() {
    setBuilding(true); setError(null)
    try {
      const blob = await buildCollage(photos)
      if (!blob) throw new Error('Failed to create collage')
      const url  = URL.createObjectURL(blob)
      const file = new File([blob], `putt-n-glow-collage-${Date.now()}.jpg`, { type:'image/jpeg' })
      if (navigator.canShare?.({ files:[file] })) {
        await navigator.share({ files:[file], title:'Putt N Glow Memories' })
      } else {
        const a = document.createElement('a'); a.href=url; a.download=file.name; a.click()
      }
      setTimeout(() => URL.revokeObjectURL(url), 3000)
    } catch(e) {
      setError(e.message || 'Could not create collage')
    } finally { setBuilding(false) }
  }

  return (
    <div style={{ marginBottom:8 }}>
      <button className="btn btn-ghost btn-full" onClick={generate} disabled={building} style={{ gap:7, border:'1px solid rgba(255,214,0,0.25)', color:'var(--yellow)' }}>
        {building ? (
          <><span style={{ width:14,height:14,border:'2px solid rgba(255,214,0,0.3)',borderTopColor:'var(--yellow)',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }}/> Creating collage…</>
        ) : <>🖼️ Share all as collage</>}
      </button>
      {error && <p style={{ color:'#ff5252', fontSize:12, textAlign:'center', marginTop:6 }}>{error}</p>}
    </div>
  )
}

// ── Photo Gallery Sheet ───────────────────────────────────────
export function PhotoGallery({ onClose }) {
  const { photos, addPhoto } = useGame()
  const t = useTranslation()
  const [showCamera,    setShowCamera]    = useState(false)
  const [capturedBlob,  setCapturedBlob]  = useState(null)
  const [isFront,       setIsFront]       = useState(true)
  const [previewUrl,    setPreviewUrl]    = useState(null)
  const [processing,    setProcessing]    = useState(false)
  const [carouselIdx,   setCarouselIdx]   = useState(Math.max(0, photos.length - 1))

  const dateLabel = new Date().toLocaleDateString('en-NZ', { day:'numeric', month:'long', year:'numeric' })

  function handleCapture(blob, front) {
    setIsFront(front)
    setCapturedBlob(blob)
    setPreviewUrl(URL.createObjectURL(blob))
    setShowCamera(false)
  }

  function retake() {
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
    setCapturedBlob(null)
    setShowCamera(true)
  }

  const [saveError, setSaveError] = useState(null)
  const [saved,     setSaved]     = useState(false)

  async function confirmPhoto() {
    if (!capturedBlob) return
    setProcessing(true); setSaveError(null)
    try {
      const polaroid = await composePolaroid(capturedBlob, isFront)
      if (!polaroid) throw new Error('Photo processing failed — please try again.')
      await addPhoto(polaroid)
      setSaved(true)
      setCarouselIdx(photos.length)
      // Auto-close preview after success
      setTimeout(() => {
        if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
        setCapturedBlob(null); setSaved(false)
      }, 1400)
    } catch (err) {
      setSaveError(err.message || 'Could not save photo. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  // Full-screen camera
  if (showCamera) return (
    <FullScreenCamera
      onCapture={handleCapture}
      onClose={() => setShowCamera(false)}
    />
  )

  // Preview confirm — shown after capture
  if (capturedBlob && previewUrl) return (
    <div className="modal-overlay" style={{ zIndex:150 }}>
      <div className="modal-sheet" style={{ maxHeight:'94dvh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ fontSize:19, fontWeight:900, letterSpacing:'-0.02em', margin:0 }}>{t.saveMemory}</h3>
          <button onClick={retake} style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:13, fontFamily:'inherit', fontWeight:600 }}>
            <RotateCcw size={15}/> Retake
          </button>
        </div>
        <div style={{ marginBottom:20 }}>
          <PolaroidPreview url={previewUrl} label={dateLabel}/>
        </div>
        {/* Error state */}
        {saveError && (
          <div style={{ background:'rgba(255,59,59,0.10)', border:'1px solid rgba(255,59,59,0.3)',
            borderRadius:10, padding:'10px 14px', marginBottom:12, display:'flex', gap:10, alignItems:'flex-start' }}>
            <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
            <div>
              <p style={{ color:'#ff5252', fontSize:13, fontWeight:700, margin:'0 0 2px' }}>Photo not saved</p>
              <p style={{ color:'rgba(255,82,82,0.7)', fontSize:12, margin:0 }}>{saveError}</p>
            </div>
          </div>
        )}
        {/* Success state */}
        {saved && (
          <div style={{ background:'rgba(52,211,153,0.10)', border:'1px solid rgba(52,211,153,0.3)',
            borderRadius:10, padding:'12px 14px', marginBottom:12, textAlign:'center' }}>
            <p style={{ color:'#34d399', fontSize:14, fontWeight:700, margin:0 }}>✓ Polaroid saved!</p>
          </div>
        )}
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost" onClick={() => {
            if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
            setCapturedBlob(null); setSaveError(null); setSaved(false)
          }} style={{ flex:1 }} disabled={processing || saved}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={confirmPhoto}
            disabled={processing || saved} style={{ flex:2, gap:7 }}>
            {saved ? '✓ Saved!' : processing ? (
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)',
                  borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/>
                Saving…
              </span>
            ) : saveError ? 'Try Again' : t.savePolaroid}
          </button>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  // Gallery view
  return (
    <div className="modal-overlay" style={{ zIndex:150 }}>
      <div className="modal-sheet" style={{ maxHeight:'94dvh', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h3 style={{ fontSize:19, fontWeight:900, margin:0, letterSpacing:'-0.02em' }}>{t.memories}</h3>
            <p style={{ fontSize:13, color:'var(--text-2)', margin:0 }}>{photos.length} photo{photos.length!==1?'s':''} taken</p>
          </div>
          <button onClick={onClose} style={{ background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-2)', cursor:'pointer', padding:8, display:'flex' }}>
            <X size={18}/>
          </button>
        </div>

        {/* Carousel */}
        {photos.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ position:'relative' }}>
              <div style={{ background:'#fff', padding:'10px 10px 0', borderRadius:6, boxShadow:'0 8px 32px rgba(0,0,0,0.45)' }}>
                <img src={photos[carouselIdx]} alt={`Memory ${carouselIdx+1}`}
                  style={{ width:'100%', display:'block', borderRadius:2 }}/>
                <div style={{ padding:'10px 0 12px', textAlign:'center' }}>
                  <img src="/logo.png" alt="" style={{ maxWidth:'70%', maxHeight:40, objectFit:'contain', display:'block', margin:'0 auto' }}/>
                </div>
              </div>
              {photos.length > 1 && (
                <>
                  <button onClick={() => setCarouselIdx(i=>(i-1+photos.length)%photos.length)}
                    style={{ position:'absolute', left:-14, top:'45%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'var(--bg-card)', border:'1px solid var(--border)', color:'#fff', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
                  <button onClick={() => setCarouselIdx(i=>(i+1)%photos.length)}
                    style={{ position:'absolute', right:-14, top:'45%', transform:'translateY(-50%)', width:32, height:32, borderRadius:'50%', background:'var(--bg-card)', border:'1px solid var(--border)', color:'#fff', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div style={{ display:'flex', justifyContent:'center', gap:5, marginTop:12 }}>
                {photos.map((_,i) => (
                  <button key={i} onClick={() => setCarouselIdx(i)}
                    style={{ width:i===carouselIdx?18:6, height:6, borderRadius:3, border:'none', background:i===carouselIdx?'var(--yellow)':'var(--bg-card-3)', cursor:'pointer', padding:0, transition:'all 0.2s' }}/>
                ))}
              </div>
            )}
            <p style={{ textAlign:'center', color:'var(--text-3)', fontSize:12, marginTop:8 }}>
              Photo {carouselIdx+1} of {photos.length}
            </p>
          </div>
        )}

        {/* Empty state */}
        {photos.length === 0 && (
          <div style={{ textAlign:'center', padding:'32px 0 20px' }}>
            <Camera size={40} color="var(--text-3)" style={{ marginBottom:12 }}/>
            <p style={{ fontSize:16, fontWeight:700, color:'var(--text-2)', marginBottom:6 }}>{t.noMemoriesYet}</p>
            <p style={{ fontSize:14, color:'var(--text-3)' }}>{t.noMemoriesDesc}</p>
          </div>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowCamera(true)} style={{ marginTop:4, gap:8 }}>
          <Camera size={20}/> Make a Memory
        </button>
      </div>
    </div>
  )
}

export default CameraNavButton
