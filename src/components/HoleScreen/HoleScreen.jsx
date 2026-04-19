import { useState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, Info, SkipForward, Crown,
  Flag, Target, AlertTriangle, CheckCircle, X,
  Shuffle, Camera, RefreshCw
} from 'lucide-react'
import { useGame } from '../../context/GameContext'
import { getSpinnerEffects, getGameModeRules } from '../../lib/supabase'
import LeaderboardStrip from '../Leaderboard/LeaderboardStrip'
import SpinnerWheel from '../SpinnerWheel/SpinnerWheel'
import { CameraNavButton, PhotoGallery } from '../PhotoSystem/PhotoSystem'
import { HoleInOnePopup, FloatNumber, HoleTransition } from './Celebrations'
import Hole8Timer from './Hole8Timer'

const FALLBACK_RULES = {
  casual:      ['Count every stroke honestly','Ball must stop before next shot','Out of bounds = +1 penalty stroke','Lowest total strokes wins'],
  competitive: ['One player takes their turn at a time','You may nudge other players\' balls','Ball must stop before the next player goes','Winner of each hole goes first on the next'],
  silly:       ['Normal scoring applies — every stroke counts','Spin the wheel after completing each hole','Wheel effects must be carried out immediately','Lowest total strokes still wins'],
  fun:         ['No scores are tracked','Read each hole\'s description as you go','Take as many shots as you like','The only goal is to have a great time'],
}

const STYLE_CONFIG = {
  casual:      { label:'Casual',       color:'#FFD600' },
  competitive: { label:'Competitive',  color:'#60a5fa' },
  silly:       { label:'Silly',        color:'#a78bfa' },
  fun:         { label:'Just for Fun', color:'#fb923c' },
}

// Physical spinner prompt — shown instead of digital wheel
function PhysicalSpinnerPrompt({ onDone }) {
  return (
    <div className="modal-center">
      <div className="modal-box" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎡</div>
        <h3 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>
          Spin the wheel!
        </h3>
        <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 24 }}>
          Head to the physical wheel in the corner and give it a spin. Come back when you're done!
        </p>
        <button className="btn btn-primary btn-full btn-lg" onClick={onDone}>
          <CheckCircle size={18}/> Done — let's continue!
        </button>
      </div>
    </div>
  )
}

// Mode change modal
function ModeChangeModal({ current, onSelect, onClose, onRestart }) {
  const styles = ['casual','competitive','silly','fun']
  const [confirmRestart, setConfirmRestart] = useState(false)

  if (confirmRestart) return (
    <div className="modal-center">
      <div className="modal-box" style={{ textAlign:'center' }}>
        <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,59,59,0.10)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
          <AlertTriangle size={26} color="var(--red)"/>
        </div>
        <h3 style={{ fontSize:18, fontWeight:900, marginBottom:8, letterSpacing:'-0.02em' }}>Restart the game?</h3>
        <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6, marginBottom:20 }}>
          All scores and photos from this round will be lost. This cannot be undone.
        </p>
        <div style={{ display:'flex', gap:9 }}>
          <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setConfirmRestart(false)}>Cancel</button>
          <button className="btn btn-danger" style={{ flex:1 }} onClick={onRestart}>Restart</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontSize:19, fontWeight:900, letterSpacing:'-0.02em' }}>Game Options</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-2)', cursor:'pointer', padding:4, display:'flex' }}>
            <X size={20}/>
          </button>
        </div>
        <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)', marginBottom:12 }}>Change Play Style</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          {styles.map(s => {
            const cfg = STYLE_CONFIG[s]
            const isCurrent = s === current
            return (
              <button key={s} onClick={() => { onSelect(s); onClose() }}
                style={{
                  display:'flex', alignItems:'center', gap:14,
                  background: isCurrent ? `${cfg.color}10` : 'var(--bg-card-2)',
                  border: `1.5px solid ${isCurrent ? cfg.color+'40' : 'var(--border)'}`,
                  borderRadius:'var(--radius)', padding:'14px 18px',
                  cursor:'pointer', textAlign:'left', fontFamily:'inherit', width:'100%',
                }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:cfg.color, flexShrink:0 }}/>
                <span style={{ fontSize:15, fontWeight:800, color:isCurrent?cfg.color:'var(--text)', letterSpacing:'-0.01em' }}>{cfg.label}</span>
                {isCurrent && <span style={{ marginLeft:'auto', fontSize:12, color:cfg.color, fontWeight:700 }}>Current</span>}
              </button>
            )
          })}
        </div>
        <div className="divider"/>
        <button
          onClick={() => setConfirmRestart(true)}
          className="btn btn-ghost btn-full"
          style={{ color:'var(--red)', borderColor:'rgba(255,59,59,0.2)', gap:8, marginTop:8 }}
        >
          <RefreshCw size={15}/> Restart Game
        </button>
      </div>
    </div>
  )
}

export default function HoleScreen() {
  const {
    currentHole, currentHoleIndex, holes, players, scores, saveScore,
    playStyle, changePlayStyle, nextHole, goToHole, skipHole, playAgain,
    showPhotoGallery, setShowPhotoGallery,
    showSpinner, dismissSpinner, setShowSpinner, setSpinnerEffect,
    currentTurnIndex, setCurrentTurnIndex,
    previousHoleWinner,
    spinnerPreference,
    showPostHole8Camera, setShowPostHole8Camera,
  } = useGame()

  const [localScores, setLocalScores]           = useState({})
  const [showRules, setShowRules]               = useState(false)
  const [showModeChange, setShowModeChange]     = useState(false)
  const [rules, setRules]                       = useState([])
  const [spinnerEffects, setSpinnerEffects]     = useState([])
  const [pickedEffect, setPickedEffect]         = useState(null)
  const [showZeroWarn, setShowZeroWarn]         = useState(false)
  const [showSkipConfirm, setShowSkipConfirm]   = useState(false)
  const [showPhysicalSpin, setShowPhysicalSpin] = useState(false)
  const [holeInOnePlayers, setHoleInOnePlayers] = useState([])
  const [floaters, setFloaters]                 = useState([])
  const [transition, setTransition]             = useState(null)
  const [pendingNav, setPendingNav]             = useState(null)

  useEffect(() => {
    if (playStyle === 'silly') getSpinnerEffects().then(setSpinnerEffects)
    getGameModeRules(playStyle).then(r => setRules(r.length > 0 ? r : FALLBACK_RULES[playStyle] || []))
  }, [playStyle])

  useEffect(() => {
    if (!currentHole) return
    const existing = scores[currentHole.id] || {}
    const initial = {}
    players.forEach(p => {
      const saved = existing[p.name]
      initial[p.name] = (saved !== undefined && saved !== null) ? saved : null
    })
    setLocalScores(initial)
  }, [currentHole?.id])

  if (!currentHole) return (
    <div className="screen" style={{ alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'var(--text-2)' }}>Loading…</p>
    </div>
  )

  const holeNum    = currentHoleIndex + 1
  const totalHoles = holes.length
  const isLast     = currentHoleIndex === totalHoles - 1
  const isHole8    = currentHoleIndex === 7
  const allUnset   = players.every(p => localScores[p.name] === null || localScores[p.name] === undefined)

  function increment(playerName) {
    setLocalScores(prev => ({ ...prev, [playerName]: (prev[playerName] ?? 0) + 1 }))
    const el = document.getElementById(`score-plus-${playerName}`)
    if (el) addFloater(1, el)
  }

  function decrement(playerName) {
    setLocalScores(prev => {
      const cur = prev[playerName]
      if (cur === null || cur === undefined || cur <= 1) return { ...prev, [playerName]: null }
      return { ...prev, [playerName]: cur - 1 }
    })
    const el = document.getElementById(`score-minus-${playerName}`)
    if (el) addFloater(-1, el)
  }

  function addFloater(delta, el) {
    const rect = el.getBoundingClientRect()
    setFloaters(f => [...f, { id: Date.now() + Math.random(), value: delta, x: rect.left + rect.width / 2, y: rect.top }])
  }

  async function doNavigate() {
    if (playStyle === 'silly' && spinnerEffects.length > 0) {
      const effect = spinnerEffects[Math.floor(Math.random() * spinnerEffects.length)]
      setPickedEffect(effect)
      if (spinnerPreference === 'physical') {
        setShowPhysicalSpin(true)
      } else {
        await nextHole(effect)
      }
    } else {
      const nextIdx = currentHoleIndex + 1
      if (!isLast && holes[nextIdx]) {
        setTransition({ number: nextIdx + 1, title: holes[nextIdx].title })
        setTimeout(() => { setTransition(null); nextHole(null) }, 1100)
      } else {
        await nextHole(null)
      }
    }
  }

  async function handleNext() {
    if (allUnset && playStyle !== 'fun') { setShowZeroWarn(true); return }
    const saved = {}
    for (const player of players) {
      const strokes = localScores[player.name]
      if (strokes !== null && strokes !== undefined && playStyle !== 'fun') {
        await saveScore(currentHole.id, player.name, strokes)
        saved[player.name] = strokes
      }
    }
    const hio = players.filter(p => saved[p.name] === 1)
    if (hio.length > 0) {
      setHoleInOnePlayers(hio)
      setPendingNav(() => doNavigate)
    } else {
      await doNavigate()
    }
  }

  const currentPlayer = players[currentTurnIndex % players.length]

  return (
    <div className="screen">
      {/* Progress */}
      <div style={{ height:3, background:'var(--bg-card-2)', flexShrink:0 }}>
        <div style={{ height:'100%', width:`${(holeNum/totalHoles)*100}%`, background:'var(--yellow)', transition:'width 0.5s cubic-bezier(0.16,1,0.3,1)', borderRadius:'0 2px 2px 0', boxShadow:'0 0 8px rgba(255,214,0,0.4)' }}/>
      </div>

      {/* Header */}
      <div style={{ padding:'13px 20px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:9 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13, fontWeight:900, color:'var(--yellow)', letterSpacing:'-0.01em' }}>
              {String(holeNum).padStart(2,'0')}
              <span style={{ color:'var(--text-3)', fontWeight:500 }}> / {totalHoles}</span>
            </span>
            <span className="pill" style={{
              background:currentHole.type==='hole'?'rgba(255,214,0,0.08)':'rgba(167,139,250,0.08)',
              color:currentHole.type==='hole'?'var(--yellow)':'var(--purple)',
              border:`1px solid ${currentHole.type==='hole'?'rgba(255,214,0,0.22)':'rgba(167,139,250,0.22)'}`,
            }}>
              {currentHole.type==='hole'?<Flag size={10}/>:<Target size={10}/>}
              {currentHole.type==='hole'?'Hole':'Challenge'}
            </span>
          </div>
          <div style={{ display:'flex', gap:7 }}>
            {/* Mode change */}
            <button onClick={() => setShowModeChange(true)}
              style={{ background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 10px', color:'var(--text-2)', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:600, display:'flex', alignItems:'center', gap:5, minHeight:36 }}>
              <Shuffle size={13}/>
              <span style={{ color: STYLE_CONFIG[playStyle]?.color }}>{STYLE_CONFIG[playStyle]?.label}</span>
            </button>
            <button onClick={() => setShowRules(true)}
              style={{ background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 12px', color:'var(--text-2)', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:600, display:'flex', alignItems:'center', gap:5, minHeight:36 }}>
              <Info size={14}/> Rules
            </button>
          </div>
        </div>

        <h2 style={{ fontSize:22, fontWeight:900, letterSpacing:'-0.03em', marginBottom:3, lineHeight:1.2 }}>{currentHole.title}</h2>
        {currentHole.description && (
          <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.58, marginBottom:9 }}>{currentHole.description}</p>
        )}

        {/* Competitive turn */}
        {playStyle==='competitive' && currentPlayer && (
          <div style={{ background:`${currentPlayer.color}12`, border:`1.5px solid ${currentPlayer.color}35`, borderRadius:11, padding:'9px 13px', marginBottom:9, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:currentPlayer.color, animation:'glowRing 1.5s infinite' }}/>
              <span style={{ fontSize:14, fontWeight:700 }}>{currentPlayer.name}'s turn</span>
            </div>
            <button onClick={() => setCurrentTurnIndex(i => i+1)}
              style={{ background:currentPlayer.color, color:'#000', border:'none', borderRadius:8, padding:'6px 13px', fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }}>
              Next <ChevronRight size={14}/>
            </button>
          </div>
        )}

        {/* Winner indicator */}
        {previousHoleWinner && playStyle!=='competitive' && playStyle!=='fun' && (
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:9, padding:'6px 11px', background:'var(--yellow-dim)', border:'1px solid var(--border-y)', borderRadius:8 }}>
            <Crown size={13} color="var(--yellow)"/>
            <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)' }}>
              <span style={{ color:previousHoleWinner.color, fontWeight:800 }}>{previousHoleWinner.name}</span> won last hole — goes first
            </span>
          </div>
        )}
      </div>

      {/* Score inputs */}
      <div className="screen-content" style={{ paddingTop:8 }}>

        {/* Hole 8 timer */}
        {isHole8 && <Hole8Timer/>}

        {playStyle!=='fun' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:12 }}>
            {players.map(player => {
              const val = localScores[player.name]
              const isSet = val !== null && val !== undefined
              const runningTotal = Object.entries(scores)
                .filter(([hid]) => hid !== currentHole.id)
                .reduce((a,[,h]) => a + (h[player.name]||0), 0) + (isSet ? val : 0)
              const isWinner = previousHoleWinner?.name === player.name
              return (
                <div key={player.name} style={{ background:'var(--bg-card)', border:`1.5px solid ${isSet?player.color+'28':isWinner?'var(--border-y)':'var(--border)'}`, borderRadius:'var(--radius)', padding:'12px 14px', transition:'border-color 0.2s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:9 }}>
                    <div style={{ width:9, height:9, borderRadius:'50%', background:player.color, flexShrink:0 }}/>
                    <span style={{ fontWeight:800, fontSize:14, flex:1, letterSpacing:'-0.01em' }}>{player.name}</span>
                    {isWinner && <Crown size={13} color="var(--yellow)"/>}
                    <span style={{ fontSize:12, color:'var(--text-3)' }}>Total <strong style={{ color:'var(--text-2)', fontWeight:800 }}>{runningTotal}</strong></span>
                  </div>
                  <div className="score-input-wrap">
                    <button id={`score-minus-${player.name}`} className="score-btn score-btn-minus" onClick={() => decrement(player.name)}>−</button>
                    <div className={`score-display${isSet?' active':''}`} key={`${player.name}-${val}`} style={{ animation:'countUp 0.18s cubic-bezier(0.34,1.56,0.64,1)' }}>
                      {isSet ? val : '—'}
                    </div>
                    <button id={`score-plus-${player.name}`} className="score-btn score-btn-plus" onClick={() => increment(player.name)}>+</button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ background:'var(--yellow-dim)', border:'1.5px solid var(--border-y)', borderRadius:'var(--radius)', padding:24, marginBottom:12, textAlign:'center' }}>
            <p style={{ color:'var(--text-2)', fontSize:15, lineHeight:1.6 }}>Just for Fun mode — enjoy the hole and tap Next when ready!</p>
          </div>
        )}

        {/* Nav */}
        <div style={{ display:'flex', gap:9, marginBottom:9 }}>
          <button className="btn btn-ghost" onClick={() => goToHole(currentHoleIndex-1)} disabled={currentHoleIndex===0} style={{ flex:1, gap:5 }}>
            <ChevronLeft size={17}/> Back
          </button>
          <CameraNavButton onClick={() => setShowPhotoGallery(true)} photoCount={0}/>
          <button className="btn btn-primary" onClick={handleNext} style={{ flex:2, gap:5 }}>
            {isLast ? 'Finish' : 'Next'}{!isLast && <ChevronRight size={17}/>}
          </button>
        </div>

        <button className="btn btn-ghost btn-full btn-sm" onClick={() => setShowSkipConfirm(true)} style={{ gap:6, color:'var(--text-3)' }}>
          <SkipForward size={14}/> Skip this hole
        </button>
      </div>

      <LeaderboardStrip/>
      {showPhotoGallery && <PhotoGallery onClose={() => setShowPhotoGallery(false)}/>}
      {showSpinner && spinnerPreference==='digital' && <SpinnerWheel effects={spinnerEffects} forcedEffect={pickedEffect} onDismiss={dismissSpinner}/>}
      {showPhysicalSpin && (
        <PhysicalSpinnerPrompt onDone={() => {
          setShowPhysicalSpin(false)
          dismissSpinner()
        }}/>
      )}

      {floaters.map(f => (
        <FloatNumber key={f.id} value={f.value} x={f.x} y={f.y} onDone={() => setFloaters(fl => fl.filter(x => x.id!==f.id))}/>
      ))}

      {holeInOnePlayers.length > 0 && (
        <HoleInOnePopup players={holeInOnePlayers}
          onDismiss={async () => { setHoleInOnePlayers([]); if (pendingNav) { await pendingNav(); setPendingNav(null) } }}/>
      )}

      {transition && <HoleTransition holeNumber={transition.number} title={transition.title} onDone={() => setTransition(null)}/>}

      {/* Post hole 8 camera popup */}
      {showPostHole8Camera && (
        <div className="modal-center">
          <div className="modal-box" style={{ textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:18, background:'var(--yellow-dim)', border:'1.5px solid var(--border-y)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Camera size={30} color="var(--yellow)" strokeWidth={1.5}/>
            </div>
            <h3 style={{ fontSize:20, fontWeight:900, letterSpacing:'-0.02em', marginBottom:8 }}>
              Make some memories!
            </h3>
            <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.65, marginBottom:22 }}>
              Take some memorable photos with you and your group before heading to the next hole!
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="btn btn-primary btn-full" onClick={() => { setShowPostHole8Camera(false); setShowPhotoGallery(true) }}>
                <Camera size={18}/> Open Camera
              </button>
              <button className="btn btn-ghost btn-full" onClick={() => setShowPostHole8Camera(false)}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zero warning */}
      {showZeroWarn && (
        <div className="modal-center">
          <div className="modal-box" style={{ textAlign:'center' }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'rgba(255,59,59,0.10)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <AlertTriangle size={26} color="var(--red)"/>
            </div>
            <h3 style={{ fontSize:18, fontWeight:900, marginBottom:8, letterSpacing:'-0.02em' }}>No scores entered</h3>
            <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6, marginBottom:20 }}>
              None of your players have a score yet. Skip this hole, or go back and score it.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              <button className="btn btn-primary btn-full" onClick={() => { setShowZeroWarn(false); skipHole() }}>
                <SkipForward size={15}/> Skip this hole
              </button>
              <button className="btn btn-ghost btn-full" onClick={() => setShowZeroWarn(false)}>Go back and score it</button>
            </div>
          </div>
        </div>
      )}

      {/* Skip confirm */}
      {showSkipConfirm && (
        <div className="modal-center">
          <div className="modal-box" style={{ textAlign:'center' }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'var(--yellow-dim)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <SkipForward size={26} color="var(--yellow)"/>
            </div>
            <h3 style={{ fontSize:18, fontWeight:900, marginBottom:8, letterSpacing:'-0.02em' }}>Skip this hole?</h3>
            <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6, marginBottom:20 }}>
              Shows as <strong style={{ color:'var(--text)' }}>—</strong> in your scorecard and won't count. You can fill it in at the end.
            </p>
            <div style={{ display:'flex', gap:9 }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowSkipConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={() => { setShowSkipConfirm(false); skipHole() }}>Skip it</button>
            </div>
          </div>
        </div>
      )}

      {/* Rules */}
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h3 style={{ fontSize:18, fontWeight:900, letterSpacing:'-0.02em' }}>Game Rules</h3>
              <button onClick={() => setShowRules(false)} style={{ background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-2)', cursor:'pointer', padding:'6px 10px', display:'flex' }}>
                <X size={16}/>
              </button>
            </div>
            <div className="pill pill-yellow" style={{ marginBottom:14 }}>{playStyle?.toUpperCase()} MODE</div>
            {rules.map((r,i) => (
              <div key={i} style={{ display:'flex', gap:11, marginBottom:13, alignItems:'flex-start' }}>
                <CheckCircle size={15} color="var(--yellow)" style={{ flexShrink:0, marginTop:2 }}/>
                <span style={{ color:'var(--text-2)', fontSize:14, lineHeight:1.6 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode change */}
      {showModeChange && (
        <ModeChangeModal
          current={playStyle}
          onSelect={changePlayStyle}
          onClose={() => setShowModeChange(false)}
          onRestart={() => { setShowModeChange(false); playAgain() }}
        />
      )}

      <style>{`
        @keyframes countUp{from{transform:translateY(8px) scale(0.88);opacity:0}to{transform:none;opacity:1}}
        @keyframes glowRing{0%,100%{box-shadow:0 0 0 0 rgba(255,214,0,0.4)}50%{box-shadow:0 0 0 5px rgba(255,214,0,0)}}
        @keyframes popIn{0%{opacity:0;transform:scale(0.6)}80%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  )
}
