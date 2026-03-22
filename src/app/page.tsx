"use client";

import Link from "next/link";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import AuditEntryComponent from "@/components/AuditEntry";
import AgentCard from "@/components/AgentCard";
import { useAgents, MOCK_AGENTS } from "@/hooks/useAgents";
import { useAudit, MOCK_AUDIT } from "@/hooks/useAudit";

export default function DashboardPage() {
  const { data: agents } = useAgents();
  const { data: auditData } = useAudit({ limit: 10 });

  const activeAgents = (agents || MOCK_AGENTS).filter(
    (a) => a.status === "working",
  );
  const recentActivity = auditData?.entries || MOCK_AUDIT.slice(0, 10);

  return (
    <>
      <Header title="Dashboard" />

      <div className="stat-cards">
        <StatCard
          label="Active Workers"
          value={activeAgents.length}
          trend={{ value: "+1 from yesterday", positive: true }}
        />
        <StatCard
          label="Total Cost Today"
          value="$1.47"
          trend={{ value: "12% under budget", positive: true }}
        />
        <StatCard
          label="Tasks Completed (24h)"
          value={7}
          trend={{ value: "+3 vs avg", positive: true }}
        />
        <StatCard
          label="Projects Tracked"
          value={4}
        />
      </div>

      <div className="two-columns">
        <div className="column-section">
          <div className="column-section-header">
            <span className="column-section-title">Recent Activity</span>
            <Link href="/audit" className="view-all-link">
              View all
            </Link>
          </div>
          <div className="column-section-body">
            {recentActivity.map((entry) => (
              <AuditEntryComponent
                key={entry.id}
                entry={entry}
                compact
              />
            ))}
          </div>
        </div>

        <div className="column-section">
          <div className="column-section-header">
            <span className="column-section-title">Active Agents</span>
            <span className="column-section-count">
              {activeAgents.length} working
            </span>
          </div>
          <div className="column-section-body">
            {activeAgents.length > 0 ? (
              activeAgents.map((agent) => (
                <AgentCard key={agent.name} agent={agent} compact />
              ))
            ) : (
              <div className="loading-spinner">No agents currently working</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
