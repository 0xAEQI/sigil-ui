import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";
import CommandPalette from "./CommandPalette";
import ContextPanel from "./ContextPanel";
import { useUIStore } from "@/store/ui";
import { useChatStore } from "@/store/chat";

function Breadcrumbs() {
  const { pathname } = useLocation();
  if (pathname === "/login") return null;

  // Chat home
  if (pathname === "/") {
    return <ChatBreadcrumb />;
  }

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = segments[i];
    crumbs.push({ label, href });
  }

  return (
    <div className="breadcrumbs">
      <Link to="/" className="breadcrumb-item">chat</Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="breadcrumb-segment">
          <span className="breadcrumb-sep">/</span>
          {i === crumbs.length - 1 ? (
            <span className="breadcrumb-current">{crumb.label}</span>
          ) : (
            <Link to={crumb.href} className="breadcrumb-item">{crumb.label}</Link>
          )}
        </span>
      ))}
    </div>
  );
}

function ChatBreadcrumb() {
  const channel = useChatStore((s) => s.channel);
  return (
    <div className="breadcrumbs">
      <span className={channel ? "breadcrumb-item" : "breadcrumb-current"} style={{ cursor: "default" }}>chat</span>
      {channel && (
        <span className="breadcrumb-segment">
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{channel.includes("/") ? channel.split("/").pop() : channel}</span>
        </span>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname } = useLocation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const isChatHome = pathname === "/";

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        useUIStore.getState().toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="app-shell">
      <StatusBar onCommandPalette={openPalette} />
      <div className={`app-layout ${collapsed ? "app-layout-collapsed" : ""}`}>
        <Sidebar />
        <div className="main-wrapper">
          <Breadcrumbs />
          <main className={`main-content ${isChatHome ? "main-content-chat" : ""}`}>
            {children}
          </main>
        </div>
        {isChatHome && <ContextPanel />}
      </div>
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  );
}
