/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (user?: User, rememberMe?: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const LOCAL_STORAGE_KEY = "atlas-user";
const SESSION_STORAGE_KEY = "atlas-session-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check both storages: local first, then session
    const localUser = localStorage.getItem(LOCAL_STORAGE_KEY);
    const sessionUser = sessionStorage.getItem(SESSION_STORAGE_KEY);

    const stored = localUser || sessionUser;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch {
        // Ignore invalid data
      }
    }
    setLoading(false);
  }, []);

  const login = (newUser?: User, rememberMe = true) => {
    const userObj = newUser || {
      name: "Emmanuel",
      email: "emmanuel@example.com",
    };

    setUser(userObj);
    setIsAuthenticated(true);

    const json = JSON.stringify(userObj);

    if (rememberMe) {
      localStorage.setItem(LOCAL_STORAGE_KEY, json);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, json);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}