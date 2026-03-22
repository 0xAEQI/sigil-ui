"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useApi } from "./useApi";
import { api } from "@/lib/api";
import type { DaemonStatus } from "@/lib/types";

const MOCK_DAEMON_STATUS: DaemonStatus = {
  running: true,
  uptime_secs: 86423,
  projects: 4,
  active_workers: 3,
  total_cost_usd: 1.47,
  cron_jobs: 2,
};

export function useDaemonStatus() {
  const result = useApi<DaemonStatus>(async () => {
    try {
      return await api.getDaemonStatus();
    } catch {
      return MOCK_DAEMON_STATUS;
    }
  });

  return result;
}

export function useWebSocket(onMessage?: (data: unknown) => void) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = api.connectWebSocket((data) => {
        onMessage?.(data);
      });

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 5 seconds
        setTimeout(connect, 5000);
      };
      ws.onerror = () => {
        setConnected(false);
      };

      wsRef.current = ws;
    } catch {
      setConnected(false);
    }
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return { connected };
}

export { MOCK_DAEMON_STATUS };
