"use client";

import { use } from "react";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import TaskRow from "@/components/TaskRow";
import EmptyState from "@/components/EmptyState";
import { ROLE_LABELS } from "@/lib/constants";
import { useAgent } from "@/hooks/useAgents";
import { MOCK_TASKS } from "@/hooks/useTasks";

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const { data: agent, loading } = useAgent(name);

  const agentTasks = MOCK_TASKS.filter(
    (t) => t.assignee === name,
  );
  const recentTasks = agentTasks.slice(0, 8);

  if (loading) {
    return <div className="loading-spinner">Loading agent...</div>;
  }

  if (!agent) {
    return (
      <EmptyState
        title="Agent not found"
        description={`No agent named "${name}" was found.`}
      />
    );
  }

  const successRate =
    agent.stats.completed + agent.stats.failed > 0
      ? (
          (agent.stats.completed /
            (agent.stats.completed + agent.stats.failed)) *
          100
        ).toFixed(1)
      : "N/A";

  return (
    <>
      <Header
        title={agent.name}
        breadcrumbs={[
          { label: "Agents", href: "/agents" },
          { label: agent.name },
        ]}
      />

      <div className="detail-grid">
        <div className="detail-sidebar">
          <div className="detail-panel">
            <div className="detail-panel-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span>Identity</span>
                <StatusBadge status={agent.status} size="sm" />
              </div>
            </div>
            <div className="detail-panel-body">
              <div className="detail-field">
                <span className="detail-field-label">Name</span>
                <span className="detail-field-value">{agent.name}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Prefix</span>
                <code className="detail-field-value detail-field-mono">
                  {agent.prefix}
                </code>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Role</span>
                <span className="detail-field-value">
                  {ROLE_LABELS[agent.role]}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Model</span>
                <code className="detail-field-value detail-field-mono">
                  {agent.model}
                </code>
              </div>
              {agent.current_task && (
                <div className="detail-field">
                  <span className="detail-field-label">Current Task</span>
                  <code className="detail-field-value detail-field-mono" style={{ color: "var(--accent)" }}>
                    {agent.current_task}
                  </code>
                </div>
              )}
            </div>
          </div>

          <div className="detail-panel">
            <div className="detail-panel-header">Expertise</div>
            <div className="detail-panel-body">
              <div className="agent-expertise" style={{ marginBottom: 0 }}>
                {agent.expertise.map((skill) => (
                  <span key={skill} className="expertise-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="detail-panel">
            <div className="detail-panel-header">Metrics</div>
            <div className="detail-panel-body">
              <div className="detail-field">
                <span className="detail-field-label">Tasks Completed</span>
                <span className="detail-field-value detail-field-mono" style={{ color: "var(--success)" }}>
                  {agent.stats.completed}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Tasks Failed</span>
                <span className="detail-field-value detail-field-mono" style={{ color: "var(--error)" }}>
                  {agent.stats.failed}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Success Rate</span>
                <span className="detail-field-value detail-field-mono">
                  {successRate}%
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Avg Cost per Task</span>
                <span className="detail-field-value detail-field-mono">
                  ${agent.stats.avg_cost_usd.toFixed(3)}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Total Estimated Cost</span>
                <span className="detail-field-value detail-field-mono">
                  $
                  {(
                    agent.stats.avg_cost_usd *
                    (agent.stats.completed + agent.stats.failed)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-main">
          <div className="table-container">
            <div className="table-header">
              <span className="table-title">Recent Work</span>
              <span className="table-count">{recentTasks.length} tasks</span>
            </div>
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => <TaskRow key={task.id} task={task} />)
            ) : (
              <EmptyState
                title="No tasks yet"
                description="Tasks assigned to this agent will appear here."
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
