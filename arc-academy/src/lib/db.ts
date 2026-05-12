import { supabase } from "./supabase";
import type { QuizResult, Certificate } from "@/store/useAppStore";

export interface LoadedUserData {
  points: number;
  streak: number;
  lastCheckIn: string | null;
  completedQuizzes: QuizResult[];
  certificates: Certificate[];
  availableToMint: string[];
}

export async function ensureUser(userId: string, email: string): Promise<void> {
  await supabase.from("users").upsert(
    { id: userId, email },
    { onConflict: "id", ignoreDuplicates: false }
  );
}

export async function loadUserData(userId: string): Promise<LoadedUserData | null> {
  const [profileRes, quizRes, certRes, checkinRes] = await Promise.all([
    supabase.from("users").select("points, streak, last_check_in").eq("id", userId).single(),
    supabase.from("quiz_results").select("quiz_id, score, passed, completed_at").eq("user_id", userId),
    supabase.from("nft_certificates").select("quiz_id, quiz_name, tx_hash, minted_at").eq("user_id", userId),
    supabase
      .from("daily_checkins")
      .select("checked_in_date")
      .eq("user_id", userId)
      .order("checked_in_date", { ascending: false })
      .limit(1),
  ]);

  if (profileRes.error && profileRes.error.code !== "PGRST116") {
    console.error("[db] loadUserData profile error:", profileRes.error.message);
    return null;
  }

  const profile = profileRes.data;
  const quizRows = quizRes.data ?? [];
  const certRows = certRes.data ?? [];

  const completedQuizzes: QuizResult[] = quizRows.map((r) => ({
    quizId: r.quiz_id,
    score: r.score,
    passed: r.passed,
    completedAt: r.completed_at,
  }));

  const certificates: Certificate[] = certRows.map((c) => ({
    quizId: c.quiz_id,
    quizName: c.quiz_name,
    mintedAt: c.minted_at,
    txHash: c.tx_hash ?? undefined,
  }));

  const mintedIds = new Set(certRows.map((c) => c.quiz_id));
  const availableToMint = completedQuizzes
    .filter((q) => q.passed && !mintedIds.has(q.quizId))
    .map((q) => q.quizId);

  return {
    points: profile?.points ?? 0,
    streak: profile?.streak ?? 0,
    lastCheckIn: profile?.last_check_in ?? null,
    completedQuizzes,
    certificates,
    availableToMint,
  };
}

export async function saveQuizResult(
  userId: string,
  result: QuizResult,
  newPoints: number,
  newStreak: number
): Promise<void> {
  const [quizUpsert, statsUpdate] = await Promise.all([
    supabase.from("quiz_results").upsert(
      {
        user_id: userId,
        quiz_id: result.quizId,
        score: result.score,
        passed: result.passed,
        completed_at: result.completedAt,
      },
      { onConflict: "user_id,quiz_id" }
    ),
    supabase
      .from("users")
      .update({ points: newPoints, streak: newStreak })
      .eq("id", userId),
  ]);

  if (quizUpsert.error) console.error("[db] saveQuizResult:", quizUpsert.error.message);
  if (statsUpdate.error) console.error("[db] updatePoints:", statsUpdate.error.message);
}

export async function saveCheckIn(
  userId: string,
  dateStr: string,
  streakDay: number,
  pointsEarned: number,
  totalPoints: number,
  totalStreak: number
): Promise<void> {
  const dateOnly = dateStr.split("T")[0];

  const [checkinInsert, statsUpdate] = await Promise.all([
    supabase.from("daily_checkins").upsert(
      {
        user_id: userId,
        checked_in_date: dateOnly,
        streak_day: streakDay,
        points_earned: pointsEarned,
      },
      { onConflict: "user_id,checked_in_date", ignoreDuplicates: true }
    ),
    supabase
      .from("users")
      .update({ points: totalPoints, streak: totalStreak, last_check_in: dateOnly })
      .eq("id", userId),
  ]);

  if (checkinInsert.error) console.error("[db] saveCheckIn:", checkinInsert.error.message);
  if (statsUpdate.error) console.error("[db] updateStats:", statsUpdate.error.message);
}

export async function saveCertificate(userId: string, cert: Certificate): Promise<void> {
  const { error } = await supabase.from("nft_certificates").upsert(
    {
      user_id: userId,
      quiz_id: cert.quizId,
      quiz_name: cert.quizName,
      tx_hash: cert.txHash ?? null,
      minted_at: cert.mintedAt,
    },
    { onConflict: "user_id,quiz_id", ignoreDuplicates: true }
  );
  if (error) console.error("[db] saveCertificate:", error.message);
}
