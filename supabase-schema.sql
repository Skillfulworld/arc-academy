-- Arc Academy · Supabase Schema
-- Run this once in your Supabase project: SQL Editor → New Query → paste → Run

-- ── 1. users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          TEXT,
  wallet_address TEXT,
  points         INTEGER NOT NULL DEFAULT 0,
  streak         INTEGER NOT NULL DEFAULT 0,
  last_check_in  DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ── 2. quiz_results ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id      TEXT NOT NULL,
  score        INTEGER NOT NULL,
  passed       BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, quiz_id)
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_results_select_own" ON public.quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "quiz_results_insert_own" ON public.quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "quiz_results_update_own" ON public.quiz_results
  FOR UPDATE USING (auth.uid() = user_id);

-- ── 3. daily_checkins ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  checked_in_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  streak_day       INTEGER NOT NULL,
  points_earned    INTEGER NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, checked_in_date)
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkins_select_own" ON public.daily_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "checkins_insert_own" ON public.daily_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 4. nft_certificates ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.nft_certificates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id    TEXT NOT NULL,
  quiz_name  TEXT NOT NULL,
  tx_hash    TEXT,
  minted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, quiz_id)
);

ALTER TABLE public.nft_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certs_select_own" ON public.nft_certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "certs_insert_own" ON public.nft_certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 5. auto-update updated_at on users ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
