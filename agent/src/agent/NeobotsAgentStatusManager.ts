import { v4 as uuidv4 } from "uuid";
import { CancellationToken } from "./CancellationToken";

interface AgentActionStatus {
  id: string;
  type: string;
  current?: number;
  total?: number;
  message?: string;
  status: "pending" | "running" | "success" | "closed" | "error";
  targetContent?: string;
  targetPda?: string;
  reason?: string;
  inference?: string;
}

export interface AgentStatus {
  running: boolean;
  actions: AgentActionStatus[];
  message?: string;
}

export class AgentActionStatusNotifier {
  constructor(
    private status: AgentActionStatus,
    private statusManager: NeobotsAgentStatusManager
  ) {}

  public getStatus(): AgentActionStatus {
    return this.status;
  }

  public async startSessionAsync<T>(
    fn: (session: AgentActionStatusNotifierSession) => Promise<T>
  ): Promise<T> {
    const session = new AgentActionStatusNotifierSession(this);
    try {
      session.setStatus("running");
      const result = await fn(session);
      if (this.status.status === "running") {
        session.setStatus("success");
      }
      return result;
    } catch (e) {
      session.setStatus("error");
      throw e;
    }
  }

  public close(): void {
    this.status.status = "closed";
    this.statusManager.updateAction(this);
  }

  __internal_setStatus(status: AgentActionStatus): void {
    if (this.statusManager.cancellationToken.isCancelled) {
      throw new Error("Termination requested");
    }
    this.status = status;
    this.statusManager.updateAction(this);
  }

  __internal_setInference(inference: string): void {
    if (this.statusManager.cancellationToken.isCancelled) {
      throw new Error("Termination requested");
    }
    this.statusManager.updateInference(inference);
  }
}

export function CreateMockAgentActionStatusNotifierSession(): AgentActionStatusNotifierSession {
  const manager = new NeobotsAgentStatusManager();
  const notifier = manager.initializeAction("mock");
  return new AgentActionStatusNotifierSession(notifier);
}

/**
 * This class ensures that the status of the action is updated correctly.
 */
export class AgentActionStatusNotifierSession {
  constructor(private notifier: AgentActionStatusNotifier) {}

  public setProgress(current: number, total: number): void {
    this.notifier.__internal_setStatus({
      ...this.notifier.getStatus(),
      current,
      total,
    });
  }

  public setProgressIndeterminate(): void {
    this.notifier.__internal_setStatus({
      ...this.notifier.getStatus(),
      current: 0,
      total: 0,
    });
  }

  public setStatus(status: "pending" | "running" | "success" | "error"): void {
    this.notifier.__internal_setStatus({
      ...this.notifier.getStatus(),
      status,
    });
  }

  public setMessage(
    message: string,
    status?: "pending" | "running" | "success" | "error"
  ): void {
    console.log("Setting message: ", message);
    const stat = this.notifier.getStatus();
    stat.message = message;
    if (status) {
      stat.status = status;
    }
    this.notifier.__internal_setStatus(stat);
  }

  public setTargetContent(content: string, pda: string, reason?: string): void {
    if (content.length > 100) {
      content = content.slice(0, 100);
    }
    const stat = this.notifier.getStatus();
    stat.targetContent = content;
    stat.targetPda = pda;
    stat.reason = reason;
    this.notifier.__internal_setStatus(stat);
  }

  public setInferenceChunk(chunk: string): void {
    this.notifier.__internal_setInference(chunk);
  }
}

export class NeobotsAgentStatusManager {
  running: boolean = false;
  actions: AgentActionStatusNotifier[] = [];
  message?: string;
  callbacks: ((status: AgentStatus) => void)[] = [];
  inferenceCallbacks: ((inference: string) => void)[] = [];
  cancellationToken: CancellationToken;

  constructor(cancellationToken?: CancellationToken) {
    this.cancellationToken = cancellationToken ?? new CancellationToken();
  }

  public getStatus(): AgentStatus {
    return {
      running: this.running,
      actions: this.actions.map((a) => a.getStatus()),
      message: this.message,
    };
  }

  public setMessage(message: string, running?: boolean): void {
    this.message = message;
    if (running !== undefined) {
      this.running = running;
    }
    this.notify();
  }

  public setRunning(running: boolean): void {
    this.running = running;
    this.notify();
  }

  initializeAction(type: string): AgentActionStatusNotifier {
    const action: AgentActionStatus = {
      id: uuidv4(),
      type,
      status: "pending",
    };
    const op = new AgentActionStatusNotifier(action, this);
    this.actions.push(op);
    this.notify();
    return op;
  }

  reset(): void {
    this.cancellationToken.reset();
    this.actions = [];
    this.message = undefined;
    this.running = false;
    this.notify();
  }

  updateAction(action: AgentActionStatusNotifier): void {
    const index = this.actions.indexOf(action);
    if (index !== -1) {
      this.actions[index] = action;
      this.notify();
    }
  }

  addCallback(callback: (status: AgentStatus) => void): void {
    this.callbacks.push(callback);
  }

  removeCallback(callback: (status: AgentStatus) => void): void {
    this.callbacks = this.callbacks.filter((c) => c !== callback);
  }

  addInferenceCallback(callback: (inference: string) => void): void {
    this.inferenceCallbacks.push(callback);
  }

  removeInferenceCallback(callback: (inference: string) => void): void {
    this.inferenceCallbacks = this.inferenceCallbacks.filter(
      (c) => c !== callback
    );
  }

  updateInference(inference: string): void {
    // disabled for now
    try {
      for (const callback of this.inferenceCallbacks) {
        callback(inference);
      }
    } catch (e) {
      console.error("Error in inference callback: ", e);
    }
  }

  notify() {
    try {
      for (const callback of this.callbacks) {
        callback(this.getStatus());
      }
    } catch (e) {
      console.error("Error in callback: ", e);
    }
  }
}
