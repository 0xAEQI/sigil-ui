import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import KnowledgeSidebar from "@/components/KnowledgeSidebar";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  data?: any;
}

function formatContext(data: any): string {
  if (!data || !data.ok) return data?.error || "Failed to get response";
  if (data.context) return data.context;
  return "Ready.";
}

function ProjectPill({ name, tasks, missions }: { name: string; tasks: number; missions: number }) {
  return (
    <span className="chat-pill">
      <span className="chat-pill-name">{name}</span>
      <span className="chat-pill-stat">{tasks} tasks</span>
      {missions > 0 && <span className="chat-pill-stat">{missions} missions</span>}
    </span>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("sigil_chat_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch { /* ignore */ }
    }
    return [{ role: "system" as const, content: "I'm here. What are we working on?", timestamp: new Date() }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<string | null>(() => {
    return localStorage.getItem("sigil_chat_channel") || null;
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist messages and channel to localStorage.
  useEffect(() => {
    const toSave = messages.slice(-100); // Keep last 100 messages.
    localStorage.setItem("sigil_chat_messages", JSON.stringify(toSave));
  }, [messages]);

  useEffect(() => {
    if (channel) localStorage.setItem("sigil_chat_channel", channel);
    else localStorage.removeItem("sigil_chat_channel");
  }, [channel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    api.getProjects().then((d) => setProjects(d.projects || [])).catch(() => {});
    api.getAgents().then((d) => setAgents(d.agents || [])).catch(() => {});
  }, []);

  const switchChannel = (ch: string | null) => {
    setChannel(ch);
    const label = ch || "Sigil";
    setMessages((prev) => [
      ...prev,
      { role: "system", content: `#${label}`, timestamp: new Date() },
    ]);
    inputRef.current?.focus();
  };

  const sessionId = useRef(localStorage.getItem("sigil_session_id") || `web-${Date.now()}`);
  useEffect(() => { localStorage.setItem("sigil_session_id", sessionId.current); }, []);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: msg, timestamp: new Date() }]);
    setInput("");
    setLoading(true);
    try {
      const projectContext = channel?.split("/")[0] || undefined;

      // Try quick path first (instant intents + status).
      const response = await api.chat(msg, projectContext);

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: formatContext(response), timestamp: new Date(), data: response },
        ]);
      }

      // If the quick path created a task via full pipeline, poll for agent response.
      if (response.action === "task_created" && response.task_handle) {
        const taskId = response.task_handle;
        // Poll until complete (max 2 minutes).
        for (let i = 0; i < 24; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          try {
            const poll = await api.chatPoll(taskId);
            if (poll.completed) {
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: poll.text || "Task completed.", timestamp: new Date() },
              ]);
              break;
            }
          } catch { break; }
        }
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e.message}`, timestamp: new Date() },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Determine which agents are in the current channel
  const getChannelAgents = (): any[] => {
    if (!channel) return agents; // global = all agents

    const parts = channel.split("/");
    const projectName = parts[0];
    const deptName = parts[1];
    const project = projects.find((p: any) => p.name === projectName);

    if (deptName && project) {
      const dept = (project.departments || []).find((d: any) => d.name === deptName);
      if (dept) {
        return agents.filter((a: any) => dept.agents.includes(a.name) || dept.lead === a.name);
      }
    }

    if (project?.team) {
      const teamAgentNames = [project.team.leader, ...(project.team.agents || [])];
      return agents.filter((a: any) => teamAgentNames.includes(a.name));
    }

    return agents;
  };

  const channelAgents = getChannelAgents();
  const currentProject = channel ? projects.find((p: any) => p.name === channel?.split("/")[0]) : null;

  return (
    <div className="chat-layout">
      {/* Channel Sidebar */}
      <div className="chat-channels">
        <div className="chat-channels-header">Channels</div>

        <div
          className={`chat-channel ${channel === null ? "chat-channel-active" : ""}`}
          onClick={() => switchChannel(null)}
        >
          <span className="chat-channel-icon">零</span>
          <span className="chat-channel-name">Sigil</span>
        </div>

        <div className="chat-channels-divider" />

        {projects.map((p: any) => (
          <div key={p.name}>
            <div
              className={`chat-channel ${channel === p.name ? "chat-channel-active" : ""}`}
              onClick={() => switchChannel(p.name)}
            >
              <span className="chat-channel-dot" />
              <span className="chat-channel-name">{p.name}</span>
              {p.open_tasks > 0 && <span className="chat-channel-count">{p.open_tasks}</span>}
            </div>
            {(p.departments || []).map((d: any) => (
              <div
                key={`${p.name}/${d.name}`}
                className={`chat-channel chat-channel-dept ${channel === `${p.name}/${d.name}` ? "chat-channel-active" : ""}`}
                onClick={() => switchChannel(`${p.name}/${d.name}`)}
              >
                <span className="chat-channel-name">{d.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Chat Main */}
      <div className="chat-page">
        {/* Header with channel agents */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">零</div>
            <div>
              <div className="chat-header-title">
                Rei
                {channel && <span className="chat-header-channel">#{channel}</span>}
              </div>
              <div className="chat-header-subtitle">
                {channel
                  ? `${currentProject?.open_tasks || 0} open tasks`
                  : "All projects"}
              </div>
            </div>
          </div>

          {/* Agents in this channel */}
          <div className="chat-header-agents">
            {channelAgents.map((a: any) => (
              <div key={a.name} className="chat-header-agent" title={`${a.name} (${a.role})`}>
                <span className="chat-header-agent-avatar">{a.name[0].toUpperCase()}</span>
              </div>
            ))}
            <span className="chat-header-agent-count">
              {channelAgents.length} {channelAgents.length === 1 ? "agent" : "agents"}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
              {msg.role === "assistant" && <div className="chat-msg-avatar">零</div>}
              <div className="chat-msg-bubble">
                <pre className="chat-msg-content">{msg.content}</pre>
                {msg.data?.projects && !channel && (
                  <div className="chat-msg-projects">
                    {msg.data.projects.map((p: any) => (
                      <ProjectPill key={p.name} name={p.name} tasks={p.open_tasks} missions={p.active_missions} />
                    ))}
                  </div>
                )}
                {msg.data?.cost && (
                  <div className="chat-msg-cost">
                    ${Number(msg.data.cost.spent).toFixed(3)} / ${Number(msg.data.cost.budget).toFixed(2)} budget
                  </div>
                )}
                <span className="chat-msg-time">
                  {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg chat-msg-assistant">
              <div className="chat-msg-avatar">零</div>
              <div className="chat-msg-bubble">
                <div className="chat-typing"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar">
          {channel && <span className="chat-input-context">#{channel.split("/").pop()}</span>}
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={channel ? `Message #${channel.split("/").pop()}...` : "Talk to Rei..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <button className="chat-send" onClick={sendMessage} disabled={loading || !input.trim()}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10h12M12 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Knowledge sidebar — only for project channels */}
      {channel && !channel.includes("/") && (
        <KnowledgeSidebar project={channel} />
      )}
    </div>
  );
}
