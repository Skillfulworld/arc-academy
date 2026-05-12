-- Arc Academy · Leaderboard SQL
-- Run this in Supabase: SQL Editor → New Query → paste → Run
-- (Run AFTER supabase-schema.sql has been applied)

-- SECURITY DEFINER function bypasses RLS and exposes only safe fields.
-- Anon and authenticated users can call it to read the leaderboard.

CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  rank          BIGINT,
  user_id       UUID,
  display_name  TEXT,
  points        INTEGER,
  streak        INTEGER,
  quizzes_passed BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY u.points DESC, u.id) AS rank,
    u.id AS user_id,
    CASE
      WHEN u.email IS NOT NULL AND u.email <> ''
        THEN split_part(u.email, '@', 1)
      WHEN u.wallet_address IS NOT NULL AND u.wallet_address <> ''
        THEN LEFT(u.wallet_address, 8) || '...' || RIGHT(u.wallet_address, 4)
      ELSE 'anon_' || LEFT(u.id::text, 6)
    END AS display_name,
    u.points,
    u.streak,
    COUNT(qr.id) FILTER (WHERE qr.passed = TRUE)::BIGINT AS quizzes_passed
  FROM public.users u
  LEFT JOIN public.quiz_results qr ON qr.user_id = u.id
  GROUP BY u.id, u.email, u.wallet_address, u.points, u.streak
  ORDER BY u.points DESC, u.id
  LIMIT limit_count;
END;
$$;

-- Grant execution to both anon (logged out) and authenticated users
GRANT EXECUTE ON FUNCTION public.get_leaderboard(INTEGER) TO anon, authenticated;
