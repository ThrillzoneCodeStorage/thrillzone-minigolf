import { useState } from 'react'
import { ChevronRight, Check, Zap, Trophy, Shuffle, Smile, Smartphone, Disc, X } from 'lucide-react'
import PlayingCardsRules from '../Rules/PlayingCardsRules'
import { useGame } from '../../context/GameContext'

const STYLES = [
  { id:'casual',      Icon:Zap,     name:'Casual',        tag:'Classic',        desc:'Normal scoring. Relaxed, no pressure.', color:'#FFD600', bg:'rgba(255,214,0,0.07)',   border:'rgba(255,214,0,0.25)', rules:['Count every stroke honestly.','Your ball must stop before your next shot.','Ball out of bounds = +1 penalty stroke.','Lowest total strokes at the end wins!'] },
  { id:'competitive', Icon:Trophy,  name:'Competitive',   tag:'One at a time',  desc:'Take turns. You can nudge other balls.', color:'#60a5fa', bg:'rgba(96,165,250,0.07)', border:'rgba(96,165,250,0.25)', rules:['One player takes their full turn before the next.','You may nudge other players\' balls out of your path.','Ball must stop before the next player goes.','Winner of each hole goes first on the next.'] },
  { id:'silly',       Icon:Shuffle, name:'Silly',         tag:'Spin the wheel', desc:'Normal scoring + a spin wheel after every hole.', color:'#a78bfa', bg:'rgba(167,139,250,0.07)', border:'rgba(167,139,250,0.25)', rules:['Normal scoring applies — every stroke counts.','After each hole, someone spins the wheel.','Whatever the wheel lands on must be carried out!','Lowest total strokes still wins — even with chaos.'] },
  { id:'fun',         Icon:Smile,   name:'Just for Fun',  tag:'No scores',      desc:'No scores, no leaderboard. Just enjoy the course.', color:'#fb923c', bg:'rgba(251,146,60,0.07)',  border:'rgba(251,146,60,0.25)', rules:['No scores are tracked — no winner or loser.','Read each hole\'s description as you go.','Take as many shots as you like.','The only goal is to have a great time!'] },
]

export default function PlayStyleSelect() {
  const { setPlayStyle, setOnboardStep, setSpinnerPreference, setOptOut } = useGame()
  const [preview, setPreview]               = useState(null)
  const [showSpinChoice, setShowSpinChoice] = useState(false)

  function handleRulesDone() {
    if (preview?.id === 'silly') {
      setShowSpinChoice(true)
    } else {
      // Fun mode: auto opt-out, skip leaderboard screen
      if (preview?.id === 'fun') setOptOut(true)
      setPlayStyle(preview.id)
      setOnboardStep(preview.id === 'fun' ? 'players' : 'optOut')
      setPreview(null)
    }
  }

  function handleSpinChoice(pref) {
    setSpinnerPreference(pref)
    setPlayStyle('silly')
    setOnboardStep('optOut')
    setPreview(null)
    setShowSpinChoice(false)
  }

  return (
    <div className="screen animate-in">
      <div className="screen-content" style={{ paddingBottom:40 }}>
        <div style={{ textAlign:'center', padding:'28px 0 24px' }}>
          <img src="/logo.png" alt="Thrillzone" style={{ height:56, objectFit:'contain', marginBottom:18 }}/>
          <h1 style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Mini Golf</h1>
          <p style={{ color:'var(--text-2)', fontSize:15 }}>Choose your play style</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {STYLES.map((s,i) => (
            <button key={s.id} onClick={() => setPreview(s)}
              style={{
                display:'flex', alignItems:'center', gap:16,
                background:s.bg, border:`1.5px solid ${s.border}`,
                borderRadius:'var(--radius)', padding:'16px 18px',
                cursor:'pointer', textAlign:'left', width:'100%', fontFamily:'inherit',
                animation:`fadeIn 0.35s ${i*0.06}s both`,
                transition:'transform 0.12s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              onTouchStart={e => e.currentTarget.style.transform='scale(0.97)'}
              onTouchEnd={e => e.currentTarget.style.transform=''}
            >
              <div style={{ width:44, height:44, borderRadius:12, background:s.border, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <s.Icon size={22} color={s.color} strokeWidth={2}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:16, fontWeight:800, color:s.color, letterSpacing:'-0.02em' }}>{s.name}</span>
                  <span className="pill" style={{ background:s.border, color:s.color, border:'none' }}>{s.tag}</span>
                </div>
                <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.45 }}>{s.desc}</p>
              </div>
              <ChevronRight size={18} color="var(--text-3)" style={{ flexShrink:0 }}/>
            </button>
          ))}
        </div>
      </div>

      {/* Rules sheet — shown AFTER style selected */}
      {preview && !showSpinChoice && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:2 }}>
                  <preview.Icon size={20} color={preview.color}/>
                  <h3 style={{ fontSize:20, fontWeight:900, letterSpacing:'-0.02em' }}>{preview.name}</h3>
                </div>
                <p style={{ fontSize:13, color:'var(--text-2)' }}>Quick rules, then add your players</p>
              </div>
              <button onClick={() => setPreview(null)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:4 }}>
                <X size={20}/>
              </button>
            </div>
            <PlayingCardsRules title={preview.name} rules={preview.rules} accent={preview.color} onDone={handleRulesDone}/>
          </div>
        </div>
      )}

      {/* Silly: spinner choice */}
      {showSpinChoice && (
        <div className="modal-center">
          <div className="modal-box" style={{ textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:16, background:'rgba(167,139,250,0.10)', border:'1.5px solid rgba(167,139,250,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Shuffle size={28} color="#a78bfa" strokeWidth={1.75}/>
            </div>
            <h3 style={{ fontSize:20, fontWeight:900, letterSpacing:'-0.02em', marginBottom:8 }}>How do you want to spin?</h3>
            <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.65, marginBottom:24 }}>
              After each hole someone spins to get a challenge — use the digital wheel on your phone, or the physical wheel in the corner!
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="btn btn-full" onClick={() => handleSpinChoice('digital')}
                style={{ background:'rgba(167,139,250,0.10)', border:'1.5px solid rgba(167,139,250,0.30)', color:'#a78bfa', fontWeight:800, fontSize:15, padding:'16px', gap:10, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--radius)', cursor:'pointer', fontFamily:'inherit' }}>
                <Smartphone size={20}/> Spin on my phone
              </button>
              <button className="btn btn-full" onClick={() => handleSpinChoice('physical')}
                style={{ background:'var(--bg-card-2)', border:'1px solid var(--border)', color:'var(--text-2)', fontWeight:700, fontSize:15, padding:'16px', gap:10, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--radius)', cursor:'pointer', fontFamily:'inherit' }}>
                <Disc size={20}/> Use physical wheel in the corner
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
