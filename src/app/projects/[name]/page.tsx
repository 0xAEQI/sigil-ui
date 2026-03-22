"use client";

import { use } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
import TaskRow from "@/components/TaskRow";
import MissionCard from "@/components/MissionCard";
import EmptyState from "@/components/EmptyState";
import { useProject } from "@/hooks/useProjects";
import { useTasks, MOCK_TASKS } from "@/hooks/useTasks";
import { useMissions, MOCK_MISSIONS } from "@/hooks/useMissions";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const { data: project, loading: projectLoading } = useProject(name);
  const { data: allTasks } = useTasks({ project: name });
  const { data: allMissions } = useMissions();

  const tasks = allTasks || MOCK_TASKS.filter((t) => t.project === name);
  const missions =
    allMissions?.filter((m) => m.project === name) ||
    MOCK_MISSIONS.filter((m) => m.project === name);

  if (projectLoading) {
    return <div className="loading-spinner">Loading project...</div>;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description={`No project named "${name}" was found.`}
      />
    );
  }

  const total =
    project.stats.pending +
    project.stats.active +
    project.stats.done +
    project.stats.failed;
  const completionPct = total > 0 ? (project.stats.done / total) * 100 : 0;

  return (
    <>
      <Header
        title={project.name}
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
      />

      <div className="detail-grid">
        <div className="detail-sidebar">
          <div className="detail-panel">
            <div className="detail-panel-header">Project Info</div>
            <div className="detail-panel-body">
              <div className="detail-field">
                <span className="detail-field-label">Prefix</span>
                <code className="detail-field-value detail-field-mono">
                  {project.prefix}
                </code>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Repository</span>
                <span className="detail-field-value detail-field-mono">
                  {project.repo}
                </span>
              </div>
              {project.description && (
                <div className="detail-field">
                  <span className="detail-field-label">Description</span>
                  <span className="detail-field-value">
                    {project.description}
                  </span>
                </div>
              )}
              <div className="detail-field">
                <span className="detail-field-label">Completion</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="project-progress-bar" style={{ flex: 1 }}>
                    <div
                      className="project-progress-fill"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <span className="detail-field-value detail-field-mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {completionPct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-panel">
            <div className="detail-panel-header">Team</div>
            <div className="detail-panel-body">
              <div className="detail-field">
                <span className="detail-field-label">Leader</span>
                <Link
                  href={`/agents/${project.team.leader}`}
                  className="detail-field-value"
                  style={{ color: "var(--accent)" }}
                >
                  {project.team.leader}
                </Link>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Advisors</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {project.team.advisors.map((a) => (
                    <Link
                      key={a}
                      href={`/agents/${a}`}
                      className="detail-field-value"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {a}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-panel">
            <div className="detail-panel-header">Stats</div>
            <div className="detail-panel-body">
              <div className="project-stat-row" style={{ flexWrap: "wrap", gap: 12 }}>
                <div className="project-stat">
                  <span className="project-stat-count project-stat-pending">
                    {project.stats.pending}
                  </span>
                  <span className="project-stat-label">pending</span>
                </div>
                <div className="project-stat">
                  <span className="project-stat-count project-stat-active">
                    {project.stats.active}
                  </span>
                  <span className="project-stat-label">active</span>
                </div>
                <div className="project-stat">
                  <span className="project-stat-count project-stat-done">
                    {project.stats.done}
                  </span>
                  <span className="project-stat-label">done</span>
                </div>
                <div className="project-stat">
                  <span className="project-stat-count project-stat-failed">
                    {project.stats.failed}
                  </span>
                  <span className="project-stat-label">failed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-main">
          {missions.length > 0 && (
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
                Missions
              </h3>
              <div className="mission-cards">
                {missions.map((m) => (
                  <MissionCard key={m.id} mission={m} />
                ))}
              </div>
            </div>
          )}

          <div className="table-container">
            <div className="table-header">
              <span className="table-title">Tasks</span>
              <span className="table-count">{tasks.length} tasks</span>
            </div>
            {tasks.length > 0 ? (
              tasks.map((task) => <TaskRow key={task.id} task={task} />)
            ) : (
              <EmptyState
                title="No tasks"
                description="Tasks for this project will appear here."
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
