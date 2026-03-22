"use client";

import { useState } from "react";
import Header from "@/components/Header";
import AuditEntryComponent from "@/components/AuditEntry";
import EmptyState from "@/components/EmptyState";
import { useAudit } from "@/hooks/useAudit";

export default function AuditPage() {
  const [projectFilter, setProjectFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data: auditData, loading } = useAudit({
    project: projectFilter || undefined,
    limit: 50,
  });

  const entries = auditData?.entries ?? [];
  const filtered = entries.filter((e) =>
    search
      ? e.summary.toLowerCase().includes(search.toLowerCase()) ||
        e.decision_type.toLowerCase().includes(search.toLowerCase()) ||
        (e.task_id && e.task_id.toLowerCase().includes(search.toLowerCase()))
      : true,
  );

  return (
    <>
      <Header
        title="Audit Trail"
        breadcrumbs={[{ label: "Audit" }]}
        actions={
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {auditData?.total ?? 0} total entries
          </span>
        }
      />

      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="Search decisions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
          <div className="loading-spinner">Loading audit log...</div>
        ) : filtered.length > 0 ? (
          filtered.map((entry) => (
            <AuditEntryComponent key={entry.id} entry={entry} />
          ))
        ) : (
          <EmptyState
            title="No audit entries found"
            description="Audit entries will appear here as the daemon makes orchestration decisions."
          />
        )}
      </div>
    </>
  );
}
