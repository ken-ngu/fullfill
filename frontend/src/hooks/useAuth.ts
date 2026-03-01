import { useState, useCallback } from "react";
import { login as apiLogin } from "../api/client";

export function useAuth() {
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
