// Basic inappropriate word filter — warns but allows continuing
// Keep list minimal and family-friendly focused
const BAD_WORDS = [
  'fuck','shit','cunt','cock','dick','ass','bitch','bastard','wank','piss',
  'nigger','nigga','faggot','fag','retard','spastic','whore','slut',
  'arsch','scheiß','scheiße','fotze','hurensohn','wichser','fick',
]

let customBadWords = []

// Load custom words from Supabase at startup
export async function loadCustomBannedWords(supabase) {
  try {
    const { data } = await supabase.from('admin_settings').select('value').eq('key','banned_words').single()
    if (data?.value) customBadWords = JSON.parse(data.value)
  } catch {}
}

export function checkName(name) {
  const lower = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const all = [...BAD_WORDS, ...customBadWords]
  const found = all.find(w => lower.includes(w.toLowerCase().replace(/[^a-z0-9]/g, '')))
  return found ? { clean: false, word: found } : { clean: true }
}

export function checkAllNames(names) {
  return names.map(name => ({
    name,
    ...checkName(name),
  })).filter(r => !r.clean)
}
