import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { WalletModal } from "@/components/WalletModal";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { isConnected } = useAppStore();
  const [showWallet, setShowWallet] = useState(false);

  function handleLaunch() {
    if (isConnected) {
      onNavigate("dashboard");
    } else {
      setShowWallet(true);
    }
  }

  const features = [
    { icon: "📚", label: "5 Modules", desc: "Curated Arc ecosystem content" },
    { icon: "🏆", label: "Quiz System", desc: "Test knowledge, earn points" },
    { icon: "🎖️", label: "NFT Certs", desc: "On-chain proof of completion" },
    { icon: "🔥", label: "Daily Streaks", desc: "7-day reward progression" },
  ];

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <div className="animate-fade-in-up max-w-2xl mx-auto">
          <p className="font-orbitron text-arc-purple text-[11px] tracking-[0.4em] mb-4 opacity-80">
            ARC TESTNET · LEARN · BUILD · EARN
          </p>
          <h1 className="font-orbitron font-black text-4xl md:text-6xl text-white leading-tight mb-6">
            MASTER THE<br />
            <span className="text-arc-purple">AGENTIC ECONOMY</span>
          </h1>
          <p className="text-white/50 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
            Learn Arc ecosystem fundamentals, complete on-chain quizzes, and earn
            NFT certificates as proof of your expertise.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <button
              onClick={handleLaunch}
              className="bg-white text-black font-orbitron font-black text-sm px-10 py-4 rounded-lg hover:bg-arc-purple hover:text-white transition-all duration-300 active:scale-[0.97]"
            >
              LAUNCH APP
            </button>
            <a
              href="https://docs.arc.network/"
              target="_blank"
              rel="noreferrer"
              className="border border-white/20 text-white font-orbitron text-sm px-8 py-4 rounded-lg hover:border-arc-purple hover:text-arc-purple transition-all duration-300"
            >
              READ DOCS
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
          {features.map((f, i) => (
            <div
              key={i}
              className="arc-glass arc-glass-hover rounded-xl p-4 text-center border border-white/[0.06]"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-orbitron text-white text-xs mb-1">{f.label}</div>
              <div className="text-white/40 text-[10px] leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-white/20 text-xs">
          <span>CONNECT WITH US: </span>
          <a
            href="https://x.com/Zkfenrir"
            target="_blank"
            rel="noreferrer"
            className="text-arc-purple hover:text-arc-purple/70 transition-colors font-orbitron"
          >
            @Zkfenrir
          </a>
        </div>
      </div>

      {showWallet && (
        <WalletModal
          onClose={() => setShowWallet(false)}
          onNavigate={onNavigate}
        />
      )}
    </>
  );
}
