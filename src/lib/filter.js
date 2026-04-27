// Basic inappropriate word filter — warns but allows continuing
// Keep list minimal and family-friendly focused
const BAD_WORDS = [
  'fuck','shit','cunt','cock','dick','ass','bitch','bastard','wank','piss',
  'nigger','nigga','faggot','fag','retard','spastic','whore','slut',
  'arsch','scheiß','scheiße','fotze','hurensohn','wichser','fick',
]

export function checkName(name) {
  const lower = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const found = BAD_WORDS.find(w => lower.includes(w))
  return found ? { clean: false, word: found } : { clean: true }
}

export function checkAllNames(names) {
  return names.map(name => ({
    name,
    ...checkName(name),
  })).filter(r => !r.clean)
}
