import { supabase, isConfigured } from './supabase.js'

const LOCAL_KEY = 'life_dashboard_v1'
const USER_ID_KEY = 'life_dashboard_user_id'

// Get or create a stable anonymous user ID
export function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

const defaults = {
  setup: {
    salary: 70000,
    planetsparkIncome: 0,
    emi: 0,
    rent: 0,
    living: 0,
    balanceTransfer: 1500000,
    sisterLoan: 0,
    paidOff: 0,
    sessionsThisMonth: 0,
    debtFreeTarget: '2027-01',
  },
  habits: {},
  checkins: [],
}

// ─── Local storage helpers ────────────────────────────────────────────────────

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return structuredClone(defaults)
    return { ...structuredClone(defaults), ...JSON.parse(raw) }
  } catch {
    return structuredClone(defaults)
  }
}

function saveLocal(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

function toDbSetup(s) {
  return {
    salary: s.salary,
    planetspark_income: s.planetsparkIncome,
    emi: s.emi,
    rent: s.rent,
    living: s.living,
    balance_transfer: s.balanceTransfer,
    sister_loan: s.sisterLoan,
    paid_off: s.paidOff,
    sessions_this_month: s.sessionsThisMonth,
    debt_free_target: s.debtFreeTarget,
    updated_at: new Date().toISOString(),
  }
}

function fromDbSetup(row) {
  return {
    salary: row.salary,
    planetsparkIncome: row.planetspark_income,
    emi: row.emi,
    rent: row.rent,
    living: row.living,
    balanceTransfer: row.balance_transfer,
    sisterLoan: row.sister_loan,
    paidOff: row.paid_off,
    sessionsThisMonth: row.sessions_this_month,
    debtFreeTarget: row.debt_free_target,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function loadData() {
  if (!isConfigured()) return loadLocal()

  const userId = getUserId()

  try {
    const [setupRes, habitsRes, checkinsRes] = await Promise.all([
      supabase.from('setup').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('habits').select('*').eq('user_id', userId),
      supabase.from('checkins').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(30),
    ])

    const setup = setupRes.data ? fromDbSetup(setupRes.data) : structuredClone(defaults.setup)

    // Re-assemble habits into { [weekKey]: { [habitId]: boolean[] } }
    const habits = {}
    for (const row of (habitsRes.data || [])) {
      if (!habits[row.week_key]) habits[row.week_key] = {}
      habits[row.week_key][row.habit_id] = row.days
    }

    const checkins = (checkinsRes.data || []).map(r => ({
      date: r.date,
      answers: r.answers,
      note: r.note,
      score: r.score,
    }))

    const data = { setup, habits, checkins }
    saveLocal(data) // keep local copy in sync
    return data
  } catch (err) {
    console.error('Supabase load error, falling back to local:', err)
    return loadLocal()
  }
}

export async function saveSetup(data, setup) {
  const updated = { ...data, setup }
  saveLocal(updated)
  if (!isConfigured()) return updated

  const userId = getUserId()
  try {
    await supabase.from('setup').upsert({
      user_id: userId,
      ...toDbSetup(setup),
    }, { onConflict: 'user_id' })
  } catch (err) {
    console.error('Supabase setup save error:', err)
  }
  return updated
}

export async function saveHabits(data, habits) {
  const updated = { ...data, habits }
  saveLocal(updated)
  if (!isConfigured()) return updated

  const userId = getUserId()
  try {
    // Flatten habits object into rows
    const rows = []
    for (const [weekKey, weekHabits] of Object.entries(habits)) {
      for (const [habitId, days] of Object.entries(weekHabits)) {
        rows.push({
          user_id: userId,
          week_key: weekKey,
          habit_id: habitId,
          days,
          updated_at: new Date().toISOString(),
        })
      }
    }
    if (rows.length > 0) {
      await supabase.from('habits').upsert(rows, { onConflict: 'user_id,week_key,habit_id' })
    }
  } catch (err) {
    console.error('Supabase habits save error:', err)
  }
  return updated
}

export async function saveCheckin(data, checkin) {
  const others = (data.checkins || []).filter(c => c.date !== checkin.date)
  const checkins = [checkin, ...others]
  const updated = { ...data, checkins }
  saveLocal(updated)
  if (!isConfigured()) return updated

  const userId = getUserId()
  try {
    await supabase.from('checkins').upsert({
      user_id: userId,
      date: checkin.date,
      answers: checkin.answers,
      note: checkin.note,
      score: checkin.score,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,date' })
  } catch (err) {
    console.error('Supabase checkin save error:', err)
  }
  return updated
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function getWeekKey() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export function fmtINR(n) {
  const abs = Math.abs(Math.round(n))
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(0)}k`
  return `₹${abs.toLocaleString('en-IN')}`
}

export function fmtINRFull(n) {
  return (n < 0 ? '-₹' : '₹') + Math.abs(Math.round(n)).toLocaleString('en-IN')
}
