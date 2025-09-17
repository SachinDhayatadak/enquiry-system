import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import API from "../api/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      API.get("/auth/me")
        .then((res) => setUser(res.data.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.data.token);
    setToken(res.data.data.token);
    setUser(res.data.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    await API.post("/auth/register", { name, email, password });
    await login(email, password); // auto-login after register
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};