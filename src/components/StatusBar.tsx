import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDaemonStore } from "@/store/daemon";
import { useUIStore } from "@/store/ui";
import { api } from "@/lib/api";

export default function StatusBar({ onCommandPalette }: { onCommandPalette: () => void }) {
  const status = useDaemonStore((s) => s.status);
  const fetchStatus = useDaemonStore((s) => s.fetchStatus);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const [cost, setCost] = useState<any>(null);
  const [activeTasks, setActiveTasks] = useState(0);

  useEffect(() => {
    fetchStatus();
    api.getCost().then(setCost).catch(() => {});
    api.getTasks({ status: "in_progress" }).then((d) => setActiveTasks((d.tasks || []).length)).catch(() => {});
    const interval = setInterval(() => {
      fetchStatus();
      api.getCost().then(setCost).catch(() => {});
      api.getTasks({ status: "in_progress" }).then((d) => setActiveTasks((d.tasks || []).length)).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const daemonOk = status?.ok === true;
  const spent = cost?.spent_today_usd ?? 0;
  const budget = cost?.daily_budget_usd ?? 0;

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <button className="status-bar-toggle" onClick={toggleSidebar} title="Toggle sidebar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 3.5h10M2 7h10M2 10.5h10" />
          </svg>
        </button>
        <Link to="/" className="status-bar-brand">Sigil</Link>
        <span className="status-bar-sep" />
        <span className={`status-bar-dot ${daemonOk ? "status-bar-dot-ok" : "status-bar-dot-err"}`} />
        <span className="status-bar-metric">
          <span className="status-bar-metric-value">{activeTasks}</span> active
        </span>
        <span className="status-bar-sep" />
        <span className="status-bar-metric">
          <span className="status-bar-metric-value">${Number(spent).toFixed(2)}</span>
          <span className="status-bar-metric-dim"> / ${Number(budget).toFixed(0)}</span>
        </span>
      </div>
      <button className="status-bar-cmd" onClick={onCommandPalette}>
        <kbd>Cmd+K</kbd>
      </button>
    </div>
  );
}
