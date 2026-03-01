import { useState, useCallback, useContext, createContext } from "react";
import { login as apiLogin } from "../api/client";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (clinicCode: string, pin: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthState(): AuthContextValue {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("fullfill_token")
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (clinicCode: string, pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const t = await apiLogin(clinicCode, pin);
      localStorage.setItem("fullfill_token", t);
      setToken(t);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fullfill_token");
    setToken(null);
  }, []);

  return { token, isAuthenticated: !!token, login, logout, error, loading };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthContext.Provider");
  return ctx;
}
