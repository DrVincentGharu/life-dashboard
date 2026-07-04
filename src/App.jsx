import React, { useState, useEffect } from 'react'
import { loadData, saveSetup, saveHabits, saveCheckin } from './storage.js'
import { isConfigured } from './supabase.js'
import Finance from './components/Finance.jsx'
import Habits from './components/Habits.jsx'
import Checkin from './components/Checkin.jsx'
import Setup from './components/Setup.jsx'

const TABS = [
  { id: 'finance', label: 'Finance', icon: '₹' },
  { id: 'habits', label: 'Habits', icon: '◉' },
  { id: 'checkin', label: 'Check-in', icon: '✓' },
  { id: 'setup', label: 'Setup', icon: '⚙' },
]

const DAYS_TO_35 = Math.ceil((new Date('2032-06-29') - new Date()) / 86400000)

export default function App() {
  const [tab, setTab] = useState('finance')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    loadData().then(d => {
      setData(d)
      setLoading(false)
      setSynced(isConfigured())
    })
  }, [])

  const handleSetup = async (setup) => {
    const updated = await saveSetup(data, setup)
    setData(updated)
  }

  const handleHabits = async (habits) => {
    const updated = await saveHabits(data, habits)
    setData(updated)
  }

  const handleCheckin = async (checkin) => {
    const updated = await saveCheckin(data, checkin)
    setData(updated)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading your dashboard…</div>
    </div>
  )

  const net = data.setup.salary + data.setup.planetsparkIncome - data.setup.emi - data.setup.rent - data.setup.living
  const totalDebt = data.setup.balanceTransfer + data.setup.sisterLoan - data.setup.paidOff

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 80px' }}>

        {/* Header */}
        <div style={{ padding: '28px 0 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>29 → 35</h1>
              <span style={{ fontSize: 13, color: 'var(--text3)' }}>Operating system</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: synced ? 'var(--green)' : 'var(--amber)' }} />
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{synced ? 'Cloud sync on' : 'Local only'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--text3)', display: 'block' }}>Days left</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{DAYS_TO_35.toLocaleString()}</span>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <span style={{ fontSize: 11, color: 'var(--text3)', display: 'block' }}>Monthly net</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: net >= 0 ? 'var(--green)' : 'var(--red)' }}>
                {net >= 0 ? '+' : ''}₹{Math.abs(Math.round(net)).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <span style={{ fontSize: 11, color: 'var(--text3)', display: 'block' }}>Debt remaining</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--amber)' }}>
                ₹{(Math.max(0, totalDebt) / 100000).toFixed(1)}L
              </span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 2, padding: '12px 0', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '8px 4px', border: 'none', borderRadius: 8,
              background: tab === t.id ? 'var(--bg3)' : 'transparent',
              color: tab === t.id ? 'var(--text)' : 'var(--text3)',
              fontWeight: tab === t.id ? 600 : 400, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
            }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'finance' && <Finance data={data} />}
        {tab === 'habits' && <Habits data={data} onUpdate={handleHabits} />}
        {tab === 'checkin' && <Checkin data={data} onUpdate={handleCheckin} />}
        {tab === 'setup' && <Setup data={data} onUpdate={handleSetup} />}
      </div>
    </div>
  )
}
