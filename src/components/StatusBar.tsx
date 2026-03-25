import { useEffect, useState } from "react";
import { useDaemonStore } from "@/store/daemon";
import { api } from "@/lib/api";

export default function StatusBar({ onCommandPalette }: { onCommandPalette: () => void }) {
  const status = useDaemonStore((s) => s.status);
  const fetchStatus = useDaemonStore((s) => s.fetchStatus);
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
        <span className={`status-bar-dot ${daemonOk ? "status-bar-dot-ok" : "status-bar-dot-err"}`} />
        <span className="status-bar-label">
          {daemonOk ? "Online" : "Offline"}
        </span>
        <span className="status-bar-sep" />
        <span className="status-bar-metric">
          <span className="status-bar-metric-value">{activeTasks}</span> active
        </span>
        <span className="status-bar-sep" />
        <span className="status-bar-metric">
          <span className="status-bar-metric-value">${Number(spent).toFixed(2)}</span>
          <span className="status-bar-metric-dim"> / ${Number(budget).toFixed(0)}</span>
        </span>
        {status?.max_workers > 0 && (
          <>
            <span className="status-bar-sep" />
            <span className="status-bar-metric">
              <span className="status-bar-metric-value">{status.max_workers}</span> workers
            </span>
          </>
        )}
      </div>
      <button className="status-bar-cmd" onClick={onCommandPalette}>
        <kbd>Cmd+K</kbd>
      </button>
    </div>
  );
}
