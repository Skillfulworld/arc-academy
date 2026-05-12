import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { saveCheckIn } from "@/lib/db";

interface CheckInModalProps {
  onClose: () => void;
}

type Status = "idle" | "signing" | "done" | "already" | "error";

export function CheckInModal({ onClose }: CheckInModalProps) {
  const {
    processCheckIn,
    getStreakDay,
    getTodayCheckInDone,
    isConnected,
    walletAddress,
    supabaseUserId,
  } = useAppStore();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<{ day: number; points: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const currentStreak = getStreakDay();
  const todayDone = getTodayCheckInDone();
  const dayRewards = [1, 2, 3, 4, 5, 6, 7];

  async function handleCheckIn() {
    if (todayDone) {
      setStatus("already");
      return;
    }

    setStatus("signing");
    setErrorMsg("");

    try {
      const isWalletUser = isConnected && walletAddress && !supabaseUserId;
      const isRealWallet = isWalletUser && typeof window.ethereum !== "undefined";

      if (isRealWallet) {
        const message = `Arc Academy Daily Check-in\nDate: ${new Date().toDateString()}\nWallet: ${walletAddress}`;
        await window.ethereum!.request({
          method: "personal_sign",
          params: [message, walletAddress],
        });
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }

      const res = processCheckIn();

      if (res.alreadyDone) {
        setStatus("already");
      } else {
        setResult({ day: res.day, points: res.points });
        setStatus("done");

        if (supabaseUserId) {
          saveCheckIn(
            supabaseUserId,
            res.dateStr,
            res.day,
            res.points,
            res.totalPoints,
            res.totalStreak
          ).catch(() => {});
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message.toLowerCase().includes("reject")) {
        setErrorMsg("Signature rejected. Check-in cancelled.");
      } else {
        setErrorMsg("Signature failed. Try again.");
      }
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-[#0a1f33] border border-arc-purple rounded-xl p-6 shadow-2xl">
        <h2 className="font-orbitron text-arc-purple text-center tracking-widest text-sm mb-1">
          DAILY_PROTOCOL_SYNC
        </h2>
        <p className="text-white/40 text-center text-[11px] mb-5">
          Sign to check in · earn streak points
        </p>

        {/* Streak grid */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {dayRewards.slice(0, 4).map((pts, i) => {
            const day = i + 1;
            const isCompleted = currentStreak >= day;
            const isCurrent = currentStreak + 1 === day && !todayDone;
            return (
              <div
                key={day}
                className={`rounded-lg p-3 text-center border transition-all text-xs ${
                  isCompleted
                    ? "border-arc-purple bg-arc-purple/15 text-arc-purple"
                    : isCurrent
                    ? "border-white text-white animate-border-glow"
                    : "border-white/10 text-white/25"
                }`}
              >
                <div className="text-[9px] opacity-60 mb-0.5">DAY</div>
                <div className="font-orbitron font-bold">{day}</div>
                <div className="text-[9px] mt-0.5">+{pts}pt</div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {dayRewards.slice(4).map((pts, i) => {
            const day = i + 5;
            const isCompleted = currentStreak >= day;
            const isCurrent = currentStreak + 1 === day && !todayDone;
            return (
              <div
                key={day}
                className={`rounded-lg p-3 text-center border transition-all text-xs ${
                  isCompleted
                    ? "border-arc-purple bg-arc-purple/15 text-arc-purple"
                    : isCurrent
                    ? "border-white text-white animate-border-glow"
                    : "border-white/10 text-white/25"
                }`}
              >
                <div className="text-[9px] opacity-60 mb-0.5">DAY</div>
                <div className="font-orbitron font-bold">{day}</div>
                <div className="text-[9px] mt-0.5">+{pts}pt</div>
              </div>
            );
          })}
        </div>

        {/* Status messages */}
        {status === "done" && result && (
          <div className="mb-4 p-3 bg-arc-purple/20 border border-arc-purple/40 rounded-lg text-center">
            <p className="font-orbitron text-arc-purple text-xs">
              ✅ STREAK DAY {result.day} · +{result.points} PTS EARNED
            </p>
          </div>
        )}
        {status === "already" && (
          <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="font-orbitron text-white/50 text-xs">ALREADY SYNCED TODAY</p>
          </div>
        )}
        {status === "error" && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
            <p className="font-orbitron text-red-400 text-xs">{errorMsg}</p>
          </div>
        )}

        {/* Action button */}
        {status === "idle" || status === "error" ? (
          <button
            onClick={handleCheckIn}
            disabled={todayDone}
            className={`w-full py-3 font-orbitron text-xs tracking-widest rounded-lg transition-all active:scale-[0.98] ${
              todayDone
                ? "bg-white/10 text-white/30 cursor-not-allowed"
                : "bg-gradient-to-r from-arc-purple to-[#3a82c4] text-white hover:opacity-90"
            }`}
          >
            {todayDone ? "ALREADY SYNCED" : "SIGN & CHECK IN"}
          </button>
        ) : status === "signing" ? (
          <div className="w-full py-3 bg-arc-purple/30 text-arc-purple font-orbitron text-xs text-center rounded-lg tracking-widest">
            WAITING FOR SIGNATURE...
          </div>
        ) : null}

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-white/30 hover:text-white/60 text-xs font-orbitron transition-colors"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
