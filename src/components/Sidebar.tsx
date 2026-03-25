import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chat";
import { useUIStore } from "@/store/ui";
import { api } from "@/lib/api";

export default function Sidebar() {
  const { pathname } = useLocation();
  const channel = useChatStore((s) => s.channel);
  const setChannel = useChatStore((s) => s.setChannel);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    api.getProjects().then((d) => setProjects(d.projects || [])).catch(() => {});
    const interval = setInterval(() => {
      api.getProjects().then((d) => setProjects(d.projects || [])).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const isChatHome = pathname === "/";

  if (collapsed) {
    return (
      <aside className="sidebar sidebar-collapsed">
        <nav className="sidebar-collapsed-nav">
          <Link to="/" className={`sidebar-collapsed-item ${isChatHome ? "sidebar-collapsed-item-active" : ""}`} title="Chat">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3 3V3a1 1 0 011-1z"/></svg>
          </Link>
          <Link to="/dashboard" className={`sidebar-collapsed-item ${pathname === "/dashboard" ? "sidebar-collapsed-item-active" : ""}`} title="Dashboard">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>
          </Link>
          <Link to="/tasks" className={`sidebar-collapsed-item ${pathname.startsWith("/tasks") ? "sidebar-collapsed-item-active" : ""}`} title="Tasks">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h10M2 7h10M2 11h6"/></svg>
          </Link>
          <Link to="/projects" className={`sidebar-collapsed-item ${pathname.startsWith("/projects") ? "sidebar-collapsed-item-active" : ""}`} title="Projects">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l5-2 5 2v6l-5 2-5-2V4z"/><path d="M2 4l5 2 5-2"/><path d="M7 6v6"/></svg>
          </Link>
          <Link to="/agents" className={`sidebar-collapsed-item ${pathname.startsWith("/agents") ? "sidebar-collapsed-item-active" : ""}`} title="Agents">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1" width="10" height="8" rx="2"/><circle cx="5" cy="5" r="1"/><circle cx="9" cy="5" r="1"/><path d="M4 12h6"/><path d="M7 9v3"/></svg>
          </Link>
          <Link to="/knowledge" className={`sidebar-collapsed-item ${pathname.startsWith("/knowledge") ? "sidebar-collapsed-item-active" : ""}`} title="Knowledge">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2h4l1 1h5v9H2V2z"/></svg>
          </Link>
          <Link to="/settings" className={`sidebar-collapsed-item ${pathname === "/settings" ? "sidebar-collapsed-item-active" : ""}`} title="Settings">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="2"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.8 2.8l1.4 1.4M9.8 9.8l1.4 1.4M2.8 11.2l1.4-1.4M9.8 4.2l1.4-1.4"/></svg>
          </Link>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      {/* Channels */}
      <div className="sidebar-channels">
        <div className="sidebar-section-label">Channels</div>
        <div
          className={`channel-item ${isChatHome && channel === null ? "channel-item-active" : ""}`}
          onClick={() => setChannel(null)}
        >
          <Link to="/" className="channel-link">
            <span className="channel-icon">S</span>
            <span className="channel-name">Sigil</span>
          </Link>
        </div>
        {projects.map((p: any) => (
          <div key={p.name}>
            <div
              className={`channel-item ${isChatHome && channel === p.name ? "channel-item-active" : ""}`}
              onClick={() => setChannel(p.name)}
            >
              <Link to="/" className="channel-link">
                <span className="channel-dot" />
                <span className="channel-name">{p.name}</span>
                {(p.open_tasks || 0) > 0 && <span className="channel-count">{p.open_tasks}</span>}
              </Link>
            </div>
            {(p.departments || []).map((d: any) => (
              <div
                key={`${p.name}/${d.name}`}
                className={`channel-item channel-item-dept ${isChatHome && channel === `${p.name}/${d.name}` ? "channel-item-active" : ""}`}
                onClick={() => setChannel(`${p.name}/${d.name}`)}
              >
                <Link to="/" className="channel-link">
                  <span className="channel-name">{d.name}</span>
                </Link>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="sidebar-section-label">Navigate</div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`nav-item ${pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? "nav-item-active" : ""}`}
          >
            <NavIcon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/projects", label: "Projects", icon: "box" },
  { href: "/agents", label: "Agents", icon: "bot" },
  { href: "/tasks", label: "Tasks", icon: "list" },
  { href: "/missions", label: "Missions", icon: "target" },
  { href: "/knowledge", label: "Knowledge", icon: "book" },
  { href: "/operations", label: "Operations", icon: "clock" },
  { href: "/cost", label: "Cost", icon: "dollar" },
  { href: "/settings", label: "Settings", icon: "gear" },
];

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    grid: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>,
    box: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l5-2 5 2v6l-5 2-5-2V4z"/><path d="M2 4l5 2 5-2"/><path d="M7 6v6"/></svg>,
    bot: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1" width="10" height="8" rx="2"/><circle cx="5" cy="5" r="1"/><circle cx="9" cy="5" r="1"/><path d="M4 12h6"/><path d="M7 9v3"/></svg>,
    list: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h10M2 7h10M2 11h6"/></svg>,
    target: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><circle cx="7" cy="7" r="3"/><circle cx="7" cy="7" r="0.5" fill="currentColor"/></svg>,
    book: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2h4l1 1h5v9H2V2z"/></svg>,
    clock: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3l2 1"/></svg>,
    dollar: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v6M5 6h4M5 8h4"/></svg>,
    gear: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="2"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.8 2.8l1.4 1.4M9.8 9.8l1.4 1.4M2.8 11.2l1.4-1.4M9.8 4.2l1.4-1.4"/></svg>,
  };
  return <span className="nav-icon">{icons[name]}</span>;
}
