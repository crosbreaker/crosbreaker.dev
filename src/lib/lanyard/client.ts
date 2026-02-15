import type { LanyardHello, LanyardInitState, LanyardPresence } from "./types";

const LANYARD_SOCKET_URL = "wss://api.lanyard.rest/socket";

interface LanyardClientOptions {
  userIds: string[];
  onInitState: (state: LanyardInitState) => void;
  onPresenceUpdate: (userId: string, presence: LanyardPresence) => void;
  onError?: (error: Error) => void;
  onDisconnect?: () => void;
}

interface SocketMessage {
  op: number;
  t?: string;
  d?: unknown;
}

export interface LanyardClient {
  connect: () => void;
  disconnect: () => void;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLanyardPresence(value: unknown): value is LanyardPresence {
  if (!isObject(value)) {
    return false;
  }

  return "discord_user" in value && "discord_status" in value;
}

export function createLanyardClient(options: LanyardClientOptions): LanyardClient {
  let socket: WebSocket | null = null;
  let heartbeatTimer: number | null = null;
  let reconnectTimer: number | null = null;
  let reconnectAttempts = 0;
  let intentionalClose = false;

  const clearHeartbeat = () => {
    if (heartbeatTimer !== null) {
      window.clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const clearReconnect = () => {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const send = (payload: unknown) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify(payload));
  };

  const startHeartbeat = (interval: number) => {
    clearHeartbeat();
    send({ op: 3 });
    heartbeatTimer = window.setInterval(() => {
      send({ op: 3 });
    }, interval);
  };

  const scheduleReconnect = () => {
    clearReconnect();

    const jitter = Math.floor(Math.random() * 300);
    const baseDelay = Math.min(1000 * 2 ** reconnectAttempts, 15000);
    const delay = baseDelay + jitter;

    reconnectAttempts += 1;
    reconnectTimer = window.setTimeout(() => {
      openSocket();
    }, delay);
  };

  const handleMessage = (event: MessageEvent<string>) => {
    let payload: SocketMessage;

    try {
      payload = JSON.parse(event.data) as SocketMessage;
    } catch {
      options.onError?.(new Error("Failed to parse Lanyard socket payload."));
      return;
    }

    if (payload.op === 1) {
      const hello = payload.d as LanyardHello;
      const heartbeatInterval = typeof hello?.heartbeat_interval === "number" ? hello.heartbeat_interval : 30000;
      startHeartbeat(heartbeatInterval);
      send({ op: 2, d: { subscribe_to_ids: options.userIds } });
      return;
    }

    if (payload.op !== 0 || typeof payload.t !== "string") {
      return;
    }

    if (payload.t === "INIT_STATE" && isObject(payload.d)) {
      const initState: LanyardInitState = {};

      for (const [userId, presence] of Object.entries(payload.d)) {
        if (isLanyardPresence(presence)) {
          initState[userId] = presence;
        }
      }

      options.onInitState(initState);
      return;
    }

    if (payload.t === "PRESENCE_UPDATE" && isLanyardPresence(payload.d)) {
      const presence = payload.d;
      if (!presence.user_id) {
        return;
      }

      options.onPresenceUpdate(presence.user_id, presence);
    }
  };

  const openSocket = () => {
    clearReconnect();
    clearHeartbeat();

    socket = new WebSocket(LANYARD_SOCKET_URL);

    socket.addEventListener("open", () => {
      reconnectAttempts = 0;
    });

    socket.addEventListener("message", handleMessage as EventListener);

    socket.addEventListener("error", () => {
      options.onError?.(new Error("Lanyard websocket connection error."));
    });

    socket.addEventListener("close", () => {
      clearHeartbeat();

      if (!intentionalClose) {
        options.onDisconnect?.();
        scheduleReconnect();
      }
    });
  };

  const connect = () => {
    intentionalClose = false;
    openSocket();
  };

  const disconnect = () => {
    intentionalClose = true;
    clearReconnect();
    clearHeartbeat();

    if (socket) {
      socket.close();
      socket = null;
    }
  };

  return {
    connect,
    disconnect
  };
}
