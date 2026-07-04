import React, { useState } from 'react'

const FIELDS = [
  { key: 'salary', label: 'Monthly salary (₹)', hint: 'Your Barclays take-home' },
  { key: 'planetsparkIncome', label: 'PlanetSpark income this month (₹)', hint: 'Update monthly' },
  { key: 'emi', label: 'Total EMI payments / month (₹)', hint: 'All loan EMIs combined' },
  { key: 'rent', label: 'Rent (₹)', hint: 'Monthly rent' },
  { key: 'living', label: 'Living expenses (₹)', hint: 'Food, transport, misc' },
  { key: 'balanceTransfer', label: 'Balance transfer loan balance (₹)', hint: 'Current outstanding' },
  { key: 'sisterLoan', label: "Sister's loan amount (₹)", hint: 'Interest-free, 1–2 year payback' },
  { key: 'paidOff', label: 'Total debt paid off so far (₹)', hint: 'Running total across all loans' },
  { key: 'sessionsThisMonth', label: 'PlanetSpark sessions this month', hint: 'Count of completed sessions' },
]

export default function Setup({ data, onUpdate }) {
  const [form, setForm] = useState({ ...data.setup })
  const [saved, setSaved] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val === '' ? 0 : Number(val) }))

  const handleSave = () => {
    onUpdate(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 18 }}>Your numbers</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FIELDS.map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{f.label}</label>
              <input
                type="number"
                value={form[f.key] || ''}
                onChange={e => set(f.key, e.target.value)}
                placeholder="0"
              />
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{f.hint}</div>
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Debt-free target date</label>
            <input
              type="month"
              value={form.debtFreeTarget || ''}
              onChange={e => setForm(f => ({ ...f, debtFreeTarget: e.target.value }))}
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>

        <button onClick={handleSave} style={{
          width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: 'none',
          background: saved ? 'var(--green)' : 'var(--accent)', color: '#fff',
          fontWeight: 600, fontSize: 14, marginTop: 20, transition: 'background 0.2s'
        }}>
          {saved ? '✓ Saved' : 'Save and update dashboard'}
        </button>
      </div>

      <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--amber)', marginBottom: 6 }}>Update cadence</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
          Update <strong>PlanetSpark income</strong> and <strong>sessions</strong> weekly.<br />
          Update <strong>debt balances</strong> monthly after EMI hits.<br />
          Update <strong>paid off total</strong> every time you make an extra payment.
        </div>
      </div>
    </div>
  )
}
