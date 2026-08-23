/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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

const STORAGE_KEY = "atlas-saved-details";

export function SavedDetailsProvider({ children }: { children: ReactNode }) {
  const [savedDetails, setSavedDetails] = useState<SavedDetail[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedDetails(JSON.parse(stored));
      } catch {
        // ignore
      }
    } else {
      // initial mock data
      setSavedDetails([
        {
          id: "sd1",
          name: "Emmanuel Phone",
          type: "phone",
          value: "024 123 4567",
          service: "Airtime / Data",
        },
        {
          id: "sd2",
          name: "ECG Meter",
          type: "meter",
          value: "1234567890",
          service: "Electricity",
        },
        {
          id: "sd3",
          name: "DSTV Decoder",
          type: "smartcard",
          value: "1234567890",
          service: "Cable TV",
        },
      ]);
    }
  }, []);

  const persist = (details: SavedDetail[]) => {
    setSavedDetails(details);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
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