-- ============================================================
-- profiles 테이블 (프리미엄 구독 상태 저장)
-- Supabase → SQL Editor 에 붙여넣고 실행.
-- is_premium 은 사용자가 직접 못 바꾸고, 결제 승인 Edge Function(service role)만 변경한다.
-- ============================================================

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  is_premium    boolean not null default false,
  premium_until timestamptz,
  display_name  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 본인 프로필만 조회 가능
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

-- ⚠️ 사용자 UPDATE 정책은 두지 않는다 (is_premium 위변조 방지).
--    is_premium 변경은 Edge Function이 service role로만 수행.

-- 가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- (선택) 기존 사용자용 프로필 백필
insert into public.profiles (id, display_name)
select id, split_part(email, '@', 1) from auth.users
on conflict (id) do nothing;
