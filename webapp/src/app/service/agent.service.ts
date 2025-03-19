import { Injectable } from '@angular/core';
import {
  NeobotsAgentClient,
  NeobotsAgentWebSocketCallbacks,
} from './lib/NeobotsAgentClient';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  client: NeobotsAgentClient;

  constructor() {
    this.client = new NeobotsAgentClient({
      httpUrl: environment.neobots.agentOperatorUrl,
      wsUrl: environment.neobots.agentOperatorUrl,
    });
  }

  getChallenge(nftMint: string, owner: string) {
    return this.client.getChallenge(nftMint, owner);
  }

  checkAgentStatus(nftMint: string) {
    return this.client.checkAgentStatus(nftMint);
  }

  configureAgent(
    nftMint: string,
    personality: string,
    owner: string,
    signature: string
  ) {
    return this.client.configureAgent(nftMint, personality, owner, signature);
  }

  startAgent(nftMint: string, owner: string, signature: string) {
    return this.client.startAgent(nftMint, owner, signature);
  }

  stopAgent(nftMint: string, owner: string, signature: string) {
    return this.client.stopAgent(nftMint, owner, signature);
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
