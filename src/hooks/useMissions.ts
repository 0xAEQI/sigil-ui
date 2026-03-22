"use client";

import { useApi } from "./useApi";
import { api } from "@/lib/api";
import type { Mission } from "@/lib/types";

const MOCK_MISSIONS: Mission[] = [
  {
    id: "M-INF-003",
    name: "Batch Inference Pipeline",
    description: "Implement end-to-end batch inference pipeline with validation, processing, and monitoring.",
    status: "in_progress",
    project: "inference-engine",
    skill: "rust",
    task_count: 5,
    done_count: 2,
    created_at: "2026-03-22T08:00:00Z",
  },
  {
    id: "M-DAT-007",
    name: "Storage Layer Optimization",
    description: "Optimize data storage layer for high-throughput ingestion and efficient query patterns.",
    status: "in_progress",
    project: "data-platform",
    skill: "data-pipelines",
    task_count: 4,
    done_count: 1,
    created_at: "2026-03-21T14:00:00Z",
  },
  {
    id: "M-DAT-006",
    name: "CDC Connector Suite",
    description: "Build change data capture connectors for major database platforms.",
    status: "done",
    project: "data-platform",
    skill: "data-pipelines",
    task_count: 3,
    done_count: 3,
    created_at: "2026-03-18T10:00:00Z",
  },
  {
    id: "M-AUTH-002",
    name: "Token Security Hardening",
    description: "Harden JWT token handling with automated key rotation and enhanced validation.",
    status: "in_progress",
    project: "auth-service",
    skill: "security",
    task_count: 3,
    done_count: 1,
    created_at: "2026-03-22T06:00:00Z",
  },
  {
    id: "M-MON-001",
    name: "Observability Foundation",
    description: "Establish baseline observability with dashboards, alerting, and distributed tracing.",
    status: "in_progress",
    project: "monitoring-stack",
    skill: "monitoring",
    schedule: "0 */6 * * *",
    task_count: 6,
    done_count: 3,
    created_at: "2026-03-19T09:00:00Z",
  },
  {
    id: "M-INF-002",
    name: "Memory Safety Audit",
    description: "Comprehensive audit of memory management patterns in the inference engine.",
    status: "done",
    project: "inference-engine",
    skill: "rust",
    task_count: 4,
    done_count: 4,
    created_at: "2026-03-17T08:00:00Z",
  },
];

export function useMissions() {
  const result = useApi<Mission[]>(async () => {
    try {
      return await api.getMissions();
    } catch {
      return MOCK_MISSIONS;
    }
  });

  return result;
}

export { MOCK_MISSIONS };
