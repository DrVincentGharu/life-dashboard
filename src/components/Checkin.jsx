import React, { useState } from 'react'

const QUESTIONS = [
  { id: 'budget', label: 'Did I spend within my budget this week?', options: ['Yes — stayed on track', 'Close — minor overspend', 'No — went over'], category: 'Finance' },
  { id: 'ps_earn', label: 'Did I earn from PlanetSpark this week?', options: ['Yes, sessions done', 'No — need to book', 'Sessions booked for next week'], category: 'Income' },
  { id: 'integrity', label: 'Did I act with integrity in my relationship this week?', options: ['Yes', 'No', 'Complicated'], category: 'Self' },
  { id: 'proud', label: 'Did I make a decision future-me will be proud of?', options: ['Yes, a real one', 'Small one', 'Not really'], category: 'Self' },
]

export default function Checkin({ data, onUpdate }) {
  const today = new Date().toISOString().split('T')[0]
  const existing = data.checkins?.find(c => c.date === today) || {}
  const [form, setForm] = useState({ answers: existing.answers || {}, note: existing.note || '', score: existing.score || 5 })
  const [saved, setSaved] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setAnswer = (id, val) => setForm(f => ({ ...f, answers: { ...f.answers, [id]: val } }))

  const handleSave = () => {
    const entry = { date: today, ...form }
    onUpdate(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const past = [...(data.checkins || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
          Today's check-in · {today}
        </div>

        {QUESTIONS.map(q => (
          <div key={q.id} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{q.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {q.options.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', border: '1.5px solid',
                    borderColor: form.answers[q.id] === opt ? 'var(--accent)' : 'var(--border2)',
                    background: form.answers[q.id] === opt ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.15s'
                  }} onClick={() => setAnswer(q.id, opt)}>
                    {form.answers[q.id] === opt && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <span style={{ fontSize: 13, color: form.answers[q.id] === opt ? 'var(--text)' : 'var(--text2)' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>One honest note to yourself</div>
          <textarea
            rows={3}
            placeholder="What happened today that you need to be honest about?"
            value={form.note}
            onChange={e => set('note', e.target.value)}
            style={{ width: '100%', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Weekly gut score</span>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: form.score >= 7 ? 'var(--green)' : form.score >= 5 ? 'var(--amber)' : 'var(--red)' }}>{form.score}/10</span>
          </div>
          <input type="range" min={1} max={10} step={1} value={form.score} onChange={e => set('score', +e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
        </div>

        <button onClick={handleSave} style={{
          width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: 'none',
          background: saved ? 'var(--green)' : 'var(--accent)', color: '#fff',
          fontWeight: 600, fontSize: 14, transition: 'background 0.2s'
        }}>
          {saved ? '✓ Saved' : 'Save check-in'}
        </button>
      </div>

      {past.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Past check-ins</div>
          {past.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < past.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>{c.date}</div>
                {c.note && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.note}</div>}
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: c.score >= 7 ? 'var(--green-dim)' : c.score >= 5 ? 'var(--amber-dim)' : 'var(--red-dim)',
                fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)',
                color: c.score >= 7 ? 'var(--green)' : c.score >= 5 ? 'var(--amber)' : 'var(--red)'
              }}>{c.score}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
