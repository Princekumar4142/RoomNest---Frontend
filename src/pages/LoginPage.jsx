import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import AuthLayout from "../layouts/AuthLayout";

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({ emailOrPhone, password });
      loginSuccess(res.data);
      const role = res.data.user?.role;
      if (role === "admin") {
        toast.success(`Welcome Admin, ${res.data.user.name.split(" ")[0]}! Opening Admin Panel.`);
        navigate("/admin/dashboard");
      } else if (role === "owner") {
        toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}!`);
        navigate("/owner/dashboard");
      } else {
        toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}`);
        navigate("/");
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresEmailVerification) {
        toast(data.message, { icon: "✉️" });
        navigate("/verify-email", {
          state: { userId: data.userId, email: emailOrPhone },
        });
        return;
      }
      toast.error(data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <img
          src="/logo.png"
          alt="RoomNest Logo"
          className="h-12 w-12 object-contain rounded-xl mx-auto mb-3 shadow-sm border border-slate-100 lg:hidden"
        />
        <h1 className="font-display text-2xl font-bold text-slate-900">{t("login_title")}</h1>
        <p className="text-xs text-slate-500 mt-1">{t("login_sub")}</p>
      </div>

      <form onSubmit={handlePasswordLogin} className="space-y-4">
        <input
          required
          type="email"
          placeholder={t("email_placeholder")}
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          className="input-field"
        />
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            placeholder={t("password_placeholder")}
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
            {t("forgot_password")}
          </Link>
        </div>

        <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? t("logging_in") : t("login_btn")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-ink/60">
        {t("new_to_roomnest")}{" "}
        <Link to="/register" className="font-medium text-teal hover:text-teal-dark">
          {t("create_account")}
        </Link>
      </p>
    </AuthLayout>
  );
}
