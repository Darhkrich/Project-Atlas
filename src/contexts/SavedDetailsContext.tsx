/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";

export type SavedDetailType = "phone" | "meter" | "smartcard" | "bank";

export type SavedDetail = {
  id: string;
  name: string;
  type: SavedDetailType;
  value: string;
  service: string;
};

type SavedDetailsContextType = {
  savedDetails: SavedDetail[];
  addSavedDetail: (detail: Omit<SavedDetail, "id">) => void;
  deleteSavedDetail: (id: string) => void;
  getDetailsByType: (type: SavedDetailType) => SavedDetail[];
};

const SavedDetailsContext = createContext<SavedDetailsContextType>({
  savedDetails: [],
  addSavedDetail: () => {},
  deleteSavedDetail: () => {},
  getDetailsByType: () => [],
});

export function useSavedDetails() {
  return useContext(SavedDetailsContext);
}

const STORAGE_KEY = "atlas-saved-details"; // scoped per user

export function SavedDetailsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allDetails, setAllDetails] = useState<Record<string, SavedDetail[]>>({});
  const [loaded, setLoaded] = useState(false);

  // Load all details from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAllDetails(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    setLoaded(true);
  }, []);

  // Persist whenever allDetails changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDetails));
    }
  }, [allDetails, loaded]);

  const userKey = user?.email || "guest";

  const savedDetails = allDetails[userKey] || [];

  const persist = (details: SavedDetail[]) => {
    setAllDetails((prev) => ({
      ...prev,
      [userKey]: details,
    }));
  };

  const addSavedDetail = (detail: Omit<SavedDetail, "id">) => {
    const newDetail: SavedDetail = {
      ...detail,
      id: `sd-${Date.now()}`,
    };
    persist([newDetail, ...savedDetails]);
  };

  const deleteSavedDetail = (id: string) => {
    persist(savedDetails.filter((d) => d.id !== id));
  };

  const getDetailsByType = (type: SavedDetailType) =>
    savedDetails.filter((d) => d.type === type);

  return (
    <SavedDetailsContext.Provider
      value={{
        savedDetails,
        addSavedDetail,
        deleteSavedDetail,
        getDetailsByType,
      }}
    >
      {children}
    </SavedDetailsContext.Provider>
  );
}