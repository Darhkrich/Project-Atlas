/* eslint-disable react-hooks/set-state-in-effect */
// lib/admin/rbac/context.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DevRoleSwitcher } from "@/components/admin/rbac/dev-role-switcher";
import type { Role } from "./roles";
import type { Permission } from "./permissions";

export interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
  role: Role;
  extraPermissions?: Permission[];
}

interface CurrentAdminContextValue {
  admin: CurrentAdmin | null;
  ready: boolean;
  setRole: (role: Role) => void;
  resetRole: () => void;
}

const NO_OP = () => {
  /* no-op outside the provider */
};

const CurrentAdminContext = createContext<CurrentAdminContextValue>({
  admin: null,
  ready: false,
  setRole: NO_OP,
  resetRole: NO_OP,
});

const DEFAULT_ADMIN: CurrentAdmin = {
  id: "usr-001",
  name: "Yaw Mensah",
  email: "yaw.mensah@atlas.com",
  role: "operations_admin",
  extraPermissions: [],
};

const STORAGE_KEY = "atlas-dev-role";
const IS_DEV = process.env.NODE_ENV === "development";

interface CurrentAdminProviderProps {
  children: ReactNode;
  admin?: CurrentAdmin | null;
  showDevRoleSwitcher?: boolean;
}

export function CurrentAdminProvider({
  children,
  admin = DEFAULT_ADMIN,
  showDevRoleSwitcher = IS_DEV,
}: CurrentAdminProviderProps) {
  const [current, setCurrent] = useState<CurrentAdmin | null>(admin);

  useEffect(() => {
    if (!IS_DEV) return;
    if (!admin) return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      setCurrent({ ...admin, role: stored as Role });
    } catch {
      /* storage unavailable; fall back to prop */
    }
  }, [admin]);

  const setRole = useCallback((role: Role) => {
    setCurrent((prev) => {
      const base = prev ?? admin;
      if (!base) return prev;
      if (IS_DEV) {
        try {
          window.localStorage.setItem(STORAGE_KEY, role);
        } catch {
          /* ignore */
        }
      }
      return { ...base, role };
    });
  }, [admin]);

  const resetRole = useCallback(() => {
    if (IS_DEV) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    setCurrent(admin);
  }, [admin]);

  return (
    <CurrentAdminContext.Provider
      value={{ admin: current, ready: true, setRole, resetRole }}
    >
      {children}
      {showDevRoleSwitcher && IS_DEV && current && (
        <DevRoleSwitcher
          currentRole={current.role}
          onChange={setRole}
          onReset={resetRole}
        />
      )}
    </CurrentAdminContext.Provider>
  );
}

export function useCurrentAdmin(): CurrentAdmin | null {
  return useContext(CurrentAdminContext).admin;
}

export function useCurrentAdminReady(): boolean {
  return useContext(CurrentAdminContext).ready;
}

export function useSetCurrentAdminRole(): (role: Role) => void {
  return useContext(CurrentAdminContext).setRole;
}

export function useResetCurrentAdminRole(): () => void {
  return useContext(CurrentAdminContext).resetRole;
}