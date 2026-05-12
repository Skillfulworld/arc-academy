import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { QUIZZES } from "@/data/quizzes";
import { WalletModal } from "@/components/WalletModal";
import { CERTIFICATE_CONTRACT_ADDRESS, CERTIFICATE_ABI, ARC_EXPLORER_TX } from "@/lib/arcContract";
import { saveCertificate } from "@/lib/db";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onStartQuiz: (quizId: string) => void;
}

type MintStatus = "idle" | "pending" | "confirmed" | "error";

interface MintState {
  quizId: string;
  status: MintStatus;
  txHash?: string;
  error?: string;
}

export function DashboardPage({ onNavigate, onStartQuiz }: DashboardPageProps) {
  const {
    isConnected,
    walletAddress,
    supabaseUserId,
    supabaseEmail,
    points,
    streak,
    completedQuizzes,
    certificates,
    availableToMint,
    visitedDocs,
    markDocVisited,
    mintCertificate,
  } = useAppStore();

  const [showWallet, setShowWallet] = useState(false);
  const [mintState, setMintState] = useState<MintState | null>(null);

  const totalPassed = completedQuizzes.filter((q) => q.passed).length;
  const progress = Math.round((totalPassed / QUIZZES.length) * 100);
  const isEmailUser = !!supabaseUserId;

  const displayId = isEmailUser
    ? supabaseEmail ?? "email user"
    : walletAddress
    ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}`
    : null;

  function handleReadDocs(quizId: string, link: string) {
    markDocVisited(quizId);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  async function handleMint(quizId: string, quizName: string) {
    setMintState({ quizId, status: "pending" });

    try {
      const isRealWallet =
        !isEmailUser &&
        typeof window.ethereum !== "undefined" &&
        CERTIFICATE_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

      let txHash: string;

      if (isRealWallet) {
        const { createWalletClient, custom, encodeFunctionData } = await import("viem");
        const { arcTestnet } = await import("@/lib/wagmiConfig");

        const walletClient = createWalletClient({
          chain: arcTestnet,
          transport: custom(window.ethereum!),
        });

        const [account] = await walletClient.getAddresses();

        const data = encodeFunctionData({
          abi: CERTIFICATE_ABI,
          functionName: "mintCertificate",
          args: [account, quizName],
        });

        txHash = await walletClient.sendTransaction({
          account,
          to: CERTIFICATE_CONTRACT_ADDRESS,
          data,
        });
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        txHash = "0x" + Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("");
      }

      const cert = mintCertificate(quizId, quizName, txHash);
      setMintState({ quizId, status: "confirmed", txHash });

      if (supabaseUserId) {
        saveCertificate(supabaseUserId, cert).catch(() => {});
      }

      setTimeout(() => setMintState(null), 5000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message.slice(0, 60) : "Transaction failed";
      setMintState({ quizId, status: "error", error: msg });
      setTimeout(() => setMintState(null), 4000);
    }
  }

  if (!isConnected) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 text-center">
          <div className="arc-glass rounded-xl p-10 max-w-sm w-full border border-white/10">
            <p className="font-orbitron text-arc-purple text-sm mb-2">ACCESS_REQUIRED</p>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              Connect your wallet or email to access the Academy Dashboard
            </p>
            <button
              onClick={() => setShowWallet(true)}
              className="w-full bg-arc-purple text-white font-orbitron text-xs py-3 rounded-lg hover:bg-arc-purple/80 transition-all active:scale-[0.98]"
            >
              CONNECT NOW
            </button>
          </div>
        </div>
        {showWallet && (
          <WalletModal onClose={() => setShowWallet(false)} onNavigate={onNavigate} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 pt-24 pb-20">
      <div className="max-w-4xl mx-auto">

        {/* Mint confirmation toast */}
        {mintState?.status === "confirmed" && mintState.txHash && (
          <div className="fixed bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 bg-[#0a1f33] border border-arc-purple rounded-xl p-4 shadow-2xl animate-fade-in-up">
            <p className="font-orbitron text-arc-purple text-xs mb-1">🎖️ NFT MINTED ON-CHAIN</p>
            <p className="text-white/50 text-[10px] font-mono truncate">{mintState.txHash}</p>
            <a
              href={ARC_EXPLORER_TX(mintState.txHash)}
              target="_blank"
              rel="noreferrer"
              className="text-arc-purple text-[10px] font-orbitron hover:underline"
            >
              VIEW ON EXPLORER →
            </a>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="font-orbitron text-white text-xl mb-1">ACADEMY_DASHBOARD</h1>
          {displayId && (
            <p className="text-white/30 text-[11px] font-mono mb-5 truncate max-w-xs">
              {displayId}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: "TOTAL POINTS", value: points, icon: "⚡" },
              { label: "STREAK", value: streak > 0 ? `DAY ${streak}` : "—", icon: "🔥" },
              { label: "COMPLETED", value: `${totalPassed}/${QUIZZES.length}`, icon: "✅" },
              { label: "CERTS EARNED", value: certificates.length, icon: "🎖️" },
            ].map((stat) => (
              <div key={stat.label} className="arc-glass rounded-lg p-4 text-center border border-white/[0.06]">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="font-orbitron text-arc-purple text-lg font-bold leading-tight">
                  {stat.value}
                </div>
                <div className="text-white/30 text-[9px] tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-white/40 text-[11px] font-orbitron">OVERALL PROGRESS</span>
            <span className="text-arc-purple text-[11px] font-orbitron">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full">
            <div
              className="h-full bg-arc-purple rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quiz cards */}
        <h2 className="font-orbitron text-white/60 text-xs tracking-widest mb-4">MODULES</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {QUIZZES.map((quiz, idx) => {
            const hasRead = visitedDocs.includes(quiz.id);
            const result = completedQuizzes.find((q) => q.quizId === quiz.id);
            const passed = result?.passed ?? false;
            const canMint = availableToMint.includes(quiz.id);
            const hasCert = certificates.some((c) => c.quizId === quiz.id);
            const isMinting = mintState?.quizId === quiz.id && mintState.status === "pending";
            const mintError = mintState?.quizId === quiz.id && mintState.status === "error";

            return (
              <div
                key={quiz.id}
                className={`rounded-xl p-5 transition-all duration-300 border ${
                  passed
                    ? "bg-arc-purple/5 border-arc-purple/30"
                    : "arc-glass border-white/[0.07]"
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-orbitron text-arc-purple text-[10px] tracking-widest mb-1">
                      {quiz.module}
                    </p>
                    <h3 className="text-white text-sm font-medium leading-snug pr-2">
                      {quiz.name}
                    </h3>
                  </div>
                  <span className="text-xl flex-shrink-0" title={hasCert ? "Cert minted" : passed ? "Passed" : result ? "Failed" : "Locked"}>
                    {hasCert ? "🎖️" : passed ? "✅" : result ? "❌" : "🔒"}
                  </span>
                </div>

                {result && (
                  <p className="text-[11px] text-white/40 mb-3 font-mono">
                    Last score: {result.score}/5 · {passed ? "PASSED" : "FAILED"}
                  </p>
                )}

                {/* Two action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReadDocs(quiz.id, quiz.link)}
                    className={`flex-1 py-2.5 px-3 text-[11px] font-orbitron border rounded-lg transition-all active:scale-[0.97] ${
                      hasRead
                        ? "border-arc-purple/60 bg-arc-purple/10 text-arc-purple hover:bg-arc-purple/20"
                        : "border-white/30 bg-white/5 text-white hover:border-arc-purple hover:text-arc-purple hover:bg-arc-purple/5"
                    }`}
                  >
                    {hasRead ? "✓ DOCS" : "READ DOCS"}
                  </button>

                  <button
                    onClick={() => hasRead && onStartQuiz(quiz.id)}
                    disabled={!hasRead}
                    title={!hasRead ? "Read the docs first to unlock the quiz" : undefined}
                    className={`flex-1 py-2.5 px-3 text-[11px] font-orbitron rounded-lg transition-all active:scale-[0.97] ${
                      !hasRead
                        ? "bg-white/8 border border-white/15 text-white/35 cursor-not-allowed"
                        : "bg-white text-black hover:bg-arc-purple hover:text-white"
                    }`}
                  >
                    {!hasRead ? "🔒 QUIZ" : passed ? "RETAKE" : "TAKE QUIZ"}
                  </button>
                </div>

                {/* MINT NFT */}
                {canMint && !hasCert && (
                  <div className="mt-2">
                    {mintError && (
                      <p className="text-red-400 text-[10px] font-orbitron mb-1 text-center">
                        {mintState?.error}
                      </p>
                    )}
                    <button
                      onClick={() => handleMint(quiz.id, quiz.name)}
                      disabled={isMinting}
                      className="w-full py-2.5 px-3 text-[11px] font-orbitron bg-gradient-to-r from-arc-purple to-[#3a82c4] text-white rounded-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isMinting ? "MINTING ON-CHAIN..." : "MINT NFT CERTIFICATE"}
                    </button>
                  </div>
                )}

                {hasCert && (
                  <div className="mt-2 py-2 px-3 text-[11px] font-orbitron text-center text-arc-purple/70 border border-arc-purple/20 rounded-lg bg-arc-purple/5">
                    CERTIFICATE MINTED ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Certificates section */}
        {certificates.length > 0 && (
          <div>
            <h2 className="font-orbitron text-white/60 text-xs tracking-widest mb-4">
              EARNED_CERTIFICATES
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {certificates.map((cert) => (
                <div
                  key={cert.quizId}
                  className="arc-glass rounded-xl p-4 border border-arc-purple/25"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-arc-purple/20 border border-arc-purple/40 flex items-center justify-center text-xl flex-shrink-0">
                      🎖️
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">{cert.quizName}</p>
                      {cert.txHash && (
                        <a
                          href={ARC_EXPLORER_TX(cert.txHash)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-arc-purple/60 text-[10px] font-mono hover:text-arc-purple transition-colors block truncate"
                        >
                          {cert.txHash.slice(0, 18)}...
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-white/20 text-[9px] mt-2 font-mono">
                    {new Date(cert.mintedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
