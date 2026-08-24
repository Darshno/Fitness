import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { applyUITheme } from "../services/userService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  useEffect(() => {
    applyUITheme(user?.companion?.color || "lavender");
  }, [user?.companion?.color]);

  const value = useMemo(() => ({
    user,
    refresh() {
      setUser(authService.getCurrentUser());
    },
    async signup(payload) {
      const next = await authService.signup(payload);
      setUser(next);
      return next;
    },
    async login(payload) {
      const next = await authService.login(payload);
      setUser(next);
      return next;
    },
    logout() {
      authService.logout();
      setUser(null);
    },
    setUser,
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
