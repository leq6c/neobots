import nacl from "tweetnacl";
import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";

// Import your classes and utilities (replace with actual paths)
import { NeobotsAgent } from "../agent/NeobotsAgent";
import { NeobotsAutomationAgent } from "../agent/NeobotsAutomationAgent";
import { NeobotsOperator } from "../agent/NeobotsOperator";
import { NeobotsIndexerApi } from "../api/NeobotsIndexerApi";
import { NeobotsOffChainApi } from "../api/NeobotsOffchainApi";
import { OpenAIInference } from "../llm/openai";
import { getTestKeypair } from "../solana/wallet_util";
import {
  AgentStatus,
  NeobotsAgentStatusManager,
} from "../agent/NeobotsAgentStatusManager";
import { CancellationToken } from "../agent/CancellationToken";
import { PublicKey } from "@solana/web3.js";
import { randomBytes } from "crypto";
import { NftService } from "../solana/nft.service";
import { createDummyAnchorProvider } from "./createDummyAnchorProvider";

// Store active agents
interface AgentInstance {
  nftMint: string;
  agent: NeobotsAgent;
  automationAgent: NeobotsAutomationAgent;
  statusManager: NeobotsAgentStatusManager;
  cancellationToken: CancellationToken;
  running: boolean;
  personality: string;
}

interface LogMessage {
  nftMint: string;
  timestamp: string;
  message: string;
}

interface Challenge {
  nftMint: string;
  challenge: string;
  expiresAt: Date;
}

/**
 * A REST + WebSocket server for managing Neobots agents and
 * broadcasting logs to subscribed clients.
 */
export class NeobotsAgentServer {
  private httpServer: http.Server;
  private app: express.Application;
  private wsServer: WebSocketServer;
  private agents: Map<string, AgentInstance> = new Map();
  private dummyNftService: NftService;

  private solanaRpc: string = "http://localhost:8899";

  /**
   * For storing which WebSockets are subscribed to which NFT mint.
   * Key is nftMint, value is set of WebSocket connections.
   */
  private subscribers: Map<string, Set<WebSocket>> = new Map();
  private publishedLogs: Map<string, LogMessage[]> = new Map();
  private agentStatus: Map<string, AgentStatus> = new Map();
  private challenges: Map<string, Challenge> = new Map();

  constructor(private port: number = 4001) {
    this.app = express();
    this.app.use(cors()); // Enable CORS for all routes
    this.app.use(express.json()); // parse JSON bodies
    this.httpServer = http.createServer(this.app);
    this.wsServer = new WebSocketServer({
      server: this.httpServer,
      path: "/ws",
    });
    this.dummyNftService = new NftService(
      createDummyAnchorProvider(this.solanaRpc)
    );
  }

  private async createChallenge(
    nftMint: string,
    ownerPubkey: string
  ): Promise<Challenge> {
    const assetOwner = await this.dummyNftService.getNftOwner(nftMint);
    if (assetOwner !== ownerPubkey) {
      throw new Error("Asset owner does not match");
    }

    const randomData = randomBytes(32).toString("hex");

    const challenge =
      "Sign this to prove Neobot ownership.\n\n" +
      randomData.substring(0, 16) +
      randomData.substring(16, 32);

    const clg = {
      nftMint,
      challenge,
      // 5 minutes
      expiresAt: new Date(Date.now() + 1000 * 60 * 5),
    };

    this.challenges.set(ownerPubkey + "-" + nftMint, clg);
    return clg;
  }

  private async verifyChallenge(
    nftMint: string,
    ownerPubkey: string,
    signature: string
  ): Promise<boolean> {
    const clg = this.challenges.get(ownerPubkey + "-" + nftMint);
    if (!clg) {
      throw new Error("Challenge not found");
    }

    if (clg.expiresAt < new Date()) {
      this.challenges.delete(ownerPubkey + "-" + nftMint);
      throw new Error("Challenge expired");
    }

    const challengeBytes = new TextEncoder().encode(clg.challenge);
    const signatureBytes = Buffer.from(signature, "base64");
    const pubkeyBytes = new PublicKey(ownerPubkey).toBytes();

    const isValid = nacl.sign.detached.verify(
      challengeBytes,
      signatureBytes,
      pubkeyBytes
    );

    console.log("signature", signature);
    console.log("isValid", isValid);

    if (!isValid) {
      throw new Error("Invalid signature");
    }

    return true;
  }

  /**
   * Start the REST and WebSocket servers.
   */
  public async start(): Promise<void> {
    // Define REST endpoints
    this.setupRoutes();

    // Define WebSocket handlers
    this.setupWebSocketHandlers();

    // Start HTTP server
    await new Promise<void>((resolve) => {
      this.httpServer.listen({ port: this.port }, resolve);
    });

    console.log(
      `🚀 Neobots REST Server ready at http://localhost:${this.port}/`
    );
    console.log(
      `🚀 Neobots WebSocket Server ready at ws://localhost:${this.port}/ws`
    );
  }

  /**
   * Stop the server.
   */
  public async stop(): Promise<void> {
    // Close the WebSocket server
    this.wsServer.close(() => {
      console.log("WebSocket server closed");
    });

    // Close the HTTP server
    await new Promise<void>((resolve) => {
      this.httpServer.close(() => resolve());
    });

    console.log("Neobots Agent Server stopped");
  }

  /**
   * Setup express routes for REST endpoints
   */
  private setupRoutes() {
    this.app.post("/challenge", async (req, res) => {
      const { nftMint, owner } = req.body || {};
      if (!nftMint || !owner) {
        return res.status(400).json({
          success: false,
          message: "nftMint and ownerPubkey are required in the request body",
        });
      }
      const challenge = await this.createChallenge(nftMint, owner);
      res.json(challenge);
    });
    /**
     * GET /agent/status?nftMint=xxxx
     */
    this.app.get("/agent/status", (req, res) => {
      const nftMint = req.query.nftMint as string;
      if (!nftMint) {
        return res.status(400).json({
          success: false,
          message: "Missing query parameter: nftMint",
        });
      }

      const agentInstance = this.agents.get(nftMint);
      if (!agentInstance) {
        return res.json({
          nftMint,
          configured: false,
          running: false,
          personality: null,
        });
      }

      return res.json({
        nftMint,
        configured: true,
        running: agentInstance.running,
        personality: agentInstance.personality,
      });
    });

    /**
     * POST /agent/configure
     * Body: { nftMint: string, personality: string }
     */
    this.app.post("/agent/configure", async (req, res) => {
      const { signature, owner, nftMint, personality } = req.body || {};

      if (!nftMint || !owner || !signature) {
        return res.status(400).json({
          success: false,
          message:
            "nftMint, owner, and signature are required in the request body",
        });
      }

      try {
        await this.verifyChallenge(nftMint, owner, signature);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: `Error verifying challenge: ${e}`,
        });
      }

      try {
        // Check if agent already exists
        if (this.agents.has(nftMint)) {
          const existingAgent = this.agents.get(nftMint)!;
          if (existingAgent.running) {
            return res.json({
              success: false,
              message: `Agent with NFT mint ${nftMint} is already running. Stop it first before reconfiguring.`,
              nftMint,
            });
          }
        }

        // Create a new agent with the specified personality
        const cancellationToken = new CancellationToken();
        const openai = new OpenAIInference(process.env.OPENAI_API_KEY ?? "");
        const agent = new NeobotsAgent(
          { persona: personality, rationality: "100%" },
          openai
        );
        const neobotsIndexerApi = new NeobotsIndexerApi({
          apiUrl: "http://localhost:4000/graphql",
        });
        const neobotsOperator = new NeobotsOperator({
          solanaRpcUrl: this.solanaRpc,
          wallet: getTestKeypair(),
        });
        const neobotsOffChainApi = new NeobotsOffChainApi(
          "http://localhost:5000"
        );
        const neobotsAgentStatusManager = new NeobotsAgentStatusManager(
          cancellationToken
        );

        const automationAgent = new NeobotsAutomationAgent(
          {
            maxPostsFetched: 10,
            maxPostsToRead: 10,
            maxCommentsContext: 10,
            maxCommentsTail: 10,
            maxReactionsPerRound: 3,
            enableCreatePost: false,
          },
          agent,
          neobotsOperator,
          neobotsIndexerApi,
          neobotsOffChainApi,
          neobotsAgentStatusManager
        );

        try {
          if (!nftMint) {
            throw new Error("NFT mint is required");
          }
          await neobotsOperator.selectUser(new PublicKey(nftMint));
        } catch (e) {
          return res.json({
            success: false,
            message: `Error selecting user: ${e}`,
            nftMint,
          });
        }

        // Store the agent
        this.agents.set(nftMint, {
          nftMint,
          agent,
          automationAgent,
          statusManager: neobotsAgentStatusManager,
          cancellationToken,
          running: false,
          personality,
        });

        this.publishLog(
          nftMint,
          `Agent configured with personality: ${personality}`
        );

        neobotsAgentStatusManager.addCallback((status) => {
          this.publishStatus(nftMint, status);
        });

        neobotsAgentStatusManager.addInferenceCallback((inference) => {
          this.publishInference(nftMint, inference);
        });

        return res.json({
          success: true,
          message: `Agent with NFT mint ${nftMint} configured successfully`,
          nftMint,
        });
      } catch (error: any) {
        console.error(`Error configuring agent: ${error}`);
        return res.json({
          success: false,
          message: `Error configuring agent: ${error.message || error}`,
          nftMint,
        });
      }
    });

    /**
     * POST /agent/start
     * Body: { nftMint: string }
     */
    this.app.post("/agent/start", async (req, res) => {
      const { nftMint } = req.body || {};

      if (!nftMint) {
        return res.status(400).json({
          success: false,
          message: "nftMint is required in the request body",
        });
      }

      try {
        // Check if agent exists
        if (!this.agents.has(nftMint)) {
          return res.json({
            success: false,
            message: `Agent with NFT mint ${nftMint} not found. Configure it first.`,
            nftMint,
          });
        }

        const agentInstance = this.agents.get(nftMint)!;
        if (agentInstance.running) {
          return res.json({
            success: false,
            message: `Agent with NFT mint ${nftMint} is already running.`,
            nftMint,
          });
        }

        // Mark as running
        agentInstance.running = true;
        this.agents.set(nftMint, agentInstance);

        this.publishLog(nftMint, `Starting agent...`);

        // Run the agent in a separate thread to not block
        setTimeout(async () => {
          try {
            agentInstance.statusManager.reset();
            await agentInstance.automationAgent.run();
            this.publishLog(nftMint, `Agent completed run cycle`);
          } catch (error: any) {
            this.publishLog(
              nftMint,
              `Error during agent run: ${error.message || error}`
            );
          } finally {
            agentInstance.running = false;
          }
        }, 0);

        return res.json({
          success: true,
          message: `Agent with NFT mint ${nftMint} started successfully`,
          nftMint,
        });
      } catch (error: any) {
        console.error(`Error starting agent: ${error}`);
        return res.json({
          success: false,
          message: `Error starting agent: ${error.message || error}`,
          nftMint,
        });
      }
    });

    /**
     * POST /agent/stop
     * Body: { nftMint: string }
     */
    this.app.post("/agent/stop", async (req, res) => {
      const { nftMint } = req.body || {};

      if (!nftMint) {
        return res.status(400).json({
          success: false,
          message: "nftMint is required in the request body",
        });
      }

      try {
        if (!this.agents.has(nftMint)) {
          return res.json({
            success: false,
            message: `Agent with NFT mint ${nftMint} not found.`,
            nftMint,
          });
        }

        const agentInstance = this.agents.get(nftMint)!;
        if (!agentInstance.running) {
          return res.json({
            success: false,
            message: `Agent with NFT mint ${nftMint} is not running.`,
            nftMint,
          });
        }

        this.agentStatus.delete(nftMint);

        // Stop the agent
        agentInstance.running = false;
        this.agents.set(nftMint, agentInstance);
        agentInstance.cancellationToken.cancel();

        this.publishLog(nftMint, `Agent stopped`);

        return res.json({
          success: true,
          message: `Agent with NFT mint ${nftMint} stopped successfully`,
          nftMint,
        });
      } catch (error: any) {
        console.error(`Error stopping agent: ${error}`);
        return res.json({
          success: false,
          message: `Error stopping agent: ${error.message || error}`,
          nftMint,
        });
      }
    });
  }

  /**
   * Setup websocket server:
   * 1) Listen for client connections
   * 2) Handle subscribe/unsubscribe messages
   * 3) On new logs, broadcast to the relevant subscribers
   */
  private setupWebSocketHandlers() {
    this.wsServer.on("connection", (socket: WebSocket) => {
      console.log("New WebSocket client connected");

      socket.on("message", (data) => {
        let parsed;
        try {
          parsed = JSON.parse(data.toString());
        } catch (e) {
          console.warn("Invalid JSON from client:", data);
          return;
        }

        // Expecting messages like: { type: "subscribe", nftMint: "xxx" }
        // or { type: "unsubscribe", nftMint: "xxx" }
        const { type, nftMint } = parsed || {};

        if (type === "subscribe" && nftMint) {
          this.addSubscriber(nftMint, socket);
          // Optionally send ack
          socket.send(
            JSON.stringify({
              type: "subscribed",
              nftMint,
              message: `Subscribed to logs for ${nftMint}`,
            })
          );
          // Send cached logs
          this.sendCachedLogs(nftMint, socket);
          // Send cached status
          this.sendCachedStatus(nftMint, socket);
        } else if (type === "unsubscribe" && nftMint) {
          this.removeSubscriber(nftMint, socket);
          // Optionally send ack
          socket.send(
            JSON.stringify({
              type: "unsubscribed",
              nftMint,
              message: `Unsubscribed from logs for ${nftMint}`,
            })
          );
        } else {
          // Unknown message type
          console.warn("Unknown message:", parsed);
        }
      });

      socket.on("close", () => {
        // Remove this socket from all subscriptions
        this.removeAllSubscriptionsForSocket(socket);
        console.log("WebSocket client disconnected");
      });
    });
  }

  /**
   * Broadcast a log message to all subscribers for the given nftMint.
   */
  private publishLog(nftMint: string, message: string): void {
    const logMessage = {
      nftMint,
      timestamp: new Date().toISOString(),
      message,
    };
    console.log(`[${nftMint}] ${message}`);

    // Store the log message so that we can send it to new subscribers
    if (!this.publishedLogs.has(nftMint)) {
      this.publishedLogs.set(nftMint, []);
    }
    // But only keep the latest 10 logs
    this.publishedLogs.get(nftMint)!.push(logMessage);
    while (this.publishedLogs.get(nftMint)!.length > 10) {
      this.publishedLogs.get(nftMint)!.shift();
    }

    const wsSet = this.subscribers.get(nftMint);
    if (!wsSet) return;

    const payload = JSON.stringify({
      type: "log",
      ...logMessage,
    });

    for (const ws of wsSet) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  private publishStatus(nftMint: string, status: AgentStatus): void {
    this.agentStatus.set(nftMint, status);
    const payload = JSON.stringify({
      type: "status",
      ...status,
    });

    const wsSet = this.subscribers.get(nftMint);
    if (!wsSet) return;

    for (const ws of wsSet) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  private publishInference(nftMint: string, inference: string): void {
    const payload = JSON.stringify({
      type: "inference",
      inference,
    });

    const wsSet = this.subscribers.get(nftMint);
    if (!wsSet) return;

    for (const ws of wsSet) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }

  private sendCachedLogs(nftMint: string, socket: WebSocket): void {
    const wsSet = this.subscribers.get(nftMint);
    if (!wsSet) return;

    const cachedLogs = this.publishedLogs.get(nftMint) || [];
    if (cachedLogs.length === 0) return;

    for (const log of cachedLogs) {
      socket.send(
        JSON.stringify({
          type: "log",
          ...log,
        })
      );
    }
  }

  private sendCachedStatus(nftMint: string, socket: WebSocket): void {
    const status = this.agentStatus.get(nftMint);
    if (!status) return;

    socket.send(JSON.stringify({ type: "status", ...status }));
  }

  /**
   * Add a WebSocket to the subscription set for a given nftMint
   */
  private addSubscriber(nftMint: string, socket: WebSocket): void {
    if (!this.subscribers.has(nftMint)) {
      this.subscribers.set(nftMint, new Set());
    }
    this.subscribers.get(nftMint)!.add(socket);
  }

  /**
   * Remove a WebSocket from the subscription set for a given nftMint
   */
  private removeSubscriber(nftMint: string, socket: WebSocket): void {
    if (!this.subscribers.has(nftMint)) return;
    this.subscribers.get(nftMint)!.delete(socket);

    if (this.subscribers.get(nftMint)!.size === 0) {
      this.subscribers.delete(nftMint);
    }
  }

  /**
   * Remove this socket from all its subscriptions (on close).
   */
  private removeAllSubscriptionsForSocket(socket: WebSocket): void {
    for (const [mint, wsSet] of this.subscribers.entries()) {
      if (wsSet.has(socket)) {
        wsSet.delete(socket);
      }
      if (wsSet.size === 0) {
        this.subscribers.delete(mint);
      }
    }
  }
}
