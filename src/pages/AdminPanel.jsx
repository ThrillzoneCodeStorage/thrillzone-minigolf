// ── Reports Tab ───────────────────────────────────────────────
function ReportsTab() {
  const [stats,  setStats]  = useState(null)
  const [period, setPeriod] = useState('today')
  const [loading,setLoading]= useState(true)

  async function load() {
    setLoading(true)
    try { setStats(await getReportingStats()) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const STYLE_COLORS = { casual:'#FFD600', competitive:'#60a5fa', silly:'#a78bfa', fun:'#fb923c' }
  const p = stats ? (period==='today' ? stats.today : period==='week' ? stats.week : stats.all) : null
  const ph= stats ? (period==='today' ? stats.photos.today : period==='week' ? stats.photos.week : stats.photos.all) : null

  function StatCard({ icon: Icon, label, value, sub, color='#FFD600' }) {
    return (
      <div style={{ background:'#161616', border:`1px solid ${A.border}`, borderRadius:14, padding:'20px 22px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:`${color}14`, border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={17} color={color} strokeWidth={1.75}/>
          </div>
          <span style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:A.text3 }}>{label}</span>
        </div>
        <p style={{ fontSize:38, fontWeight:900, color:A.text, margin:0, letterSpacing:'-0.03em', lineHeight:1 }}>{value ?? '—'}</p>
        {sub && <p style={{ fontSize:12, color:A.text3, margin:'6px 0 0', fontWeight:600 }}>{sub}</p>}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ color:A.text, fontSize:15, fontWeight:800, margin:0 }}>Reporting Overview</h3>
        <div style={{ display:'flex', gap:7, alignItems:'center' }}>
          {['today','week','all'].map(per => (
            <button key={per} onClick={()=>setPeriod(per)} style={{ padding:'7px 16px', borderRadius:20, border:'none', background:period===per?A.yellow:'#1c1c1c', color:period===per?'#000':A.text2, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit', textTransform:'capitalize' }}>
              {per==='all'?'All time':per==='week'?'This week':'Today'}
            </button>
          ))}
          <button onClick={load} style={{ ...iconBtn, marginLeft:4 }}><RefreshCw size={13}/></button>
        </div>
      </div>

      {loading || !p ? (
        <p style={{ color:A.text3, fontSize:14 }}>Loading…</p>
      ) : (
        <>
          {/* Key stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
            <StatCard icon={BarChart3} label="Sessions" value={p.sessions} sub={`${p.completed} completed`} color={A.yellow}/>
            <StatCard icon={Users} label="Players" value={p.players} sub="total across sessions" color='#60a5fa'/>
            <StatCard icon={Camera} label="Photos" value={ph} sub="Polaroids taken" color='#a78bfa'/>
            <StatCard icon={Zap} label="Hole in ones" value={p.holeInOnes} sub="across all sessions" color='#22C55E'/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <StatCard icon={CheckCircle} label="Completed" value={`${p.sessions>0?Math.round((p.completed/p.sessions)*100):0}%`} sub={`${p.completed} of ${p.sessions} finished`} color='#22C55E'/>
            <StatCard icon={Clock} label="Avg duration" value={p.avgDur ? `${p.avgDur}m` : '—'} sub="per completed round" color='#fb923c'/>
            <StatCard icon={XCircle} label="Abandoned" value={p.sessions - p.completed} sub="sessions not finished" color={A.red}/>
          </div>

          {/* Play style breakdown */}
          {Object.keys(p.styleBreak).length > 0 && (
            <div style={{ background:'#161616', border:`1px solid ${A.border}`, borderRadius:14, padding:20 }}>
              <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:A.text3, marginBottom:16 }}>Play Style Breakdown</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {Object.entries(p.styleBreak).sort((a,b)=>b[1]-a[1]).map(([style, count]) => {
                  const pct = Math.round((count / p.sessions) * 100)
                  const col = STYLE_COLORS[style] || A.yellow
                  return (
                    <div key={style}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:A.text, textTransform:'capitalize' }}>{style}</span>
                        <span style={{ fontSize:13, color:A.text2, fontWeight:600 }}>{count} sessions ({pct}%)</span>
                      </div>
                      <div style={{ height:6, background:'#242424', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:col, borderRadius:3, transition:'width 0.6s ease' }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Leaderboard Tab ────────────────────────────────────────────
function LeaderboardTab() {
  const [entries,  setEntries]  = useState([])
  const [period,   setPeriod]   = useState('all')
  const [expanded, setExpanded] = useState(null) // session_id-playerName
  const [holeScores, setHoleScores] = useState({})
  const [loading,  setLoading]  = useState(false)
  const [acting,   setActing]   = useState(null)

  async function load() {
    setLoading(true)
    try { setEntries(await getAdminLeaderboard(period)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [period])

  async function toggleExpand(sessionId, playerName) {
    const key = `${sessionId}-${playerName}`
    if (expanded === key) { setExpanded(null); return }
    setExpanded(key)
    if (!holeScores[key]) {
      const scores = await getPlayerScoresBySession(sessionId, playerName)
      setHoleScores(prev => ({ ...prev, [key]: scores }))
    }
  }

  async function toggleOptOut(sessionId, currentOptOut) {
    setActing(sessionId)
    try {
      await setSessionOptOut(sessionId, !currentOptOut)
      load()
    } finally { setActing(null) }
  }

  async function handleDeleteScores(sessionId, playerName) {
    if (!confirm(`Delete all scores for ${playerName}? This cannot be undone.`)) return
    setActing(`${sessionId}-${playerName}`)
    try { await deletePlayerScores(sessionId, playerName); load() } finally { setActing(null) }
  }

  const qualified   = entries.filter(e => e.qualified && !e.opt_out)
  const hidden      = entries.filter(e => e.opt_out)
  const unqualified = entries.filter(e => !e.qualified && !e.opt_out)

  function PlayerRow({ e, rank }) {
    const key = `${e.session_id}-${e.name}`
    const isOpen = expanded === key
    const scores = holeScores[key] || []

    return (
      <div style={{ background:'#161616', border:`1px solid ${A.border}`, borderRadius:12, marginBottom:8, overflow:'hidden', opacity:e.opt_out?0.55:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px' }}>
          {/* Rank */}
          <div style={{ width:32, height:32, borderRadius:'50%', background:rank===1?'rgba(255,214,0,0.12)':rank===2?'rgba(180,180,180,0.07)':'rgba(255,255,255,0.04)', border:`1px solid ${rank===1?'rgba(255,214,0,0.25)':'rgba(255,255,255,0.07)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {rank===1 ? <Trophy size={14} color='#FFD600' strokeWidth={1.5}/> : <span style={{ fontSize:14, fontWeight:800, color:rank===2?'#888':'#2e2e2e' }}>{rank}</span>}
          </div>

          {/* Colour dot */}
          {e.color && <div style={{ width:9, height:9, borderRadius:'50%', background:e.color, flexShrink:0 }}/>}

          {/* Name */}
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ color:A.text, fontSize:14, fontWeight:700, margin:0 }}>{e.name}</p>
            <p style={{ color:A.text3, fontSize:11, margin:0 }}>{e.holes} holes · started {new Date(e.started_at).toLocaleDateString('en-NZ')}</p>
          </div>

          {/* Scores */}
          <div style={{ textAlign:'right', marginRight:8 }}>
            <span style={{ fontSize:22, fontWeight:900, color:rank===1?A.yellow:A.text, letterSpacing:'-0.02em' }}>{e.total}</span>
            <span style={{ fontSize:11, color:A.text3, marginLeft:4 }}>strokes</span>
          </div>
          <div style={{ textAlign:'right', minWidth:60, borderLeft:`1px solid ${A.border}`, paddingLeft:12, marginRight:8 }}>
            <p style={{ fontSize:16, fontWeight:700, color:A.text3, margin:0 }}>{e.avg}</p>
            <p style={{ fontSize:10, color:A.text3, margin:0 }}>avg/hole</p>
          </div>

          {/* Qualified badge */}
          <div style={{ ...iconBtn, color:e.qualified?'#22C55E':A.text3, fontSize:11, cursor:'default' }}>
            {e.qualified ? <CheckCircle size={13}/> : <XCircle size={13}/>}
            {e.qualified ? 'Full course' : `${e.holes} holes`}
          </div>

          {/* Actions */}
          <button
            onClick={() => toggleOptOut(e.session_id, e.opt_out)}
            disabled={acting===e.session_id}
            style={{ ...iconBtn, color:e.opt_out?'#22C55E':A.text2 }}
            title={e.opt_out?'Show on leaderboard':'Hide from leaderboard'}
          >
            {e.opt_out ? <Eye size={13}/> : <EyeOff size={13}/>}
            {e.opt_out ? 'Show' : 'Hide'}
          </button>

          <button
            onClick={() => handleDeleteScores(e.session_id, e.name)}
            disabled={!!acting}
            style={{ ...iconBtn, color:A.red }}
          >
            <Trash2 size={13}/>
          </button>

          {/* Expand toggle */}
          <button onClick={() => toggleExpand(e.session_id, e.name)}
            style={{ ...iconBtn }}>
            {isOpen ? <ChevronUp size={13}/> : <ChevronDown size={13}/>}
          </button>
        </div>

        {/* Hole-by-hole scores */}
        {isOpen && (
          <div style={{ borderTop:`1px solid ${A.border}`, padding:'14px 16px' }}>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:A.text3, marginBottom:12 }}>Hole-by-hole scores</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:7 }}>
              {scores.map((h, i) => (
                <div key={h.id} style={{ display:'flex', alignItems:'center', gap:8, background:'#1e1e1e', borderRadius:8, padding:'7px 12px' }}>
                  <span style={{ fontSize:11, color:A.text3, fontWeight:700, width:20 }}>{i+1}</span>
                  <span style={{ flex:1, fontSize:12, color:A.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.title}</span>
                  <span style={{
                    fontSize:16, fontWeight:900, letterSpacing:'-0.02em',
                    color: h.strokes === null ? A.text3 : h.strokes === 1 ? '#FFD600' : h.strokes <= (h.par||3) ? '#22C55E' : h.strokes === (h.par||3)+1 ? A.text : A.red
                  }}>
                    {h.strokes ?? '—'}
                  </span>
                  <span style={{ fontSize:10, color:A.text3 }}>/{h.par||3}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ color:A.text, fontSize:15, fontWeight:800, margin:0 }}>Leaderboard Management</h3>
        <div style={{ display:'flex', gap:7, alignItems:'center' }}>
          {['day','week','all'].map(per => (
            <button key={per} onClick={()=>setPeriod(per)} style={{ padding:'7px 16px', borderRadius:20, border:'none', background:period===per?A.yellow:'#1c1c1c', color:period===per?'#000':A.text2, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              {per==='day'?'Today':per==='week'?'This week':'All time'}
            </button>
          ))}
          <button onClick={load} style={{ ...iconBtn, marginLeft:4 }}><RefreshCw size={13}/></button>
        </div>
      </div>

      {loading ? (
        <p style={{ color:A.text3, fontSize:14 }}>Loading…</p>
      ) : entries.length === 0 ? (
        <p style={{ color:A.text3, fontSize:14 }}>No entries for this period.</p>
      ) : (
        <>
          {/* Qualified — on leaderboard */}
          {qualified.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <Trophy size={13} color={A.yellow}/>
                <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:A.yellow, margin:0 }}>
                  On Leaderboard ({qualified.length})
                </p>
              </div>
              {qualified.map((e, i) => <PlayerRow key={`${e.session_id}-${e.name}`} e={e} rank={i+1}/>)}
            </div>
          )}

          {/* Unqualified — partial rounds */}
          {unqualified.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <XCircle size={13} color={A.text3}/>
                <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:A.text3, margin:0 }}>
                  Incomplete rounds — not shown on board ({unqualified.length})
                </p>
              </div>
              {unqualified.map((e, i) => <PlayerRow key={`${e.session_id}-${e.name}`} e={e} rank={i+1}/>)}
            </div>
          )}

          {/* Hidden */}
          {hidden.length > 0 && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <EyeOff size={13} color={A.text3}/>
                <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:A.text3, margin:0 }}>
                  Hidden from leaderboard ({hidden.length})
                </p>
              </div>
              {hidden.map((e, i) => <PlayerRow key={`${e.session_id}-${e.name}`} e={e} rank={i+1}/>)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  Settings, LayoutDashboard, BookOpen, BarChart2,
  Plus, Trash2, Edit2, Save, X, Eye, EyeOff,
  GripVertical, Monitor, ChevronDown, ChevronUp, Clock,
  Users, Camera, Zap, TrendingDown,
  BarChart3, Trophy, CheckCircle, XCircle, RefreshCw, Image
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import {
  checkAdminPassword, getHoles, upsertHole, deleteHole, reorderHoles,
  getAllSpinnerEffects, upsertSpinnerEffect, deleteSpinnerEffect,
  getAllSessions, setAdminSetting, deleteSession, deletePlayerScores,
  getAllGameModeRules, upsertGameModeRule, deleteGameModeRule, reorderGameModeRules,
  getReportingStats, getAdminLeaderboard, getPlayerScoresBySession, setSessionOptOut,
  getLeaderboardPlayerPhotos, lockSession, unlockSession,
} from '../lib/supabase'

// ── Style constants ────────────────────────────────────────────
const A = {
  bg: '#0a0a0a', card: '#141414', card2: '#1c1c1c',
  border: 'rgba(255,255,255,0.07)', borderY: 'rgba(255,214,0,0.22)',
  yellow: '#FFD600', text: '#ffffff', text2: '#888888', text3: '#444444',
  red: '#FF3B3B', green: '#22C55E',
}
const inp = { width:'100%', background:'#1c1c1c', border:`1px solid ${A.border}`, borderRadius:8, color:A.text, fontFamily:'inherit', fontSize:14, padding:'10px 13px', outline:'none', boxSizing:'border-box', marginBottom:10 }
const lbl = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:A.text2, marginBottom:5 }
const row = { display:'flex', alignItems:'center', gap:10, background:'#1a1a1a', border:`1px solid ${A.border}`, borderRadius:10, padding:'11px 13px', marginBottom:7 }
const saveBtn   = { background:A.yellow, color:'#000', border:'none', borderRadius:8, padding:'9px 18px', fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }
const cancelBtn = { background:'#1c1c1c', color:A.text2, border:`1px solid ${A.border}`, borderRadius:8, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontSize:14, fontFamily:'inherit' }
const iconBtn   = { background:'#242424', border:`1px solid ${A.border}`, borderRadius:7, padding:'6px 9px', cursor:'pointer', color:A.text2, fontFamily:'inherit', display:'flex', alignItems:'center', gap:4, fontSize:13 }
const overlay   = { position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:400, padding:16, backdropFilter:'blur(6px)' }
const mbox      = { background:A.card, border:`1px solid ${A.borderY}`, borderRadius:18, width:'100%', maxWidth:460, padding:24, maxHeight:'90vh', overflowY:'auto' }

function Field({ label, value, onChange, type='text', rows, children }) {
  return (
    <div style={{ marginBottom:2 }}>
      <label style={lbl}>{label}</label>
      {rows
        ? <textarea style={{ ...inp, minHeight:60, resize:'vertical' }} value={value} onChange={e => onChange(e.target.value)} rows={rows} />
        : children || <input style={inp} type={type} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  )
}

// ── Login ──────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true); setErr('')
    const ok = await checkAdminPassword(pw)
    if (ok) { sessionStorage.setItem('tz_admin','1'); onLogin() }
    else setErr('Incorrect password')
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:A.bg, fontFamily:'Inter,sans-serif', padding:20 }}>
      <div style={{ background:A.card, border:`1px solid ${A.border}`, borderRadius:20, padding:36, width:'100%', maxWidth:380, textAlign:'center' }}>
        <img src="/logo.png" alt="Thrillzone" style={{ height:56, marginBottom:20, objectFit:'contain' }} />
        <h2 style={{ color:A.text, fontSize:22, fontWeight:800, marginBottom:6 }}>Admin Panel</h2>
        <p style={{ color:A.text2, fontSize:14, marginBottom:24 }}>Staff access only</p>
        <input type="password" placeholder="Password" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()}
          style={{ ...inp, fontSize:16, marginBottom:12 }} />
        {err && <p style={{ color:A.red, fontSize:13, marginBottom:12 }}>{err}</p>}
        <button onClick={handleLogin} disabled={loading||!pw}
          style={{ ...saveBtn, width:'100%', justifyContent:'center', fontSize:15, padding:'13px', opacity:loading||!pw?0.45:1 }}>
          {loading ? 'Checking…' : 'Login'}
        </button>
      </div>
    </div>
  )
}

// ── Holes Tab ──────────────────────────────────────────────────
function HolesTab({ holes, onRefresh }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title:'', description:'', type:'hole', par:3 })
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  function openNew() {
    setForm({
      title:'', description:'', type:'hole', par:3,
      title_de:'', description_de:'', title_fr:'', description_fr:'',
      title_es:'', description_es:'', title_zh:'', description_zh:'',
      title_hi:'', description_hi:'',
    })
    setEditing('new')
  }
  function openEdit(h) {
    setForm({
      title:h.title, description:h.description||'', type:h.type||'hole', par:h.par||3,
      title_de:h.title_de||'', description_de:h.description_de||'',
      title_fr:h.title_fr||'', description_fr:h.description_fr||'',
      title_es:h.title_es||'', description_es:h.description_es||'',
      title_zh:h.title_zh||'', description_zh:h.description_zh||'',
      title_hi:h.title_hi||'', description_hi:h.description_hi||'',
    })
    setEditing(h)
  }

  async function save() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      editing==='new'
        ? await upsertHole({ ...form, title:form.title.trim(), description:form.description.trim(), order_index:holes.length })
        : await upsertHole({ ...editing, ...form, title:form.title.trim(), description:form.description.trim() })
      setEditing(null); onRefresh()
    } finally { setSaving(false) }
  }

  async function remove(h) {
    if (!confirm(`Delete "${h.title}"?`)) return
    await deleteHole(h.id); onRefresh()
  }

  function onDragStart(e,i) { setDragging(i); e.dataTransfer.effectAllowed='move' }
  function onDragOver(e,i)  { e.preventDefault(); setDragOver(i) }
  async function onDrop(e,i) {
    e.preventDefault()
    if (dragging===null||dragging===i) { setDragging(null); setDragOver(null); return }
    const r=[...holes]; const [m]=r.splice(dragging,1); r.splice(i,0,m)
    await reorderHoles(r.map(h=>h.id))
    setDragging(null); setDragOver(null); onRefresh()
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <h3 style={{ color:A.text, fontSize:15, fontWeight:800, margin:0 }}>Holes & Challenges ({holes.length})</h3>
        <button onClick={openNew} style={saveBtn}><Plus size={15}/> Add</button>
      </div>
      <p style={{ color:A.text3, fontSize:12, marginBottom:14 }}>Drag to reorder — applies immediately to new games.</p>
      {holes.map((h,i) => (
        <div key={h.id} draggable
          onDragStart={e=>onDragStart(e,i)} onDragOver={e=>onDragOver(e,i)}
          onDrop={e=>onDrop(e,i)} onDragEnd={()=>{ setDragging(null); setDragOver(null) }}
          style={{ ...row, opacity:dragging===i?0.4:1, border:dragOver===i?`1px solid ${A.yellow}`:`1px solid ${A.border}`, cursor:'grab' }}>
          <GripVertical size={16} color={A.text3} style={{ flexShrink:0 }}/>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
              <span style={{ color:A.text, fontWeight:700, fontSize:14 }}>{i+1}. {h.title}</span>
              <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', padding:'2px 7px', borderRadius:10, background:h.type==='hole'?'rgba(255,214,0,0.10)':'rgba(167,139,250,0.10)', color:h.type==='hole'?A.yellow:'#a78bfa' }}>
                {h.type}
              </span>
            </div>
            {h.description && <p style={{ fontSize:12, color:A.text3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.description}</p>}
          </div>
          <button onClick={()=>openEdit(h)} style={iconBtn}><Edit2 size={14}/></button>
          <button onClick={()=>remove(h)} style={{ ...iconBtn, color:A.red }}><Trash2 size={14}/></button>
        </div>
      ))}
      {editing!==null && (
        <div style={overlay}>
          <div style={mbox}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h4 style={{ color:A.text, fontSize:17, fontWeight:800 }}>{editing==='new'?'New Station':'Edit Station'}</h4>
              <button onClick={()=>setEditing(null)} style={{ background:'none', border:'none', color:A.text2, cursor:'pointer' }}><X size={20}/></button>
            </div>
            <Field label="Title (English)" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))}/>
            <Field label="Description (English)" value={form.description} onChange={v=>setForm(f=>({...f,description:v}))} rows={2}/>
            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
              <div style={{ flex:1 }}>
                <label style={lbl}>Type</label>
                <select style={{ ...inp, marginBottom:0 }} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  <option value="hole">Hole</option>
                  <option value="challenge">Challenge</option>
                </select>
              </div>
              <div style={{ width:90 }}>
                <label style={lbl}>Par</label>
                <input style={{ ...inp, marginBottom:0 }} type="number" min={1} max={10} value={form.par} onChange={e=>setForm(f=>({...f,par:parseInt(e.target.value)||3}))}/>
              </div>
            </div>

            {/* Translations */}
            <div style={{ borderTop:`1px solid ${A.border}`, paddingTop:14, marginBottom:4 }}>
              <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:A.text3, marginBottom:12 }}>
                Translations (optional)
              </p>
              {[
                {code:'de', flag:'🇩🇪', lang:'German / Deutsch'},
                {code:'fr', flag:'🇫🇷', lang:'French / Français'},
                {code:'es', flag:'🇪🇸', lang:'Spanish / Español'},
                {code:'zh', flag:'🇨🇳', lang:'Chinese / 中文'},
                {code:'hi', flag:'🇮🇳', lang:'Hindi / हिन्दी'},
              ].map(({code, flag, lang}) => (
                <div key={code} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:16 }}>{flag}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:A.text2 }}>{lang}</span>
                  </div>
                  <input style={{ ...inp, marginBottom:6 }}
                    placeholder={`Title in ${lang.split('/')[0].trim()}…`}
                    value={form[`title_${code}`]||''}
                    onChange={e=>setForm(f=>({...f,[`title_${code}`]:e.target.value}))}/>
                  <textarea style={{ ...inp, minHeight:50, resize:'vertical', marginBottom:0 }}
                    placeholder={`Description in ${lang.split('/')[0].trim()}…`}
                    value={form[`description_${code}`]||''}
                    onChange={e=>setForm(f=>({...f,[`description_${code}`]:e.target.value}))}/>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:9 }}>
              <button onClick={()=>setEditing(null)} style={{ ...cancelBtn, flex:1 }}>Cancel</button>
              <button onClick={save} disabled={saving||!form.title.trim()} style={{ ...saveBtn, flex:2, justifyContent:'center', opacity:saving||!form.title.trim()?0.5:1 }}>
                <Save size={14}/>{saving?'Saving…':'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Rules Tab ──────────────────────────────────────────────────
const MODES = [
  { id:'casual',      label:'Casual',       color:A.yellow  },
  { id:'competitive', label:'Competitive',  color:'#60a5fa' },
  { id:'silly',       label:'Silly',        color:'#a78bfa' },
  { id:'fun',         label:'Just for Fun', color:'#fb923c' },
]

function RulesTab() {
  const [allRules, setAllRules]     = useState([])
  const [activeMode, setActiveMode] = useState('casual')
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState({ rule_text:'', active:true })
  const [saving, setSaving]         = useState(false)
  const [dragging, setDragging]     = useState(null)
  const [dragOver, setDragOver]     = useState(null)

  async function load() { getAllGameModeRules().then(setAllRules) }
  useEffect(() => { load() }, [])

  const modeRules = allRules.filter(r => r.mode === activeMode)
  const mode      = MODES.find(m => m.id === activeMode)

  function openNew()   { setForm({ rule_text:'', active:true }); setEditing('new') }
  function openEdit(r) { setForm({ rule_text:r.rule_text, active:r.active }); setEditing(r) }

  async function save() {
    setSaving(true)
    try {
      editing==='new'
        ? await upsertGameModeRule({ mode:activeMode, rule_text:form.rule_text, active:form.active, order_index:modeRules.length })
        : await upsertGameModeRule({ ...editing, rule_text:form.rule_text, active:form.active })
      setEditing(null); load()
    } finally { setSaving(false) }
  }

  async function remove(id) {
    if (!confirm('Delete this rule?')) return
    await deleteGameModeRule(id); load()
  }

  async function toggle(r) { await upsertGameModeRule({ ...r, active:!r.active }); load() }

  function onDragStart(e,i) { setDragging(i); e.dataTransfer.effectAllowed='move' }
  function onDragOver(e,i)  { e.preventDefault(); setDragOver(i) }
  async function onDrop(e,i) {
    e.preventDefault()
    if (dragging===null||dragging===i) { setDragging(null); setDragOver(null); return }
    const reordered=[...modeRules]; const [moved]=reordered.splice(dragging,1); reordered.splice(i,0,moved)
    await reorderGameModeRules(activeMode, reordered.map(r=>r.id))
    setDragging(null); setDragOver(null); load()
  }

  return (
    <div>
      <h3 style={{ color:A.text, fontSize:15, fontWeight:800, marginBottom:6 }}>Rules per Game Mode</h3>
      <p style={{ color:A.text3, fontSize:12, marginBottom:16 }}>Each mode has independent rule cards shown before the game starts. Drag to reorder.</p>
      <div style={{ display:'flex', gap:7, marginBottom:18, flexWrap:'wrap' }}>
        {MODES.map(m => (
          <button key={m.id} onClick={()=>setActiveMode(m.id)} style={{ padding:'7px 16px', borderRadius:20, border:'none', background:activeMode===m.id?m.color:'#1c1c1c', color:activeMode===m.id?'#000':A.text2, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
            {m.label}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <p style={{ color:A.text2, fontSize:13 }}>{modeRules.filter(r=>r.active).length} active rule{modeRules.filter(r=>r.active).length!==1?'s':''}</p>
        <button onClick={openNew} style={{ ...saveBtn, background:mode?.color }}><Plus size={14}/>Add Rule</button>
      </div>
      {modeRules.map((r,i) => (
        <div key={r.id} draggable
          onDragStart={e=>onDragStart(e,i)} onDragOver={e=>onDragOver(e,i)}
          onDrop={e=>onDrop(e,i)} onDragEnd={()=>{ setDragging(null); setDragOver(null) }}
          style={{ ...row, opacity:r.active?(dragging===i?0.4:1):0.45, border:dragOver===i?`1px solid ${mode?.color}`:`1px solid ${A.border}`, cursor:'grab' }}>
          <GripVertical size={14} color={A.text3} style={{ flexShrink:0 }}/>
          <span style={{ flex:1, color:A.text, fontSize:14, lineHeight:1.5 }}>{r.rule_text}</span>
          <button onClick={()=>toggle(r)} style={{ ...iconBtn, color:r.active?A.green:A.text3 }}>{r.active?<Eye size={14}/>:<EyeOff size={14}/>}</button>
          <button onClick={()=>openEdit(r)} style={iconBtn}><Edit2 size={14}/></button>
          <button onClick={()=>remove(r.id)} style={{ ...iconBtn, color:A.red }}><Trash2 size={14}/></button>
        </div>
      ))}
      {modeRules.length===0 && <p style={{ color:A.text3, fontSize:13, textAlign:'center', padding:'20px 0' }}>No rules yet. Add one above.</p>}
      {editing!==null && (
        <div style={overlay}>
          <div style={mbox}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
              <h4 style={{ color:A.text, fontSize:17, fontWeight:800 }}>{editing==='new'?'New Rule':'Edit Rule'}</h4>
              <button onClick={()=>setEditing(null)} style={{ background:'none', border:'none', color:A.text2, cursor:'pointer' }}><X size={20}/></button>
            </div>
            <Field label="Rule text" value={form.rule_text} onChange={v=>setForm(f=>({...f,rule_text:v}))} rows={2}/>
            <label style={{ display:'flex', alignItems:'center', gap:10, color:A.text2, fontSize:13, marginBottom:18, cursor:'pointer' }}>
              <input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))}/>
              Active (shown to players)
            </label>
            <div style={{ display:'flex', gap:9 }}>
              <button onClick={()=>setEditing(null)} style={{ ...cancelBtn, flex:1 }}>Cancel</button>
              <button onClick={save} disabled={saving||!form.rule_text.trim()} style={{ ...saveBtn, flex:2, justifyContent:'center', background:mode?.color, opacity:saving||!form.rule_text.trim()?0.5:1 }}>
                <Save size={14}/>{saving?'Saving…':'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Spinner Tab ────────────────────────────────────────────────
function SpinnerTab() {
  const [effects, setEffects] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState({ name:'', description:'', active:true })
  const [saving, setSaving]   = useState(false)

  useEffect(() => { getAllSpinnerEffects().then(setEffects) }, [])

  function openNew()   { setForm({ name:'', description:'', active:true }); setEditing('new') }
  function openEdit(e) { setForm({ name:e.name, description:e.description||'', active:e.active }); setEditing(e) }

  async function save() {
    setSaving(true)
    try {
      editing==='new'
        ? await upsertSpinnerEffect({ name:form.name, description:form.description, active:form.active })
        : await upsertSpinnerEffect({ ...editing, name:form.name, description:form.description, active:form.active })
      setEditing(null); getAllSpinnerEffects().then(setEffects)
    } finally { setSaving(false) }
  }

  async function remove(id) {
    if (!confirm('Delete this effect?')) return
    await deleteSpinnerEffect(id); getAllSpinnerEffects().then(setEffects)
  }

  async function toggle(e) { await upsertSpinnerEffect({ ...e, active:!e.active }); getAllSpinnerEffects().then(setEffects) }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <h3 style={{ color:A.text, fontSize:15, fontWeight:800, margin:0 }}>Spinner Effects ({effects.length})</h3>
        <button onClick={openNew} style={saveBtn}><Plus size={15}/>Add</button>
      </div>
      {effects.map(e => (
        <div key={e.id} style={{ ...row, opacity:e.active?1:0.45 }}>
          <div style={{ flex:1 }}>
            <p style={{ color:A.text, fontWeight:700, fontSize:14, marginBottom:2 }}>{e.name}</p>
            <p style={{ color:A.text3, fontSize:12 }}>{e.description}</p>
          </div>
          <button onClick={()=>toggle(e)} style={{ ...iconBtn, color:e.active?A.green:A.text3 }}>{e.active?<Eye size={14}/>:<EyeOff size={14}/>}</button>
          <button onClick={()=>openEdit(e)} style={iconBtn}><Edit2 size={14}/></button>
          <button onClick={()=>remove(e.id)} style={{ ...iconBtn, color:A.red }}><Trash2 size={14}/></button>
        </div>
      ))}
      {editing!==null && (
        <div style={overlay}>
          <div style={mbox}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
              <h4 style={{ color:A.text, fontSize:17, fontWeight:800 }}>{editing==='new'?'New Effect':'Edit Effect'}</h4>
              <button onClick={()=>setEditing(null)} style={{ background:'none', border:'none', color:A.text2, cursor:'pointer' }}><X size={20}/></button>
            </div>
            <Field label="Effect name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))}/>
            <Field label="Description" value={form.description} onChange={v=>setForm(f=>({...f,description:v}))} rows={2}/>
            <label style={{ display:'flex', alignItems:'center', gap:10, color:A.text2, fontSize:13, marginBottom:18, cursor:'pointer' }}>
              <input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))}/>
              Active (shown on wheel)
            </label>
            <div style={{ display:'flex', gap:9 }}>
              <button onClick={()=>setEditing(null)} style={{ ...cancelBtn, flex:1 }}>Cancel</button>
              <button onClick={save} disabled={saving||!form.name.trim()} style={{ ...saveBtn, flex:2, justifyContent:'center', opacity:saving||!form.name.trim()?0.5:1 }}>
                <Save size={14}/>{saving?'Saving…':'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── LB Photos Tab ─────────────────────────────────────────────
function LBPhotosTab() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [locking, setLocking] = useState(null)

  async function load() {
    setLoading(true)
    try { setPhotos(await getLeaderboardPlayerPhotos()) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function deletePhoto(sessionId, playerName) {
    if (!confirm(`Remove leaderboard photo for ${playerName}?`)) return
    setDeleting(`${sessionId}-${playerName}`)
    try {
      await supabase.from('leaderboard_player_photos')
        .delete().eq('session_id', sessionId).eq('player_name', playerName)
      load()
    } finally { setDeleting(null) }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div>
          <h3 style={{ color:A.text, fontSize:15, fontWeight:800, margin:0 }}>Leaderboard Photos</h3>
          <p style={{ color:A.text3, fontSize:12, margin:'3px 0 0' }}>Player selfies shown next to their name on the TV board. Auto-deleted after 10 days.</p>
        </div>
        <button onClick={load} style={iconBtn}><RefreshCw size={13}/></button>
      </div>

      {loading && <p style={{ color:A.text3, fontSize:14 }}>Loading…</p>}
      {!loading && photos.length === 0 && (
        <p style={{ color:A.text3, fontSize:14 }}>No leaderboard photos yet. Players take these at the end of a qualifying round.</p>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:12, marginTop:12 }}>
        {photos.map(p => (
          <div key={`${p.session_id}-${p.player_name}`} style={{ background:'#161616', border:`1px solid ${A.border}`, borderRadius:12, overflow:'hidden' }}>
            <div style={{ background:'#fff', padding:'6px 6px 18px' }}>
              <img src={p.photo_url} alt={p.player_name} style={{ width:'100%', aspectRatio:'1', objectFit:'cover', display:'block', borderRadius:2 }}/>
              <div style={{ textAlign:'center', marginTop:6 }}>
                <img src="/logo.png" alt="" style={{ maxWidth:'80%', maxHeight:22, objectFit:'contain', display:'block', margin:'0 auto' }}/>
              </div>
            </div>
            <div style={{ padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ color:A.text, fontSize:13, fontWeight:700 }}>{p.player_name}</span>
              <button
                onClick={() => deletePhoto(p.session_id, p.player_name)}
                disabled={deleting===`${p.session_id}-${p.player_name}`}
                style={{ ...iconBtn, color:A.red }}>
                <Trash2 size={13}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Data Tab ───────────────────────────────────────────────────
function DataTab() {
  const [sessions, setSessions] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [locking, setLocking] = useState(null)

  async function load() {
    const { data } = await supabase
      .from('sessions')
      .select('id, play_style, players, started_at, completed_at, opt_out_leaderboard, locked, email, scores(hole_id, player_name, strokes)')
      .order('started_at', { ascending: false })
      .limit(60)
    setSessions(data || [])
  }
  useEffect(() => { load(); const t=setInterval(load,20000); return()=>clearInterval(t) }, [])

  function elapsed(start) {
    const m=Math.floor((Date.now()-new Date(start))/60000)
    return m<60?`${m}m ago`:`${Math.floor(m/60)}h ${m%60}m ago`
  }
  function duration(start,end) {
    const m=Math.floor((new Date(end||Date.now())-new Date(start))/60000)
    return m<60?`${m}m`:`${Math.floor(m/60)}h ${m%60}m`
  }

  async function handleDeleteSession(id) {
    if (!confirm('Delete this entire session and all its scores? This cannot be undone.')) return
    setDeleting(id)
    try { await deleteSession(id); load() } finally { setDeleting(null) }
  }

  async function handleDeletePlayer(sessionId, playerName) {
    if (!confirm(`Remove all scores for ${playerName} from this session?`)) return
    setDeleting(`${sessionId}-${playerName}`)
    try { await deletePlayerScores(sessionId, playerName); load() } finally { setDeleting(null) }
  }

  const INACTIVE_MS = 30 * 60 * 1000
  const active = sessions.filter(s => {
    if (s.completed_at) return false
    // Check last score time vs session start
    const sessionScores = s.scores || []
    const lastActivity = sessionScores.length > 0
      ? Math.max(...sessionScores.map(sc => new Date(sc.created_at || s.started_at).getTime()))
      : new Date(s.started_at).getTime()
    return Date.now() - lastActivity < INACTIVE_MS
  })
  const recent = sessions.filter(s=>s.completed_at)

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <h3 style={{ color:A.text, fontSize:15, fontWeight:800, margin:0 }}>
          Current Live Games
          {active.length>0 && <span style={{ marginLeft:8, background:A.yellow, color:'#000', fontSize:11, fontWeight:800, padding:'2px 8px', borderRadius:10 }}>{active.length}</span>}
        </h3>
        <button onClick={load} style={iconBtn}><Clock size={14}/> Refresh</button>
      </div>

      {active.length===0
        ? <p style={{ color:A.text3, fontSize:13, marginBottom:24 }}>No active games right now.</p>
        : active.map(s => {
            const players=s.players||[]
            const scoresArr=s.scores||[]
            const totals=players.map(p=>({
              ...p,
              total:scoresArr.filter(sc=>sc.player_name===p.name).reduce((a,sc)=>a+sc.strokes,0),
              holes:scoresArr.filter(sc=>sc.player_name===p.name).length,
            })).sort((a,b)=>a.total-b.total)
            return (
              <div key={s.id} style={{ background:'#161616', border:`1px solid ${A.border}`, borderRadius:12, padding:14, marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', color:A.yellow }}>{s.play_style}</span>
                    <span style={{ fontSize:11, color:A.text3 }}>Hole {(s.current_hole_index||0)+1}/17</span>
                    <span style={{ fontSize:11, color:A.text3 }}>{duration(s.started_at)} played</span>
                    {s.opt_out_leaderboard && <span style={{ fontSize:11, color:A.text3 }}>Private</span>}
                  </div>
                  <button onClick={()=>handleDeleteSession(s.id)} disabled={deleting===s.id}
                    style={{ ...iconBtn, color:A.red, fontSize:12, opacity:deleting===s.id?0.5:1 }}>
                    <Trash2 size={13}/>{deleting===s.id?'Deleting…':'Delete session'}
                  </button>
                </div>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                  {totals.map(p=>(
                    <div key={p.name} style={{ display:'flex', alignItems:'center', gap:5, background:'#1e1e1e', padding:'4px 9px', borderRadius:7 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:p.color||A.yellow }}/>
                      <span style={{ color:A.text, fontSize:12, fontWeight:600 }}>{p.name}</span>
                      <span style={{ color:A.text2, fontSize:12 }}>{p.total} ({p.holes}h)</span>
                      <button onClick={()=>handleDeletePlayer(s.id,p.name)} style={{ background:'none', border:'none', color:A.red, cursor:'pointer', padding:'0 2px', lineHeight:1, opacity:0.6 }}>
                        <X size={11}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
      }

      <h3 style={{ color:A.text, fontSize:15, fontWeight:800, margin:'24px 0 10px' }}>Completed Games</h3>
      {recent.slice(0,30).map(s => {
        const players=s.players||[]
        const scoresArr=s.scores||[]
        const isOpen=expanded===s.id
        return (
          <div key={s.id} style={{ background:'#161616', border:`1px solid ${A.border}`, borderRadius:12, marginBottom:7, overflow:'hidden' }}>
            <div onClick={()=>setExpanded(isOpen?null:s.id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:13, cursor:'pointer' }}>
              <div style={{ flex:1 }}>
                <p style={{ color:A.text, fontSize:13, fontWeight:700, marginBottom:3 }}>{players.map(p=>p.name).join(', ')}</p>
                <div style={{ display:'flex', gap:8 }}>
                  <span style={{ fontSize:11, color:A.text3, textTransform:'capitalize' }}>{s.play_style}</span>
                  <span style={{ fontSize:11, color:A.text3 }}>{duration(s.started_at,s.completed_at)}</span>
                  {s.email && <span style={{ fontSize:11, color:A.green }}>emailed</span>}
                </div>
              </div>
              <span style={{ fontSize:11, color:A.text3 }}>{new Date(s.started_at).toLocaleDateString('en-NZ')}</span>
              {isOpen?<ChevronUp size={14} color={A.text3}/>:<ChevronDown size={14} color={A.text3}/>}
            </div>
            {isOpen && (
              <div style={{ borderTop:`1px solid ${A.border}`, padding:'12px 13px' }}>
                {players.map(p=>{
                  const total=scoresArr.filter(sc=>sc.player_name===p.name).reduce((a,sc)=>a+sc.strokes,0)
                  const holes=scoresArr.filter(sc=>sc.player_name===p.name).length
                  const key=`${s.id}-${p.name}`
                  return (
                    <div key={p.name} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:p.color||A.yellow, flexShrink:0 }}/>
                      <span style={{ color:A.text, fontSize:13, fontWeight:600, flex:1 }}>{p.name}</span>
                      <span style={{ color:A.text2, fontSize:13 }}>{total} strokes</span>
                      <span style={{ color:A.text3, fontSize:12 }}>{holes} holes</span>
                      <button onClick={()=>handleDeletePlayer(s.id,p.name)} disabled={deleting===key}
                        style={{ ...iconBtn, color:A.red, fontSize:12, opacity:deleting===key?0.5:1 }}>
                        <Trash2 size={12}/>{deleting===key?'…':'Remove scores'}
                      </button>
                    </div>
                  )
                })}
                <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${A.border}`, display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={()=>handleDeleteSession(s.id)} disabled={deleting===s.id}
                    style={{ ...iconBtn, color:A.red, opacity:deleting===s.id?0.5:1 }}>
                    <Trash2 size={13}/>{deleting===s.id?'Deleting…':'Delete entire session'}
                  </button>
                </div>
                {s.email && <p style={{ fontSize:12, color:A.green, marginTop:8 }}>Scorecard sent to {s.email}</p>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Settings Tab ───────────────────────────────────────────────
function SettingsTab({ onLogout }) {
  const [newPw, setNewPw]           = useState('')
  const [confirm, setConfirm]       = useState('')
  const [msg, setMsg]               = useState('')
  const [timerEnabled, setTimerEnabled] = useState(true)
  const [timerHole, setTimerHole]   = useState(8)
  const [timerSecs, setTimerSecs]   = useState(30)
  const [timerSaved, setTimerSaved] = useState(false)

  useEffect(() => {
    async function loadTimerSettings() {
      const [en, hole, secs] = await Promise.all([
        supabase.from('admin_settings').select('value').eq('key','timer_enabled').single(),
        supabase.from('admin_settings').select('value').eq('key','timer_hole').single(),
        supabase.from('admin_settings').select('value').eq('key','timer_seconds').single(),
      ])
      if (en.data)   setTimerEnabled(en.data.value !== 'false')
      if (hole.data) setTimerHole(parseInt(hole.data.value) || 8)
      if (secs.data) setTimerSecs(parseInt(secs.data.value) || 30)
    }
    loadTimerSettings()
  }, [])

  async function saveTimerSettings() {
    await Promise.all([
      setAdminSetting('timer_enabled', String(timerEnabled)),
      setAdminSetting('timer_hole',    String(timerHole)),
      setAdminSetting('timer_seconds', String(timerSecs)),
    ])
    setTimerSaved(true)
    setTimeout(() => setTimerSaved(false), 2000)
  }

  async function changePw() {
    if (newPw.length<4) { setMsg('Password must be at least 4 characters'); return }
    if (newPw!==confirm) { setMsg('Passwords do not match'); return }
    await setAdminSetting('admin_password', newPw)
    setMsg('Password updated!'); setNewPw(''); setConfirm('')
  }

  return (
    <div>
      <h3 style={{ color:A.text, fontSize:15, fontWeight:800, marginBottom:16 }}>Settings</h3>

      {/* Timer settings */}
      <div style={{ background:'#161616', border:`1px solid ${A.border}`, borderRadius:12, padding:18, marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <p style={{ color:A.text, fontSize:14, fontWeight:700, margin:0 }}>Challenge Timer</p>
            <p style={{ color:A.text3, fontSize:12, margin:'2px 0 0' }}>Controls the countdown timer shown on a specific hole</p>
          </div>
          <button onClick={() => setTimerEnabled(v => !v)}
            style={{ width:44, height:26, borderRadius:13, border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s',
              background: timerEnabled ? A.yellow : '#333' }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:3, transition:'left 0.2s',
              left: timerEnabled ? 21 : 3 }}/>
          </button>
        </div>
        {timerEnabled && (
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ flex:1 }}>
              <label style={lbl}>Hole number</label>
              <input style={{ ...inp, marginBottom:0 }} type="number" min={1} max={17} value={timerHole}
                onChange={e => setTimerHole(parseInt(e.target.value)||8)}/>
            </div>
            <div style={{ flex:1 }}>
              <label style={lbl}>Timer seconds</label>
              <input style={{ ...inp, marginBottom:0 }} type="number" min={10} max={120} value={timerSecs}
                onChange={e => setTimerSecs(parseInt(e.target.value)||30)}/>
            </div>
          </div>
        )}
        {timerEnabled && (
          <button onClick={saveTimerSettings} style={{ ...saveBtn, marginTop:12, width:'100%', justifyContent:'center',
            background: timerSaved ? A.green : A.yellow }}>
            <Save size={14}/> {timerSaved ? 'Saved!' : 'Save Timer Settings'}
          </button>
        )}
      </div>

      {/* Password */}
      <div style={{ background:'#161616', border:`1px solid ${A.border}`, borderRadius:12, padding:18, marginBottom:14 }}>
        <p style={{ color:A.text2, fontSize:14, fontWeight:700, marginBottom:14 }}>Change Admin Password</p>
        <label style={lbl}>New password</label>
        <input style={inp} type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="New password"/>
        <label style={lbl}>Confirm password</label>
        <input style={inp} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm"/>
        {msg && <p style={{ color:msg.includes('!')?A.green:A.red, fontSize:13, marginBottom:10 }}>{msg}</p>}
        <button onClick={changePw} style={{ ...saveBtn, width:'100%', justifyContent:'center' }}>
          <Save size={14}/> Update Password
        </button>
      </div>
      {/* Custom banned words */}
      <BannedWordsSection/>

      <button onClick={onLogout} style={{ ...cancelBtn, width:'100%', textAlign:'center' }}>Log Out</button>
    </div>
  )
}

// ── Banned Words Section ──────────────────────────────────────
function BannedWordsSection() {
  const [words, setWords]   = useState([])
  const [input, setInput]   = useState('')
  const [saved,  setSaved]  = useState(false)

  useEffect(() => {
    supabase.from('admin_settings').select('value').eq('key','banned_words').single()
      .then(({ data }) => {
        if (data?.value) {
          try { setWords(JSON.parse(data.value)) } catch {}
        }
      })
  }, [])

  async function save(list) {
    await supabase.from('admin_settings').upsert({ key:'banned_words', value: JSON.stringify(list) })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  function add() {
    const w = input.trim().toLowerCase()
    if (!w || words.includes(w)) return
    const next = [...words, w]
    setWords(next); save(next); setInput('')
  }

  function remove(w) {
    const next = words.filter(x => x !== w)
    setWords(next); save(next)
  }

  return (
    <div style={{ background:'#161616', border:`1px solid ${A.border}`, borderRadius:12, padding:18, marginBottom:14 }}>
      <p style={{ color:A.text, fontSize:14, fontWeight:700, marginBottom:6 }}>Custom Banned Names/Words</p>
      <p style={{ color:A.text3, fontSize:12, marginBottom:14 }}>These are flagged during player name entry. Players can still continue after the warning.</p>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input style={{ ...inp, flex:1, marginBottom:0 }} placeholder="Add a word…" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && add()}/>
        <button onClick={add} style={{ ...saveBtn, flexShrink:0, background:saved?A.green:A.yellow }}>
          <Plus size={14}/> Add
        </button>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
        {words.length === 0 && <p style={{ color:A.text3, fontSize:13 }}>No custom words yet.</p>}
        {words.map(w => (
          <div key={w} style={{ display:'flex', alignItems:'center', gap:6, background:'#1e1e1e', border:`1px solid ${A.border}`, borderRadius:8, padding:'4px 10px', fontSize:13, color:A.text2 }}>
            <span>{w}</span>
            <button onClick={() => remove(w)} style={{ background:'none', border:'none', color:A.red, cursor:'pointer', padding:0, display:'flex', lineHeight:1 }}>
              <X size={12}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function AdminPanel() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('tz_admin')==='1')
  const [tab, setTab]       = useState('data')
  const [holes, setHoles]   = useState([])

  async function loadHoles() { getHoles().then(setHoles) }
  useEffect(() => { if (authed) loadHoles() }, [authed])

  if (!authed) return <AdminLogin onLogin={()=>setAuthed(true)} />

  const TABS = [
    { id:'data',       Icon:BarChart2,       label:'Live Games' },
    { id:'leaderboard',Icon:Trophy,          label:'Leaderboard'},
    { id:'photos',     Icon:Image,           label:'LB Photos'  },
    { id:'holes',      Icon:LayoutDashboard, label:'Holes'      },
    { id:'rules',      Icon:BookOpen,        label:'Rules'      },
    { id:'spinner',    Icon:Settings,        label:'Spinner'    },
    { id:'reports',    Icon:BarChart3,       label:'Reports'    },
    { id:'settings',   Icon:Settings,        label:'Settings'   },
  ]

  return (
    <div style={{ minHeight:'100vh', background:A.bg, fontFamily:'Inter,sans-serif', color:A.text }}>
      {/* Top bar */}
      <div style={{ background:'#0d0d0d', borderBottom:`1px solid ${A.border}`, padding:'12px 18px', display:'flex', alignItems:'center', gap:14, position:'sticky', top:0, zIndex:10 }}>
        <img src="/logo.png" alt="" style={{ height:30, objectFit:'contain' }}/>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:800, fontSize:13, margin:0 }}>Thrillzone Admin</p>
          <p style={{ color:A.text3, fontSize:11, margin:0 }}>Mini Golf Manager</p>
        </div>
        <a href="/" style={{ color:A.text3, fontSize:12, textDecoration:'none' }}>Player app</a>
        <a href="/leaderboard" target="_blank" rel="noreferrer"
          style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,214,0,0.08)', border:`1px solid ${A.borderY}`, borderRadius:8, padding:'5px 11px', color:A.yellow, fontSize:12, textDecoration:'none', fontWeight:700 }}>
          <Monitor size={13}/> TV Board
        </a>
      </div>

      {/* Tabs */}
      <div style={{ background:'#0d0d0d', borderBottom:`1px solid ${A.border}`, padding:'0 14px', display:'flex', gap:2, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:'none', border:'none',
            borderBottom:tab===t.id?`2px solid ${A.yellow}`:'2px solid transparent',
            color:tab===t.id?A.yellow:A.text2,
            fontWeight:tab===t.id?700:500,
            padding:'12px 13px', cursor:'pointer', fontFamily:'inherit',
            fontSize:13, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5,
          }}>
            <t.Icon size={13}/>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth:860, margin:'0 auto', padding:'20px 16px 48px' }}>
        {tab==='reports'     && <ReportsTab/>}
        {tab==='photos'      && <LBPhotosTab/>}
        {tab==='leaderboard' && <LeaderboardTab/>}
        {tab==='holes'       && <HolesTab holes={holes} onRefresh={loadHoles}/>}
        {tab==='rules'       && <RulesTab/>}
        {tab==='spinner'     && <SpinnerTab/>}
        {tab==='data'        && <DataTab/>}
        {tab==='settings'    && <SettingsTab onLogout={()=>{ sessionStorage.removeItem('tz_admin'); setAuthed(false) }}/>}
      </div>
    </div>
  )
}
