import { useState } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { truncateAddress } from "@/lib/utils";
import { CheckInModal } from "./CheckInModal";
import { WalletModal } from "./WalletModal";
import { supabase } from "@/lib/supabase";

interface NavbarProps {
  onNavigate: (page: string) => void;
}

export function Navbar({ onNavigate }: NavbarProps) {
  const [location] = useLocation();
  const {
    walletAddress,
    isConnected,
    supabaseEmail,
    supabaseUserId,
    disconnectWallet,
    disconnectEmail,
    getTodayCheckInDone,
  } = useAppStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  const todayDone = getTodayCheckInDone();

  const isEmailUser = !!supabaseUserId;

  const displayAddress = isEmailUser && supabaseEmail
    ? supabaseEmail.split("@")[0] + "@..."
    : walletAddress?.startsWith("EMAIL:")
    ? walletAddress.replace("EMAIL:", "").split("@")[0] + "@..."
    : walletAddress
    ? truncateAddress(walletAddress)
    : null;

  function handleWalletClick() {
    if (!isConnected) {
      setShowWallet(true);
    } else {
      setShowDropdown((v) => !v);
    }
  }

  async function handleDisconnect() {
    setShowDropdown(false);
    if (isEmailUser) {
      await supabase.auth.signOut();
      disconnectEmail();
    } else {
      disconnectWallet();
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 h-[68px] bg-[rgba(5,13,22,0.97)] backdrop-blur-lg border-b border-white/[0.07]">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-full bg-arc-purple flex items-center justify-center flex-shrink-0">
            <span className="text-white font-orbitron font-black text-[11px]">A</span>
          </div>
          <span className="font-orbitron font-black tracking-widest text-[13px] text-white hidden sm:block">
            ARC // ACADEMY
          </span>
        </button>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => onNavigate("landing")}
            className={`font-orbitron text-[11px] tracking-wider transition-colors ${
              location === "/" ? "text-arc-purple" : "text-white/40 hover:text-white/70"
            }`}
          >
            HOME
          </button>
          <button
            onClick={() => onNavigate("dashboard")}
            className={`font-orbitron text-[11px] tracking-wider transition-colors ${
              location === "/dashboard" ? "text-arc-purple" : "text-white/40 hover:text-white/70"
            }`}
          >
            DASHBOARD
          </button>
          <button
            onClick={() => onNavigate("leaderboard")}
            className={`font-orbitron text-[11px] tracking-wider transition-colors ${
              location === "/leaderboard" ? "text-arc-purple" : "text-white/40 hover:text-white/70"
            }`}
          >
            LEADERBOARD
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Check-in button */}
          <button
            onClick={() => setShowCheckin(true)}
            className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/5 transition-colors"
            title="Daily Check-in"
          >
            <span className="text-lg leading-none">📅</span>
            {!todayDone && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050d16] animate-pulse-red" />
            )}
          </button>

          {/* Wallet/identity button */}
          <div className="relative">
            <button
              onClick={handleWalletClick}
              className="border border-arc-purple bg-arc-purple/10 text-white font-orbitron text-[11px] px-3 py-2 rounded-lg hover:bg-arc-purple/20 transition-all whitespace-nowrap active:scale-[0.97]"
            >
              {isConnected && displayAddress ? displayAddress : "CONNECT WALLET"}
            </button>

            {isConnected && showDropdown && (
              <div className="absolute right-0 top-11 w-52 bg-[#0a1f33] border border-arc-purple/60 rounded-xl p-3 shadow-2xl z-50">
                <p className="font-orbitron text-arc-purple text-[10px] tracking-widest mb-2 px-1">
                  {isEmailUser ? "EMAIL_NODE" : "ARCHITECT_NODE"}
                </p>
                <button
                  className="w-full text-left text-white/80 py-2 px-2 hover:text-arc-purple hover:bg-white/5 rounded transition-colors font-orbitron text-[11px]"
                  onClick={() => { onNavigate("dashboard"); setShowDropdown(false); }}
                >
                  MY PROGRESS
                </button>
                <hr className="border-white/10 my-1" />
                <button
                  className="w-full text-left text-red-400 py-2 px-2 hover:text-red-300 hover:bg-white/5 rounded transition-colors font-orbitron text-[11px]"
                  onClick={handleDisconnect}
                >
                  DISCONNECT
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showCheckin && <CheckInModal onClose={() => setShowCheckin(false)} />}
      {showWallet && (
        <WalletModal onClose={() => setShowWallet(false)} onNavigate={onNavigate} />
      )}
      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
      )}
    </>
  );
}
