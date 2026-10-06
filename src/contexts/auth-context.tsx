/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type UserRole = "customer" | "reseller" | "merchant";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
  phone?: string;
  twoFactor?: boolean;
  updatedAt?: number;
};

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

export interface ChangePasswordInput {
  current: string;
  next: string;
}

export interface AuthMutationResult {
  ok: boolean;
  error?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  register: (
    email: string,
    password: string,
    initialRole: UserRole
  ) => boolean;
  login: (email: string, password: string) => AuthUser | null;
  logout: () => void;
  addRole: (email: string, role: UserRole) => void;
  hasRole: (email: string, role: UserRole) => boolean;
  updateProfile: (input: UpdateProfileInput) => AuthMutationResult;
  changePassword: (input: ChangePasswordInput) => AuthMutationResult;
  setTwoFactor: (enabled: boolean) => AuthMutationResult;
  deleteAccount: () => AuthMutationResult;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "atlas-unified-auth";
const USER_DB_KEY = "atlas-unified-users";

function readUsers(): AuthUser[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(USER_DB_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (u): u is AuthUser =>
        u !== null &&
        typeof u === "object" &&
        typeof (u as Record<string, unknown>).id === "string" &&
        typeof (u as Record<string, unknown>).email === "string"
    );
  } catch {
    return [];
  }
}

function writeUsers(users: AuthUser[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
  } catch {
    // Quota. State stays in memory.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const persistSession = (next: AuthUser | null) => {
    setUser(next);
    if (typeof window === "undefined") return;
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const register = (
    email: string,
    password: string,
    initialRole: UserRole
  ): boolean => {
    const users = readUsers();
    if (users.some((u) => u.email === email)) return false;

    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      name: email.split("@")[0] || "User",
      email,
      password,
      roles: [initialRole],
      twoFactor: false,
      updatedAt: Date.now(),
    };
    users.push(newUser);
    writeUsers(users);
    persistSession(newUser);
    return true;
  };

  const login = (email: string, password: string): AuthUser | null => {
    const users = readUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      persistSession(found);
      return found;
    }
    return null;
  };

  const logout = () => {
    persistSession(null);
  };

  const addRole = (email: string, role: UserRole) => {
    const users = readUsers();
    const updated = users.map((u) => {
      if (u.email === email && !u.roles.includes(role)) {
        return {
          ...u,
          roles: [...u.roles, role],
          updatedAt: Date.now(),
        };
      }
      return u;
    });
    writeUsers(updated);

    setUser((prev) => {
      if (prev && prev.email === email) {
        const newUser: AuthUser = {
          ...prev,
          roles: prev.roles.includes(role)
            ? prev.roles
            : [...prev.roles, role],
          updatedAt: Date.now(),
        };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        }
        return newUser;
      }
      return prev;
    });
  };

  const hasRole = (email: string, role: UserRole): boolean => {
    const users = readUsers();
    const found = users.find((u) => u.email === email);
    return found ? found.roles.includes(role) : false;
  };

  const updateProfile = (input: UpdateProfileInput): AuthMutationResult => {
    if (!user) return { ok: false, error: "Not signed in." };

    const trimmedName = input.name?.trim();
    const trimmedPhone = input.phone?.trim();

    if (trimmedName !== undefined && trimmedName.length === 0) {
      return { ok: false, error: "Name cannot be empty." };
    }

    const updated: AuthUser = {
      ...user,
      name: trimmedName ?? user.name,
      phone: trimmedPhone ?? user.phone,
      updatedAt: Date.now(),
    };

    const users = readUsers();
    const next = users.map((u) => (u.email === user.email ? updated : u));
    writeUsers(next);
    persistSession(updated);
    return { ok: true };
  };

  const changePassword = (
    input: ChangePasswordInput
  ): AuthMutationResult => {
    if (!user) return { ok: false, error: "Not signed in." };

    const current = input.current;
    const next = input.next;

    if (current.length === 0) {
      return { ok: false, error: "Enter your current password." };
    }
    if (next.length < 8) {
      return {
        ok: false,
        error: "New password must be at least 8 characters.",
      };
    }
    if (current === next) {
      return {
        ok: false,
        error: "New password must be different from the current one.",
      };
    }

    const users = readUsers();
    const stored = users.find((u) => u.email === user.email);
    if (!stored) {
      return { ok: false, error: "Account not found." };
    }
    if (stored.password !== current) {
      return { ok: false, error: "Current password is incorrect." };
    }

    const updated: AuthUser = {
      ...stored,
      password: next,
      updatedAt: Date.now(),
    };
    const nextUsers = users.map((u) =>
      u.email === user.email ? updated : u
    );
    writeUsers(nextUsers);
    persistSession(updated);
    return { ok: true };
  };

  const setTwoFactor = (enabled: boolean): AuthMutationResult => {
    if (!user) return { ok: false, error: "Not signed in." };

    const updated: AuthUser = {
      ...user,
      twoFactor: enabled,
      updatedAt: Date.now(),
    };
    const users = readUsers();
    const next = users.map((u) => (u.email === user.email ? updated : u));
    writeUsers(next);
    persistSession(updated);
    return { ok: true };
  };

  const deleteAccount = (): AuthMutationResult => {
    if (!user) return { ok: false, error: "Not signed in." };
    const users = readUsers();
    const filtered = users.filter((u) => u.email !== user.email);
    writeUsers(filtered);
    persistSession(null);
    return { ok: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        addRole,
        hasRole,
        updateProfile,
        changePassword,
        setTwoFactor,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}