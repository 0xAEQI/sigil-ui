import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDaemonStore } from "@/store/daemon";
import { useChatStore } from "@/store/chat";
import { api } from "@/lib/api";

export default function Sidebar() {
  const { pathname } = useLocation();
  const status = useDaemonStore((s) => s.status);
  const fetchStatus = useDaemonStore((s) => s.fetchStatus);
  const channel = useChatStore((s) => s.channel);
  const setChannel = useChatStore((s) => s.setChannel);
  const [projects, setProjects] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    fetchStatus();
    api.getProjects().then((d) => setProjects(d.projects || [])).catch(() => {});
    api.getAgents().then((d) => setAgents(d.agents || [])).catch(() => {});
    const interval = setInterval(() => {
      fetchStatus();
      api.getProjects().then((d) => setProjects(d.projects || [])).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const daemonRunning = status?.ok === true;
  const isChatHome = pathname === "/";

  const switchChannel = (ch: string | null) => {
    setChannel(ch);
  };

  // Channel agents for display
  const getChannelAgentCount = (ch: string | null): number => {
    if (!ch) return agents.length;
    const parts = ch.split("/");
    const proj = projects.find((p: any) => p.name === parts[0]);
    if (parts[1] && proj) {
      const dept = (proj.departments || []).find((d: any) => d.name === parts[1]);
      return dept ? (dept.agents?.length || 0) + (dept.lead ? 1 : 0) : 0;
    }
    return proj?.team ? 1 + (proj.team.agents?.length || 0) : 0;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <span className="logo-text">Sigil</span>
        </Link>
      </div>

      {/* Channels section */}
      <div className="sidebar-channels">
        <div className="sidebar-section-label">Channels</div>

        <div
          className={`channel-item ${isChatHome && channel === null ? "channel-item-active" : ""}`}
          onClick={() => { switchChannel(null); }}
        >
          <Link to="/" className="channel-link">
            <span className="channel-icon">S</span>
            <span className="channel-name">Sigil</span>
            <span className="channel-agents">{getChannelAgentCount(null)}</span>
          </Link>
        </div>

        {projects.map((p: any) => (
          <div key={p.name}>
            <div
              className={`channel-item ${isChatHome && channel === p.name ? "channel-item-active" : ""}`}
              onClick={() => switchChannel(p.name)}
            >
              <Link to="/" className="channel-link">
                <span className="channel-dot" />
                <span className="channel-name">{p.name}</span>
                {(p.open_tasks || 0) > 0 && (
                  <span className="channel-count">{p.open_tasks}</span>
                )}
              </Link>
            </div>
            {(p.departments || []).map((d: any) => (
              <div
                key={`${p.name}/${d.name}`}
                className={`channel-item channel-item-dept ${isChatHome && channel === `${p.name}/${d.name}` ? "channel-item-active" : ""}`}
                onClick={() => switchChannel(`${p.name}/${d.name}`)}
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
        {[
          { href: "/dashboard", label: "Dashboard", icon: "grid" },
          { href: "/projects", label: "Projects", icon: "box" },
          { href: "/agents", label: "Agents", icon: "bot" },
          { href: "/tasks", label: "Tasks", icon: "list" },
          { href: "/missions", label: "Missions", icon: "target" },
          { href: "/knowledge", label: "Knowledge", icon: "book" },
          { href: "/operations", label: "Operations", icon: "clock" },
          { href: "/cost", label: "Cost", icon: "dollar" },
          { href: "/settings", label: "Settings", icon: "gear" },
        ].map((item) => (
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

      <div className="sidebar-footer">
        <div className="daemon-status">
          <span
            className="daemon-dot"
            style={{ backgroundColor: daemonRunning ? "var(--success)" : "var(--error)" }}
          />
          <span className="daemon-label">
            {daemonRunning ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </aside>
  );
}

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
