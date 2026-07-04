import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { fmtINR, fmtINRFull } from '../storage.js'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
      <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: color || 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function DebtRow({ label, amount, badge, badgeColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text2)', fontSize: 13 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {badge && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: badgeColor + '22', color: badgeColor, fontWeight: 500 }}>{badge}</span>}
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>{fmtINRFull(amount)}</span>
      </div>
    </div>
  )
}

export default function Finance({ data }) {
  const s = data.setup
  const totalIncome = s.salary + s.planetsparkIncome
  const totalOut = s.emi + s.rent + s.living
  const net = totalIncome - totalOut
  const totalDebt = s.balanceTransfer + s.sisterLoan
  const remaining = totalDebt - s.paidOff
  const pct = totalDebt > 0 ? Math.min(100, Math.round((s.paidOff / totalDebt) * 100)) : 0

  // Project debt payoff over months
  const months = []
  let bal = remaining
  const monthlyExtra = Math.max(0, net * 0.7)
  for (let i = 0; i < 30; i++) {
    months.push({ month: MONTHS[i % 12], balance: Math.max(0, Math.round(bal / 1000)) })
    bal = Math.max(0, bal - monthlyExtra)
    if (bal <= 0 && i > 2) break
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <StatCard label="Monthly income" value={fmtINR(totalIncome)} color="var(--green)" sub={s.planetsparkIncome > 0 ? `incl. ₹${(s.planetsparkIncome/1000).toFixed(0)}k PlanetSpark` : 'Barclays only'} />
        <StatCard label="Net cash flow" value={(net >= 0 ? '+' : '') + fmtINR(net)} color={net >= 0 ? 'var(--green)' : 'var(--red)'} sub={net < 0 ? 'Still a shortfall' : 'Positive — good'} />
        <StatCard label="Debt remaining" value={fmtINR(remaining)} color="var(--amber)" sub={`${pct}% paid off`} />
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Debt breakdown</div>
        <DebtRow label="Balance transfer loan" amount={s.balanceTransfer} badge="EMI" badgeColor="var(--amber)" />
        <DebtRow label="Sister's loan (interest-free)" amount={s.sisterLoan} badge="0%" badgeColor="var(--green)" />
        <DebtRow label="Paid off so far" amount={-s.paidOff} badge="Done" badgeColor="var(--green)" />
        <div style={{ paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Payoff progress</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: pct + '%', background: 'var(--green)', borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Monthly cash flow</div>
        {[
          { label: 'Barclays salary', val: s.salary, sign: 1 },
          { label: 'PlanetSpark income', val: s.planetsparkIncome, sign: 1 },
          { label: 'EMI payments', val: s.emi, sign: -1 },
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

      {months.length > 1 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Debt payoff projection (₹k)</div>
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
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Based on putting 70% of net monthly cash toward debt</div>
        </div>
      )}
    </div>
  )
}
