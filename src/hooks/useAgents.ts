"use client";

import { useApi } from "./useApi";
import { api } from "@/lib/api";
import type { Agent } from "@/lib/types";

const MOCK_AGENTS: Agent[] = [
  {
    name: "architect",
    prefix: "ARC",
    model: "claude-opus-4",
    role: "leader",
    status: "working",
    expertise: ["system-design", "rust", "architecture", "code-review"],
    current_task: "INF-048",
    stats: { completed: 142, failed: 3, avg_cost_usd: 0.087 },
  },
  {
    name: "reviewer",
    prefix: "REV",
    model: "claude-sonnet-4",
    role: "advisor",
    status: "idle",
    expertise: ["code-review", "testing", "security-audit"],
    stats: { completed: 98, failed: 1, avg_cost_usd: 0.042 },
  },
  {
    name: "security",
    prefix: "SEC",
    model: "claude-sonnet-4",
    role: "advisor",
    status: "working",
    expertise: ["security", "auth", "cryptography", "compliance"],
    current_task: "AUTH-032",
    stats: { completed: 67, failed: 2, avg_cost_usd: 0.055 },
  },
  {
    name: "data-eng",
    prefix: "DEN",
    model: "claude-sonnet-4",
    role: "worker",
    status: "idle",
    expertise: ["data-pipelines", "sql", "etl", "streaming"],
    stats: { completed: 84, failed: 4, avg_cost_usd: 0.038 },
  },
  {
    name: "ops",
    prefix: "OPS",
    model: "claude-haiku-3",
    role: "worker",
    status: "working",
    expertise: ["devops", "kubernetes", "terraform", "monitoring"],
    current_task: "MON-016",
    stats: { completed: 56, failed: 1, avg_cost_usd: 0.012 },
  },
  {
    name: "frontend",
    prefix: "FE",
    model: "claude-sonnet-4",
    role: "worker",
    status: "offline",
    expertise: ["react", "typescript", "css", "accessibility"],
    stats: { completed: 39, failed: 0, avg_cost_usd: 0.034 },
  },
];

export function useAgents() {
  const result = useApi<Agent[]>(async () => {
    try {
      return await api.getAgents();
    } catch {
      return MOCK_AGENTS;
    }
  });

  return result;
}

export function useAgent(name: string) {
  const result = useApi<Agent>(
    async () => {
      try {
        return await api.getAgent(name);
      } catch {
        const found = MOCK_AGENTS.find((a) => a.name === name);
        if (!found) throw new Error(`Agent "${name}" not found`);
        return found;
      }
    },
    [name],
  );

  return result;
}

export { MOCK_AGENTS };
