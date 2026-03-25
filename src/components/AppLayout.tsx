import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";
import CommandPalette from "./CommandPalette";
import ContextPanel from "./ContextPanel";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname } = useLocation();
  const isChatHome = pathname === "/";

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="app-shell">
      <StatusBar onCommandPalette={openPalette} />
      <div className="app-layout">
        <Sidebar />
        <main className={`main-content ${isChatHome ? "main-content-chat" : ""}`}>
          {children}
        </main>
        {isChatHome && <ContextPanel />}
      </div>
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  );
}
