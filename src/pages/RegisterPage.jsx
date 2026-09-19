import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { authApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

const OTP_LENGTH = 6;
const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function RegisterPage({ forcedRole }) {
  const [step, setStep] = useState("details"); // details | verify
  const [role, setRole] = useState(forcedRole || "user");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [devOtp, setDevOtp] = useState(null);
  const inputRefs = useRef([]);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (step !== "verify" || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  async function handleDetailsSubmit(e) {
    e.preventDefault();

    if (!PHONE_REGEX.test(form.phone)) {
      setPhoneTouched(true);
      toast.error("Enter a valid 10-digit mobile number (starting with 6-9).");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({ ...form, role });
      setUserId(res.data.userId);
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      setCountdown(30);
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
      if (role === "owner") {
        navigate("/owner/dashboard");
      } else {
        const hub = form.hubPreference || "GEC West Champaran (Kumarbagh)";
        if (hub === "GPS" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              navigate(`/search?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radiusKm=10&ai=1`);
            },
            () => {
              navigate("/search?campus=GEC&radiusKm=10&ai=1");
            },
            { timeout: 4000 }
          );
        } else {
          navigate(`/search?campus=${encodeURIComponent(hub)}&radiusKm=10&ai=1`);
        }
      }
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

  function fillOtp(code) {
    if (!code) return;
    const digits = String(code).split("").slice(0, OTP_LENGTH);
    setOtp(digits);
    if (inputRefs.current[OTP_LENGTH - 1]) inputRefs.current[OTP_LENGTH - 1].focus();
  }

  if (step === "verify") {
    return (
      <AuthLayout>
        <button onClick={() => setStep("details")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-5">
          <ArrowLeft size={14} /> Edit registration details
        </button>

        <div className="text-center mb-6">
          <span className="stamp h-14 w-14 text-sm font-bold mx-auto mb-4 bg-orange-50 text-[#FD701E] border border-orange-200">
            <Mail size={22} />
          </span>
          <h1 className="font-display text-2xl font-bold text-slate-900">Check your email</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            We sent a 6-digit code to <strong className="text-slate-800">{form.email}</strong>
          </p>

          {/* Spam / Inbox Alert Notice */}
          <div className="mt-4 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-left text-xs text-amber-900">
            <p className="font-semibold flex items-center gap-1.5 text-amber-800">
              📬 Didn't see the email in your Primary Inbox?
            </p>
            <p className="text-amber-700 text-[11px] mt-0.5 leading-relaxed">
              Please check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions / Updates</strong> folder. Sent from <strong>RoomNest &lt;no-reply@trackmapinnovations.in&gt;</strong>.
            </p>
          </div>

          {/* Development fast-fill badge */}
          {devOtp && (
            <button
              type="button"
              onClick={() => fillOtp(devOtp)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              ⚡ Test Code: <strong>{devOtp}</strong> (Click to auto-fill)
            </button>
          )}
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
                className="h-11 w-9 sm:h-12 sm:w-11 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-slate-900 focus:border-[#FD701E] focus:outline-none focus:ring-2 focus:ring-orange-200 transition-shadow"
              />
            ))}
          </div>

          <button disabled={loading} className="btn-brand w-full !py-2.5 text-xs font-bold disabled:opacity-60">
            {loading ? "Verifying..." : "Verify & Create Account"}
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

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <img
          src="/logo.png"
          alt="RoomNest Logo"
          className="h-12 w-12 object-contain rounded-xl mx-auto mb-3 shadow-sm border border-slate-100 lg:hidden"
        />
        <h1 className="font-display text-2xl font-bold text-slate-900">Create Free Account</h1>
        <p className="text-xs text-slate-500 mt-1">Join as a student looking for a PG or list your property.</p>
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
        <div>
          <input
            required
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm({ ...form, phone: digitsOnly });
            }}
            onBlur={() => setPhoneTouched(true)}
            maxLength={10}
            className={`input-field ${
              phoneTouched && form.phone && !PHONE_REGEX.test(form.phone) ? "!border-red-400 focus:!ring-red-200" : ""
            }`}
          />
          {phoneTouched && form.phone && !PHONE_REGEX.test(form.phone) && (
            <p className="mt-1.5 text-xs text-red-600">
              Enter a valid 10-digit mobile number (starting with 6-9).
            </p>
          )}
        </div>
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

        {/* AI 10 KM LIVE LOCATION SUGGESTION PREFERENCE FOR STUDENTS */}
        {role === "user" && (
          <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <span>📍</span> AI 10 km Radius Suggestions
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-200/80 text-blue-800 px-1.5 py-0.5 rounded">
                Smart Match
              </span>
            </div>
            <p className="text-[11px] text-blue-900/80 leading-relaxed">
              Auto-show verified PGs and hostels within 10 km of your live GPS or college area right after signup.
            </p>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-900/70 mb-1">
                Your College / Primary Hub
              </label>
              <select
                value={form.hubPreference || "GEC West Champaran (Kumarbagh)"}
                onChange={(e) => setForm({ ...form, hubPreference: e.target.value })}
                className="input-field !py-1.5 text-xs bg-white"
              >
                <option value="GEC West Champaran (Kumarbagh)">GEC West Champaran (Kumarbagh)</option>
                <option value="Kumarbagh">Kumarbagh Station & College Rd</option>
                <option value="Bettiah">Bettiah Town (Supriya Road / Lal Bazar)</option>
                <option value="Chanpatia">Chanpatia (Startup Zone & Station)</option>
                <option value="Narkatiaganj">Narkatiaganj Junction & College</option>
                <option value="GPS">Use My Live GPS (Auto-detect)</option>
              </select>
            </div>
          </div>
        )}

        <p className="flex items-center gap-1.5 text-xs text-slate-ink/50">
          <ShieldCheck size={13} className="text-teal" />
          We'll email you a 6-digit code to verify it's really you.
        </p>
        <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Sending code..." : "Continue & get 10 km suggestions"}
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
