import { useState, useCallback, useContext, createContext } from "react";

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

  const login = useCallback(async (clinicCode: string, _pin: string) => {
    setLoading(true);
    setError(null);
    try {
      // Mock authentication - accept any clinic code/pin for now
      const mockToken = `token_${clinicCode}_${Date.now()}`;
      localStorage.setItem("fullfill_token", mockToken);
      setToken(mockToken);
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
