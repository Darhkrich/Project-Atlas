"use client";

import { createContext, useContext, ReactNode } from "react";

interface Permissions {
  providers: {
    view: boolean;
    create: boolean;
    update: boolean;
    disable: boolean;
    test: boolean;
    routing: boolean;
    credentials: boolean;
    audit: boolean;
  };
}

const defaultPermissions: Permissions = {
  providers: {
    view: true,
    create: true,
    update: true,
    disable: true,
    test: true,
    routing: true,
    credentials: true,
    audit: true,
  },
};

const PermissionContext = createContext<Permissions>(defaultPermissions);

export function PermissionProvider({ children }: { children: ReactNode }) {
  return <PermissionContext.Provider value={defaultPermissions}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  return useContext(PermissionContext);
}