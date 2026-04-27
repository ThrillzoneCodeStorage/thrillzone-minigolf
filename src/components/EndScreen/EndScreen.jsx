import { useState, useEffect, useRef } from 'react'
import { Trophy, Mail, RotateCcw, AlertTriangle, CheckCircle, SkipForward, Camera, Star } from 'lucide-react'
import { useGame } from '../../context/GameContext'
import { updateSession, upsertScore, uploadLeaderboardPhoto } from '../../lib/supabase'
import { EndConfetti } from '../HoleScreen/Celebrations'
import ScorecardShare from './ScorecardShare'
import { composePolaroid } from '../PhotoSystem/PhotoSystem'

// ── Leaderboard selfie button ─────────────────────────────────
function LbSelfieButton({ sessionId, player, onDone }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [blob, setBlob] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  async function openCam() {
    setOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user' }, audio:false })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
    } catch { setOpen(false) }
  }

  function stopStream() { streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null }

  function capture() {
    const v = videoRef.current; if (!v) return
    const c = document.createElement('canvas'); c.width=v.videoWidth; c.height=v.videoHeight
    const ctx=c.getContext('2d'); ctx.translate(c.width,0); ctx.scale(-1,1); ctx.drawImage(v,0,0)
    stopStream()
    c.toBlob(b => { setBlob(b); setPreviewUrl(URL.createObjectURL(b)) }, 'image/jpeg', 0.92)
  }

  async function confirm() {
    setUploading(true)
    try {
      const polaroid = await composePolaroid(blob)
      await uploadLeaderboardPhoto(sessionId, player.name, polaroid||blob)
      onDone()
    } finally { setUploading(false) }
  }

  if (!open) return (
    <button className="btn btn-primary btn-full btn-lg" onClick={openCam} style={{ gap:8 }}>
      <Camera size={20}/> Take my leaderboard selfie!
    </button>
  )

  if (blob && previewUrl) return (
    <div>
      <div style={{ background:'#fff', padding:'8px 8px 28px', borderRadius:6, marginBottom:12, boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>
        <img src={previewUrl} alt="Preview" style={{ width:'100%', aspectRatio:'1', objectFit:'cover', display:'block', borderRadius:2 }}/>
        <div style={{ textAlign:'center', marginTop:8 }}><img src="/logo.png" alt="" style={{ height:24, objectFit:'contain' }}/></div>
      </div>
      <div style={{ display:'flex', gap:9 }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => { setBlob(null); setPreviewUrl(null); openCam() }}>Retake</button>
        <button className="btn btn-primary" style={{ flex:2 }} onClick={confirm} disabled={uploading}>
          {uploading?'Uploading…':'Save to leaderboard'}
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ position:'relative', borderRadius:12, overflow:'hidden', aspectRatio:'1', background:'#000', marginBottom:12 }}>
        <video ref={videoRef} playsInline muted style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transform:'scaleX(-1)' }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <button onClick={capture}
          style={{ width:68, height:68, borderRadius:'50%', background:'#fff', border:'5px solid rgba(255,255,255,0.35)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Camera size={28} color="#000"/>
        </button>
      </div>
    </div>
  )
}

export default function EndScreen() {
  const { players, holes, scores, skippedHoles, photos, sessionId, playAgain, leaderboard, saveScore, optOut } = useGame()
  const [email, setEmail]         = useState('')
  const [sending, setSending]     = useState(false)
  const [sent, setSent]           = useState(false)
  const [error, setError]         = useState('')
  const [showFinishWarn, setShowFinishWarn] = useState(false)
  const [showLbSelfie, setShowLbSelfie]     = useState(false)
  const [lbSelfiePlayer, setLbSelfiePlayer] = useState(null)
  const [lbSelfieQueue, setLbSelfieQueue]   = useState([])
  const [takingLbPhoto, setTakingLbPhoto]   = useState(false)
  const [lbPhotoDone, setLbPhotoDone]       = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  // For filling in skipped holes at end
  const [skipScores, setSkipScores] = useState({}) // { holeId: { playerName: value } }

  const winner = leaderboard[0]

  // Detect qualifying players for leaderboard selfie
  useEffect(() => {
    if (!sessionId || optOut) return
    const totalHoles = holes.length
    const qualifiers = leaderboard.filter(p => p.holesPlayed >= totalHoles)
    if (qualifiers.length > 0) {
      setLbSelfieQueue(qualifiers)
      setLbSelfiePlayer(qualifiers[0])
      setTimeout(() => setShowLbSelfie(true), 1200)
    }
  }, [])
  const skippedList = holes.filter(h => skippedHoles.has(h.id))
  const hasSkipped = skippedList.length > 0

  // Show finish warning first if there are skipped holes and not yet confirmed
  function handleFinishAttempt() {
    if (hasSkipped && !confirmed) { setShowFinishWarn(true); return }
    playAgain()
  }

  async function saveSkippedScore(holeId, playerName, val) {
    const n = parseInt(val)
    if (isNaN(n) || n < 1) return
    setSkipScores(prev => ({
      ...prev,
      [holeId]: { ...(prev[holeId] || {}), [playerName]: n }
    }))
    await saveScore(holeId, playerName, n)
  }

  async function sendEmail() {
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email address'); return }
    setSending(true); setError('')
    try {
      const playerHeaders = players.map(p =>
        `<th style="padding:10px 14px;color:${p.color};font-weight:800;">${p.name}</th>`
      ).join('')

      const rows = holes.map((h, i) => {
        const isSkipped = skippedHoles.has(h.id)
        const cells = players.map(p => {
          const s = isSkipped ? '—' : (scores[h.id]?.[p.name] ?? '—')
          return `<td style="padding:9px 14px;text-align:center;font-weight:700;${isSkipped ? 'color:#555;' : ''}">${s}</td>`
        }).join('')
        return `<tr style="border-top:1px solid #222;${isSkipped ? 'opacity:0.5;' : ''}"><td style="padding:9px 14px;color:#888;">${i + 1}. ${h.title}${isSkipped ? ' <span style="color:#555;font-size:11px;">(skipped)</span>' : ''}</td>${cells}</tr>`
      }).join('')

      const totals = leaderboard.map(p =>
        `<td style="padding:10px 14px;text-align:center;font-weight:900;font-size:17px;color:${p.color};">${p.total}</td>`
      ).join('')

      const html = `<!DOCTYPE html><html><body style="margin:0;background:#0a0a0a;font-family:Inter,sans-serif;color:#fff;">
<div style="max-width:600px;margin:0 auto;padding:40px 24px;">
<img src="${window.location.origin}/logo.png" style="height:56px;margin-bottom:28px;"/>
<h1 style="color:#FFD600;font-size:30px;font-weight:900;letter-spacing:-0.03em;margin:0 0 6px;">Your Scorecard!</h1>
<p style="color:#666;margin:0 0 32px;">Thanks for playing at Thrillzone Escape Quest!</p>
<table style="width:100%;border-collapse:collapse;background:#141414;border-radius:12px;overflow:hidden;margin-bottom:24px;">
<thead><tr style="background:#1c1c1c;"><th style="padding:10px 14px;text-align:left;color:#555;">Hole</th>${playerHeaders}</tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr style="background:#222;border-top:2px solid rgba(255,214,0,0.25);"><td style="padding:10px 14px;font-weight:900;color:#FFD600;">TOTAL</td>${totals}</tr></tfoot>
</table>
<div style="background:#141414;border:1px solid rgba(255,214,0,0.2);border-radius:12px;padding:22px;margin-bottom:24px;">
<h2 style="color:#FFD600;font-weight:900;margin:0 0 14px;">Final Standings</h2>
${leaderboard.map((p, i) => `<p style="margin:5px 0;color:${i === 0 ? p.color : '#888'};font-weight:${i === 0 ? 900 : 500};">${i + 1}. ${p.name} — ${p.total} strokes${p.avg ? ` (${p.avg} avg/hole)` : ''}</p>`).join('')}
</div>
${photos.length ? `<p style="color:#888;font-size:14px;">Your ${photos.length} Polaroid photo${photos.length !== 1 ? 's are' : ' is'} attached!</p>` : ''}
<p style="color:#333;font-size:13px;text-align:center;margin-top:36px;">Thrillzone Escape Quest — Come back soon!</p>
</div></body></html>`

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ to: email, subject: 'Your Thrillzone Mini Golf Scorecard', html, photos }),
      })
      if (res.ok) { await updateSession(sessionId, { email }); setSent(true) }
      else { const d = await res.json().catch(() => ({})); setError(d.error || 'Could not send. Try again.') }
    } catch { setError('Network error. Check your connection.') }
    finally { setSending(false) }
  }

  return (
    <div className="screen animate-in">
      <EndConfetti />
      <div className="screen-content" style={{ paddingBottom: 48 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '36px 0 28px' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--yellow-dim)', border: '1.5px solid var(--border-y)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <Trophy size={40} color="var(--yellow)" strokeWidth={1.5} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 8 }}>
            Game Over!
          </h1>
          {winner && winner.holesPlayed > 0 && (
            <p style={{ fontSize: 17, color: 'var(--text-2)', marginBottom: 4 }}>
              <span style={{ color: winner.color, fontWeight: 900 }}>{winner.name}</span> wins with {winner.total} strokes
            </p>
          )}
          <img src="/logo.png" alt="" style={{ height: 44, objectFit: 'contain', marginTop: 18 }} />
        </div>

        {/* Skipped holes — fill in */}
        {hasSkipped && (
          <div style={{ background: 'rgba(255,59,59,0.07)', border: '1.5px solid rgba(255,59,59,0.2)', borderRadius: 'var(--radius)', padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <SkipForward size={16} color="var(--text-2)" />
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Skipped holes — fill in scores?</p>
            </div>
            {skippedList.map(hole => (
              <div key={hole.id} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>{hole.title}</p>
                {players.map(player => (
                  <div key={player.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: player.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1 }}>{player.name}</span>
                    <input
                      type="number" min="1" max="20"
                      placeholder="—"
                      value={skipScores[hole.id]?.[player.name] || ''}
                      onChange={e => saveSkippedScore(hole.id, player.name, e.target.value)}
                      style={{ width: 60, background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: 16, padding: '6px 10px', outline: 'none', textAlign: 'center', WebkitAppearance: 'none' }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Standings */}
        <div className="card" style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 14 }}>Final Standings</p>
          {leaderboard.map((p, i) => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '11px 14px', borderRadius: 12, background: i === 0 ? 'var(--yellow-dim)' : 'var(--bg-card-2)', border: `1.5px solid ${i === 0 ? 'var(--border-y)' : 'transparent'}`, animation: `fadeIn 0.4s ${i * 0.08}s both` }}>
              <span style={{ fontSize: 20, width: 26, textAlign: 'center', flexShrink: 0 }}>
                {['1st','2nd','3rd'][i] ? ['🥇','🥈','🥉'][i] : `${i + 1}.`}
              </span>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontWeight: 800, color: i === 0 ? 'var(--yellow)' : 'var(--text)', letterSpacing: '-0.01em' }}>{p.name}</span>
              <span style={{ fontSize: 17, fontWeight: 900, color: i === 0 ? 'var(--yellow)' : 'var(--text-2)', letterSpacing: '-0.02em' }}>{p.holesPlayed > 0 ? p.total : '—'}</span>
              {p.avg !== null && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{p.avg} avg</span>}
            </div>
          ))}
        </div>

        {/* Score table */}
        <div className="card" style={{ marginBottom: 14, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 12 }}>Full Scorecard</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 260 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-3)', fontWeight: 600 }}>Hole</th>
                {players.map(p => <th key={p.name} style={{ padding: '6px 8px', textAlign: 'center', color: p.color, fontWeight: 800 }}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {holes.map((h, i) => {
                const isSkipped = skippedHoles.has(h.id)
                return (
                  <tr key={h.id} style={{ borderTop: '1px solid var(--border)', opacity: isSkipped ? 0.45 : 1 }}>
                    <td style={{ padding: '7px 8px', color: 'var(--text-2)', fontWeight: 500 }}>{i + 1}. {h.title}</td>
                    {players.map(p => (
                      <td key={p.name} style={{ padding: '7px 8px', textAlign: 'center', fontWeight: 800, color: scores[h.id]?.[p.name] ? 'var(--text)' : 'var(--text-3)' }}>
                        {isSkipped ? '—' : (scores[h.id]?.[p.name] ?? '—')}
                      </td>
                    ))}
                  </tr>
                )
              })}
              <tr style={{ borderTop: '2px solid var(--border-y)' }}>
                <td style={{ padding: '9px 8px', fontWeight: 900, color: 'var(--yellow)' }}>Total</td>
                {leaderboard.map(p => (
                  <td key={p.name} style={{ padding: '9px 8px', textAlign: 'center', fontWeight: 900, color: p.color, fontSize: 15 }}>
                    {p.holesPlayed > 0 ? p.total : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Email */}
        {!sent ? (
          <div className="card-yellow" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Mail size={16} color="var(--yellow)" />
              <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>Get your scorecard + photos</p>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.55 }}>
              We'll email your scorecard and all {photos.length} Polaroid{photos.length !== 1 ? 's' : ''} straight to your inbox.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" type="email" placeholder="your@email.com" value={email}
                onChange={e => { setEmail(e.target.value); setError('') }} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={sendEmail} disabled={sending || !email.trim()} style={{ flexShrink: 0 }}>
                {sending ? '…' : 'Send'}
              </button>
            </div>
            {error && <p style={{ fontSize: 13, color: 'var(--red)', marginTop: 8 }}>{error}</p>}
          </div>
        ) : (
          <div className="card-yellow" style={{ marginBottom: 14, textAlign: 'center' }}>
            <CheckCircle size={32} color="var(--yellow)" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--yellow)', marginBottom: 4 }}>Email sent!</p>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Check your inbox at {email}</p>
          </div>
        )}

        <button className="btn btn-secondary btn-full btn-lg" onClick={handleFinishAttempt} style={{ gap: 8 }}>
          <RotateCcw size={18} /> Play Again
        </button>
      </div>

      {/* Finish / skipped holes warning */}
      {showFinishWarn && (
        <div className="modal-center">
          <div className="modal-box" style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,59,59,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={28} color="var(--red)" />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
              {skippedList.length} hole{skippedList.length !== 1 ? 's' : ''} were skipped
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 6 }}>
              The following holes weren't scored:
            </p>
            {skippedList.map(h => (
              <p key={h.id} style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 3 }}>— {h.title}</p>
            ))}
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: '14px 0 20px' }}>
              You can fill in scores above, or finish without them.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowFinishWarn(false)}>Go back</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => { setShowFinishWarn(false); setConfirmed(true); playAgain() }}>
                Finish anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounceIn{0%{opacity:0;transform:scale(0.3)}60%{transform:scale(1.12)}80%{transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      `}</style>
    </div>
  )
}
