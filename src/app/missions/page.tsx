"use client";

import { useState } from "react";
import Header from "@/components/Header";
import MissionCard from "@/components/MissionCard";
import EmptyState from "@/components/EmptyState";
import { useMissions } from "@/hooks/useMissions";

export default function MissionsPage() {
  const { data: missions, loading } = useMissions();
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = missions?.filter((m) =>
    statusFilter ? m.status === statusFilter : true,
  );

  const activeCount = missions?.filter((m) => m.status === "in_progress").length ?? 0;
  const doneCount = missions?.filter((m) => m.status === "done").length ?? 0;

  return (
    <>
      <Header
        title="Missions"
        breadcrumbs={[{ label: "Missions" }]}
        actions={
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--info)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                {activeCount}
              </span>{" "}
              active
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span style={{ color: "var(--success)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                {doneCount}
              </span>{" "}
              completed
            </span>
          </div>
        }
      />

      <div className="filter-bar">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading missions...</div>
      ) : filtered && filtered.length > 0 ? (
        <div className="mission-cards">
          {filtered.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No missions found"
          description="Missions will appear here once they are created in Sigil."
        />
      )}
    </>
  );
}
