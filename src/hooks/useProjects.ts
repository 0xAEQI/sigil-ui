"use client";

import { useApi } from "./useApi";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";

// Mock data for development
const MOCK_PROJECTS: Project[] = [
  {
    name: "inference-engine",
    prefix: "INF",
    repo: "org/inference-engine",
    description: "Core inference pipeline for production ML models",
    team: { leader: "architect", advisors: ["reviewer", "security"] },
    stats: { pending: 4, active: 2, done: 47, failed: 1 },
    missions: [],
  },
  {
    name: "data-platform",
    prefix: "DAT",
    repo: "org/data-platform",
    description: "Unified data ingestion and transformation layer",
    team: { leader: "architect", advisors: ["data-eng"] },
    stats: { pending: 8, active: 3, done: 23, failed: 0 },
    missions: [],
  },
  {
    name: "auth-service",
    prefix: "AUTH",
    repo: "org/auth-service",
    description: "Authentication and authorization microservice",
    team: { leader: "security", advisors: ["architect"] },
    stats: { pending: 1, active: 0, done: 31, failed: 2 },
    missions: [],
  },
  {
    name: "monitoring-stack",
    prefix: "MON",
    repo: "org/monitoring-stack",
    description: "Observability, alerting, and metrics infrastructure",
    team: { leader: "ops", advisors: ["architect", "data-eng"] },
    stats: { pending: 6, active: 1, done: 15, failed: 0 },
    missions: [],
  },
];

export function useProjects() {
  const result = useApi<Project[]>(async () => {
    try {
      return await api.getProjects();
    } catch {
      return MOCK_PROJECTS;
    }
  });

  return result;
}

export function useProject(name: string) {
  const result = useApi<Project>(
    async () => {
      try {
        return await api.getProject(name);
      } catch {
        const found = MOCK_PROJECTS.find((p) => p.name === name);
        if (!found) throw new Error(`Project "${name}" not found`);
        return found;
      }
    },
    [name],
  );

  return result;
}

export { MOCK_PROJECTS };
