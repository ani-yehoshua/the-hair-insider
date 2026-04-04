-- Run this in your Supabase SQL editor

create table if not exists agent_pipeline_runs (
  id uuid default gen_random_uuid() primary key,
  run_id text not null unique,
  name text not null,
  status text not null check (status in ('running', 'pass', 'fail', 'review')),
  created_at timestamptz default now()
);

create table if not exists agent_run_steps (
  id uuid default gen_random_uuid() primary key,
  run_id text not null references agent_pipeline_runs(run_id),
  agent text not null,
  status text not null check (status in ('pass', 'fail', 'skip')),
  score integer,
  detail text,
  tokens_in integer default 0,
  tokens_out integer default 0,
  timestamp timestamptz default now()
);

create table if not exists lauren_feedback (
  id uuid default gen_random_uuid() primary key,
  run_id text references agent_pipeline_runs(run_id),
  content text not null,
  feedback text not null,
  approved boolean not null,
  created_at timestamptz default now()
);

create index if not exists idx_pipeline_runs_created on agent_pipeline_runs(created_at desc);
create index if not exists idx_run_steps_run_id on agent_run_steps(run_id);
create index if not exists idx_lauren_feedback_created on lauren_feedback(created_at desc);