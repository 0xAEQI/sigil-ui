import { create } from "zustand";

export type LayoutMode = "focus" | "split" | "stack";

interface UIState {
  sidebarCollapsed: boolean;
  layout: LayoutMode;
  layoutPickerOpen: boolean;
  toggleSidebar: () => void;
  setLayout: (mode: LayoutMode) => void;
  toggleLayoutPicker: () => void;
  closeLayoutPicker: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: localStorage.getItem("sigil_sidebar_collapsed") === "true",
  layout: (localStorage.getItem("sigil_layout") as LayoutMode) || "split",
  layoutPickerOpen: false,
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      localStorage.setItem("sigil_sidebar_collapsed", String(next));
      return { sidebarCollapsed: next };
    }),
  setLayout: (mode) => {
    localStorage.setItem("sigil_layout", mode);
    set({ layout: mode, layoutPickerOpen: false });
  },
  toggleLayoutPicker: () => set((s) => ({ layoutPickerOpen: !s.layoutPickerOpen })),
  closeLayoutPicker: () => set({ layoutPickerOpen: false }),
}));
