import React from 'react'
import { getWeekKey } from '../storage.js'

const HABITS = [
  { id: 'budget', name: 'Tracked expenses', category: 'Finance', color: 'var(--blue)' },
  { id: 'ps', name: 'PlanetSpark session', category: 'Income', color: 'var(--green)' },
  { id: 'no_impulse', name: 'No impulse purchase', category: 'Finance', color: 'var(--blue)' },
  { id: 'ads_study', name: 'Studied 1 Meta ad case', category: 'Skill', color: 'var(--amber)' },
  { id: 'move', name: 'Got physical activity', category: 'Health', color: 'var(--green)' },
  { id: 'reflect', name: '5 min honest reflection', category: 'Self', color: 'var(--accent)' },
  { id: 'dogs', name: 'Quality time with dogs', category: 'Joy', color: 'var(--red)' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Habits({ data, onUpdate }) {
  const weekKey = getWeekKey()
  const weekData = data.habits[weekKey] || {}

  const toggle = (habitId, dayIdx) => {
    const current = weekData[habitId] || [false, false, false, false, false, false, false]
    const updated = [...current]
    updated[dayIdx] = !updated[dayIdx]
    const newHabits = {
      ...data.habits,
      [weekKey]: { ...weekData, [habitId]: updated }
    }
    onUpdate(newHabits)
  }

  const totalPossible = HABITS.length * 7
  const totalDone = HABITS.reduce((sum, h) => {
    const days = weekData[h.id] || []
    return sum + days.filter(Boolean).length
  }, 0)
  const weekPct = Math.round((totalDone / totalPossible) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>This week · {weekKey}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: weekPct >= 70 ? 'var(--green)' : weekPct >= 40 ? 'var(--amber)' : 'var(--red)' }}>{totalDone}/{totalPossible} done</span>
        </div>
        <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3 }}>
          <div style={{ height: '100%', width: weekPct + '%', background: weekPct >= 70 ? 'var(--green)' : weekPct >= 40 ? 'var(--amber)' : 'var(--red)', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(7, 36px)', gap: 0, padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>Habit</span>
          {DAYS.map(d => <span key={d} style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>{d}</span>)}
        </div>

        {HABITS.map((habit, hi) => {
          const days = weekData[habit.id] || [false, false, false, false, false, false, false]
          const streak = days.filter(Boolean).length
          return (
            <div key={habit.id} style={{
              display: 'grid', gridTemplateColumns: '1fr repeat(7, 36px)', gap: 0,
              padding: '12px 20px', borderBottom: hi < HABITS.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{habit.name}</div>
                <div style={{ fontSize: 11, color: habit.color, marginTop: 2 }}>{habit.category} · {streak}/7</div>
              </div>
              {days.map((done, di) => (
                <button key={di} onClick={() => toggle(habit.id, di)} style={{
                  width: 26, height: 26, borderRadius: '50%', border: 'none',
                  background: done ? habit.color : 'var(--bg3)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', transition: 'background 0.15s, transform 0.1s',
                  transform: done ? 'scale(1.1)' : 'scale(1)'
                }}>
                  {done && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
