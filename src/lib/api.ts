const BASE_URL = import.meta.env.VITE_API_URL || "/api";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  return localStorage.getItem("sigil_token");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("sigil_token");
    window.location.href = "/login";
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (secret: string) =>
    request<{ ok: boolean; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ secret }),
    }),

  // Dashboard
  getDashboard: () => request<any>("/dashboard"),

  // Status
  getStatus: () => request<any>("/status"),

  // Projects
  getProjects: () => request<any>("/projects"),

  // Tasks
  getTasks: (params?: { status?: string; project?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.project) query.set("project", params.project);
    const qs = query.toString();
    return request<any>(`/tasks${qs ? `?${qs}` : ""}`);
  },

  // Missions
  getMissions: (params?: { project?: string }) => {
    const query = new URLSearchParams();
    if (params?.project) query.set("project", params.project);
    const qs = query.toString();
    return request<any>(`/missions${qs ? `?${qs}` : ""}`);
  },

  // Agents
  getAgents: () => request<any>("/agents"),

  // Audit
  getAudit: (params?: { last?: number; project?: string }) => {
    const query = new URLSearchParams();
    if (params?.last) query.set("last", String(params.last));
    if (params?.project) query.set("project", params.project);
    const qs = query.toString();
    return request<any>(`/audit${qs ? `?${qs}` : ""}`);
  },

  // Blackboard
  getBlackboard: (params?: { project?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.project) query.set("project", params.project);
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<any>(`/blackboard${qs ? `?${qs}` : ""}`);
  },

  // Expertise
  getExpertise: (domain?: string) => {
    const query = new URLSearchParams();
    if (domain) query.set("domain", domain);
    const qs = query.toString();
    return request<any>(`/expertise${qs ? `?${qs}` : ""}`);
  },

  // Cost
  getCost: () => request<any>("/cost"),

  // Brief
  getBrief: () => request<any>("/brief"),

  // Memories
  getMemories: (params?: { project?: string; query?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.project) q.set("project", params.project);
    if (params?.query) q.set("query", params.query);
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request<any>(`/memories${qs ? `?${qs}` : ""}`);
  },

  // Skills
  getSkills: () => request<any>("/skills"),

  // Pipelines
  getPipelines: () => request<any>("/pipelines"),

  // Project Knowledge
  getProjectKnowledge: (name: string) => request<any>(`/projects/${name}/knowledge`),

  // Knowledge CRUD
  storeKnowledge: (data: { project: string; key: string; content: string; category?: string; scope?: string }) =>
    request<any>("/knowledge/store", { method: "POST", body: JSON.stringify(data) }),

  deleteKnowledge: (data: { project: string; id: string }) =>
    request<any>("/knowledge/delete", { method: "POST", body: JSON.stringify(data) }),

  // Channel Knowledge
  getChannelKnowledge: (params: { project: string; query?: string; limit?: number }) => {
    const q = new URLSearchParams();
    q.set("project", params.project);
    if (params.query) q.set("query", params.query);
    if (params.limit) q.set("limit", String(params.limit));
    return request<any>(`/knowledge/channel?${q.toString()}`);
  },

  // Agent Identity
  getAgentIdentity: (name: string) => request<any>(`/agents/${name}/identity`),
  saveAgentFile: (name: string, filename: string, content: string) =>
    request<any>(`/agents/${name}/files`, {
      method: "POST",
      body: JSON.stringify({ filename, content }),
    }),

  // Rate Limit
  getRateLimit: () => request<any>("/rate-limit"),

  // Crons & Watchdogs
  getCrons: () => request<any>("/crons"),
  getWatchdogs: () => request<any>("/watchdogs"),

  // Health
  getHealth: () => request<any>("/health"),

  // Chat — quick path (instant responses for intents + status queries)
  chat: (message: string, project?: string | null) =>
    request<any>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, ...(project ? { project } : {}) }),
    }),

  // Chat — full path (spawns agent execution, returns task handle for polling)
  chatFull: (message: string, project?: string | null, sessionId?: string) =>
    request<any>("/chat/full", {
      method: "POST",
      body: JSON.stringify({
        message,
        ...(project ? { project } : {}),
        ...(sessionId ? { session_id: sessionId } : {}),
      }),
    }),

  // Chat — poll for completion of a full-path task
  chatPoll: (taskId: string) =>
    request<any>(`/chat/poll/${taskId}`),

  // Chat — get conversation history
  chatHistory: (params?: { chatId?: number; sessionId?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.chatId) query.set("chat_id", String(params.chatId));
    if (params?.sessionId) query.set("session_id", params.sessionId);
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<any>(`/chat/history${qs ? `?${qs}` : ""}`);
  },

  // Chat — list all channels
  chatChannels: () => request<any>("/chat/channels"),

  // Write: Create Task
  createTask: (data: { project: string; subject: string; description?: string }) =>
    request<any>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Write: Close Task
  closeTask: (id: string, data?: { reason?: string; project?: string }) =>
    request<any>(`/tasks/${id}/close`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    }),

  // Write: Post to Blackboard
  postBlackboard: (data: { project: string; key: string; content: string; tags?: string[]; durability?: string }) =>
    request<any>("/blackboard", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export { ApiError };
