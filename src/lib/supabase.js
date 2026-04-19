import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase env vars. Copy .env.example to .env and fill in your keys.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// ── Holes ──────────────────────────────────────────────────────
export async function getHoles() {
  const { data, error } = await supabase
    .from('holes')
    .select('*')
    .order('order_index')
  if (error) throw error
  return data
}

export async function upsertHole(hole) {
  const { data, error } = await supabase.from('holes').upsert(hole).select().single()
  if (error) throw error
  return data
}

export async function deleteHole(id) {
  const { error } = await supabase.from('holes').delete().eq('id', id)
  if (error) throw error
}

export async function reorderHoles(orderedIds) {
  const updates = orderedIds.map((id, i) =>
    supabase.from('holes').update({ order_index: i }).eq('id', id)
  )
  await Promise.all(updates)
}

// ── Sessions ───────────────────────────────────────────────────
export async function createSession(sessionData) {
  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSession(id, updates) {
  const { error } = await supabase.from('sessions').update(updates).eq('id', id)
  if (error) throw error
}

export async function getSessionByDeviceCode(deviceCode) {
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('device_code', deviceCode)
    .gte('started_at', oneDayAgo)
    .is('completed_at', null)
    .single()
  if (error) return null
  return data
}

export async function getActiveSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select(`*, scores(*)`)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
  if (error) return []
  return data
}

// ── Scores ─────────────────────────────────────────────────────
export async function upsertScore(sessionId, holeId, playerName, strokes) {
  const { error } = await supabase
    .from('scores')
    .upsert(
      { session_id: sessionId, hole_id: holeId, player_name: playerName, strokes },
      { onConflict: 'session_id,hole_id,player_name' }
    )
  if (error) throw error
}

export async function getScoresForSession(sessionId) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('session_id', sessionId)
  if (error) return []
  return data
}

// ── Photos ─────────────────────────────────────────────────────
export async function uploadPhoto(sessionId, blob) {
  const fileName = `${sessionId}/${Date.now()}.jpg`
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName)
  await supabase.from('photos').insert({ session_id: sessionId, storage_path: publicUrl })
  return publicUrl
}

export async function getSessionPhotos(sessionId) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('session_id', sessionId)
    .order('taken_at')
  if (error) return []
  return data
}

export async function getAllPhotos(limit = 50) {
  const { data } = await supabase
    .from('photos')
    .select('*')
    .order('taken_at', { ascending: false })
    .limit(limit)
  return data || []
}

// ── Leaderboard ────────────────────────────────────────────────
export async function getLeaderboard(period = 'all') {
  // Get total hole count so we can require full course completion
  const { data: allHoles } = await supabase.from('holes').select('id')
  const totalHoles = allHoles?.length || 17

  let query = supabase
    .from('sessions')
    .select(`id, players, play_style, started_at, scores(hole_id, player_name, strokes)`)
    .eq('opt_out_leaderboard', false)
    .not('play_style', 'eq', 'fun')

  if (period === 'day') {
    const start = new Date(); start.setHours(0,0,0,0)
    query = query.gte('started_at', start.toISOString())
  } else if (period === 'week') {
    const start = new Date(); start.setDate(start.getDate() - 7); start.setHours(0,0,0,0)
    query = query.gte('started_at', start.toISOString())
  }

  const { data, error } = await query
  if (error) return []

  const entries = []
  for (const session of (data || [])) {
    for (const player of (session.players || [])) {
      // Only valid scores (strokes > 0, not skipped)
      const playerScores = (session.scores || []).filter(
        s => s.player_name === player.name && s.strokes > 0
      )
      // Must have completed every single hole with a real score
      if (playerScores.length < totalHoles) continue
      const total = playerScores.reduce((a, s) => a + s.strokes, 0)
      const avg   = Math.round((total / playerScores.length) * 10) / 10
      entries.push({
        name:       player.name,
        color:      player.color,
        total,
        avg,
        holes:      playerScores.length,
        session_id: session.id,
        started_at: session.started_at,
      })
    }
  }

  return entries.sort((a, b) => a.total - b.total).slice(0, 10)
}

export async function getLiveLeaderboard() {
  // Active sessions only — lowest avg per player
  const { data, error } = await supabase
    .from('sessions')
    .select(`id, players, started_at, scores(hole_id, player_name, strokes)`)
    .eq('opt_out_leaderboard', false)
    .not('play_style', 'eq', 'fun')
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(20)

  if (error) return []
  const entries = []
  for (const session of (data || [])) {
    for (const player of (session.players || [])) {
      const playerScores = (session.scores || []).filter(s => s.player_name === player.name)
      if (playerScores.length === 0) continue
      const avg = playerScores.reduce((a, s) => a + s.strokes, 0) / playerScores.length
      entries.push({ name: player.name, color: player.color, avg: Math.round(avg * 10) / 10, holes: playerScores.length })
    }
  }
  return entries.sort((a, b) => a.avg - b.avg)
}

// ── Spinner Effects ────────────────────────────────────────────
export async function getSpinnerEffects() {
  const { data } = await supabase.from('spinner_effects').select('*').eq('active', true).order('created_at')
  return data || []
}

export async function getAllSpinnerEffects() {
  const { data } = await supabase.from('spinner_effects').select('*').order('created_at')
  return data || []
}

export async function upsertSpinnerEffect(effect) {
  const { data, error } = await supabase.from('spinner_effects').upsert(effect).select().single()
  if (error) throw error
  return data
}

export async function deleteSpinnerEffect(id) {
  await supabase.from('spinner_effects').delete().eq('id', id)
}

// ── Admin ──────────────────────────────────────────────────────
export async function checkAdminPassword(password) {
  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'admin_password')
    .single()
  return data?.value === password
}

export async function getAdminSetting(key) {
  const { data } = await supabase.from('admin_settings').select('value').eq('key', key).single()
  return data?.value || null
}

export async function setAdminSetting(key, value) {
  await supabase.from('admin_settings').upsert({ key, value })
}

export async function getAllSessions(limit = 50) {
  const { data } = await supabase
    .from('sessions')
    .select(`*, scores(*)`)
    .order('started_at', { ascending: false })
    .limit(limit)
  return data || []
}

// ── Game Mode Rules ────────────────────────────────────────────
export async function getGameModeRules(mode) {
  const { data } = await supabase
    .from('game_mode_rules')
    .select('rule_text')
    .eq('mode', mode)
    .eq('active', true)
    .order('order_index')
  return (data || []).map(r => r.rule_text)
}

export async function getAllGameModeRules() {
  const { data } = await supabase
    .from('game_mode_rules')
    .select('*')
    .order('mode')
    .order('order_index')
  return data || []
}

export async function upsertGameModeRule(rule) {
  const { data, error } = await supabase.from('game_mode_rules').upsert(rule).select().single()
  if (error) throw error
  return data
}

export async function deleteGameModeRule(id) {
  await supabase.from('game_mode_rules').delete().eq('id', id)
}

export async function reorderGameModeRules(mode, orderedIds) {
  const updates = orderedIds.map((id, i) =>
    supabase.from('game_mode_rules').update({ order_index: i }).eq('id', id)
  )
  await Promise.all(updates)
}

// ── Hole averages (all-time) ───────────────────────────────────
export async function getHoleAverages() {
  const [{ data: holes }, { data: scores }] = await Promise.all([
    supabase.from('holes').select('*').order('order_index'),
    supabase.from('scores').select('hole_id, strokes').gt('strokes', 0),
  ])
  if (!holes) return []
  return holes.map(hole => {
    const hs = (scores || []).filter(s => s.hole_id === hole.id)
    const avg = hs.length > 0
      ? Math.round((hs.reduce((a, s) => a + s.strokes, 0) / hs.length) * 10) / 10
      : null
    return { ...hole, avg, count: hs.length }
  })
}

// ── Delete session ─────────────────────────────────────────────
export async function deleteSession(id) {
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw error
}

// ── Delete one player's scores from a session ──────────────────
export async function deletePlayerScores(sessionId, playerName) {
  const { error } = await supabase.from('scores')
    .delete()
    .eq('session_id', sessionId)
    .eq('player_name', playerName)
  if (error) throw error
}
