import { useGame } from '../context/GameContext'
import PlayStyleSelect   from '../components/Onboarding/PlayStyleSelect'
import LeaderboardOptOut from '../components/Onboarding/LeaderboardOptOut'
import PlayerSetup       from '../components/Onboarding/PlayerSetup'
import HoleScreen        from '../components/HoleScreen/HoleScreen'
import EndScreen         from '../components/EndScreen/EndScreen'

export default function PlayerApp() {
  const { phase, onboardStep } = useGame()

  if (phase === 'loading') return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:24, background:'#0a0a0a' }}>
      <img src="/logo.png" alt="Thrillzone" style={{ height:72, objectFit:'contain', animation:'pulse 2s ease infinite' }}/>
      <div style={{ display:'flex', gap:6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#FFD600', animation:`dot 1.2s ${i*0.18}s ease-in-out infinite` }}/>
        ))}
      </div>
      <style>{`
        @keyframes pulse{0%,100%{opacity:0.6;transform:scale(0.97)}50%{opacity:1;transform:scale(1)}}
        @keyframes dot{0%,100%{opacity:0.2;transform:scale(0.7)}50%{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  )

  if (phase === 'onboarding') {
    // New flow: playStyle → players → optOut
    if (onboardStep === 'playStyle') return <PlayStyleSelect />
    if (onboardStep === 'players')   return <PlayerSetup />
    if (onboardStep === 'optOut')    return <LeaderboardOptOut />
  }

  if (phase === 'playing') return <HoleScreen />
  if (phase === 'end')     return <EndScreen />
  return null
}
