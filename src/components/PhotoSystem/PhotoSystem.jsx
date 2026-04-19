import { useRef, useState, useEffect } from 'react'
import { Camera, X, RotateCcw, Check, SwitchCamera, Zap, ZapOff } from 'lucide-react'
import { useGame } from '../../context/GameContext'

// ── Polaroid composer — adapts to actual image dimensions ──────
export function composePolaroid(photoBlob, isFrontCamera = false) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(photoBlob)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)

      const imgW = img.naturalWidth  || img.width
      const imgH = img.naturalHeight || img.height

      // Polaroid frame constants
      const SIDE_PAD  = 28   // equal left/right/top padding
      const BOT_PAD   = 140  // bottom label area height
      const FRAME_W   = 800  // fixed canvas width

      // Scale image to fit within frame width
      const photoW  = FRAME_W - SIDE_PAD * 2
      const photoH  = Math.round(photoW * (imgH / imgW))
      const totalH  = SIDE_PAD + photoH + BOT_PAD

      const canvas = document.createElement('canvas')
      canvas.width  = FRAME_W
      canvas.height = totalH
      const ctx = canvas.getContext('2d')

      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, FRAME_W, totalH)

      // Draw image — mirror front camera only
      ctx.save()
      if (isFrontCamera) {
        ctx.translate(FRAME_W, 0)
        ctx.scale(-1, 1)
      }
      ctx.drawImage(img, isFrontCamera ? -(FRAME_W - SIDE_PAD * 2 + SIDE_PAD) : SIDE_PAD, SIDE_PAD, photoW, photoH)
      ctx.restore()

      // Subtle border around photo
      ctx.strokeStyle = '#e8e8e8'
      ctx.lineWidth = 1
      ctx.strokeRect(SIDE_PAD, SIDE_PAD, photoW, photoH)

      // ── Label area ──────────────────────────────────────────
      const labelY   = SIDE_PAD + photoH
      const labelMid = FRAME_W / 2
      const labelH   = BOT_PAD

      // Date — top of label
      const dateStr = new Date().toLocaleDateString('en-NZ', { day:'numeric', month:'long', year:'numeric' })
      ctx.fillStyle   = '#aaaaaa'
      ctx.font        = '18px Georgia, "Times New Roman", serif'
      ctx.textAlign   = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(dateStr, labelMid, labelY + 14)

      // Logo — centred, fills remaining label space nicely
      const logo = new Image()
      logo.crossOrigin = 'anonymous'

      logo.onload = () => {
        // Logo gets ~60% of label height, centred vertically in remaining space
        const logoMaxH = Math.round(labelH * 0.55)
        const logoMaxW = FRAME_W - SIDE_PAD * 4
        const ratio    = logo.width / logo.height
        let lw = logoMaxH * ratio
        let lh = logoMaxH
        if (lw > logoMaxW) { lw = logoMaxW; lh = lw / ratio }
        const lx = (FRAME_W - lw) / 2
        const ly = labelY + 38 + ((labelH - 38 - lh) / 2)
        ctx.drawImage(logo, lx, Math.max(labelY + 38, ly), lw, lh)
        canvas.toBlob(b => resolve(b), 'image/jpeg', 0.94)
      }

      logo.onerror = () => {
        // Fallback text
        ctx.fillStyle    = '#222'
        ctx.font         = 'bold 28px Inter, Arial, sans-serif'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('PUTT N GLOW', labelMid, labelY + labelH / 2)
        canvas.toBlob(b => resolve(b), 'image/jpeg', 0.94)
      }

      logo.src = '/logo.png'
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

// ── Camera Nav Button ─────────────────────────────────────────
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
      if (err.name === 'NotFoundError')    msg = 'No camera found on this device.'
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

// ── Photo Gallery Sheet ───────────────────────────────────────
export function PhotoGallery({ onClose }) {
  const { photos, addPhoto } = useGame()
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

  async function confirmPhoto() {
    if (!capturedBlob) return
    setProcessing(true)
    try {
      const polaroid = await composePolaroid(capturedBlob, isFront)
      await addPhoto(polaroid || capturedBlob)
      setCarouselIdx(photos.length)
    } finally {
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
      setCapturedBlob(null)
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
          <h3 style={{ fontSize:19, fontWeight:900, letterSpacing:'-0.02em', margin:0 }}>Save this memory?</h3>
          <button onClick={retake} style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:13, fontFamily:'inherit', fontWeight:600 }}>
            <RotateCcw size={15}/> Retake
          </button>
        </div>
        <div style={{ marginBottom:20 }}>
          <PolaroidPreview url={previewUrl} label={dateLabel}/>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost" onClick={() => { if(previewUrl){URL.revokeObjectURL(previewUrl);setPreviewUrl(null)} setCapturedBlob(null) }} style={{ flex:1 }}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={confirmPhoto} disabled={processing} style={{ flex:2, gap:7 }}>
            {processing ? 'Saving…' : <><Check size={16}/> Save Polaroid</>}
          </button>
        </div>
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
            <h3 style={{ fontSize:19, fontWeight:900, margin:0, letterSpacing:'-0.02em' }}>Memories</h3>
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
            <p style={{ fontSize:16, fontWeight:700, color:'var(--text-2)', marginBottom:6 }}>No memories yet</p>
            <p style={{ fontSize:14, color:'var(--text-3)' }}>Take your first Polaroid below.</p>
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
