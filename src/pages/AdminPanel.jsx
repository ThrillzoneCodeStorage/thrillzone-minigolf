import { useState, useEffect } from 'react'
import {
  Settings, LayoutDashboard, BookOpen, BarChart2,
  Plus, Trash2, Edit2, Save, X, Eye, EyeOff,
  GripVertical, Monitor, ChevronDown, ChevronUp, Clock
} from 'lucide-react'
import {
  checkAdminPassword, getHoles, upsertHole, deleteHole, reorderHoles,
  getAllSpinnerEffects, upsertSpinnerEffect, deleteSpinnerEffect,
  getAllSessions, setAdminSetting,
  getAllGameModeRules, upsertGameModeRule, deleteGameModeRule, reorderGameModeRules,
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

  function openNew()   { setForm({ title:'', description:'', type:'hole', par:3 }); setEditing('new') }
  function openEdit(h) { setForm({ title:h.title, description:h.description||'', type:h.type||'hole', par:h.par||3 }); setEditing(h) }

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
            <Field label="Title" value={form.title} onChange={v=>setForm(f=>({...f,title:v}))}/>
            <Field label="Description" value={form.description} onChange={v=>setForm(f=>({...f,description:v}))} rows={3}/>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
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

// ── Data Tab ───────────────────────────────────────────────────
function DataTab() {
  const [sessions, setSessions] = useState([])
  const [expanded, setExpanded] = useState(null)

  async function load() { getAllSessions(60).then(setSessions) }
  useEffect(() => { load(); const t=setInterval(load,20000); return()=>clearInterval(t) }, [])

  function elapsed(start) {
    const m=Math.floor((Date.now()-new Date(start))/60000)
    return m<60?`${m}m ago`:`${Math.floor(m/60)}h ${m%60}m ago`
  }
  function duration(start,end) {
    const m=Math.floor((new Date(end||Date.now())-new Date(start))/60000)
    return m<60?`${m}m`:`${Math.floor(m/60)}h ${m%60}m`
  }

  const active = sessions.filter(s=>!s.completed_at)
  const recent = sessions.filter(s=>s.completed_at)

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <h3 style={{ color:A.text, fontSize:15, fontWeight:800, margin:0 }}>
          Active Games
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
                  <span style={{ fontSize:10, color:A.text3 }}>{elapsed(s.started_at)}</span>
                </div>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                  {totals.map(p=>(
                    <div key={p.name} style={{ display:'flex', alignItems:'center', gap:5, background:'#1e1e1e', padding:'4px 9px', borderRadius:7 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:p.color||A.yellow }}/>
                      <span style={{ color:A.text, fontSize:12, fontWeight:600 }}>{p.name}</span>
                      <span style={{ color:A.text2, fontSize:12 }}>{p.total} ({p.holes}h)</span>
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
                  return (
                    <div key={p.name} style={{ display:'flex', gap:8, marginBottom:5, alignItems:'center' }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:p.color||A.yellow, flexShrink:0 }}/>
                      <span style={{ color:A.text, fontSize:13, fontWeight:600, flex:1 }}>{p.name}</span>
                      <span style={{ color:A.text2, fontSize:13 }}>{total} strokes</span>
                      <span style={{ color:A.text3, fontSize:12 }}>{holes} holes</span>
                    </div>
                  )
                })}
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
  const [newPw, setNewPw]     = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg]         = useState('')

  async function changePw() {
    if (newPw.length<4) { setMsg('Password must be at least 4 characters'); return }
    if (newPw!==confirm) { setMsg('Passwords do not match'); return }
    await setAdminSetting('admin_password', newPw)
    setMsg('Password updated!'); setNewPw(''); setConfirm('')
  }

  return (
    <div>
      <h3 style={{ color:A.text, fontSize:15, fontWeight:800, marginBottom:16 }}>Settings</h3>
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
      <button onClick={onLogout} style={{ ...cancelBtn, width:'100%', textAlign:'center' }}>Log Out</button>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function AdminPanel() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('tz_admin')==='1')
  const [tab, setTab]       = useState('holes')
  const [holes, setHoles]   = useState([])

  async function loadHoles() { getHoles().then(setHoles) }
  useEffect(() => { if (authed) loadHoles() }, [authed])

  if (!authed) return <AdminLogin onLogin={()=>setAuthed(true)} />

  const TABS = [
    { id:'holes',    Icon:LayoutDashboard, label:'Holes'    },
    { id:'rules',    Icon:BookOpen,        label:'Rules'    },
    { id:'spinner',  Icon:Settings,        label:'Spinner'  },
    { id:'data',     Icon:BarChart2,       label:'Data'     },
    { id:'settings', Icon:Settings,        label:'Settings' },
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
        {tab==='holes'    && <HolesTab holes={holes} onRefresh={loadHoles}/>}
        {tab==='rules'    && <RulesTab/>}
        {tab==='spinner'  && <SpinnerTab/>}
        {tab==='data'     && <DataTab/>}
        {tab==='settings' && <SettingsTab onLogout={()=>{ sessionStorage.removeItem('tz_admin'); setAuthed(false) }}/>}
      </div>
    </div>
  )
}
