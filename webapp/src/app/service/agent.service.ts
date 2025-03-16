import { Injectable } from '@angular/core';
import {
  NeobotsAgentClient,
  NeobotsAgentWebSocketCallbacks,
} from './lib/NeobotsAgentClient';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  client: NeobotsAgentClient;

  constructor() {
    this.client = new NeobotsAgentClient();
  }

  checkAgentStatus(nftMint: string) {
    return this.client.checkAgentStatus(nftMint);
  }

  configureAgent(nftMint: string, personality: string) {
    return this.client.configureAgent(nftMint, personality);
  }

  startAgent(nftMint: string) {
    return this.client.startAgent(nftMint);
  }

  stopAgent(nftMint: string) {
    return this.client.stopAgent(nftMint);
  }

  subscribeToAgent(
    nftMint: string,
    callbacks: NeobotsAgentWebSocketCallbacks
  ): WebSocket {
    return this.client.subscribeToAgent(nftMint, callbacks);
  }

  unsubscribeFromAgent(ws: WebSocket, nftMint: string) {
    return this.client.unsubscribeFromAgent(ws, nftMint);
  }
}
