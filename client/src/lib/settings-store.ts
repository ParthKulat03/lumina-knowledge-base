import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  topK: number;
  setTopK: (k: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      topK: 5,
      setTopK: (k) => set({ topK: k }),
    }),
    { name: "settings-storage" }
  )
);
