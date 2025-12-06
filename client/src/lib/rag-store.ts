import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSettingsStore } from "./settings-store";
import { useAuthStore } from "./auth-store";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: any[];
};

interface RagState {
  chatMessages: ChatMessage[];

  addChatMessage: (msg: ChatMessage) => void;
  clearChatMessages: () => void;

  search: (query: string) => Promise<{ answer: string; sources: any[] }>;
}

export const useRagStore = create<RagState>()(
  persist(
    (set, get) => ({
      chatMessages: [],

      addChatMessage: (msg) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, msg],
        })),

      clearChatMessages: () => set({ chatMessages: [] }),

      search: async (query: string) => {
        const settings = useSettingsStore.getState();
        const { user } = useAuthStore.getState();

        if (!user?.id) {
          return {
            answer:
              "You need to be logged in before I can search your documents.",
            sources: [],
          };
        }

        const topK = settings.topK ?? 5;

        const resp = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            userId: user.id,
            topK,
          }),
        });

        if (!resp.ok) {
          return {
            answer:
              "Sorry, I ran into an error while searching your documents.",
            sources: [],
          };
        }

        const data = await resp.json();
        return {
          answer: data.answer,
          sources: data.sources ?? [],
        };
      },
    }),
    {
      name: "rag-storage",
      partialize: (state) => ({ chatMessages: state.chatMessages }),
    }
  )
);
