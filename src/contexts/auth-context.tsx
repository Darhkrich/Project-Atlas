/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "customer" | "reseller" | "merchant";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  register: (email: string, password: string, initialRole: UserRole) => boolean;
  login: (email: string, password: string) => AuthUser | null;
  logout: () => void;
  addRole: (email: string, role: UserRole) => void;
  hasRole: (email: string, role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "atlas-unified-auth";
const USER_DB_KEY = "atlas-unified-users";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load current session
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const register = (email: string, password: string, initialRole: UserRole): boolean => {
    const users = getUsers();
    if (users.some((u) => u.email === email)) return false;

    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      name: email.split("@")[0] || "User",
      email,
      password,
      roles: [initialRole],
    };
    users.push(newUser);
    localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return true;
  };

  const login = (email: string, password: string): AuthUser | null => {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return found;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const addRole = (email: string, role: UserRole) => {
    const users = getUsers();
    const updated = users.map((u) => {
      if (u.email === email && !u.roles.includes(role)) {
        return { ...u, roles: [...u.roles, role] };
      }
      return u;
    });
    localStorage.setItem(USER_DB_KEY, JSON.stringify(updated));

    // Update current session if it's the same user
    setUser((prev) => {
      if (prev && prev.email === email) {
        const newUser = { ...prev, roles: prev.roles.includes(role) ? prev.roles : [...prev.roles, role] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        return newUser;
      }
      return prev;
    });
  };

  const hasRole = (email: string, role: UserRole): boolean => {
    const users = getUsers();
    const found = users.find((u) => u.email === email);
    return found ? found.roles.includes(role) : false;
  };

  const getUsers = (): AuthUser[] => {
    const stored = localStorage.getItem(USER_DB_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, register, login, logout, addRole, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}