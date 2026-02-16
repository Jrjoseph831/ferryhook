import { create } from "zustand";
import { api } from "./api";

interface AuthState {
  accessToken: string | null;
  user: { id: string; email: string; name: string; plan: string } | null;
  setAuth: (token: string, user: AuthState["user"]) => void;
  logout: () => void;
  refresh: () => Promise<boolean>;
}

export const useAuth = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,

  setAuth: (accessToken, user) => set({ accessToken, user }),

  logout: () => {
    set({ accessToken: null, user: null });
    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  refresh: async () => {
    try {
      const res = await fetch(`${getApiUrl()}/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = await res.json();
      set({ accessToken: data.data.accessToken });
      return true;
    } catch {
      return false;
    }
  },
}));

function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}
