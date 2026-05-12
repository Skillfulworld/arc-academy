import { supabase } from "./supabase";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  points: number;
  streak: number;
  quizzesPassed: number;
}

export async function fetchLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    limit_count: limit,
  });

  if (error) {
    console.error("[leaderboard] fetch error:", error.message);
    return [];
  }

  return (data ?? []).map((row: {
    rank: number;
    user_id: string;
    display_name: string;
    points: number;
    streak: number;
    quizzes_passed: number;
  }) => ({
    rank: Number(row.rank),
    userId: row.user_id,
    displayName: row.display_name,
    points: row.points,
    streak: row.streak,
    quizzesPassed: Number(row.quizzes_passed),
  }));
}
