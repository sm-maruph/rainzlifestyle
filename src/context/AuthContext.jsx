// Tracks the logged-in user (+ admin role). Wrap your app in <AuthProvider>.
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCurrentUser, login as apiLogin, register as apiRegister, logout as apiLogout, onAuthChange } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const profile = await getCurrentUser();
      const u = profile ? { ...profile, name: profile.full_name } : null;
      setUser(u);
      return u;            // <-- add
    } catch {
      setUser(null);
      return null;         // <-- add
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const { data: sub } = onAuthChange(() => refresh());
    return () => sub?.subscription?.unsubscribe?.();
  }, [refresh]);

  const login = async (creds) => { await apiLogin(creds); await refresh(); };
  const register = async (data) => { await apiRegister(data); await refresh(); };
  const logout = async () => { await apiLogout(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: user?.role === "admin", login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
