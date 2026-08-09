import { useCallback, useEffect, useState } from "react";
import api from "@/services/api";
import { disconnectSocket } from "@/services/socket";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  isVerified?: boolean;
}

/**
 * JWT-based auth hook replacing the old Supabase auth hook.
 *
 * Returns the same shape the rest of the app expects:
 *   { user, loading, ready, login, signup, logout }
 *
 * Reads token + user from localStorage on mount.
 * Listens for cross-tab storage events to stay in sync.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Read persisted auth state on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  // Cross-tab sync via storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "user") {
        if (!e.newValue) {
          setUser(null);
        } else {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            setUser(null);
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Logout endpoint may fail — still clear local state
    }
    disconnectSocket();
    localStorage.removeItem("user");
    setUser(null);
    // Trigger AuthBridge in __root.tsx
    window.dispatchEvent(new StorageEvent("storage", { key: "user", newValue: null }));
  }, []);

  return {
    user,
    loading,
    ready: !loading,
    login,
    signup,
    logout,
  };
}
