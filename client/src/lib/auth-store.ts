import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabaseClient";

export type AuthUser = {
  id: string;
  email: string | null;
};

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;

  setUser: (user: AuthUser | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      setUser: (user) => set({ user }),

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        const { data: { user } } = await supabase.auth.getUser();

        if (error || !data.user) {
          set({ loading: false, error: error?.message ?? "Login failed" });
          throw error ?? new Error("Login failed");
        }

        set({
            loading: false,
            user: user ? { id: user.id, email: user.email ?? "" } : null,
            error: null,
        });

      },

      signUp: async (email, password) => {
        set({ loading: true, error: null });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        const { data: { user } } = await supabase.auth.getUser();

        if (error || !data.user) {
          set({ loading: false, error: error?.message ?? "Signup failed" });
          throw error ?? new Error("Signup failed");
        }

        set({
            loading: false,
            user: user ? { id: user.id, email: user.email ?? "" } : null,
            error: null,
        });

        await supabase.from("profiles").upsert({
          id: data.user.id,
          email,
        });
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },

      refreshSession: async () => {
        const { data } = await supabase.auth.getUser();
        const user = data.user;

        if (user) {
            set({
            user: { id: user.id, email: user.email ?? "" },
            });
        } else {
            set({ user: null });
        }
    },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
