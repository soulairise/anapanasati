-- ============================================================
-- 숨결의 길 · Supabase 스키마
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행(RUN)하세요.
-- ============================================================

-- 수행일지 테이블 (핵심)
create table if not exists public.sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  duration_sec   int  not null default 0,
  stage          int  not null default 1,
  breath_pattern text not null default '',
  focus_score    int  not null default 3,
  note           text not null default '',
  ai_feedback    text,
  created_at      timestamptz not null default now()
);

-- 조회 성능을 위한 인덱스 (내 기록을 최신순으로)
create index if not exists sessions_user_created_idx
  on public.sessions (user_id, created_at desc);

-- ============================================================
-- RLS (Row Level Security) — 본인 데이터만 접근 가능
-- ============================================================
alter table public.sessions enable row level security;

-- 조회: 내 기록만
create policy "sessions_select_own"
  on public.sessions for select
  using (auth.uid() = user_id);

-- 생성: 내 user_id로만
create policy "sessions_insert_own"
  on public.sessions for insert
  with check (auth.uid() = user_id);

-- 수정: 내 기록만
create policy "sessions_update_own"
  on public.sessions for update
  using (auth.uid() = user_id);

-- 삭제: 내 기록만
create policy "sessions_delete_own"
  on public.sessions for delete
  using (auth.uid() = user_id);
