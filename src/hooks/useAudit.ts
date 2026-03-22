"use client";

import { useApi } from "./useApi";
import { api } from "@/lib/api";
import type { AuditEntry } from "@/lib/types";

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: 1042,
    timestamp: "2026-03-22T11:02:33Z",
    project: "inference-engine",
    decision_type: "task_assigned",
    summary: "Assigned INF-048 to architect based on expertise match (system-design, rust)",
    agent: "architect",
    task_id: "INF-048",
  },
  {
    id: 1041,
    timestamp: "2026-03-22T10:58:12Z",
    project: "auth-service",
    decision_type: "task_assigned",
    summary: "Assigned AUTH-032 to security — critical priority, domain expert",
    agent: "security",
    task_id: "AUTH-032",
  },
  {
    id: 1040,
    timestamp: "2026-03-22T10:45:00Z",
    project: "monitoring-stack",
    decision_type: "task_started",
    summary: "ops began work on MON-016 (Configure Prometheus alerting rules)",
    agent: "ops",
    task_id: "MON-016",
  },
  {
    id: 1039,
    timestamp: "2026-03-22T10:30:00Z",
    project: "inference-engine",
    decision_type: "preflight_pass",
    summary: "Preflight check passed for INF-048 — all dependencies met, estimated cost $0.15",
    task_id: "INF-048",
  },
  {
    id: 1038,
    timestamp: "2026-03-22T10:15:00Z",
    project: "data-platform",
    decision_type: "mission_decomposed",
    summary: "Decomposed M-DAT-007 into 4 tasks with critical path: DAT-024 → DAT-025",
    metadata: { task_count: 4, critical_path_length: 2 },
  },
  {
    id: 1037,
    timestamp: "2026-03-22T09:30:00Z",
    project: "auth-service",
    decision_type: "expertise_update",
    summary: "Updated security expertise score: security domain 0.92 (+0.03)",
    agent: "security",
    metadata: { domain: "security", score: 0.92 },
  },
  {
    id: 1036,
    timestamp: "2026-03-22T09:00:00Z",
    project: "data-platform",
    decision_type: "task_started",
    summary: "data-eng resumed work on DAT-024 (Optimize Parquet writer throughput)",
    agent: "data-eng",
    task_id: "DAT-024",
  },
  {
    id: 1035,
    timestamp: "2026-03-22T08:30:00Z",
    project: "inference-engine",
    decision_type: "mission_created",
    summary: "Created mission M-INF-003: Batch Inference Pipeline (5 tasks)",
    metadata: { mission_id: "M-INF-003", task_count: 5 },
  },
  {
    id: 1034,
    timestamp: "2026-03-22T08:00:00Z",
    project: "monitoring-stack",
    decision_type: "task_completed",
    summary: "ops completed MON-015 (Deploy Grafana dashboards) — cost $0.02",
    agent: "ops",
    task_id: "MON-015",
  },
  {
    id: 1033,
    timestamp: "2026-03-21T17:30:00Z",
    project: "inference-engine",
    decision_type: "task_completed",
    summary: "architect completed INF-045 (Fix memory leak in model cache) — cost $0.21",
    agent: "architect",
    task_id: "INF-045",
  },
  {
    id: 1032,
    timestamp: "2026-03-21T15:00:00Z",
    project: "data-platform",
    decision_type: "task_completed",
    summary: "data-eng completed DAT-022 (Add CDC connector for PostgreSQL) — cost $0.14",
    agent: "data-eng",
    task_id: "DAT-022",
  },
  {
    id: 1031,
    timestamp: "2026-03-21T14:00:00Z",
    project: "auth-service",
    decision_type: "failure_analyzed",
    summary: "Classified AUTH-029 failure as 'context_overflow' — recommending task split",
    task_id: "AUTH-029",
    metadata: { failure_mode: "context_overflow", recommendation: "split" },
  },
  {
    id: 1030,
    timestamp: "2026-03-21T12:00:00Z",
    project: "inference-engine",
    decision_type: "watchdog_triggered",
    summary: "Watchdog: cost threshold exceeded for INF-045 ($0.18 > $0.15 limit)",
    task_id: "INF-045",
    metadata: { rule: "cost_threshold", limit: 0.15, actual: 0.18 },
  },
  {
    id: 1029,
    timestamp: "2026-03-21T10:00:00Z",
    project: "monitoring-stack",
    decision_type: "blackboard_post",
    summary: "ops posted finding: 'Grafana 11 requires explicit CORS config for embedded panels'",
    agent: "ops",
  },
  {
    id: 1028,
    timestamp: "2026-03-21T09:00:00Z",
    project: "data-platform",
    decision_type: "reroute",
    summary: "Rerouted DAT-023 from frontend to data-eng — skill mismatch detected at preflight",
    agent: "data-eng",
    task_id: "DAT-023",
  },
];

export function useAudit(params?: {
  page?: number;
  limit?: number;
  project?: string;
}) {
  const result = useApi<{ entries: AuditEntry[]; total: number }>(
    async () => {
      try {
        return await api.getAudit(params);
      } catch {
        let entries = [...MOCK_AUDIT];
        if (params?.project) {
          entries = entries.filter((e) => e.project === params.project);
        }
        const limit = params?.limit ?? 20;
        const page = params?.page ?? 1;
        const start = (page - 1) * limit;
        return {
          entries: entries.slice(start, start + limit),
          total: entries.length,
        };
      }
    },
    [params?.page, params?.limit, params?.project],
  );

  return result;
}

export { MOCK_AUDIT };
