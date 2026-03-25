import { create } from "zustand";

interface ChatState {
  channel: string | null;
  setChannel: (ch: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  channel: localStorage.getItem("sigil_chat_channel") || null,
  setChannel: (ch) => {
    if (ch) localStorage.setItem("sigil_chat_channel", ch);
    else localStorage.removeItem("sigil_chat_channel");
    set({ channel: ch });
  },
}));
