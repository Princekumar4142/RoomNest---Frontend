import { useState, useRef } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import { authApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

const OTP_LENGTH = 6;

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();
  const { userId, email } = location.state || {};

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  function updateOtpDigit(index, value) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  }

  async function handleVerify(e) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return toast.error("Enter the full 6-digit code.");
    setLoading(true);
    try {
      const res = await authApi.verifyEmailOtp({ userId, otp: code });
      loginSuccess(res.data);
      toast.success("Email verified — welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await authApi.resendEmailOtp(userId);
      toast.success("A new code has been sent.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <span className="stamp h-14 w-14 text-sm font-bold mx-auto mb-4">
          <Mail size={22} />
        </span>
        <h1 className="font-display text-2xl font-semibold text-ink">Verify your email</h1>
        <p className="text-sm text-slate-ink/60 mt-2">
          Enter the 6-digit code sent to <span className="font-medium text-ink">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex justify-center gap-1.5 sm:gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              value={digit}
              onChange={(e) => updateOtpDigit(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-11 w-9 sm:h-12 sm:w-11 rounded-xl border border-ink/15 bg-white text-center text-lg font-semibold text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 transition-shadow"
            />
          ))}
        </div>
        <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-ink/60">
        Didn't get the code?{" "}
        <button onClick={handleResend} disabled={resending} className="font-medium text-teal hover:text-teal-dark">
          {resending ? "Sending..." : "Resend code"}
        </button>
      </p>
    </AuthLayout>
  );
}
