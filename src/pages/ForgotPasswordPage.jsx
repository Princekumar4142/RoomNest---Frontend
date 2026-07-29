import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authApi } from "../api/endpoints";
import AuthLayout from "../layouts/AuthLayout";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("request"); // request | reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRequest(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      toast.success(res.data.message);
      setStep("reset");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send reset code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      toast.success("Password updated — please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Link to="/login" className="flex items-center gap-1.5 text-sm text-slate-ink/60 hover:text-ink mb-6">
        <ArrowLeft size={15} /> Back to login
      </Link>

      <div className="text-center mb-8">
        <span className="stamp h-14 w-14 text-sm font-bold mx-auto mb-4">
          <KeyRound size={22} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {step === "request" ? "Reset your password" : "Set a new password"}
        </h1>
        <p className="text-sm text-slate-ink/60 mt-2">
          {step === "request"
            ? "Enter the email on your account and we'll send you a reset code."
            : `Enter the code sent to ${email} and choose a new password.`}
        </p>
      </div>

      {step === "request" ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <input
            required
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Sending..." : "Send reset code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <input
            required
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            className="input-field text-center tracking-[0.3em] font-mono"
          />
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-ink/40 hover:text-ink"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Updating..." : "Update password"}
          </button>
          <button
            type="button"
            onClick={handleRequest}
            disabled={loading}
            className="w-full text-center text-xs font-medium text-teal hover:text-teal-dark"
          >
            Resend code
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
