import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/lib/supabase";

interface WalletModalProps {
  onClose: () => void;
  onNavigate: (page: string) => void;
}

type Tab = "wallet" | "email";
type EmailStep = "enter_email" | "enter_otp";

export function WalletModal({ onClose, onNavigate }: WalletModalProps) {
  const { connectWallet, connectEmail } = useAppStore();
  const [tab, setTab] = useState<Tab>("wallet");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Wallet tab
  const [walletError, setWalletError] = useState("");

  // Email tab
  const [emailStep, setEmailStep] = useState<EmailStep>("enter_email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  async function handleMetaMask() {
    setWalletError("");
    setLoading(true);
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        }) as string[];
        if (accounts && accounts[0]) {
          connectWallet(accounts[0]);
          onClose();
          onNavigate("dashboard");
          return;
        }
      } else {
        setWalletError("MetaMask not detected. Install MetaMask or use Demo Mode.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("reject")) {
        setWalletError("Connection rejected.");
      } else {
        setWalletError("Connection failed. Try Demo Mode.");
      }
    }
    setLoading(false);
  }

  function handleDemo() {
    const demoAddr = "0xARCH" + Math.random().toString(16).slice(2, 8).toUpperCase();
    connectWallet(demoAddr);
    onClose();
    onNavigate("dashboard");
  }

  async function handleSendOtp() {
    setEmailError("");
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { shouldCreateUser: true },
      });
      if (sendError) {
        setEmailError(sendError.message);
        setLoading(false);
        return;
      }
      setEmailStep("enter_otp");
      startResendCooldown();
    } catch {
      setEmailError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  }

  async function handleVerifyOtp() {
    setOtpError("");
    const token = otp.trim();
    if (!token || token.length < 4) {
      setOtpError("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: "email",
      });
      if (verifyError) {
        setOtpError(verifyError.message || "Invalid or expired code. Try again.");
        setLoading(false);
        return;
      }
      if (data.user) {
        connectEmail(data.user.id, data.user.email ?? email.trim().toLowerCase());
        onClose();
        onNavigate("dashboard");
      }
    } catch {
      setOtpError("Verification failed. Please try again.");
    }
    setLoading(false);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setOtpError("");
    setLoading(true);
    try {
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
      });
      if (resendError) {
        setOtpError(resendError.message);
      } else {
        startResendCooldown();
      }
    } catch {
      setOtpError("Failed to resend code. Please try again.");
    }
    setLoading(false);
  }

  function startResendCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function handleBackToEmail() {
    setEmailStep("enter_email");
    setOtp("");
    setOtpError("");
  }

  function handleTabChange(t: Tab) {
    setTab(t);
    setEmailStep("enter_email");
    setEmail("");
    setOtp("");
    setEmailError("");
    setOtpError("");
    setWalletError("");
    setError("");
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-[#0a1f33] border border-arc-purple rounded-xl p-6 shadow-2xl">
        <h2 className="font-orbitron text-arc-purple text-center tracking-widest text-sm mb-4">
          INITIALIZE_IDENTITY
        </h2>

        {/* Tabs */}
        <div className="flex mb-5 border border-white/10 rounded-lg overflow-hidden">
          {(["wallet", "email"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex-1 py-2 font-orbitron text-[11px] tracking-wider transition-colors ${
                tab === t
                  ? "bg-arc-purple text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t === "wallet" ? "WALLET" : "EMAIL"}
            </button>
          ))}
        </div>

        {/* Wallet tab */}
        {tab === "wallet" && (
          <div className="space-y-3">
            <button
              onClick={handleMetaMask}
              disabled={loading}
              className="w-full py-3 bg-white text-black font-orbitron text-xs tracking-widest rounded-lg hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "CONNECTING..." : "CONNECT METAMASK"}
            </button>

            <button
              onClick={handleDemo}
              className="w-full py-3 bg-arc-purple/20 border border-arc-purple text-white font-orbitron text-xs tracking-widest rounded-lg hover:bg-arc-purple/30 active:scale-[0.98] transition-all"
            >
              DEMO MODE
            </button>

            {(walletError || error) && (
              <p className="text-red-400 text-[11px] text-center font-orbitron">{walletError || error}</p>
            )}
            <p className="text-white/20 text-center text-[10px] pt-1">
              Arc testnet · no real funds required
            </p>
          </div>
        )}

        {/* Email tab — step 1: enter email */}
        {tab === "email" && emailStep === "enter_email" && (
          <div className="space-y-3">
            <div>
              <label className="block text-white/50 text-[10px] font-orbitron tracking-widest mb-1.5">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                placeholder="architect@arc.network"
                autoFocus
                className="w-full bg-white/5 border border-white/15 text-white placeholder-white/25 text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-arc-purple transition-colors"
              />
              {emailError && (
                <p className="text-red-400 text-[11px] font-orbitron mt-1">{emailError}</p>
              )}
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-3 bg-arc-purple text-white font-orbitron text-xs tracking-widest rounded-lg hover:bg-arc-purple/80 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "SENDING CODE..." : "SEND OTP CODE"}
            </button>
            <p className="text-white/20 text-center text-[10px]">
              A one-time code will be sent to your email
            </p>
          </div>
        )}

        {/* Email tab — step 2: enter OTP */}
        {tab === "email" && emailStep === "enter_otp" && (
          <div className="space-y-3">
            <div className="text-center mb-1">
              <p className="text-white/50 text-[10px] font-orbitron tracking-widest">CODE SENT TO</p>
              <p className="text-arc-purple text-xs font-orbitron mt-0.5 truncate">{email.trim().toLowerCase()}</p>
            </div>
            <div>
              <label className="block text-white/50 text-[10px] font-orbitron tracking-widest mb-1.5">
                ENTER 6-DIGIT CODE
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                placeholder="000000"
                autoFocus
                className="w-full bg-white/5 border border-white/15 text-white placeholder-white/25 text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-lg focus:outline-none focus:border-arc-purple transition-colors font-orbitron"
              />
              {otpError && (
                <p className="text-red-400 text-[11px] font-orbitron mt-1 text-center">{otpError}</p>
              )}
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-3 bg-arc-purple text-white font-orbitron text-xs tracking-widest rounded-lg hover:bg-arc-purple/80 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "VERIFYING..." : "VERIFY & SIGN IN"}
            </button>
            <div className="flex items-center justify-between px-1">
              <button
                onClick={handleBackToEmail}
                className="text-white/30 hover:text-white/60 text-[10px] font-orbitron transition-colors"
              >
                ← CHANGE EMAIL
              </button>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-white/30 hover:text-white/60 text-[10px] font-orbitron transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `RESEND (${resendCooldown}s)` : "RESEND CODE"}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-white/30 hover:text-white/60 text-xs font-orbitron transition-colors"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}
