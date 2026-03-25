import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chat";

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

export default function ChatPage() {
  const channel = useChatStore((s) => s.channel);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("sigil_chat_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch { /* ignore */ }
    }
    return [{ role: "system" as const, content: "What are we working on?", timestamp: new Date() }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevChannelRef = useRef<string | null>(channel);

  // Persist messages
  useEffect(() => {
    localStorage.setItem("sigil_chat_messages", JSON.stringify(messages.slice(-100)));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    api.getAgents().then((d) => setAgents(d.agents || [])).catch(() => {});
    api.getProjects().then((d) => setProjects(d.projects || [])).catch(() => {});
  }, []);

  // Channel change notification
  useEffect(() => {
    if (prevChannelRef.current !== channel) {
      prevChannelRef.current = channel;
      const label = channel || "Sigil";
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `#${label}`, timestamp: new Date() },
      ]);
      inputRef.current?.focus();
    }
  }, [channel]);

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
      const response = await api.chat(msg, projectContext);

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: formatContext(response), timestamp: new Date(), data: response },
        ]);
      }

      // Full path: poll for agent completion
      if (response.action === "task_created" && response.task_handle) {
        for (let i = 0; i < 24; i++) {
          await new Promise((r) => setTimeout(r, 5000));
          try {
            const poll = await api.chatPoll(response.task_handle);
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

  // Channel agents
  const getChannelAgents = (): any[] => {
    if (!channel) return agents;
    const parts = channel.split("/");
    const project = projects.find((p: any) => p.name === parts[0]);
    if (parts[1] && project) {
      const dept = (project.departments || []).find((d: any) => d.name === parts[1]);
      if (dept) return agents.filter((a: any) => dept.agents?.includes(a.name) || dept.lead === a.name);
    }
    if (project?.team) {
      const names = [project.team.leader, ...(project.team.agents || [])];
      return agents.filter((a: any) => names.includes(a.name));
    }
    return agents;
  };

  const channelAgents = getChannelAgents();
  const channelLabel = channel || "Sigil";

  return (
    <div className="chat-home">
      {/* Minimal header */}
      <div className="chat-home-header">
        <div className="chat-home-header-left">
          <div className="chat-avatar">零</div>
          <div>
            <div className="chat-home-title">
              Rei
              <span className="chat-home-channel">#{channelLabel}</span>
            </div>
          </div>
        </div>
        <div className="chat-home-agents">
          {channelAgents.slice(0, 6).map((a: any) => (
            <span key={a.name} className="chat-home-agent" title={`${a.name} (${a.role})`}>
              {a.name[0].toUpperCase()}
            </span>
          ))}
          {channelAgents.length > 0 && (
            <span className="chat-home-agent-count">{channelAgents.length}</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-home-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
            {msg.role === "assistant" && <div className="chat-msg-avatar">零</div>}
            <div className="chat-msg-bubble">
              <pre className="chat-msg-content">{msg.content}</pre>
              {msg.data?.cost && (
                <div className="chat-msg-cost">
                  ${Number(msg.data.cost.spent).toFixed(3)} / ${Number(msg.data.cost.budget).toFixed(2)}
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
      <div className="chat-home-input">
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
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 10h12M12 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
