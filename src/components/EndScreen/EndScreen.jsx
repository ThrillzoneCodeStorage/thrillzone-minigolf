import { useState, useEffect, useRef } from 'react'
import { Trophy, Mail, RotateCcw, AlertTriangle, CheckCircle, SkipForward, Camera, Star } from 'lucide-react'
import { useGame } from '../../context/GameContext'
import { useTranslation } from '../../lib/TranslationContext'
import { updateSession, upsertScore, uploadLeaderboardPhoto } from '../../lib/supabase'
import { EndConfetti } from '../HoleScreen/Celebrations'
import ScorecardShare from './ScorecardShare'
import { composePolaroid, composeLeaderboardPhoto } from '../PhotoSystem/PhotoSystem'

// ── Country flag picker ───────────────────────────────────────
const COUNTRIES = [
  // Oceania
  {code:'NZ',flag:'🇳🇿',name:'New Zealand'},{code:'AU',flag:'🇦🇺',name:'Australia'},
  {code:'FJ',flag:'🇫🇯',name:'Fiji'},{code:'WS',flag:'🇼🇸',name:'Samoa'},
  {code:'TO',flag:'🇹🇴',name:'Tonga'},{code:'PG',flag:'🇵🇬',name:'Papua New Guinea'},
  // Asia
  {code:'JP',flag:'🇯🇵',name:'Japan'},{code:'CN',flag:'🇨🇳',name:'China'},
  {code:'KR',flag:'🇰🇷',name:'South Korea'},{code:'SG',flag:'🇸🇬',name:'Singapore'},
  {code:'TW',flag:'🇹🇼',name:'Taiwan'},{code:'HK',flag:'🇭🇰',name:'Hong Kong'},
  {code:'MY',flag:'🇲🇾',name:'Malaysia'},{code:'TH',flag:'🇹🇭',name:'Thailand'},
  {code:'ID',flag:'🇮🇩',name:'Indonesia'},{code:'PH',flag:'🇵🇭',name:'Philippines'},
  {code:'VN',flag:'🇻🇳',name:'Vietnam'},{code:'IN',flag:'🇮🇳',name:'India'},
  // Americas
  {code:'US',flag:'🇺🇸',name:'USA'},{code:'CA',flag:'🇨🇦',name:'Canada'},
  {code:'BR',flag:'🇧🇷',name:'Brazil'},{code:'MX',flag:'🇲🇽',name:'Mexico'},
  {code:'AR',flag:'🇦🇷',name:'Argentina'},{code:'CL',flag:'🇨🇱',name:'Chile'},
  // Europe
  {code:'GB',flag:'🇬🇧',name:'UK'},{code:'DE',flag:'🇩🇪',name:'Germany'},
  {code:'FR',flag:'🇫🇷',name:'France'},{code:'IT',flag:'🇮🇹',name:'Italy'},
  {code:'ES',flag:'🇪🇸',name:'Spain'},{code:'NL',flag:'🇳🇱',name:'Netherlands'},
  {code:'SE',flag:'🇸🇪',name:'Sweden'},{code:'NO',flag:'🇳🇴',name:'Norway'},
  {code:'DK',flag:'🇩🇰',name:'Denmark'},{code:'FI',flag:'🇫🇮',name:'Finland'},
  {code:'CH',flag:'🇨🇭',name:'Switzerland'},{code:'AT',flag:'🇦🇹',name:'Austria'},
  {code:'BE',flag:'🇧🇪',name:'Belgium'},{code:'IE',flag:'🇮🇪',name:'Ireland'},
  {code:'PT',flag:'🇵🇹',name:'Portugal'},{code:'PL',flag:'🇵🇱',name:'Poland'},
  {code:'CZ',flag:'🇨🇿',name:'Czech Republic'},{code:'SK',flag:'🇸🇰',name:'Slovakia'},
  {code:'HU',flag:'🇭🇺',name:'Hungary'},{code:'RO',flag:'🇷🇴',name:'Romania'},
  {code:'HR',flag:'🇭🇷',name:'Croatia'},{code:'GR',flag:'🇬🇷',name:'Greece'},
  {code:'RU',flag:'🇷🇺',name:'Russia'},{code:'UA',flag:'🇺🇦',name:'Ukraine'},
  // Middle East & Africa
  {code:'ZA',flag:'🇿🇦',name:'South Africa'},{code:'AE',flag:'🇦🇪',name:'UAE'},
  {code:'SA',flag:'🇸🇦',name:'Saudi Arabia'},{code:'IL',flag:'🇮🇱',name:'Israel'},
  {code:'KE',flag:'🇰🇪',name:'Kenya'},
  // Other
  {code:'OTHER',flag:'🌍',name:'Other'},
]

function CountryFlagPicker({ player, sessionId, onDone }) {
  const t           = useTranslation()
  const [selected,  setSelected]  = useState(null)
  const [search,    setSearch]    = useState('')
  const [popular,   setPopular]   = useState([])
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    // Load most popular countries from recent sessions
    import('../../lib/supabase').then(({ supabase }) => {
      supabase.from('sessions')
        .select('country_code')
        .not('country_code', 'is', null)
        .order('started_at', { ascending: false })
        .limit(200)
        .then(({ data }) => {
          if (!data) return
          const counts = {}
          data.forEach(s => { if (s.country_code) counts[s.country_code] = (counts[s.country_code]||0)+1 })
          const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([code])=>code)
          // Always include NZ and AU at front
          const top = ['NZ','AU',...sorted.filter(c=>c!=='NZ'&&c!=='AU')].slice(0,8)
          setPopular(top)
        })
    })
  }, [])

  async function save(code) {
    setSelected(code); setSaving(true)
    // Just notify parent — country is stored per player in leaderboard_player_photos
    setSaving(false)
    setTimeout(() => onDone(code), 300)
  }

  const filtered = search.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES

  const popularList = popular.map(code => COUNTRIES.find(c=>c.code===code)).filter(Boolean)

  return (
    <div>
      <p style={{ fontSize:13, fontWeight:700, color:'var(--text-2)', marginBottom:10, textAlign:'center' }}>
        🌍 Where are you from?
      </p>

      {/* Search */}
      <input
        placeholder="Search country…"
        value={search} onChange={e=>setSearch(e.target.value)}
        style={{ width:'100%', background:'var(--bg-card-2)', border:'1px solid var(--border)',
          borderRadius:8, padding:'8px 12px', color:'var(--text)', fontSize:13,
          fontFamily:'inherit', marginBottom:10, boxSizing:'border-box' }}
      />

      {/* Popular (only when not searching) */}
      {!search.trim() && popularList.length > 0 && (
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>Popular</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
            {popularList.map(c => (
              <button key={c.code} onClick={() => save(c.code)}
                disabled={saving}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                  background: selected===c.code ? 'rgba(255,214,0,0.12)' : 'var(--bg-card-2)',
                  border: `1px solid ${selected===c.code?'var(--yellow)':'var(--border)'}`,
                  borderRadius:10, padding:'8px 10px', cursor:'pointer', fontFamily:'inherit', minWidth:60, transition:'all 0.12s' }}>
                <span style={{ fontSize:22 }}>{c.flag}</span>
                <span style={{ fontSize:10, fontWeight:600, color:'var(--text-2)', whiteSpace:'nowrap' }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All / search results */}
      <div style={{ maxHeight:170, overflowY:'auto' }}>
        <p style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:7 }}>
          {search.trim() ? `Results (${filtered.length})` : 'All Countries'}
        </p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {filtered.map(c => (
            <button key={c.code} onClick={() => save(c.code)}
              disabled={saving}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                background: selected===c.code ? 'rgba(255,214,0,0.12)' : 'var(--bg-card-2)',
                border: `1px solid ${selected===c.code?'var(--yellow)':'var(--border)'}`,
                borderRadius:8, padding:'6px 8px', cursor:'pointer', fontFamily:'inherit',
                minWidth:52, transition:'all 0.12s' }}>
              <span style={{ fontSize:18 }}>{c.flag}</span>
              <span style={{ fontSize:9, fontWeight:600, color:'var(--text-2)', whiteSpace:'nowrap' }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-ghost btn-sm btn-full"
        style={{ marginTop:10, color:'var(--text-3)', fontSize:12 }}
        onClick={() => onDone(null)}>
        {t.skipNoFlag}
      </button>
    </div>
  )
}

// ── Leaderboard selfie button ─────────────────────────────────
function LbSelfieButton({ sessionId, player, onDone, countryCode = null }) {
  const t         = useTranslation()
  const videoRef  = useRef(null)
  const streamRef = useRef(null)
  const [phase,     setPhase]     = useState('idle') // idle | camera | preview | saving | done | error
  const [blob,      setBlob]      = useState(null)
  const [previewUrl,setPreviewUrl]= useState(null)
  const [errMsg,    setErrMsg]    = useState('')

  async function openCam() {
    setPhase('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user', width:{ ideal:1280 }, height:{ ideal:1280 } }, audio:false })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
    } catch(e) { setPhase('error'); setErrMsg('Camera not available. Please allow camera access.') }
  }

  function stopStream() { streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null }

  function capture() {
    const v = videoRef.current; if (!v) return
    const size = Math.min(v.videoWidth, v.videoHeight)
    const c = document.createElement('canvas'); c.width=size; c.height=size
    const ctx=c.getContext('2d')
    // Centre-crop square from video
    const ox=(v.videoWidth-size)/2, oy=(v.videoHeight-size)/2
    ctx.translate(size,0); ctx.scale(-1,1)
    ctx.drawImage(v, ox, oy, size, size, 0, 0, size, size)
    stopStream()
    c.toBlob(b => { setBlob(b); setPreviewUrl(URL.createObjectURL(b)); setPhase('preview') }, 'image/jpeg', 0.92)
  }

  async function save() {
    if (!blob) return
    setPhase('saving')
    try {
      // Try to compose leaderboard-formatted photo; fall back to raw blob if it fails
      let lbPhoto = blob
      try { lbPhoto = await composeLeaderboardPhoto(blob, false) ?? blob } catch(e) { console.warn('composeLeaderboardPhoto failed, using raw blob', e) }
      await uploadLeaderboardPhoto(sessionId, player.name, lbPhoto, countryCode)
      setPhase('done')
      setTimeout(onDone, 1400)
    } catch(e) {
      console.error('Selfie save error:', e)
      setPhase('error')
      setErrMsg(`Could not save: ${e?.message || 'Unknown error'}. Try again or skip.`)
    }
  }

  function retake() { setBlob(null); if(previewUrl){URL.revokeObjectURL(previewUrl);setPreviewUrl(null)}; openCam() }

  // idle
  if (phase==='idle') return (
    <div style={{ textAlign:'center' }}>
      <p style={{ fontSize:14, color:'var(--text-2)', marginBottom:12 }}>
        {t.selfieDesc}
      </p>
      <button className="btn btn-primary btn-full" onClick={openCam} style={{ gap:8, fontSize:16, padding:'14px' }}>
        <Camera size={22}/> Take Selfie
      </button>
    </div>
  )

  // camera live
  if (phase==='camera') return (
    <div>
      <div style={{ position:'relative', borderRadius:12, overflow:'hidden', aspectRatio:'1', marginBottom:12, background:'#000' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
        <div style={{ position:'absolute', inset:0, border:'3px solid rgba(255,214,0,0.5)', borderRadius:12, pointerEvents:'none' }}/>
        <p style={{ position:'absolute', bottom:8, left:0, right:0, textAlign:'center', fontSize:11, color:'rgba(255,214,0,0.7)', fontWeight:600 }}>Selfie · Square crop</p>
      </div>
      <button className="btn btn-primary btn-full" onClick={capture} style={{ gap:8, fontSize:16, padding:'14px' }}>
        <Camera size={20}/> Capture
      </button>
    </div>
  )

  // preview
  if (phase==='preview') return (
    <div>
      <div style={{ borderRadius:12, overflow:'hidden', marginBottom:12, boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>
        <img src={previewUrl} alt="Selfie preview" style={{ width:'100%', display:'block', aspectRatio:'1', objectFit:'cover' }}/>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={retake}><RotateCcw size={15}/> Retake</button>
        <button className="btn btn-primary" style={{ flex:2, gap:8 }} onClick={save}>
          <Check size={16}/> Add to Leaderboard
        </button>
      </div>
    </div>
  )

  // saving
  if (phase==='saving') return (
    <div style={{ textAlign:'center', padding:'20px 0' }}>
      <div style={{ width:32, height:32, border:'3px solid rgba(255,214,0,0.2)', borderTopColor:'var(--yellow)', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 12px' }}/>
      <p style={{ color:'var(--text-2)', fontSize:14, margin:0 }}>Saving to leaderboard…</p>
    </div>
  )

  // done
  if (phase==='done') return (
    <div style={{ textAlign:'center', padding:'16px 0' }}>
      <div style={{ fontSize:36, marginBottom:8 }}>✅</div>
      <p style={{ color:'#34d399', fontSize:15, fontWeight:700, margin:0 }}>Added to the leaderboard!</p>
    </div>
  )

  // error
  return (
    <div style={{ textAlign:'center', padding:'12px 0' }}>
      <p style={{ color:'#ff5252', fontSize:14, marginBottom:12 }}>{errMsg}</p>
      <button className="btn btn-ghost btn-full" onClick={() => setPhase('idle')}>Try again</button>
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

  const t = useTranslation()
  const winner = leaderboard[0]
  const [showFullScorecard, setShowFullScorecard] = useState(false)

  // Detect qualifying players — runs when leaderboard is loaded
  const selfieShownRef = useRef(false)
  useEffect(() => {
    if (!sessionId || optOut || selfieShownRef.current) return
    if (leaderboard.length === 0) return
    // Players who completed all holes
    const totalHoles = holes.length
    const qualifiers = leaderboard.filter(p => (p.holesPlayed || p.holes || 0) >= totalHoles)
    if (qualifiers.length > 0) {
      selfieShownRef.current = true
      setLbSelfieQueue(qualifiers)
      setLbSelfiePlayer(qualifiers[0])
      setTimeout(() => setShowLbSelfie(true), 1500)
    }
  }, [leaderboard])
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

      const date = new Date().toLocaleDateString('en-NZ', { day:'numeric', month:'long', year:'numeric' })
      const winnerName = leaderboard[0]?.name || ''
      const winnerTotal = leaderboard[0]?.total || 0

      const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Putt N Glow Scorecard</title></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:32px 0;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#0a0a0a;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">

  <!-- Gold top bar -->
  <tr><td style="background:linear-gradient(90deg,#cc9900,#FFD600,#cc9900);height:5px;"></td></tr>

  <!-- Header -->
  <tr><td style="background:linear-gradient(160deg,#141200,#0a0a0a);padding:44px 48px 36px;text-align:center;">
    <img src="https://gentle-frangipane-c4d096.netlify.app/logo.png" width="120" height="auto" alt="Putt N Glow" style="height:56px;width:auto;margin-bottom:20px;display:block;margin-left:auto;margin-right:auto;"/>
    <div style="font-size:36px;font-weight:900;color:#FFD600;letter-spacing:-0.03em;margin-bottom:6px;line-height:1;">Putt N Glow</div>
    <div style="font-size:13px;color:#555;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:20px;">Mini Golf · Queenstown</div>
    <div style="display:inline-block;background:rgba(255,214,0,0.08);border:1px solid rgba(255,214,0,0.2);border-radius:8px;padding:6px 18px;font-size:13px;color:#666;">${date}</div>
  </td></tr>

  <!-- Winner banner -->
  ${leaderboard.length > 0 ? `
  <tr><td style="background:linear-gradient(135deg,#FFD600,#ffef80);padding:24px 48px;text-align:center;">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.14em;color:rgba(0,0,0,0.45);margin-bottom:8px;">🏆 Winner</div>
    <div style="font-size:28px;font-weight:900;color:#000;letter-spacing:-0.03em;">${winnerName}</div>
    <div style="font-size:15px;color:rgba(0,0,0,0.55);margin-top:4px;">${winnerTotal} strokes · Well played!</div>
  </td></tr>` : ''}

  <!-- Final standings -->
  <tr><td style="padding:32px 48px 8px;">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#444;margin-bottom:16px;">Final Standings</div>
    ${leaderboard.map((p, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
    <tr>
      <td width="36" style="vertical-align:middle;">
        <div style="width:32px;height:32px;border-radius:50%;background:${p.color};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#000;text-align:center;line-height:32px;">${p.name.charAt(0).toUpperCase()}</div>
      </td>
      <td style="vertical-align:middle;padding-left:12px;">
        <div style="font-size:16px;font-weight:${i===0?900:600};color:${i===0?p.color:'#aaa'};">${p.name}${i===0?' 🥇':i===1?' 🥈':i===2?' 🥉':''}</div>
        ${p.holesPlayed>0?`<div style="font-size:11px;color:#444;margin-top:1px;">${p.holesPlayed} holes played</div>`:''}
      </td>
      <td align="right" style="vertical-align:middle;">
        <span style="font-size:24px;font-weight:900;color:${i===0?p.color:'#fff'};">${p.total>0?p.total:'—'}</span>
        <span style="font-size:11px;color:#444;margin-left:4px;">strokes</span>
      </td>
    </tr>
    </table>`).join('')}
  </td></tr>

  <!-- Scorecard table -->
  <tr><td style="padding:16px 48px 8px;">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#444;margin-bottom:12px;">Hole by Hole</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:12px;border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:#1c1c1c;">
          <th style="padding:9px 12px;text-align:left;color:#555;font-weight:700;">Hole</th>
          ${playerHeaders}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="background:#1a1200;border-top:2px solid rgba(255,214,0,0.25);">
          <td style="padding:10px 12px;font-weight:900;color:#FFD600;font-size:13px;">TOTAL</td>
          ${totals}
        </tr>
      </tfoot>
    </table>
  </td></tr>

  ${photos.length > 0 ? `
  <!-- Photos section -->
  <tr><td style="padding:24px 48px 8px;">
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#444;margin-bottom:16px;">📸 Your Polaroid Memories (${photos.length})</div>
    <div style="font-size:13px;color:#666;margin-bottom:14px;">All your photos are attached to this email as individual files.</div>
    <div style="background:#141414;border:1px solid rgba(255,214,0,0.15);border-radius:12px;padding:16px 20px;text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">${photos.length === 1 ? '🖼️' : '🖼️🖼️'}</div>
      <div style="color:#888;font-size:13px;line-height:1.6;">${photos.length} Polaroid photo${photos.length!==1?'s':''} attached<br/><span style="color:#555;">Print them out or share on Instagram!</span></div>
    </div>
  </td></tr>` : ''}

  <!-- CTA -->
  <tr><td style="padding:28px 48px 36px;text-align:center;">
    <a href="https://gentle-frangipane-c4d096.netlify.app" style="display:inline-block;background:linear-gradient(135deg,#FFD600,#ffef80);color:#000;font-weight:900;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;letter-spacing:-0.01em;">Play Again at Putt N Glow →</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 48px 32px;text-align:center;border-top:1px solid #1c1c1c;">
    <div style="font-size:14px;color:#FFD600;font-weight:800;margin-bottom:6px;">Putt N Glow · Queenstown</div>
    <div style="font-size:12px;color:#333;margin-bottom:10px;">The most fun you'll have with a tiny golf club.</div>
    <div style="font-size:11px;color:#222;">scores.thrillzone.co.nz</div>
  </td></tr>

  <!-- Gold bottom bar -->
  <tr><td style="background:linear-gradient(90deg,#cc9900,#FFD600,#cc9900);height:5px;"></td></tr>

</table>
</td></tr>
</table>
</body></html>`

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ to: email, subject: `Putt N Glow Scorecard — ${date}`, html, photos }),
      })
      if (res.ok) { await updateSession(sessionId, { email }); setSent(true) }
      else { const d = await res.json().catch(() => ({})); setError(d.error || 'Could not send. Try again.') }
    } catch { setError('Network error. Check your connection.') }
    finally { setSending(false) }
  }

  return (
    <div className="screen animate-in">
      {/* ── Leaderboard selfie + country flag modal ── */}
      {showLbSelfie && lbSelfiePlayer && (() => {
        const queueIdx  = lbSelfieQueue.findIndex(p => p.name === lbSelfiePlayer.name)
        const total     = lbSelfieQueue.length
        const playerTotal = holes.reduce((s,h)=>s+(scores[h.id]?.[lbSelfiePlayer.name]||0),0)

        function nextPlayer() {
          const remaining = lbSelfieQueue.slice(queueIdx + 1)
          if (remaining.length > 0) {
            setLbSelfiePlayer(remaining[0])
            setLbSelfieQueue(remaining)
          } else {
            setShowLbSelfie(false)
          }
        }

        return (
          <div style={{ position:'fixed', inset:0, zIndex:400, background:'var(--bg)', overflowY:'auto' }}>
            <div className="modal-sheet" style={{ height:'100dvh', maxHeight:'100dvh', overflowY:'auto', borderRadius:0 }}>

              {/* Progress indicator for multiple players */}
              {total > 1 && (
                <div style={{ display:'flex', gap:6, marginBottom:16, justifyContent:'center' }}>
                  {lbSelfieQueue.map((p, i) => (
                    <div key={p.name} style={{ height:4, flex:1, borderRadius:2,
                      background: i===queueIdx ? p.color : 'var(--border)' }}/>
                  ))}
                </div>
              )}

              {/* Player header */}
              <div style={{ textAlign:'center', marginBottom:18 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:lbSelfiePlayer.color,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
                  fontWeight:900, color:'#000', margin:'0 auto 10px' }}>
                  {lbSelfiePlayer.name[0].toUpperCase()}
                </div>
                <h3 style={{ fontSize:22, fontWeight:900, letterSpacing:'-0.02em', margin:'0 0 4px',
                  color:lbSelfiePlayer.color }}>{lbSelfiePlayer.name}</h3>
                <p style={{ fontSize:14, color:'var(--text-2)', margin:0 }}>
                  🏆 Made the leaderboard with <strong style={{ color:'var(--yellow)' }}>{playerTotal} strokes</strong>!
                </p>
                {total > 1 && (
                  <p style={{ fontSize:12, color:'var(--text-3)', margin:'6px 0 0' }}>
                    Player {queueIdx+1} of {total}
                  </p>
                )}
              </div>

              {/* Step 1 — Flag */}
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em',
                  color:'var(--text-3)', marginBottom:10 }}>{t.stepFlag}</p>
                <CountryFlagPicker
                  player={lbSelfiePlayer}
                  sessionId={sessionId}
                  onDone={(code) => setLbSelfiePlayer(p => ({ ...p, _flagDone:true, countryCode:code }))}
                />
              </div>

              <div style={{ height:1, background:'var(--border)', margin:'12px 0 16px' }}/>

              {/* Step 2 — Selfie */}
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em',
                  color:'var(--text-3)', marginBottom:10 }}>{t.stepSelfie}</p>
                <LbSelfieButton
                  key={lbSelfiePlayer.name}
                  sessionId={sessionId}
                  player={lbSelfiePlayer}
                  countryCode={lbSelfiePlayer.countryCode || null}
                  onDone={nextPlayer}
                />
              </div>

              {/* Skip */}
              <button className="btn btn-ghost btn-full btn-sm"
                style={{ color:'var(--text-3)', fontSize:12 }}
                onClick={nextPlayer}>
                Skip {total > 1 ? '→ Next player' : ''}
              </button>
            </div>
          </div>
        )
      })()}
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
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 14 }}>{t.finalStandings}</p>
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

        {/* Score table — collapsible */}
        <button onClick={() => setShowFullScorecard(v => !v)}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'12px 16px', cursor:'pointer', fontFamily:'inherit', marginBottom: showFullScorecard ? 0 : 14 }}>
          <span style={{ fontSize:13, fontWeight:800, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Full Scorecard</span>
          <span style={{ fontSize:18, color:'var(--text-3)', transform: showFullScorecard ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>▾</span>
        </button>
        {showFullScorecard && (
        <div className="card" style={{ marginBottom: 14, overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius:'0 0 var(--radius) var(--radius)' }}>
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
        )}

        {/* Email */}
        {!sent ? (
          <div className="card-yellow" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Mail size={16} color="var(--yellow)" />
              <p style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>Get your scorecard + photos</p>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.55 }}>
              {t.emailScorecard}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" type="email" placeholder="your@email.com" value={email}
                onChange={e => { setEmail(e.target.value); setError('') }} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={sendEmail} disabled={sending || !email.trim()} style={{ flexShrink: 0 }}>
                {sending ? '…' : t.send}
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

        <ScorecardShare
          players={players}
          holes={holes}
          scores={scores}
          skippedHoles={skippedHoles}
        />

        <button className="btn btn-secondary btn-full btn-lg" onClick={handleFinishAttempt} style={{ gap: 8 }}>
          <RotateCcw size={18} /> {t.playAgain}
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
              {t.skippedHolesWarning}:
            </p>
            {skippedList.map(h => (
              <p key={h.id} style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 3 }}>— {h.title}</p>
            ))}
            <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: '14px 0 20px' }}>
              {t.skippedHolesDesc}
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
