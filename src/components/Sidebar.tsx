"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDaemonStatus } from "@/hooks/useDaemon";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="11" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="11" width="6" height="6" rx="1" />
        <rect x="11" y="11" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/projects",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 5l6-3 6 3v8l-6 3-6-3V5z" />
        <path d="M2 5l6 3 6-3" />
        <path d="M8 8v8" />
      </svg>
    ),
  },
  {
    label: "Agents",
    href: "/agents",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="2" width="12" height="10" rx="2" />
        <circle cx="7" cy="7" r="1.5" />
        <circle cx="11" cy="7" r="1.5" />
        <path d="M5 15h8" />
        <path d="M9 12v3" />
      </svg>
    ),
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 4h12M3 9h12M3 14h8" />
        <path d="M14 13l1.5 1.5L18 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Missions",
    href: "/missions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="7" />
        <circle cx="9" cy="9" r="4" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Audit",
    href: "/audit",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 2h7l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
        <path d="M11 2v4h4" />
        <path d="M6 9h6M6 12h4" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="2.5" />
        <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: daemon } = useDaemonStatus();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/" className="sidebar-logo">
          <span className="logo-text">Entity</span>
          <span className="logo-subtitle">AI Orchestration</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href) ? "nav-item-active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="daemon-status">
          <span
            className="daemon-dot"
            style={{
              backgroundColor: daemon?.running
                ? "var(--success)"
                : "var(--error)",
            }}
          />
          <span className="daemon-label">
            {daemon?.running ? "Daemon running" : "Daemon offline"}
          </span>
        </div>
      </div>
    </aside>
  );
}
