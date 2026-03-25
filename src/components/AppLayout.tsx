import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";
import ContextPanel from "./ContextPanel";
import { useUIStore } from "@/store/ui";
import { useChatStore } from "@/store/chat";

function Breadcrumbs() {
  const { pathname } = useLocation();
  if (pathname === "/login") return null;

  if (pathname === "/") {
    return <ChatBreadcrumb />;
  }

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const href = "/" + segments.slice(0, i + 1).join("/");
    crumbs.push({ label: segments[i], href });
  }

  return (
    <div className="topbar">
      <Link to="/" className="breadcrumb-item">sigil</Link>
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
    <div className="topbar">
      <span className={channel ? "breadcrumb-item" : "breadcrumb-current"} style={{ cursor: "default" }}>sigil</span>
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

  const layout = useUIStore((s) => s.layout);
  const showContext = isChatHome && layout !== "focus";
  const isStack = layout === "stack";

  return (
    <div className={`app-shell ${collapsed ? "app-shell-collapsed" : ""}`}>
      <div className="app-layout">
        <Sidebar onCommandPalette={openPalette} />
        <div className={`main-wrapper ${isStack && isChatHome ? "main-wrapper-stack" : ""}`}>
          <Breadcrumbs />
          <div className={`main-panels ${isStack && isChatHome ? "main-panels-stack" : ""}`}>
            <main className={`main-content ${isChatHome ? "main-content-chat" : ""}`}>
              {children}
            </main>
            {showContext && <ContextPanel />}
          </div>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  );
}
