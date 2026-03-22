"use client";

import { useApi } from "./useApi";
import { api } from "@/lib/api";
import type { Task } from "@/lib/types";

const MOCK_TASKS: Task[] = [
  {
    id: "INF-048",
    subject: "Implement batch inference endpoint",
    description: "Add support for batched model inference with configurable batch sizes and timeout handling.",
    status: "in_progress",
    priority: "high",
    assignee: "architect",
    skill: "rust",
    mission_id: "M-INF-003",
    project: "inference-engine",
    labels: ["api", "performance"],
    cost_usd: 0.12,
    created_at: "2026-03-22T08:15:00Z",
    updated_at: "2026-03-22T10:30:00Z",
  },
  {
    id: "INF-049",
    subject: "Add request validation middleware",
    description: "Create middleware layer for validating inference request payloads against model schemas.",
    status: "pending",
    priority: "normal",
    skill: "rust",
    mission_id: "M-INF-003",
    project: "inference-engine",
    labels: ["api", "validation"],
    cost_usd: 0,
    created_at: "2026-03-22T08:15:00Z",
  },
  {
    id: "DAT-024",
    subject: "Optimize Parquet writer throughput",
    description: "Profile and optimize the Parquet file writer for large-scale data ingestion workloads.",
    status: "in_progress",
    priority: "high",
    assignee: "data-eng",
    skill: "data-pipelines",
    mission_id: "M-DAT-007",
    project: "data-platform",
    labels: ["performance", "storage"],
    cost_usd: 0.08,
    created_at: "2026-03-21T14:00:00Z",
    updated_at: "2026-03-22T09:00:00Z",
  },
  {
    id: "AUTH-032",
    subject: "Rotate JWT signing keys",
    description: "Implement automated JWT key rotation with zero-downtime deployment.",
    status: "in_progress",
    priority: "critical",
    assignee: "security",
    skill: "security",
    project: "auth-service",
    labels: ["security", "auth"],
    cost_usd: 0.15,
    created_at: "2026-03-22T07:00:00Z",
    updated_at: "2026-03-22T11:00:00Z",
  },
  {
    id: "MON-016",
    subject: "Configure Prometheus alerting rules",
    description: "Set up alerting rules for service latency, error rates, and resource utilization.",
    status: "in_progress",
    priority: "normal",
    assignee: "ops",
    skill: "monitoring",
    project: "monitoring-stack",
    labels: ["alerting", "observability"],
    cost_usd: 0.03,
    created_at: "2026-03-22T09:30:00Z",
    updated_at: "2026-03-22T10:45:00Z",
  },
  {
    id: "INF-045",
    subject: "Fix memory leak in model cache",
    description: "Investigate and resolve memory leak when models are evicted from the LRU cache.",
    status: "done",
    priority: "critical",
    assignee: "architect",
    skill: "rust",
    project: "inference-engine",
    labels: ["bug", "memory"],
    cost_usd: 0.21,
    created_at: "2026-03-20T16:00:00Z",
    updated_at: "2026-03-21T11:30:00Z",
  },
  {
    id: "DAT-022",
    subject: "Add CDC connector for PostgreSQL",
    description: "Implement change data capture connector using logical replication for PostgreSQL sources.",
    status: "done",
    priority: "high",
    assignee: "data-eng",
    skill: "data-pipelines",
    mission_id: "M-DAT-006",
    project: "data-platform",
    labels: ["connector", "postgres"],
    cost_usd: 0.14,
    created_at: "2026-03-19T10:00:00Z",
    updated_at: "2026-03-20T15:00:00Z",
  },
  {
    id: "AUTH-030",
    subject: "Add RBAC policy engine",
    description: "Implement role-based access control with policy evaluation engine.",
    status: "done",
    priority: "high",
    assignee: "security",
    skill: "security",
    project: "auth-service",
    labels: ["rbac", "auth"],
    cost_usd: 0.19,
    created_at: "2026-03-18T08:00:00Z",
    updated_at: "2026-03-19T17:00:00Z",
  },
  {
    id: "MON-015",
    subject: "Deploy Grafana dashboards",
    description: "Create and deploy standard Grafana dashboards for all microservices.",
    status: "done",
    priority: "normal",
    assignee: "ops",
    skill: "monitoring",
    project: "monitoring-stack",
    labels: ["dashboard", "grafana"],
    cost_usd: 0.02,
    created_at: "2026-03-20T13:00:00Z",
    updated_at: "2026-03-21T09:00:00Z",
  },
  {
    id: "INF-050",
    subject: "Write load testing suite",
    description: "Create comprehensive load testing suite for inference endpoints using k6.",
    status: "blocked",
    priority: "normal",
    skill: "testing",
    mission_id: "M-INF-003",
    project: "inference-engine",
    labels: ["testing", "performance"],
    cost_usd: 0,
    created_at: "2026-03-22T08:15:00Z",
  },
  {
    id: "DAT-025",
    subject: "Schema registry integration",
    description: "Integrate with Confluent Schema Registry for Avro/Protobuf schema management.",
    status: "pending",
    priority: "low",
    project: "data-platform",
    labels: ["schema", "integration"],
    cost_usd: 0,
    created_at: "2026-03-22T11:00:00Z",
  },
  {
    id: "AUTH-033",
    subject: "Add OAuth2 PKCE flow",
    description: "Implement OAuth2 authorization code flow with PKCE for public clients.",
    status: "pending",
    priority: "high",
    project: "auth-service",
    labels: ["oauth", "auth"],
    cost_usd: 0,
    created_at: "2026-03-22T12:00:00Z",
  },
];

export function useTasks(filters?: {
  status?: string;
  priority?: string;
  project?: string;
}) {
  const result = useApi<Task[]>(
    async () => {
      try {
        return await api.getTasks(filters);
      } catch {
        let tasks = [...MOCK_TASKS];
        if (filters?.status) {
          tasks = tasks.filter((t) => t.status === filters.status);
        }
        if (filters?.priority) {
          tasks = tasks.filter((t) => t.priority === filters.priority);
        }
        if (filters?.project) {
          tasks = tasks.filter((t) => t.project === filters.project);
        }
        return tasks;
      }
    },
    [filters?.status, filters?.priority, filters?.project],
  );

  return result;
}

export { MOCK_TASKS };
