import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: localStorage.getItem("sigil_sidebar_collapsed") === "true",
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      localStorage.setItem("sigil_sidebar_collapsed", String(next));
      return { sidebarCollapsed: next };
    }),
}));
