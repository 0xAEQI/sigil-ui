import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDaemonStore } from "@/store/daemon";
import { api } from "@/lib/api";

interface TreeNode {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  count?: number;
  expanded?: boolean;
}

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(node.expanded ?? false);
  const hasChildren = node.children && node.children.length > 0;
  const isActive = node.href ? (node.href === "/" ? pathname === "/" : pathname.startsWith(node.href)) : false;

  const content = (
    <div
      className={`tree-item ${isActive ? "tree-item-active" : ""}`}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
      onClick={() => hasChildren && setExpanded(!expanded)}
    >
      {hasChildren ? (
        <span className="tree-chevron">{expanded ? "▾" : "▸"}</span>
      ) : (
        <span className="tree-spacer" />
      )}
      {node.icon && <span className="tree-icon">{node.icon}</span>}
      <span className="tree-label">{node.label}</span>
      {node.count != null && node.count > 0 && (
        <span className="tree-count">{node.count}</span>
      )}
    </div>
  );

  return (
    <>
      {node.href ? <Link to={node.href} className="tree-link">{content}</Link> : content}
      {expanded && hasChildren && (
        <div className="tree-children">
          {node.children!.map((child, i) => (
            <TreeItem key={child.label + i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  );
}

export default function Sidebar() {
  const status = useDaemonStore((s) => s.status);
  const fetchStatus = useDaemonStore((s) => s.fetchStatus);
  const [projects, setProjects] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [cronCount, setCronCount] = useState(0);
  const [watchdogCount, setWatchdogCount] = useState(0);

  useEffect(() => {
    fetchStatus();
    api.getProjects().then((d) => setProjects(d.projects || [])).catch(() => {});
    api.getAgents().then((d) => setAgents(d.agents || [])).catch(() => {});
    api.getCrons().then((d) => setCronCount((d.jobs || []).length)).catch(() => {});
    api.getWatchdogs().then((d) => setWatchdogCount((d.rules || []).length)).catch(() => {});
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const daemonRunning = status?.ok === true;

  const tree: TreeNode[] = [
    {
      label: "Dashboard",
      href: "/",
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>,
    },
    {
      label: "Chat",
      href: "/chat",
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3 3V3a1 1 0 011-1z"/></svg>,
    },
    {
      label: "Projects",
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l5-2 5 2v6l-5 2-5-2V4z"/><path d="M2 4l5 2 5-2"/><path d="M7 6v6"/></svg>,
      expanded: true,
      children: projects.map((p) => ({
        label: p.name,
        href: `/projects/${p.name}`,
        count: p.open_tasks,
        children: (p.departments || []).map((d: any) => ({
          label: d.name,
          href: `/projects/${p.name}`,
        })),
      })),
    },
    {
      label: "Agents",
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="1" width="10" height="8" rx="2"/><circle cx="5" cy="5" r="1"/><circle cx="9" cy="5" r="1"/><path d="M4 12h6"/><path d="M7 9v3"/></svg>,
      expanded: true,
      children: agents.map((a) => ({
        label: a.name,
        href: `/agents/${a.name}`,
        icon: <span className="tree-agent-dot" style={{ background: a.role === "orchestrator" ? "var(--accent)" : "var(--text-muted)" }} />,
      })),
    },
    {
      label: "Tasks",
      href: "/tasks",
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h10M2 7h10M2 11h6"/></svg>,
    },
    {
      label: "Missions",
      href: "/missions",
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><circle cx="7" cy="7" r="3"/><circle cx="7" cy="7" r="0.5" fill="currentColor"/></svg>,
    },
    {
      label: "Knowledge",
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2h4l1 1h5v9H2V2z"/></svg>,
      children: [
        { label: "Browse", href: "/knowledge", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="5"/><path d="M6 3v3"/><circle cx="6" cy="8" r="0.5" fill="currentColor"/></svg> },
        { label: "Skills", href: "/skills", icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5 4.5 4z"/></svg> },
      ],
    },
    {
      label: "Operations",
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3l2 1"/></svg>,
      children: [
        { label: "Cron Jobs", href: "/operations", count: cronCount },
        { label: "Watchdogs", href: "/operations", count: watchdogCount },
      ],
    },
    {
      label: "Cost",
      href: "/cost",
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v6M5 6h4M5 8h4"/></svg>,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="2"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.8 2.8l1.4 1.4M9.8 9.8l1.4 1.4M2.8 11.2l1.4-1.4M9.8 4.2l1.4-1.4"/></svg>,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <span className="logo-text">Sigil</span>
          <span className="logo-subtitle">Agent Orchestration</span>
        </Link>
      </div>

      <nav className="sidebar-tree">
        {tree.map((node, i) => (
          <TreeItem key={node.label + i} node={node} />
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="daemon-status">
          <span
            className="daemon-dot"
            style={{ backgroundColor: daemonRunning ? "var(--success)" : "var(--error)" }}
          />
          <span className="daemon-label">
            {daemonRunning ? "Daemon running" : "Daemon offline"}
          </span>
        </div>
      </div>
    </aside>
  );
}
