import { Injectable, inject } from '@angular/core';
import { Wallet, WalletStore } from '../lib/solana/lib/wallet.store';
import { ConnectionStore } from '../lib/solana/lib/connection.store';
import { injectWallets } from '../lib/solana/lib/inject-wallets';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { firstValueFrom } from 'rxjs';
import { AnchorProvider, setProvider } from '@coral-xyz/anchor';
import { injectPublicKey } from '../lib/solana/lib/inject-public-key';
import { injectConnected } from '../lib/solana/lib/inject-connected';
import { NftService } from './nft.service';
import { ProgramService } from './program.service';
import { Connection, Keypair } from '@solana/web3.js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  readonly connected = injectConnected();
  readonly publicKey = injectPublicKey();
  readonly walletStore = inject(WalletStore);
  readonly connectionStore = inject(ConnectionStore);
  readonly wallets = injectWallets();

  callbacks: (() => void)[] = [];

  constructor(
    private nftService: NftService,
    private programService: ProgramService
  ) {
    setProvider(
      new AnchorProvider(new Connection(environment.solana.rpcUrl), {} as any, {
        commitment: 'confirmed',
      })
    );
  }

  callOrWhenReady(fn: () => void) {
    if (this.connected()) {
      fn();
    } else {
      this.callbacks.push(fn);
    }
  }

  getPublicKey(shrink: boolean = false): string {
    const publicKey = this.publicKey();
    if (publicKey) {
      if (shrink) {
        return (
          publicKey.toBase58().slice(0, 6) +
          '...' +
          publicKey.toBase58().slice(-6)
        );
      }
      return publicKey.toBase58();
    }
    return '';
  }

  async getInstalledWallets(): Promise<Wallet[]> {
    return this.wallets().filter(
      (wallet) => wallet.readyState === WalletReadyState.Installed
    );
  }

  async connectWallet(wallet: Wallet): Promise<void> {
    this.connectionStore.setEndpoint(environment.solana.rpcUrl);

    this.walletStore.selectWallet(wallet.adapter.name);
    await firstValueFrom(this.walletStore.connect(), {
      defaultValue: undefined,
    });

    const anchorWallet = await firstValueFrom(this.walletStore.anchorWallet$);
    const connection = await firstValueFrom(this.connectionStore.connection$);
    const anchorProvider = new AnchorProvider(connection!, anchorWallet!, {
      commitment: 'confirmed',
    });
    this.nftService.setAnchorProvider(anchorProvider);
    this.programService.setAnchorProvider(anchorProvider);

    this.callbacks.forEach((fn) => fn());
    this.callbacks = [];
  }

  async disconnectWallet(): Promise<void> {
    await firstValueFrom(this.walletStore.disconnect(), {
      defaultValue: undefined,
    });
  }

  async signMessage(message: string): Promise<string> {
    const messageUint8Array = new TextEncoder().encode(message);
    const signature = await firstValueFrom(
      this.walletStore.signMessage(messageUint8Array)!
    );
    // base64
    return this.uint8ArrayToBase64(signature);
  }

  uint8ArrayToBase64(uint8Array: Uint8Array) {
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }
}
