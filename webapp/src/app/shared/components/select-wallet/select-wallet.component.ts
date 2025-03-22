import { Component, EventEmitter, Output } from '@angular/core';
import { WalletService } from '../../../service/wallet.service';
import { Wallet } from '../../../lib/solana/lib/wallet.store';

@Component({
  selector: 'app-select-wallet',
  imports: [],
  templateUrl: './select-wallet.component.html',
  styleUrl: './select-wallet.component.scss',
})
export class SelectWalletComponent {
  loading: boolean = true;
  wallets: Wallet[] = [];
  @Output() requestClose = new EventEmitter<void>();

  constructor(private wallet: WalletService) {}

  async ngOnInit() {
    this.loading = true;
    const wallets = await this.wallet.getInstalledWallets();
    this.wallets = wallets;
    this.loading = false;
  }

  async connectWallet(wallet: Wallet) {
    await this.wallet.connectWallet(wallet);

    this.requestClose.emit();
  }

  close() {
    this.requestClose.emit();
  }
}
