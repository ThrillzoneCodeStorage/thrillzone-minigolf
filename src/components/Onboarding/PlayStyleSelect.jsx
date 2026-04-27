import { useState } from 'react'
import { ChevronRight, X, Zap, Trophy, Shuffle, Smile, Smartphone, Disc } from 'lucide-react'
import { useGame } from '../../context/GameContext'
import { useTranslation } from '../../lib/TranslationContext'
import { STRINGS, LANGUAGES, LANG_META } from '../../lib/i18n'

const STYLE_META = [
  { id:'casual',      Icon:Zap,     color:'#FFD600', bg:'rgba(255,214,0,0.07)',   border:'rgba(255,214,0,0.25)' },
  { id:'competitive', Icon:Trophy,  color:'#60a5fa', bg:'rgba(96,165,250,0.07)', border:'rgba(96,165,250,0.25)' },
  { id:'silly',       Icon:Shuffle, color:'#a78bfa', bg:'rgba(167,139,250,0.07)', border:'rgba(167,139,250,0.25)' },
  { id:'fun',         Icon:Smile,   color:'#fb923c', bg:'rgba(251,146,60,0.07)',  border:'rgba(251,146,60,0.25)' },
]

// SVG flag components — reliable cross-platform rendering
const FLAGS = {
  en: () => (
    <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius:2, flexShrink:0 }}>
      <rect width="22" height="16" fill="#012169"/>
      <path d="M0,0 L22,16 M22,0 L0,16" stroke="#fff" strokeWidth="3"/>
      <path d="M0,0 L22,16 M22,0 L0,16" stroke="#C8102E" strokeWidth="2"/>
      <path d="M11,0 V16 M0,8 H22" stroke="#fff" strokeWidth="5"/>
      <path d="M11,0 V16 M0,8 H22" stroke="#C8102E" strokeWidth="3"/>
    </svg>
  ),
  de: () => (
    <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius:2, flexShrink:0 }}>
      <rect width="22" height="16" fill="#000"/>
      <rect y="5.3" width="22" height="5.4" fill="#D00"/>
      <rect y="10.6" width="22" height="5.4" fill="#FFCE00"/>
    </svg>
  ),
  fr: () => (
    <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius:2, flexShrink:0 }}>
      <rect width="22" height="16" fill="#ED2939"/>
      <rect width="14.6" height="16" fill="#fff"/>
      <rect width="7.3" height="16" fill="#002395"/>
    </svg>
  ),
  es: () => (
    <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius:2, flexShrink:0 }}>
      <rect width="22" height="16" fill="#AA151B"/>
      <rect y="4" width="22" height="8" fill="#F1BF00"/>
    </svg>
  ),
  zh: () => (
    <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius:2, flexShrink:0 }}>
      <rect width="22" height="16" fill="#DE2910"/>
      <text x="3" y="10" fontSize="7" fill="#FFDE00" fontFamily="serif">★</text>
      <text x="9" y="6.5" fontSize="4" fill="#FFDE00" fontFamily="serif">★</text>
      <text x="12" y="9" fontSize="4" fill="#FFDE00" fontFamily="serif">★</text>
      <text x="12" y="13" fontSize="4" fill="#FFDE00" fontFamily="serif">★</text>
      <text x="9" y="13.5" fontSize="4" fill="#FFDE00" fontFamily="serif">★</text>
    </svg>
  ),
  hi: () => (
    <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius:2, flexShrink:0 }}>
      <rect width="22" height="16" fill="#fff"/>
      <rect width="22" height="5.3" fill="#FF9933"/>
      <rect y="10.7" width="22" height="5.3" fill="#138808"/>
      <circle cx="11" cy="8" r="2.5" fill="none" stroke="#000080" strokeWidth="0.7"/>
      <circle cx="11" cy="8" r="0.5" fill="#000080"/>
    </svg>
  ),
}

function LanguagePicker({ language, setLanguage }) {
  const [open, setOpen] = useState(false)
  const current = LANG_META[language]
  const Flag = FLAGS[language] || FLAGS.en

  return (
    <div style={{ position:'relative' }}>
      {/* Trigger */}
      <button onClick={() => setOpen(o => !o)} style={{
        display:'flex', alignItems:'center', gap:8,
        background:'var(--bg-card-2)', border:'1px solid var(--border)',
        borderRadius:10, padding:'7px 12px', cursor:'pointer',
        fontFamily:'inherit', transition:'all 0.15s',
        boxShadow: open ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
      }}>
        <Flag/>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--text-2)' }}>{current.name}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transition:'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M2 3.5 L5 6.5 L8 3.5" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div style={{ position:'fixed', inset:0, zIndex:98 }} onClick={() => setOpen(false)}/>
          <div style={{
            position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:99,
            background:'var(--bg-card)', border:'1px solid var(--border)',
            borderRadius:12, overflow:'hidden', minWidth:180,
            boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
            animation:'dropIn 0.15s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {Object.entries(LANG_META).map(([code, meta]) => {
              const isActive = code === language
              const F = FLAGS[code] || FLAGS.en
              return (
                <button key={code}
                  onClick={() => { setLanguage(code); setOpen(false) }}
                  style={{
                    display:'flex', alignItems:'center', gap:10, width:'100%',
                    padding:'10px 14px', border:'none', cursor:'pointer',
                    fontFamily:'inherit', textAlign:'left', transition:'background 0.1s',
                    background: isActive ? 'rgba(255,214,0,0.08)' : 'transparent',
                    borderLeft: `2px solid ${isActive ? 'var(--yellow)' : 'transparent'}`,
                  }}>
                  <F/>
                  <div>
                    <div style={{ fontSize:13, fontWeight:isActive?800:600, color:isActive?'var(--yellow)':'var(--text)', lineHeight:1.2 }}>
                      {meta.name}
                    </div>
                    <div style={{ fontSize:10, color:'var(--text-3)', marginTop:1 }}>{meta.native}</div>
                  </div>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft:'auto', flexShrink:0 }}>
                      <path d="M2.5 7 L5.5 10 L11.5 4" stroke="var(--yellow)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

export default function PlayStyleSelect() {
  const { setPlayStyle, setOnboardStep, setSpinnerPreference, setOptOut, language, setLanguage } = useGame()
  const t = useTranslation()
  const STYLES = STYLE_META.map(s => ({
    ...s,
    name: t[s.id],
    tag:  s.id==='casual' ? t.classic : s.id==='competitive' ? t.oneAtATime : s.id==='silly' ? t.spinTheWheel : t.noScores,
    desc: t[s.id+'Desc'],
  }))
  const [showSpinChoice, setShowSpinChoice] = useState(false)
  const [pendingStyle,   setPendingStyle]   = useState(null)

  function selectStyle(s) {
    if (s.id === 'silly') {
      setPendingStyle(s)
      setShowSpinChoice(true)
    } else {
      if (s.id === 'fun') setOptOut(true)
      setPlayStyle(s.id)
      setOnboardStep('players')
    }
  }

  function handleSpinChoice(pref) {
    setSpinnerPreference(pref)
    setPlayStyle('silly')
    setOnboardStep('players')
    setShowSpinChoice(false)
  }

  return (
    <div className="screen animate-in">
      <div className="screen-content" style={{ paddingBottom:40 }}>
        <div style={{ textAlign:'center', padding:'28px 0 24px', position:'relative' }}>
          {/* Language dropdown with flags */}
          <div style={{ position:'absolute', top:0, right:0 }}>
            <LanguagePicker language={language} setLanguage={setLanguage}/>
          </div>
          <img src="/logo.png" alt="Thrillzone" style={{ height:56, objectFit:'contain', marginBottom:18 }}/>
          <h1 style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Mini Golf</h1>
          <p style={{ color:'var(--text-2)', fontSize:15 }}>{t.chooseStyle}</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {STYLES.map((s, i) => (
            <button key={s.id} onClick={() => selectStyle(s)}
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

      {/* Silly spinner choice */}
      {showSpinChoice && (
        <div className="modal-center">
          <div className="modal-box" style={{ textAlign:'center' }}>
            <button onClick={() => setShowSpinChoice(false)} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', display:'flex' }}>
              <X size={18}/>
            </button>
            <div style={{ width:60, height:60, borderRadius:16, background:'rgba(167,139,250,0.10)', border:'1.5px solid rgba(167,139,250,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Shuffle size={28} color="#a78bfa" strokeWidth={1.75}/>
            </div>
            <h3 style={{ fontSize:20, fontWeight:900, letterSpacing:'-0.02em', marginBottom:8 }}>{t.howToSpin || 'How do you want to spin?'}</h3>
            <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.65, marginBottom:24 }}>{t.spinChoiceDesc || 'After each hole someone spins for a challenge — digital on your phone or the physical wheel in the corner!'}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="btn btn-full" onClick={() => handleSpinChoice('digital')}
                style={{ background:'rgba(167,139,250,0.10)', border:'1.5px solid rgba(167,139,250,0.30)', color:'#a78bfa', fontWeight:800, fontSize:15, padding:'16px', gap:10, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--radius)', cursor:'pointer', fontFamily:'inherit' }}>
                <Smartphone size={20}/>{t.spinOnPhone || 'Spin on my phone'}
              </button>
              <button className="btn btn-full" onClick={() => handleSpinChoice('physical')}
                style={{ background:'var(--bg-card-2)', border:'1px solid var(--border)', color:'var(--text-2)', fontWeight:700, fontSize:15, padding:'16px', gap:10, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--radius)', cursor:'pointer', fontFamily:'inherit' }}>
                <Disc size={20}/>{t.spinPhysical || 'Use physical wheel in the corner'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
