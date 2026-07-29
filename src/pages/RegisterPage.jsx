import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { authApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

const OTP_LENGTH = 6;

export default function RegisterPage() {
  const [step, setStep] = useState("details"); // details | verify
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  async function handleDetailsSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register({ ...form, role });
      setUserId(res.data.userId);
      setStep("verify");
      toast.success("Verification code sent to your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  function updateOtpDigit(index, value) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData("text").trim().slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pasted)) return;
    e.preventDefault();
    setOtp(pasted.split("").concat(Array(OTP_LENGTH).fill("")).slice(0, OTP_LENGTH));
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleVerify(e) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error("Enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyEmailOtp({ userId, otp: code });
      loginSuccess(res.data);
      toast.success("Email verified — welcome to RoomNest!");
      navigate(role === "owner" ? "/owner/dashboard" : "/");
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

  if (step === "verify") {
    return (
      <AuthLayout>
        <button onClick={() => setStep("details")} className="flex items-center gap-1.5 text-sm text-slate-ink/60 hover:text-ink mb-6">
          <ArrowLeft size={15} /> Back
        </button>

        <div className="text-center mb-8">
          <span className="stamp h-14 w-14 text-sm font-bold mx-auto mb-4">
            <Mail size={22} />
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink">Check your email</h1>
          <p className="text-sm text-slate-ink/60 mt-2">
            We sent a 6-digit code to <span className="font-medium text-ink">{form.email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
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
            {loading ? "Verifying..." : "Verify & create account"}
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

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <span className="stamp h-11 w-11 text-xs font-bold mx-auto mb-4 lg:hidden">RN</span>
        <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
        <p className="text-sm text-slate-ink/60 mt-1.5">Join as a room seeker or list your own property.</p>
      </div>

      <div className="flex rounded-full border border-ink/12 p-1 mb-6">
        {[
          { key: "user", label: "I'm looking for a room" },
          { key: "owner", label: "I'm a property owner" },
        ].map((r) => (
          <button
            key={r.key}
            onClick={() => setRole(r.key)}
            className={`flex-1 rounded-full py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
              role === r.key ? "bg-ink text-paper shadow-sm" : "text-slate-ink/60 hover:text-ink"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleDetailsSubmit} className="space-y-4">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field"
        />
        <input
          required
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-field"
        />
        <input
          required
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="input-field"
        />
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-ink/40 hover:text-ink"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-ink/50">
          <ShieldCheck size={13} className="text-teal" />
          We'll email you a 6-digit code to verify it's really you.
        </p>
        <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Sending code..." : "Continue"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-ink/60">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-teal hover:text-teal-dark">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
