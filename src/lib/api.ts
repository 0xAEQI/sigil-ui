import type {
  Project,
  Agent,
  Task,
  Mission,
  AuditEntry,
  DaemonStatus,
  DashboardStats,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request<DashboardStats>("/dashboard"),

  // Projects
  getProjects: () => request<Project[]>("/projects"),
  getProject: (name: string) => request<Project>(`/projects/${name}`),
  getProjectMissions: (name: string) =>
    request<Mission[]>(`/projects/${name}/missions`),
  getProjectTasks: (name: string) =>
    request<Task[]>(`/projects/${name}/tasks`),

  // Agents
  getAgents: () => request<Agent[]>("/agents"),
  getAgent: (name: string) => request<Agent>(`/agents/${name}`),

  // Tasks
  getTasks: (params?: { status?: string; priority?: string; project?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.priority) query.set("priority", params.priority);
    if (params?.project) query.set("project", params.project);
    const qs = query.toString();
    return request<Task[]>(`/tasks${qs ? `?${qs}` : ""}`);
  },
  updateTask: (id: string, update: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(update),
    }),

  // Missions
  getMissions: () => request<Mission[]>("/missions"),

  // Audit
  getAudit: (params?: { page?: number; limit?: number; project?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.project) query.set("project", params.project);
    const qs = query.toString();
    return request<{ entries: AuditEntry[]; total: number }>(
      `/audit${qs ? `?${qs}` : ""}`,
    );
  },

  // Daemon
  getDaemonStatus: () => request<DaemonStatus>("/daemon/status"),

  // WebSocket
  connectWebSocket: (onMessage: (data: unknown) => void) => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        // ignore parse errors
      }
    };
    return ws;
  },
};

export { ApiError };
