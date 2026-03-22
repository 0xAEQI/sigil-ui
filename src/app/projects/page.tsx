"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import EmptyState from "@/components/EmptyState";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
  const { data: projects, loading } = useProjects();

  return (
    <>
      <Header
        title="Projects"
        breadcrumbs={[{ label: "Projects" }]}
      />

      {loading ? (
        <div className="loading-spinner">Loading projects...</div>
      ) : projects && projects.length > 0 ? (
        <div className="project-cards">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects"
          description="Projects will appear here once they are configured in Sigil."
        />
      )}
    </>
  );
}
