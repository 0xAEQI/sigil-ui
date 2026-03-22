"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useDaemonStatus, MOCK_DAEMON_STATUS } from "@/hooks/useDaemon";

function formatUptime(secs: number): string {
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}

export default function SettingsPage() {
  const { data: daemon } = useDaemonStatus();
  const status = daemon || MOCK_DAEMON_STATUS;

  const [apiUrl, setApiUrl] = useState("http://localhost:8420");
  const [wsUrl, setWsUrl] = useState("ws://localhost:8420/api/ws");

  return (
    <>
      <Header
        title="Settings"
        breadcrumbs={[{ label: "Settings" }]}
      />

      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Daemon Connection</h2>
          <p className="settings-section-desc">
            Configure the connection to your Sigil daemon instance.
          </p>
        </div>
        <div className="settings-section-body">
          <div className="settings-field">
            <label className="settings-label">API Base URL</label>
            <input
              type="text"
              className="settings-input"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <p className="settings-help">
              The HTTP endpoint for the Sigil daemon REST API.
            </p>
          </div>
          <div className="settings-field">
            <label className="settings-label">WebSocket URL</label>
            <input
              type="text"
              className="settings-input"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
            />
            <p className="settings-help">
              WebSocket endpoint for live updates from the daemon.
            </p>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Daemon Status</h2>
          <p className="settings-section-desc">
            Current status of the connected Sigil daemon.
          </p>
        </div>
        <div className="settings-section-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            <div className="detail-field">
              <span className="detail-field-label">Status</span>
              <span
                className="detail-field-value"
                style={{
                  color: status.running ? "var(--success)" : "var(--error)",
                  fontWeight: 600,
                }}
              >
                {status.running ? "Running" : "Offline"}
              </span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Uptime</span>
              <span className="detail-field-value detail-field-mono">
                {formatUptime(status.uptime_secs)}
              </span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Projects</span>
              <span className="detail-field-value detail-field-mono">
                {status.projects}
              </span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Active Workers</span>
              <span className="detail-field-value detail-field-mono">
                {status.active_workers}
              </span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Total Cost</span>
              <span className="detail-field-value detail-field-mono">
                ${status.total_cost_usd.toFixed(2)}
              </span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">Cron Jobs</span>
              <span className="detail-field-value detail-field-mono">
                {status.cron_jobs}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">API Keys</h2>
          <p className="settings-section-desc">
            Manage API keys for external integrations.
          </p>
        </div>
        <div className="settings-section-body">
          <div className="settings-field">
            <label className="settings-label">API Key</label>
            <input
              type="password"
              className="settings-input"
              value="sk-ent-xxxxxxxxxxxxxxxxxxxx"
              readOnly
            />
            <p className="settings-help">
              Use this key to authenticate API requests to Entity.
            </p>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn" type="button">
              Regenerate Key
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Team Management</h2>
          <p className="settings-section-desc">
            Manage users who have access to this Entity instance.
          </p>
        </div>
        <div className="settings-section-body">
          <div className="table-container" style={{ border: "none" }}>
            <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>
                  Admin
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  admin@entity.business
                </div>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", padding: "2px 8px", background: "var(--bg-tertiary)", borderRadius: "100px", border: "1px solid var(--border)" }}>
                Owner
              </span>
            </div>
            <div style={{ padding: "12px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>
                  Developer
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  dev@entity.business
                </div>
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", padding: "2px 8px", background: "var(--bg-tertiary)", borderRadius: "100px", border: "1px solid var(--border)" }}>
                Member
              </span>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn" type="button">
              Invite Member
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
