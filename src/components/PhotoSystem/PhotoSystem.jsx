import { useRef, useState } from 'react'
import { Camera, X, RotateCcw, Check } from 'lucide-react'
import { useGame } from '../../context/GameContext'

// ── Polaroid composer ──────────────────────────────────────────
export function composePolaroid(photoBlob) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(photoBlob)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      const W = 800, PHOTO_H = 620, LABEL_H = 160, PAD = 24, H = PAD + PHOTO_H + LABEL_H
      const canvas = document.createElement('canvas')
      canvas.width = W; canvas.height = H
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)

      // Mirror for selfie
      ctx.save()
      ctx.translate(W, 0); ctx.scale(-1, 1)
      ctx.drawImage(img, PAD, PAD, W - PAD * 2, PHOTO_H)
      ctx.restore()

      ctx.strokeStyle = '#e8e8e8'; ctx.lineWidth = 1
      ctx.strokeRect(PAD, PAD, W - PAD * 2, PHOTO_H)

      const dateStr = new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })
      ctx.fillStyle = '#999'; ctx.font = '20px Georgia,serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillText(dateStr, W / 2, PAD + PHOTO_H + 14)

      const logo = new Image()
      logo.crossOrigin = 'anonymous'
      logo.onload = () => {
        const lh = 80, lw = (logo.width / logo.height) * lh
        ctx.drawImage(logo, (W - lw) / 2, PAD + PHOTO_H + 44, lw, lh)
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.93)
      }
      logo.onerror = () => {
        ctx.fillStyle = '#111'; ctx.font = 'bold 26px Inter,sans-serif'
        ctx.fillText('THRILLZONE · ESCAPE QUEST', W / 2, PAD + PHOTO_H + 60)
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.93)
      }
      logo.src = '/logo.png'
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

// ── Camera Icon Button (for bottom nav) ───────────────────────
export function CameraNavButton({ onClick, photoCount }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open photo gallery"
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
        background: 'var(--bg-card-2)', border: '1.5px solid var(--border)',
        borderRadius: 12, padding: '10px 14px',
        cursor: 'pointer', minHeight: 52, minWidth: 60,
        transition: 'border-color 0.15s, background 0.15s',
        flexShrink: 0,
      }}
    >
      <Camera size={20} color="var(--text-2)" strokeWidth={1.75} />
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.02em' }}>Photos</span>
      {photoCount > 0 && (
        <span style={{
          position: 'absolute', top: -5, right: -5,
          background: 'var(--yellow)', color: '#000',
          fontSize: 10, fontWeight: 900, width: 18, height: 18,
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--bg)',
        }}>{photoCount}</span>
      )}
    </button>
  )
}

// ── Photo Gallery Sheet ────────────────────────────────────────
export function PhotoGallery({ onClose }) {
  const { photos, addPhoto } = useGame()
  const [cameraOpen, setCameraOpen]     = useState(false)
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [previewUrl, setPreviewUrl]     = useState(null)
  const [processing, setProcessing]     = useState(false)
  const [cameraError, setCameraError]   = useState(null)
  const [carouselIdx, setCarouselIdx]   = useState(Math.max(0, photos.length - 1))
  const videoRef  = useRef(null)
  const streamRef = useRef(null)

  async function openCamera() {
    setCameraError(null)
    setCameraOpen(true)
    setCapturedBlob(null)
    setPreviewUrl(null)

    // Check HTTPS — camera blocked on plain HTTP (except localhost)
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    if (!isSecure) {
      setCameraError('Camera requires a secure connection (HTTPS). Please use the live site URL, not a local address.')
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Your browser doesn\'t support camera access. Try Chrome or Safari on iOS 14.3+.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err) {
      let msg = 'Camera access was denied.'
      if (err.name === 'NotAllowedError') msg = 'Camera permission was denied. Tap Allow when the browser asks, or check your browser settings.'
      else if (err.name === 'NotFoundError') msg = 'No camera found on this device.'
      else if (err.name === 'NotReadableError') msg = 'Camera is in use by another app. Close it and try again.'
      else if (location.hostname !== 'localhost') msg = 'Camera requires HTTPS. Make sure you\'re using the live site URL (https://...).'
      setCameraError(msg)
    }
  }

  function stopStream() { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null }

  function closeCamera() {
    stopStream(); setCameraOpen(false); setCapturedBlob(null)
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
    setCameraError(null)
  }

  function capturePhoto() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      stopStream(); setCapturedBlob(blob)
      const u = URL.createObjectURL(blob); setPreviewUrl(u)
    }, 'image/jpeg', 0.92)
  }

  function retake() {
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
    setCapturedBlob(null); openCamera()
  }

  async function confirmPhoto() {
    if (!capturedBlob) return
    setProcessing(true)
    try {
      const polaroid = await composePolaroid(capturedBlob)
      await addPhoto(polaroid || capturedBlob)
      setCarouselIdx(photos.length)
    } finally {
      if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
      setCapturedBlob(null); setCameraOpen(false); setProcessing(false)
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 150 }}>
      <div className="modal-sheet" style={{ maxHeight: '94dvh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 19, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Memories</h3>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{photos.length} photo{photos.length !== 1 ? 's' : ''} taken</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-2)', cursor: 'pointer', padding: 8, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Camera — live view */}
        {cameraOpen && !capturedBlob && (
          <div style={{ marginBottom: 16 }}>
            {cameraError ? (
              <div style={{ background: 'rgba(255,59,59,0.08)', border: '1.5px solid rgba(255,59,59,0.2)', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 12 }}>
                <Camera size={32} color="var(--red)" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 14 }}>{cameraError}</p>
                <button className="btn btn-ghost btn-sm" onClick={closeCamera}>Close</button>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000', aspectRatio: '4/3' }}>
                  <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' }} />
                  {/* Viewfinder corners */}
                  {['tl','tr','bl','br'].map(pos => (
                    <div key={pos} style={{
                      position: 'absolute',
                      top: pos.startsWith('t') ? 10 : undefined, bottom: pos.startsWith('b') ? 10 : undefined,
                      left: pos.endsWith('l') ? 10 : undefined, right: pos.endsWith('r') ? 10 : undefined,
                      width: 18, height: 18,
                      borderTop: pos.startsWith('t') ? '2px solid rgba(255,255,255,0.55)' : 'none',
                      borderBottom: pos.startsWith('b') ? '2px solid rgba(255,255,255,0.55)' : 'none',
                      borderLeft: pos.endsWith('l') ? '2px solid rgba(255,255,255,0.55)' : 'none',
                      borderRight: pos.endsWith('r') ? '2px solid rgba(255,255,255,0.55)' : 'none',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                  <button className="btn btn-ghost btn-sm" onClick={closeCamera}>Cancel</button>
                  <button onClick={capturePhoto} style={{ width: 68, height: 68, borderRadius: '50%', background: '#fff', border: '5px solid rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.12s' }} onTouchStart={e => e.currentTarget.style.transform='scale(0.9)'} onTouchEnd={e => e.currentTarget.style.transform=''}>
                    <Camera size={26} color="#000" />
                  </button>
                  <div style={{ width: 64 }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview / confirm */}
        {cameraOpen && capturedBlob && previewUrl && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10, textAlign: 'center' }}>Looking good? Save it as a Polaroid!</p>
            <div style={{ background: '#fff', padding: '10px 10px 36px', borderRadius: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', margin: '0 auto 16px', maxWidth: 300 }}>
              <img src={previewUrl} alt="Preview" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', borderRadius: 2 }} />
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <img src="/logo.png" alt="Thrillzone" style={{ height: 32, objectFit: 'contain' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={retake} style={{ flex: 1, gap: 6 }}><RotateCcw size={15} /> Retake</button>
              <button className="btn btn-primary" onClick={confirmPhoto} disabled={processing} style={{ flex: 2, gap: 6 }}>
                {processing ? 'Saving…' : <><Check size={16} /> Save Polaroid</>}
              </button>
            </div>
          </div>
        )}

        {/* Carousel */}
        {!cameraOpen && photos.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ background: '#fff', padding: '10px 10px 40px', borderRadius: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.45)' }}>
                <img src={photos[carouselIdx]} alt={`Memory ${carouselIdx + 1}`}
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', borderRadius: 2 }} />
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <img src="/logo.png" alt="" style={{ height: 28, objectFit: 'contain' }} />
                </div>
              </div>
              {photos.length > 1 && (
                <>
                  <button onClick={() => setCarouselIdx(i => (i - 1 + photos.length) % photos.length)} style={{ position: 'absolute', left: -14, top: '45%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                  <button onClick={() => setCarouselIdx(i => (i + 1) % photos.length)} style={{ position: 'absolute', right: -14, top: '45%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 12 }}>
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setCarouselIdx(i)} style={{ width: i === carouselIdx ? 18 : 6, height: 6, borderRadius: 3, border: 'none', background: i === carouselIdx ? 'var(--yellow)' : 'var(--bg-card-3)', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }} />
                ))}
              </div>
            )}
            <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12, marginTop: 8 }}>Photo {carouselIdx + 1} of {photos.length}</p>
          </div>
        )}

        {/* Empty state */}
        {!cameraOpen && photos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0 20px' }}>
            <Camera size={40} color="var(--text-3)" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>No memories yet</p>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Tap below to take your first Polaroid.</p>
          </div>
        )}

        {!cameraOpen && (
          <button className="btn btn-primary btn-full btn-lg" onClick={openCamera} style={{ marginTop: 4, gap: 8 }}>
            <Camera size={20} /> Make a Memory
          </button>
        )}
      </div>
    </div>
  )
}

export default CameraNavButton
