import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtINR, fmtINRFull } from '../storage.js'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const DEFAULT_CARDS = [
  { id: 'idfc', name: 'IDFC Millenia', limit: 32000, balance: 40896, minPayment: 2045, apr: 46.2, color: '#f59e0b' },
  { id: 'sbi', name: 'SBI Pulse', limit: 39000, balance: 46528, minPayment: 2326, apr: 45.0, color: '#ef4444' },
  { id: 'hsbc', name: 'HSBC Platinum', limit: 100000, balance: 110184, minPayment: 5509, apr: 45.0, color: '#8b5cf6' },
]

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
      <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: color || 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function CreditCardRow({ card, onUpdate }) {
  const overLimit = card.balance > card.limit
  const utilPct = Math.min(Math.round((card.balance / card.limit) * 100), 999)
  const monthlyInterest = Math.round(card.balance * (card.apr / 100 / 12))

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: card.color }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{card.name}</span>
            {overLimit && (
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--red-dim)', color: 'var(--red)', fontWeight: 600 }}>OVER LIMIT</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
            APR {card.apr}% · Monthly interest: <span style={{ color: 'var(--red)' }}>{fmtINRFull(monthlyInterest)}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: overLimit ? 'var(--red)' : 'var(--text)' }}>{fmtINRFull(card.balance)}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>of ₹{(card.limit/1000).toFixed(0)}k limit</div>
        </div>
      </div>

      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, marginBottom: 6 }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: Math.min(utilPct, 100) + '%',
          background: overLimit ? 'var(--red)' : utilPct > 80 ? 'var(--amber)' : 'var(--green)',
          transition: 'width 0.4s'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          Min payment: <span style={{ color: 'var(--amber)', fontWeight: 500 }}>{fmtINRFull(card.minPayment)}/mo</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{utilPct}% utilized</div>
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text3)', minWidth: 80 }}>Update balance:</span>
        <input
          type="number"
          defaultValue={card.balance}
          style={{ width: 120, padding: '4px 8px', fontSize: 12 }}
          onBlur={e => onUpdate(card.id, 'balance', +e.target.value)}
        />
        <span style={{ fontSize: 12, color: 'var(--text3)', minWidth: 80 }}>Min payment:</span>
        <input
          type="number"
          defaultValue={card.minPayment}
          style={{ width: 100, padding: '4px 8px', fontSize: 12 }}
          onBlur={e => onUpdate(card.id, 'minPayment', +e.target.value)}
        />
      </div>
    </div>
  )
}

export default function Finance({ data }) {
  const CARDS_KEY = 'vgmr_cards'
  const [cards, setCards] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CARDS_KEY)) || DEFAULT_CARDS } catch { return DEFAULT_CARDS }
  })

  const updateCard = (id, field, value) => {
    const updated = cards.map(c => c.id === id ? { ...c, [field]: value } : c)
    setCards(updated)
    localStorage.setItem(CARDS_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('cards_updated'))
  }

  const s = data.setup
  const totalIncome = s.salary + s.planetsparkIncome
  const totalCardBalance = cards.reduce((sum, c) => sum + c.balance, 0)
  const totalMinPayments = cards.reduce((sum, c) => sum + c.minPayment, 0)
  const totalMonthlyInterest = cards.reduce((sum, c) => sum + Math.round(c.balance * (c.apr / 100 / 12)), 0)
  const totalOut = s.emi + s.rent + s.living + totalMinPayments
  const net = totalIncome - totalOut
  const totalLoanDebt = s.balanceTransfer + s.sisterLoan
  const totalDebt = totalLoanDebt + totalCardBalance
  const paidOff = s.paidOff
  const pct = totalDebt > 0 ? Math.min(100, Math.round((paidOff / (totalDebt + paidOff)) * 100)) : 0

  // Avalanche order (highest APR first)
  const avalanche = [...cards].sort((a, b) => b.apr - a.apr)

  // Debt projection
  const months = []
  let bal = totalDebt - paidOff
  const monthlyExtra = Math.max(0, net * 0.7)
  for (let i = 0; i < 36; i++) {
    months.push({ month: MONTHS[i % 12], balance: Math.max(0, Math.round(bal / 1000)) })
    bal = Math.max(0, bal - monthlyExtra)
    if (bal <= 0 && i > 2) break
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <StatCard label="Monthly income" value={fmtINR(totalIncome)} color="var(--green)" sub={s.planetsparkIncome > 0 ? `incl. ${fmtINR(s.planetsparkIncome)} PlanetSpark` : 'Barclays only'} />
        <StatCard label="Net cash flow" value={(net >= 0 ? '+' : '') + fmtINR(net)} color={net >= 0 ? 'var(--green)' : 'var(--red)'} sub={net < 0 ? 'Still a shortfall' : 'Positive — good'} />
        <StatCard label="Total debt" value={fmtINR(totalDebt - paidOff)} color="var(--red)" sub={`Cards: ${fmtINR(totalCardBalance)}`} />
      </div>

      {/* Credit Cards */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Credit cards</div>
          <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>Interest burning: {fmtINRFull(totalMonthlyInterest)}/mo</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
          Total balance: <span style={{ color: 'var(--red)', fontWeight: 600 }}>{fmtINRFull(totalCardBalance)}</span> · Min payments: <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{fmtINRFull(totalMinPayments)}/mo</span>
        </div>
        {cards.map(card => <CreditCardRow key={card.id} card={card} onUpdate={updateCard} />)}
      </div>

      {/* Avalanche Strategy */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Avalanche payoff order</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>Pay minimums on all, throw every extra rupee at #1 first</div>
        {avalanche.map((card, i) => (
          <div key={card.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < avalanche.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? 'var(--red-dim)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i === 0 ? 'var(--red)' : 'var(--text3)', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{card.name} {i === 0 && <span style={{ fontSize: 11, color: 'var(--red)' }}>← attack this first</span>}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>APR {card.apr}% · Balance {fmtINRFull(card.balance)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Loan debt */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Loan debt</div>
        {[
          { label: 'Balance transfer loan', amount: s.balanceTransfer, badge: 'EMI', badgeColor: 'var(--amber)' },
          { label: "Sister's loan (0% interest)", amount: s.sisterLoan, badge: '0%', badgeColor: 'var(--green)' },
          { label: 'Paid off so far', amount: -paidOff, badge: 'Done', badgeColor: 'var(--green)' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>{r.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {r.badge && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: r.badgeColor + '22', color: r.badgeColor, fontWeight: 500 }}>{r.badge}</span>}
              <span style={{ fontWeight: 600, color: r.amount < 0 ? 'var(--green)' : 'var(--text)' }}>{fmtINRFull(r.amount)}</span>
            </div>
          </div>
        ))}
        <div style={{ paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Overall payoff progress</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: pct + '%', background: 'var(--green)', borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      </div>

      {/* Cash flow */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Monthly cash flow</div>
        {[
          { label: 'Barclays salary', val: s.salary, sign: 1 },
          { label: 'PlanetSpark income', val: s.planetsparkIncome, sign: 1 },
          { label: 'Loan EMI payments', val: s.emi, sign: -1 },
          { label: 'Card minimum payments', val: totalMinPayments, sign: -1 },
          { label: 'Rent', val: s.rent, sign: -1 },
          { label: 'Living expenses', val: s.living, sign: -1 },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>{r.label}</span>
            <span style={{ fontWeight: 500, color: r.sign > 0 ? 'var(--green)' : 'var(--red)' }}>
              {r.sign > 0 ? '+' : '-'}{fmtINRFull(r.val)}
            </span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Net monthly</span>
          <span style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)', color: net >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {net >= 0 ? '+' : ''}{fmtINRFull(net)}
          </span>
        </div>
      </div>

      {/* Projection chart */}
      {months.length > 1 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Total debt payoff projection (₹k)</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={months} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c6af7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c6af7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`₹${v}k`, 'Balance']} />
              <Area type="monotone" dataKey="balance" stroke="var(--accent)" strokeWidth={2} fill="url(#debtGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Based on putting 70% of net monthly cash toward debt · Cards tackled in avalanche order</div>
        </div>
      )}
    </div>
  )
}
