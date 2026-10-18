import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { HistoryItem } from "../api/types";
import { useAuth } from "../auth/AuthContext";
import { DEFAULT_PLANT, isValidConfig, PlantConfig, stageFor } from "./catalog";

type StoredState = {
  config: PlantConfig;
  // Ids of the different artworks the user has recognized. Never shrinks.
  found: number[];
  // Highest stage the user has already been told about.
  seenStage: number;
};

type PlantContextValue = {
  config: PlantConfig;
  count: number;
  stage: number;
  // True when the plant reached a stage the user has not seen yet.
  grew: boolean;
  ready: boolean;
  setConfig: (patch: Partial<PlantConfig>) => void;
  dismissGrowth: () => void;
  // Adds artworks from the recognition history to the plant.
  refresh: () => Promise<void>;
};

const PlantContext = createContext<PlantContextValue | null>(null);

const INITIAL: StoredState = { config: DEFAULT_PLANT, found: [], seenStage: 0 };

// SecureStore keys may only contain letters, digits, ".", "-" and "_".
function storageKey(email: string): string {
  return `plant.${email.replace(/[^A-Za-z0-9._-]/g, "_")}`;
}

function parseStored(raw: string | null): StoredState {
  if (!raw) {
    return INITIAL;
  }
  try {
    const data = JSON.parse(raw) as Partial<StoredState>;
    return {
      config: isValidConfig(data.config) ? data.config : DEFAULT_PLANT,
      found: Array.isArray(data.found) ? data.found.filter((id) => typeof id === "number") : [],
      seenStage: typeof data.seenStage === "number" ? data.seenStage : 0,
    };
  } catch {
    return INITIAL;
  }
}

export function PlantProvider({ children }: { children: ReactNode }) {
  const { user, token, request } = useAuth();
  const email = user?.email ?? null;

  const [state, setState] = useState<StoredState>(INITIAL);
  const [ready, setReady] = useState(false);
  const stateRef = useRef<StoredState>(INITIAL);
  // Resolves when the saved plant of the current user has been loaded.
  const loadedRef = useRef<Promise<void>>(Promise.resolve());

  const persist = useCallback(
    (next: StoredState) => {
      stateRef.current = next;
      setState(next);
      if (email) {
        SecureStore.setItemAsync(storageKey(email), JSON.stringify(next)).catch(() => {});
      }
    },
    [email]
  );

  // Load the saved plant whenever a different user signs in.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    if (!email) {
      stateRef.current = INITIAL;
      setState(INITIAL);
      loadedRef.current = Promise.resolve();
      return;
    }
    loadedRef.current = SecureStore.getItemAsync(storageKey(email))
      .then((raw) => {
        if (!cancelled) {
          const loaded = parseStored(raw);
          stateRef.current = loaded;
          setState(loaded);
        }
      })
      .catch(() => {})
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  const refresh = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const history = await request<HistoryItem[]>("/history?limit=100&offset=0");
      // Never merge into the default state before the saved one is loaded.
      await loadedRef.current;
      const current = stateRef.current;
      const merged = new Set(current.found);
      for (const item of history) {
        if (item.recognized && item.artwork) {
          merged.add(item.artwork.id);
        }
      }
      if (merged.size !== current.found.length) {
        persist({ ...current, found: Array.from(merged) });
      }
    } catch {
      // The plant keeps its saved state when the server cannot be reached.
    }
  }, [token, request, persist]);

  const setConfig = useCallback(
    (patch: Partial<PlantConfig>) => {
      persist({ ...stateRef.current, config: { ...stateRef.current.config, ...patch } });
    },
    [persist]
  );

  const dismissGrowth = useCallback(() => {
    const current = stateRef.current;
    persist({ ...current, seenStage: stageFor(current.found.length) });
  }, [persist]);

  const value = useMemo<PlantContextValue>(() => {
    const count = state.found.length;
    const stage = stageFor(count);
    return {
      config: state.config,
      count,
      stage,
      grew: ready && stage > state.seenStage,
      ready,
      setConfig,
      dismissGrowth,
      refresh,
    };
  }, [state, ready, setConfig, dismissGrowth, refresh]);

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
}

export function usePlant(): PlantContextValue {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error("usePlant must be used inside PlantProvider");
  }
  return context;
}
