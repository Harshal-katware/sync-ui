import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bg from "../assets/restro4.jpg";

type Step = "email" | "otp" | "success";

export default function ForgotPassword() {
  const navigate  = useNavigate();
  const [step,        setStep]        = useState<Step>("email");
  const [email,       setEmail]       = useState("");
  const [otp,         setOtp]         = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [message,     setMessage]     = useState("");

  // ── Step 1: Send OTP ──────────────────────────────────────────────
  const handleSendOtp = async () => {
    setError("");
    if (!email) { setError("Please enter your email!"); return; }
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/auth/forgot-password", { email });
      setMessage("OTP sent to your email!");
      setStep("otp");
    } catch (e: any) {
      setError(e?.response?.data || "Email not found!");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP & Reset Password ───────────────────────────
  const handleResetPassword = async () => {
    setError("");
    if (!otp) { setError("Please enter OTP!"); return; }
    if (!newPassword) { setError("Please enter new password!"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters!"); return; }
    if (!/[A-Z]/.test(newPassword)) { setError("Password must have at least one uppercase letter!"); return; }
    if (!/[0-9]/.test(newPassword)) { setError("Password must have at least one number!"); return; }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) { setError("Password must have at least one special character!"); return; }
    if (newPassword !== confirm) { setError("Passwords do not match!"); return; }

    setLoading(true);
    try {
      await axios.post("http://localhost:8080/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setStep("success");
    } catch (e: any) {
      setError(e?.response?.data || "Invalid OTP or something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full px-4 py-2.5 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
         style={{ backgroundImage: `url(${bg})` }}>
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-sm p-8 text-white text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔐</span>
        </div>

        {/* ── Step 1: Email ── */}
        {step === "email" && (
          <>
            <h1 className="text-2xl font-bold mb-1">Forgot Password</h1>
            <p className="text-white/60 text-sm mb-6">Enter your registered email to receive OTP</p>

            <div className="text-left space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inp}
              />
              {error && <p className="text-red-400 text-xs">⚠ {error}</p>}
              <button onClick={handleSendOtp} disabled={loading}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition disabled:opacity-60">
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: OTP + New Password ── */}
        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
            <p className="text-emerald-400 text-sm mb-6">{message}</p>

            <div className="text-left space-y-4">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={inp}
                maxLength={6}
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inp}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inp}
              />
              {error && <p className="text-red-400 text-xs">⚠ {error}</p>}
              <button onClick={handleResetPassword} disabled={loading}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition disabled:opacity-60">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button onClick={() => { setStep("email"); setError(""); }}
                className="w-full py-2 border border-white/20 text-white/60 text-sm rounded-lg hover:bg-white/5 transition">
                ← Back
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Success ── */}
        {step === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-700 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
            <p className="text-white/60 text-sm mb-6">
              Your password has been reset successfully!
            </p>
            <button onClick={() => navigate("/")}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition">
              Back to Login
            </button>
          </>
        )}

        {/* Back to login */}
        {step === "email" && (
          <p className="mt-6 text-sm text-white/50">
            Remember password?{" "}
            <span onClick={() => navigate("/")}
              className="text-blue-400 cursor-pointer hover:underline">
              Login
            </span>
          </p>
        )}
      </div>
    </div>
  );
}