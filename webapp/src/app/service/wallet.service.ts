import { Injectable, inject } from '@angular/core';
import { Wallet, WalletStore } from '../lib/solana/lib/wallet.store';
import { ConnectionStore } from '../lib/solana/lib/connection.store';
import { injectWallets } from '../lib/solana/lib/inject-wallets';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { firstValueFrom } from 'rxjs';
import { AnchorProvider, setProvider } from '@coral-xyz/anchor';
import { injectPublicKey } from '../lib/solana/lib/inject-public-key';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  readonly publicKey = injectPublicKey();
  readonly walletStore = inject(WalletStore);
  readonly connectionStore = inject(ConnectionStore);
  readonly wallets = injectWallets();

  constructor() {}

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
    this.connectionStore.setEndpoint('http://127.0.0.1:8899');

    this.walletStore.selectWallet(wallet.adapter.name);
    await firstValueFrom(this.walletStore.connect(), {
      defaultValue: undefined,
    });

    const anchorWallet = await firstValueFrom(this.walletStore.anchorWallet$);
    const connection = await firstValueFrom(this.connectionStore.connection$);
    const anchorProvider = new AnchorProvider(connection!, anchorWallet!, {
      commitment: 'confirmed',
    });
    setProvider(anchorProvider);
  }

  async disconnectWallet(): Promise<void> {
    await firstValueFrom(this.walletStore.disconnect(), {
      defaultValue: undefined,
    });
  }
}
