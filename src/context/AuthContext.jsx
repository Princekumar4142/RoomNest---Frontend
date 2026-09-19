import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("roomnest_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("roomnest_token"))
      .finally(() => setLoading(false));
  }, []);

  function loginSuccess({ user, token }) {
    localStorage.setItem("roomnest_token", token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("roomnest_token");
    setUser(null);
    authApi.logout().catch(() => {});
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
