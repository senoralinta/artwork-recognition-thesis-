import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ApiError, apiRequest, RequestOptions } from "../api/client";
import type { TokenResponse, User } from "../api/types";

const TOKEN_KEY = "access_token";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  // Authenticated request. Logs the user out automatically when the token is rejected.
  request: <T>(path: string, options?: RequestOptions) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore a saved session when the app starts.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!stored) {
          return;
        }
        const me = await apiRequest<User>("/users/me", { token: stored });
        if (!cancelled) {
          setToken(stored);
          setUser(me);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // The backend expects an OAuth2 form where "username" holds the email address.
    const data = await apiRequest<TokenResponse>("/auth/login", {
      method: "POST",
      form: { username: email, password },
    });
    const me = await apiRequest<User>("/users/me", { token: data.access_token });
    await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
    setUser(me);
    setToken(data.access_token);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await apiRequest("/auth/register", {
        method: "POST",
        json: { name, email, password },
      });
      await login(email, password);
    },
    [login]
  );

  const request = useCallback(
    async <T,>(path: string, options: RequestOptions = {}): Promise<T> => {
      try {
        return await apiRequest<T>(path, { ...options, token });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await logout();
        }
        throw error;
      }
    },
    [token, logout]
  );

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, request }),
    [token, user, loading, login, register, logout, request]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
