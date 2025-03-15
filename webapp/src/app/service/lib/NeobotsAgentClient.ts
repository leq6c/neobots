/**
 * neobots-agent-client.ts
 *
 * A TypeScript client library for interacting with the NeobotsAgentServer.
 * This is designed for **browser** usage.
 */

// =========================
//      Type Definitions
// =========================

/** Response from GET /agent/status */
export interface AgentStatusResponse {
  nftMint: string;
  configured: boolean;
  running: boolean;
  personality: string | null;
}

/** Generic JSON response from configure/start/stop endpoints */
export interface GenericResponse {
  success: boolean;
  message: string;
  nftMint: string;
}

/** WebSocket log message shape */
export interface AgentLogMessage {
  type: 'log';
  nftMint: string;
  timestamp: string;
  message: string;
}

/** AgentStatus that might be broadcast from the server */
interface AgentActionStatus {
  id: string;
  type: string;
  current?: number;
  total?: number;
  message?: string;
  status: 'pending' | 'running' | 'success' | 'closed' | 'error';
  targetContent?: string;
  targetPda?: string;
  reason?: string;
  inference?: string;
}

export interface AgentStatusUpdate {
  type: 'status';
  running: boolean;
  actions: AgentActionStatus[];
  message?: string;
}

/** WebSocket inference message shape */
export interface AgentInference {
  type: 'inference';
  inference: string;
}

/** WebSocket subscribed/unsubscribed ack shape */
export interface AgentSubscriptionAck {
  type: 'subscribed' | 'unsubscribed';
  nftMint: string;
  message: string;
}

/**
 * Union type for **all** possible messages
 * that can come through the WebSocket.
 */
export type NeobotsWSMessage =
  | AgentLogMessage
  | AgentStatusUpdate
  | AgentInference
  | AgentSubscriptionAck;

/**
 * Callback functions you can provide when subscribing to WebSocket events.
 * All of them are **optional**.
 */
export interface NeobotsAgentWebSocketCallbacks {
  /** Called when a "log" message arrives. */
  onLog?(msg: AgentLogMessage): void;
  /** Called when a "status" update arrives. */
  onStatus?(msg: AgentStatusUpdate): void;
  /** Called when an "inference" message arrives. */
  onInference?(msg: AgentInference): void;
  /** Called when subscribe/unsubscribe acks arrive. */
  onSubscriptionAck?(msg: AgentSubscriptionAck): void;
  /** Called when the WebSocket is successfully opened. */
  onOpen?(): void;
  /** Called if the WebSocket closes. */
  onClose?(event: CloseEvent): void;
  /** Called if there is an error with the WebSocket. */
  onError?(event: Event): void;
}

// =========================
//   Neobots Agent Client
// =========================

export class NeobotsAgentClient {
  /**
   * You may need to adjust these defaults depending on your setup.
   * Make sure you include the correct protocol (http/https, ws/wss)
   * and ports.
   */
  private readonly baseHttpUrl: string; // e.g. http://localhost:4001
  private readonly baseWsUrl: string; // e.g.  ws://localhost:4001/ws

  constructor({
    httpUrl = 'http://localhost:4001',
    wsUrl = 'ws://localhost:4001/ws',
  }: {
    httpUrl?: string;
    wsUrl?: string;
  } = {}) {
    this.baseHttpUrl = httpUrl.replace(/\/+$/, ''); // trim trailing slashes
    this.baseWsUrl = wsUrl;
  }

  // =========================
  //        REST Calls
  // =========================

  /**
   * GET /agent/status?nftMint=xxxxx
   */
  public async checkAgentStatus(nftMint: string): Promise<AgentStatusResponse> {
    const url = `${this.baseHttpUrl}/agent/status?nftMint=${encodeURIComponent(
      nftMint
    )}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Failed to fetch agent status: ${resp.statusText}`);
    }
    return resp.json();
  }

  /**
   * POST /agent/configure
   * Body: { nftMint: string, personality: string }
   */
  public async configureAgent(
    nftMint: string,
    personality: string
  ): Promise<GenericResponse> {
    const url = `${this.baseHttpUrl}/agent/configure`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nftMint, personality }),
    });
    if (!resp.ok) {
      throw new Error(`Failed to configure agent: ${resp.statusText}`);
    }
    return resp.json();
  }

  /**
   * POST /agent/start
   * Body: { nftMint: string }
   */
  public async startAgent(nftMint: string): Promise<GenericResponse> {
    const url = `${this.baseHttpUrl}/agent/start`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nftMint }),
    });
    if (!resp.ok) {
      throw new Error(`Failed to start agent: ${resp.statusText}`);
    }
    return resp.json();
  }

  /**
   * POST /agent/stop
   * Body: { nftMint: string }
   */
  public async stopAgent(nftMint: string): Promise<GenericResponse> {
    const url = `${this.baseHttpUrl}/agent/stop`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nftMint }),
    });
    if (!resp.ok) {
      throw new Error(`Failed to stop agent: ${resp.statusText}`);
    }
    return resp.json();
  }

  // =========================
  //    WebSocket Handling
  // =========================

  /**
   * Create a WebSocket and subscribe to log/status/inference updates
   * for the given nftMint. You can attach callback handlers for events.
   *
   * Returns the WebSocket instance so that you can manually close
   * the connection if needed.
   *
   * Usage example:
   *    const ws = client.subscribeToAgent("MintXYZ", {
   *      onLog: (log) => console.log("LOG:", log),
   *      onStatus: (st) => console.log("STATUS:", st),
   *      onInference: (inf) => console.log("INFERENCE:", inf),
   *      onOpen: () => console.log("WebSocket connected"),
   *      onClose: () => console.log("WebSocket closed"),
   *      onError: (err) => console.error("WebSocket error:", err),
   *    });
   */
  public subscribeToAgent(
    nftMint: string,
    callbacks: NeobotsAgentWebSocketCallbacks = {}
  ): WebSocket {
    const ws = new WebSocket(this.baseWsUrl);

    ws.onopen = () => {
      // Optionally, you can subscribe after onopen to ensure
      // the socket is ready. But you can also do it right away:
      const msg = {
        type: 'subscribe',
        nftMint,
      };
      ws.send(JSON.stringify(msg));
      callbacks.onOpen?.();
    };

    ws.onmessage = (event) => {
      let data: NeobotsWSMessage;
      try {
        data = JSON.parse(event.data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', event.data);
        return;
      }

      switch (data.type) {
        case 'log':
          callbacks.onLog?.(data);
          break;
        case 'status':
          callbacks.onStatus?.(data);
          break;
        case 'inference':
          callbacks.onInference?.(data);
          break;
        case 'subscribed':
        case 'unsubscribed':
          callbacks.onSubscriptionAck?.(data);
          break;
        default:
          console.warn('Unknown message type:', data);
      }
    };

    ws.onclose = (event) => {
      callbacks.onClose?.(event);
    };

    ws.onerror = (event) => {
      callbacks.onError?.(event);
    };

    return ws;
  }

  /**
   * If you keep the WebSocket open but want to stop receiving logs
   * for a specific mint, you can call this method.
   * You need a **connected** WebSocket instance.
   *
   * e.g.:
   *   const ws = client.subscribeToAgent("MintXYZ", {...});
   *   // later...
   *   client.unsubscribeFromAgent(ws, "MintXYZ");
   */
  public unsubscribeFromAgent(ws: WebSocket, nftMint: string): void {
    if (ws.readyState === WebSocket.OPEN) {
      const msg = {
        type: 'unsubscribe',
        nftMint,
      };
      ws.send(JSON.stringify(msg));
    } else {
      console.warn('WebSocket is not open. Cannot unsubscribe right now.');
    }
  }
}
