"use client";

import { createContext, useContext, useCallback, useSyncExternalStore, type ReactNode } from "react";

const STORAGE_KEY = "wanna_selected_branch";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot() {
  return null;
}

type BranchContextValue = {
  branch: string | null;
  setBranch: (branch: string | null) => void;
};

const BranchContext = createContext<BranchContextValue>({ branch: null, setBranch: () => {} });

export function BranchProvider({ children }: { children: ReactNode }) {
  const branch = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setBranch = useCallback((value: string | null) => {
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, value);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignoramos si no se puede persistir; la selección igual vale para esta visita.
    }
    // El evento "storage" del navegador solo se dispara en OTRAS pestañas, así
    // que lo disparamos a mano para que esta misma pestaña vuelva a leer.
    window.dispatchEvent(new Event("storage"));
  }, []);

  return <BranchContext.Provider value={{ branch, setBranch }}>{children}</BranchContext.Provider>;
}

export function useBranch() {
  return useContext(BranchContext);
}
