import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { useGame } from '../../context/GameContext'
import PlayingCardsRules from '../Rules/PlayingCardsRules'

const PLAYER_COLORS = [
  '#FFD600',
  '#60a5fa',
  '#a78bfa',
  '#34d399',
  '#fb923c',
  '#f472b6',
  '#38bdf8',
  '#facc15',
  '#4ade80',
  '#818cf8',
  '#2dd4bf',
  '#e879f9',
  '#a3e635',
  '#67e8f9',
  '#fb7185',
  '#f87171',
]

const STYLE_LABELS = { casual:'Casual', competitive:'Competitive', silly:'Silly', fun:'Just for Fun' }

const RULES_MAP = {
  casual:      ['Count every stroke honestly.','Your ball must stop before your next shot.','Ball out of bounds = +1 penalty stroke.','Lowest total strokes at the end wins!'],
  competitive: ['One player takes their full turn before the next.','You may nudge other players\' balls out of your path.','Ball must stop before the next player goes.','Winner of each hole goes first on the next.'],
  silly:       ['Normal scoring applies — every stroke counts.','After each hole, someone spins the wheel.','Whatever the wheel lands on must be carried out!','Lowest total strokes still wins — even with chaos.'],
  fun:         ['No scores are tracked — no winner or loser.','Read each hole\'s description as you go.','Take as many shots as you like.','The only goal is to have a great time!'],
}

const STYLE_COLORS = { casual:'#FFD600', competitive:'#60a5fa', silly:'#a78bfa', fun:'#fb923c' }

export default function PlayerSetup() {
  const { setOnboardStep, playStyle, optOut, startGame, isLoading, spinnerPreference, setPendingPlayers } = useGame()
  const [names,     setNames]     = useState([''])
  const [showRules, setShowRules] = useState(false)

  const add    = () => names.length < 16 && setNames(n => [...n, ''])
  const remove = i  => setNames(n => n.filter((_,j) => j !== i))

  function update(i, v) {
    setNames(n => { const c=[...n]; c[i]=v; return c })
  }

  // Deduplicate names in real time — adds (2), (3) etc
  function deduped(rawNames) {
    const seen = {}
    return rawNames.filter(Boolean).map(name => {
      if (seen[name] === undefined) { seen[name] = 1; return name }
      seen[name]++; return `${name} (${seen[name]})`
    })
  }

  const validNames = names.map(n => n.trim()).filter(Boolean)
  const hasDupe    = new Set(validNames).size !== validNames.length

  async function handleContinue() {
    if (!validNames.length) return
    setShowRules(true)
  }

  async function startAfterRules() {
    const finalNames = deduped(names.map(n => n.trim()))
    await startGame({
      playStyle, optOut, spinnerPreference,
      players: finalNames.map((name,i) => ({ name, color: PLAYER_COLORS[i % PLAYER_COLORS.length] })),
    })
  }

  const accentColor = STYLE_COLORS[playStyle] || '#FFD600'

  return (
    <div className="screen animate-in">
      <div className="screen-content" style={{ paddingBottom:40 }}>
        <button onClick={() => setOnboardStep('playStyle')}
          style={{ background:'none', border:'none', color:'var(--text-2)', fontSize:14, cursor:'pointer', textAlign:'left', marginBottom:24, fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, fontWeight:600, padding:0 }}>
          <ChevronLeft size={18}/> Back
        </button>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:`${accentColor}12`, border:`1px solid ${accentColor}30`, borderRadius:20, padding:'5px 14px', marginBottom:12 }}>
            <span style={{ fontSize:13, fontWeight:700, color:accentColor }}>{STYLE_LABELS[playStyle]}</span>
          </div>
          <h2 style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.03em', marginBottom:6 }}>Who's playing?</h2>
          <p style={{ color:'var(--text-2)', fontSize:14 }}>Add up to 16 players</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {names.map((name, i) => {
            const isDupe = validNames.filter(n => n === name.trim()).length > 1 && name.trim()
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, animation:`fadeIn 0.25s ${i*0.04}s both` }}>
                <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, background:PLAYER_COLORS[i % PLAYER_COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', color:'#000', fontWeight:900, fontSize:13 }}>
                  {name.trim() ? name.trim()[0].toUpperCase() : i+1}
                </div>
                <input className="input" placeholder={`Player ${i+1}`} value={name}
                  onChange={e => update(i, e.target.value)}
                  maxLength={20} autoComplete="off" autoCapitalize="words"
                  onKeyDown={e => e.key==='Enter' && i===names.length-1 && add()}
                  style={{ flex:1, borderColor: isDupe ? 'rgba(255,214,0,0.5)' : undefined, fontSize:15, padding:'11px 14px' }}/>
                {names.length > 1 && (
                  <button onClick={() => remove(i)}
                    style={{ background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-3)', cursor:'pointer', padding:6, display:'flex', minWidth:32, minHeight:32 }}>
                    <X size={14}/>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {hasDupe && (
          <p style={{ fontSize:12, color:'var(--yellow)', marginBottom:12, paddingLeft:4 }}>
            Duplicate names will get a number added automatically (e.g. "Max (2)")
          </p>
        )}

        {names.length < 16 && (
          <button className="btn btn-ghost btn-full" onClick={add} style={{ marginBottom:16, gap:7 }}>
            <Plus size={15}/> Add player
          </button>
        )}

        <button className="btn btn-primary btn-full btn-lg" onClick={handleContinue}
          disabled={!validNames.length || isLoading}
          style={{ gap:7 }}>
          View rules &amp; start <ChevronRight size={18}/>
        </button>
      </div>

      {/* Rules sheet shown after players entered */}
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <div>
                <h3 style={{ fontSize:19, fontWeight:900, letterSpacing:'-0.02em', margin:0 }}>Game Rules</h3>
                <p style={{ fontSize:13, color:'var(--text-2)', margin:'2px 0 0' }}>
                  {validNames.length} player{validNames.length!==1?'s':''} · {STYLE_LABELS[playStyle]}
                </p>
              </div>
              <button onClick={() => setShowRules(false)} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', padding:4 }}>
                <X size={20}/>
              </button>
            </div>
            <PlayingCardsRules
              title={STYLE_LABELS[playStyle]}
              rules={RULES_MAP[playStyle] || []}
              accent={accentColor}
              onDone={() => {
                setShowRules(false)
                const finalNames = deduped(names.map(n => n.trim()))
                const finalPlayers = finalNames.map((name,i) => ({ name, color: PLAYER_COLORS[i % PLAYER_COLORS.length] }))
                if (playStyle === 'fun') {
                  startAfterRules()
                } else {
                  setPendingPlayers(finalPlayers)
                  setOnboardStep('optOut')
                }
              }}
            />
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
