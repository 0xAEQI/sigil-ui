"use client";

import Header from "@/components/Header";
import AgentCard from "@/components/AgentCard";
import EmptyState from "@/components/EmptyState";
import { useAgents } from "@/hooks/useAgents";

export default function AgentsPage() {
  const { data: agents, loading } = useAgents();

  const workingCount = agents?.filter((a) => a.status === "working").length ?? 0;
  const idleCount = agents?.filter((a) => a.status === "idle").length ?? 0;
  const offlineCount = agents?.filter((a) => a.status === "offline").length ?? 0;

  return (
    <>
      <Header
        title="Agents"
        breadcrumbs={[{ label: "Agents" }]}
        actions={
          agents && (
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  {workingCount}
                </span>{" "}
                working
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  {idleCount}
                </span>{" "}
                idle
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  {offlineCount}
                </span>{" "}
                offline
              </span>
            </div>
          )
        }
      />

      {loading ? (
        <div className="loading-spinner">Loading agents...</div>
      ) : agents && agents.length > 0 ? (
        <div className="agent-grid">
          {agents.map((agent) => (
            <AgentCard key={agent.name} agent={agent} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No agents"
          description="Agents will appear here once they are configured in Sigil."
        />
      )}
    </>
  );
}
