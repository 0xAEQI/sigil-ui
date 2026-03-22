"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TaskRow from "@/components/TaskRow";
import EmptyState from "@/components/EmptyState";
import { useTasks } from "@/hooks/useTasks";

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data: tasks, loading } = useTasks({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    project: projectFilter || undefined,
  });

  const filteredTasks = tasks?.filter((t) =>
    search
      ? t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  return (
    <>
      <Header
        title="Tasks"
        breadcrumbs={[{ label: "Tasks" }]}
        actions={
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {filteredTasks?.length ?? 0} tasks
          </span>
        }
      />

      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <select
          className="filter-select"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="">All projects</option>
          <option value="inference-engine">inference-engine</option>
          <option value="data-platform">data-platform</option>
          <option value="auth-service">auth-service</option>
          <option value="monitoring-stack">monitoring-stack</option>
        </select>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-spinner">Loading tasks...</div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
          filteredTasks.map((task) => <TaskRow key={task.id} task={task} />)
        ) : (
          <EmptyState
            title="No tasks found"
            description="Try adjusting your filters or search query."
          />
        )}
      </div>
    </>
  );
}
