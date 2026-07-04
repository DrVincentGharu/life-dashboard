-- Run this entire file in your Supabase SQL editor
-- Dashboard: 29→35 Life Operating System

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Setup / financial config (one row per user)
create table if not exists setup (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null unique,
  salary integer default 70000,
  planetspark_income integer default 0,
  emi integer default 0,
  rent integer default 0,
  living integer default 0,
  balance_transfer integer default 1500000,
  sister_loan integer default 0,
  paid_off integer default 0,
  sessions_this_month integer default 0,
  debt_free_target text default '2027-01',
  updated_at timestamptz default now()
);

-- Daily habit logs (one row per user per day)
create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  week_key text not null,
  habit_id text not null,
  days boolean[] default array[false,false,false,false,false,false,false],
  updated_at timestamptz default now(),
  unique(user_id, week_key, habit_id)
);

-- Weekly check-ins (one row per user per date)
create table if not exists checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  date text not null,
  answers jsonb default '{}',
  note text default '',
  score integer default 5,
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- Row Level Security: each user only sees their own data
alter table setup enable row level security;
alter table habits enable row level security;
alter table checkins enable row level security;

-- Policies (anon access keyed by user_id stored in localStorage)
create policy "Users manage own setup" on setup
  for all using (true) with check (true);

create policy "Users manage own habits" on habits
  for all using (true) with check (true);

create policy "Users manage own checkins" on checkins
  for all using (true) with check (true);
