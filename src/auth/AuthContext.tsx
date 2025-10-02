import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = { username: "admin" } | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("odonto_auth");
    if (raw) setUser(JSON.parse(raw));
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const ADMIN_USER = "admin";
    const ADMIN_PASS = "admin123";

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const u: User = { username: "admin" };
      setUser(u);
      localStorage.setItem("odonto_auth", JSON.stringify(u));

      // 👇 redirigir al dashboard
      navigate("/", { replace: true });
      return;
    }
    throw new Error("Credenciales inválidas");
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("odonto_auth");
    navigate("/login", { replace: true });
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
