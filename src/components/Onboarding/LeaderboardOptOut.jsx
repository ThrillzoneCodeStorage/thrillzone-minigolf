import { ChevronLeft, ChevronRight, Tv, EyeOff } from 'lucide-react'
import { useGame } from '../../context/GameContext'

export default function LeaderboardOptOut() {
  const { optOut, setOptOut, setOnboardStep } = useGame()

  return (
    <div className="screen animate-in">
      <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100dvh' }}>
        <button
          onClick={() => setOnboardStep('playStyle')}
          style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: 14, cursor: 'pointer', textAlign: 'left', marginBottom: 32, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, padding: 0 }}
        >
          <ChevronLeft size={18} /> Back
        </button>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--yellow-dim)', border: '1.5px solid var(--border-y)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Tv size={34} color="var(--yellow)" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 10 }}>Live Leaderboard</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15, lineHeight: 1.65, maxWidth: 300, margin: '0 auto' }}>
            Add your scores to the live room leaderboard?
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {[
            {
              val: false,
              Icon: Tv,
              title: 'Yes, add us!',
              desc: 'Our names and scores will show on the screen in the room.',
              color: 'var(--yellow)', border: 'var(--border-y)', bg: 'var(--yellow-dim)',
            },
            {
              val: true,
              Icon: EyeOff,
              title: 'No thanks',
              desc: 'We\'ll play without appearing on the public board.',
              color: 'var(--text-2)', border: 'var(--border)', bg: 'var(--bg-card)',
            },
          ].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => setOptOut(opt.val)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: optOut === opt.val ? opt.bg : 'var(--bg-card)',
                border: `1.5px solid ${optOut === opt.val ? opt.border : 'var(--border)'}`,
                borderRadius: 'var(--radius)', padding: '16px 18px',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: optOut === opt.val ? opt.border : 'var(--bg-card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                <opt.Icon size={20} color={optOut === opt.val ? opt.color : 'var(--text-3)'} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: optOut === opt.val ? opt.color : 'var(--text)', marginBottom: 3, letterSpacing: '-0.01em' }}>{opt.title}</p>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.4 }}>{opt.desc}</p>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${optOut === opt.val ? opt.color : 'var(--text-3)'}`, background: optOut === opt.val ? opt.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                {optOut === opt.val && <span style={{ color: '#000', fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </div>
            </button>
          ))}
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={() => setOnboardStep('players')}>
          Continue <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
