import { useState, useRef, useEffect } from "react";
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
  const { userId, email, devOtp: initialDevOtp } = location.state || {};

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [devOtp, setDevOtp] = useState(initialDevOtp);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  function fillOtpCode(code) {
    if (!code) return;
    const digits = String(code).split("").slice(0, OTP_LENGTH);
    setOtp(digits);
    if (inputRefs.current[OTP_LENGTH - 1]) inputRefs.current[OTP_LENGTH - 1].focus();
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
    if (countdown > 0) return;
    setResending(true);
    try {
      const res = await authApi.resendEmailOtp(userId);
      toast.success("A new verification code has been sent!");
      if (res.data?.devOtp) setDevOtp(res.data.devOtp);
      setCountdown(30);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <span className="stamp h-14 w-14 text-sm font-bold mx-auto mb-4 bg-orange-50 text-[#FD701E] border border-orange-200">
          <Mail size={22} />
        </span>
        <h1 className="font-display text-2xl font-bold text-slate-900">Verify your email</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Enter the 6-digit code sent to <strong className="text-slate-800">{email}</strong>
        </p>

        {/* Spam / Inbox Alert Notice */}
        <div className="mt-4 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-left text-xs text-amber-900">
          <p className="font-semibold flex items-center gap-1.5 text-amber-800">
            📬 Didn't see the email in your Primary Inbox?
          </p>
          <p className="text-amber-700 text-[11px] mt-0.5 leading-relaxed">
            Please check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions / Updates</strong> folder. The email is sent from <strong>RoomNest &lt;no-reply@trackmapinnovations.in&gt;</strong>.
          </p>
        </div>

        {/* Development fast-fill badge */}
        {devOtp && (
          <button
            type="button"
            onClick={() => fillOtpCode(devOtp)}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            ⚡ Test Code: <strong>{devOtp}</strong> (Click to auto-fill)
          </button>
        )}
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
              className="h-11 w-9 sm:h-12 sm:w-11 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-slate-900 focus:border-[#FD701E] focus:outline-none focus:ring-2 focus:ring-orange-200 transition-shadow"
            />
          ))}
        </div>
        <button disabled={loading} className="btn-brand w-full !py-2.5 text-xs font-bold disabled:opacity-60">
          {loading ? "Verifying..." : "Verify Email & Continue"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Didn't get the code?{" "}
        <button
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="font-bold text-[#FD701E] hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {resending ? "Sending..." : countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
        </button>
      </p>
    </AuthLayout>
  );
}
