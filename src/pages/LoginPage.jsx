import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ emailOrPhone, password });
      loginSuccess(res.data);
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}`);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresEmailVerification) {
        toast(data.message, { icon: "✉️" });
        navigate("/verify-email", { state: { userId: data.userId, email: emailOrPhone } });
        return;
      }
      toast.error(data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <span className="stamp h-11 w-11 text-xs font-bold mx-auto mb-4 lg:hidden">RN</span>
        <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="text-sm text-slate-ink/60 mt-1.5">Log in to manage bookings, chats and favorites.</p>
      </div>

      <form onSubmit={handlePasswordLogin} className="space-y-4">
        <input
          required
          type="email"
          placeholder="Email address"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          className="input-field"
        />
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <div className="flex justify-end -mt-1">
          <Link to="/forgot-password" className="text-xs font-medium text-teal hover:text-teal-dark">
            Forgot password?
          </Link>
        </div>

        <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-ink/60">
        New to RoomNest?{" "}
        <Link to="/register" className="font-medium text-teal hover:text-teal-dark">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
