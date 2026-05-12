import { useEffect, useState, useCallback } from "react";
import { fetchLeaderboard, LeaderboardEntry } from "@/lib/leaderboard";
import { useAppStore } from "@/store/useAppStore";

const MEDAL = ["🥇", "🥈", "🥉"];
const RANK_COLORS = [
  "border-yellow-500/50 bg-yellow-500/5 text-yellow-400",
  "border-white/30 bg-white/5 text-white/70",
  "border-orange-600/40 bg-orange-600/5 text-orange-500",
];

export function LeaderboardPage() {
  const { supabaseUserId, points: myPoints } = useAppStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchLeaderboard(50);
    setEntries(data);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const myEntry = entries.find((e) => e.userId === supabaseUserId);
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen px-4 md:px-8 pt-24 pb-20">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-orbitron text-white text-xl tracking-widest">LEADERBOARD</h1>
            <button
              onClick={load}
              disabled={loading}
              className="font-orbitron text-[10px] text-arc-purple/70 hover:text-arc-purple transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <span className={loading ? "animate-spin inline-block" : ""}>↻</span>
              {loading ? "SYNCING..." : "REFRESH"}
            </button>
          </div>
          <p className="text-white/30 text-[11px] font-mono">
            Top architects on Arc testnet · ranked by points
          </p>
          {lastRefresh && !loading && (
            <p className="text-white/20 text-[10px] mt-0.5">
              Last updated {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* My rank banner — only for email users in the list */}
        {myEntry && (
          <div className="mb-6 p-4 rounded-xl border border-arc-purple/50 bg-arc-purple/10 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-orbitron text-arc-purple text-[10px] tracking-widest mb-0.5">YOUR RANK</p>
                <p className="font-orbitron text-white text-lg font-bold">
                  #{myEntry.rank}
                  <span className="text-white/40 text-sm font-normal ml-2">of {entries.length}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-orbitron text-arc-purple text-2xl font-bold">{myEntry.points}</p>
                <p className="text-white/30 text-[10px]">POINTS</p>
              </div>
            </div>
          </div>
        )}

        {/* Not in DB yet notice for wallet/demo users */}
        {!supabaseUserId && (
          <div className="mb-6 p-3 rounded-lg border border-white/10 bg-white/[0.03] text-center">
            <p className="text-white/30 text-[11px] font-orbitron">
              Sign in with email to appear on the leaderboard
            </p>
          </div>
        )}

        {loading && entries.length === 0 ? (
          /* Skeleton */
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-white/[0.04] border border-white/[0.06] animate-pulse"
                style={{ opacity: 1 - i * 0.1 }}
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-orbitron text-white/20 text-sm">NO_DATA_YET</p>
            <p className="text-white/20 text-[11px] mt-2">
              Be the first to complete a quiz and claim rank #1
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[topThree[1], topThree[0], topThree[2]].map((entry, podiumIdx) => {
                  if (!entry) return <div key={podiumIdx} />;
                  const actualRank = entry.rank - 1;
                  const heights = ["h-28", "h-36", "h-24"];
                  const isMe = entry.userId === supabaseUserId;
                  return (
                    <div
                      key={entry.userId}
                      className={`relative flex flex-col items-center justify-end pb-4 pt-3 px-2 rounded-xl border transition-all ${
                        RANK_COLORS[actualRank]
                      } ${isMe ? "ring-2 ring-arc-purple/60" : ""} ${heights[podiumIdx]}`}
                    >
                      <span className="text-2xl mb-1">{MEDAL[actualRank]}</span>
                      <p className="font-orbitron text-[10px] truncate max-w-full text-center leading-tight">
                        {entry.displayName}
                        {isMe && <span className="text-arc-purple"> ·YOU</span>}
                      </p>
                      <p className="font-orbitron font-bold text-sm mt-1">{entry.points}</p>
                      <p className="text-[9px] opacity-50">PTS</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ranks 4+ */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((entry) => {
                  const isMe = entry.userId === supabaseUserId;
                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                        isMe
                          ? "border-arc-purple/50 bg-arc-purple/10"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                      }`}
                    >
                      {/* Rank */}
                      <span className="font-orbitron text-white/30 text-xs w-8 text-right flex-shrink-0">
                        #{entry.rank}
                      </span>

                      {/* Name */}
                      <span
                        className={`font-orbitron text-[12px] flex-1 truncate ${
                          isMe ? "text-arc-purple" : "text-white/70"
                        }`}
                      >
                        {entry.displayName}
                        {isMe && <span className="text-white/30 text-[10px] ml-1">(you)</span>}
                      </span>

                      {/* Stats */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-white/25 text-[9px] font-orbitron">QUIZZES</p>
                          <p className="font-orbitron text-white/60 text-xs">{entry.quizzesPassed}/5</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-white/25 text-[9px] font-orbitron">STREAK</p>
                          <p className="font-orbitron text-white/60 text-xs">
                            {entry.streak > 0 ? `🔥${entry.streak}` : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/25 text-[9px] font-orbitron">POINTS</p>
                          <p className={`font-orbitron text-sm font-bold ${isMe ? "text-arc-purple" : "text-white"}`}>
                            {entry.points}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-center text-white/15 text-[10px] font-orbitron mt-6">
              SHOWING TOP {entries.length} ARCHITECTS
            </p>
          </>
        )}
      </div>
    </div>
  );
}
