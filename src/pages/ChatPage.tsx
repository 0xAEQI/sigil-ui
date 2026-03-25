import { useState, useRef, useEffect, useCallback, memo } from "react";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chat";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  data?: any;
  status?: "sending" | "sent" | "error";
}

let msgId = 0;
function nextId() { return `msg-${Date.now()}-${++msgId}`; }

function formatContext(data: any): string {
  if (!data || !data.ok) return data?.error || "Failed to get response";
  if (data.context) return data.context;
  return "Ready.";
}

function timeLabel(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function shouldShowTime(current: Message, prev?: Message): boolean {
  if (!prev) return true;
  if (prev.role !== current.role) return true;
  return current.timestamp.getTime() - prev.timestamp.getTime() > 120000; // 2 min gap
}

// ── Message bubble ──
const ChatBubble = memo(function ChatBubble({
  msg, showTime, onCopy,
}: {
  msg: Message; showTime: boolean; onCopy: (text: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (msg.role === "system") {
    return (
      <div className="c-system">
        <span className="c-system-line" />
        <span className="c-system-text">{msg.content}</span>
        <span className="c-system-line" />
      </div>
    );
  }

  const isUser = msg.role === "user";

  return (
    <div className={`c-row ${isUser ? "c-row-user" : "c-row-assistant"}`}>
      {!isUser && <div className="c-avatar">S</div>}
      <div className={`c-bubble ${isUser ? "c-bubble-user" : "c-bubble-assistant"}`}>
        <div className="c-text">{msg.content}</div>
        {msg.data?.cost && (
          <div className="c-meta-cost">
            ${Number(msg.data.cost.spent).toFixed(3)} / ${Number(msg.data.cost.budget).toFixed(2)}
          </div>
        )}
        <div className="c-bubble-footer">
          {showTime && <span className="c-time">{timeLabel(msg.timestamp)}</span>}
          {msg.status === "sending" && <span className="c-status">Sending...</span>}
          {msg.status === "error" && <span className="c-status c-status-error">Failed</span>}
        </div>
        {!isUser && (
          <button className="c-action" onClick={handleCopy} title="Copy">
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--success)" strokeWidth="1.5"><path d="M2 6l3 3 5-5"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="6" height="6" rx="1"/><path d="M2 8V2h6"/></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
});

// ── Typing indicator ──
function TypingIndicator() {
  return (
    <div className="c-row c-row-assistant">
      <div className="c-avatar">S</div>
      <div className="c-bubble c-bubble-assistant c-bubble-typing">
        <span className="c-dot" />
        <span className="c-dot" />
        <span className="c-dot" />
      </div>
    </div>
  );
}

// ── Empty state ──
function EmptyChat() {
  return (
    <div className="c-empty">
      <div className="c-empty-avatar">S</div>
      <h2 className="c-empty-title">What needs to happen?</h2>
      <p className="c-empty-hint">
        Create tasks, check status, deploy, research — or just think out loud.
      </p>
      <div className="c-empty-suggestions">
        {["What's the status?", "Create a task to...", "What happened overnight?"].map((s) => (
          <span key={s} className="c-suggestion">{s}</span>
        ))}
      </div>
    </div>
  );
}

// ── Scroll-to-bottom ──
function ScrollAnchor({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <button className="c-scroll-btn" onClick={onClick}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 2v10M3 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── Main component ──
export default function ChatPage() {
  const channel = useChatStore((s) => s.channel);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("sigil_chat_messages");
    if (saved) {
      try {
        return JSON.parse(saved).map((m: any) => ({
          ...m,
          id: m.id || nextId(),
          timestamp: new Date(m.timestamp),
        }));
      } catch { /* ignore */ }
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showScroll, setShowScroll] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevChannelRef = useRef<string | null>(channel);
  const isAtBottom = useRef(true);

  // Persist
  useEffect(() => {
    localStorage.setItem("sigil_chat_messages", JSON.stringify(messages.slice(-100)));
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (isAtBottom.current && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleScroll = useCallback(() => {
    if (!messagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 60;
    isAtBottom.current = atBottom;
    setShowScroll(!atBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    api.getAgents().then((d) => setAgents(d.agents || [])).catch(() => {});
    api.getProjects().then((d) => setProjects(d.projects || [])).catch(() => {});
  }, []);

  // Channel switch
  useEffect(() => {
    if (prevChannelRef.current !== channel) {
      prevChannelRef.current = channel;
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "system", content: `#${channel || "Sigil"}`, timestamp: new Date() },
      ]);
      inputRef.current?.focus();
    }
  }, [channel]);

  const sessionId = useRef(localStorage.getItem("sigil_session_id") || `web-${Date.now()}`);
  useEffect(() => { localStorage.setItem("sigil_session_id", sessionId.current); }, []);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    const userMsg: Message = { id: nextId(), role: "user", content: msg, timestamp: new Date(), status: "sending" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (inputRef.current) { inputRef.current.style.height = "auto"; }
    setLoading(true);

    try {
      const projectContext = channel?.split("/")[0] || undefined;
      const response = await api.chat(msg, projectContext);

      // Mark user message as sent
      setMessages((prev) => prev.map((m) => m.id === userMsg.id ? { ...m, status: "sent" } : m));

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "assistant", content: formatContext(response), timestamp: new Date(), data: response },
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
                { id: nextId(), role: "assistant", content: poll.text || "Done.", timestamp: new Date() },
              ]);
              break;
            }
          } catch { break; }
        }
      }
    } catch (e: any) {
      setMessages((prev) => prev.map((m) => m.id === userMsg.id ? { ...m, status: "error" } : m));
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "assistant", content: `Error: ${e.message}`, timestamp: new Date() },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Drop zone
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // TODO: file upload
  };

  // Channel agents
  const channelAgents = (() => {
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
  })();

  const hasMessages = messages.filter((m) => m.role !== "system").length > 0;
  const canSend = input.trim().length > 0 && !loading;

  return (
    <div
      className={`c-page ${dragOver ? "c-page-dragover" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="c-header">
        <span className="c-header-channel">#{channel || "Sigil"}</span>
        <div className="c-header-agents">
          {channelAgents.slice(0, 6).map((a: any) => (
            <span key={a.name} className="c-header-avatar" title={`${a.name} (${a.role})`}>
              {a.name[0].toUpperCase()}
            </span>
          ))}
          {channelAgents.length > 0 && (
            <span className="c-header-count">{channelAgents.length} agents</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="c-messages" ref={messagesRef} onScroll={handleScroll}>
        {!hasMessages && !loading && <EmptyChat />}
        {messages.map((msg, i) => (
          <ChatBubble
            key={msg.id}
            msg={msg}
            showTime={shouldShowTime(msg, messages[i - 1])}
            onCopy={copyToClipboard}
          />
        ))}
        {loading && <TypingIndicator />}
      </div>

      <ScrollAnchor show={showScroll} onClick={scrollToBottom} />

      {/* Input */}
      <div className="c-composer">
        <div className="c-composer-inner">
          {channel && <span className="c-composer-ctx">#{channel.split("/").pop()}</span>}
          <textarea
            ref={inputRef}
            className="c-textarea"
            placeholder={channel ? `Message #${channel.split("/").pop()}...` : "What needs to happen?"}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <div className="c-composer-actions">
            <span className="c-composer-hint">
              {input.length > 0 ? <kbd>Enter</kbd> : <kbd>Shift+Enter</kbd>}
            </span>
            <button
              className={`c-send ${canSend ? "c-send-ready" : ""} ${loading ? "c-send-loading" : ""}`}
              onClick={sendMessage}
              disabled={!canSend}
            >
              {loading ? (
                <svg className="c-send-spinner" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="8" r="6" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 8h12M10 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      {dragOver && (
        <div className="c-drop-overlay">
          <div className="c-drop-label">Drop files here</div>
        </div>
      )}
    </div>
  );
}
