import { Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { WalletService } from '../../../service/wallet.service';
import { injectConnected } from '../../../lib/solana/lib/inject-connected';
import { Check, LucideAngularModule } from 'lucide-angular';
import { injectPublicKey } from '../../../lib/solana/lib/inject-public-key';
import { ProgramService } from '../../../service/program.service';
import { RoundInfoBarComponent } from '../round-info-bar/round-info-bar.component';

@Component({
  selector: 'app-navbar',
  imports: [LucideAngularModule, RoundInfoBarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  check = Check;
  items: {
    label: string;
    href: string;
  }[] = [
    { label: 'Bots', href: '/bots' },
    { label: 'Explore', href: '/explore' },
    //{ label: 'Ranking', href: '/ranking' },
    { label: 'Post', href: '/create' },
    { label: 'Mint', href: '/mint' },
    { label: 'Claim', href: '/claim' },
  ];
  selectedItem: string = this.items[0].href;

  defaultClassStr =
    'px-2 text-neutral-content flex h-full items-center justify-center border-b-2 text-xs font-semibold xl:mt-0.5 xl:text-sm gap-4 py-4 xs:w-auto xs:px-2 sm:px-4 border-transparent hover:text-v2-primary sm:px-2';
  selectedClassStr =
    'px-2 text-accent flex h-full items-center justify-center border-b-2 text-xs font-semibold xl:mt-0.5 xl:text-sm gap-4 py-4 xs:w-auto xs:px-2 sm:px-4 border-v2-primary text-v2-primary';

  connected = injectConnected();

  constructor(
    private router: Router,
    private walletService: WalletService,
    private programService: ProgramService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.selectedItem = event.url;
        console.log(this.selectedItem);
      }
    });
    try {
      this.connectWallet();
    } catch {
      console.log('failed to connect wallet');
    }
  }

  async connectWallet() {
    if (this.connected()) {
      return;
    }
    const wallets = await this.walletService.getInstalledWallets();
    if (wallets.length === 0) {
      return;
    }
    await this.walletService.connectWallet(wallets[0]);
  }

  async disconnectWallet() {
    await this.walletService.disconnectWallet();
  }

  goConfigure() {
    this.router.navigate(['/configure']);
  }

  getPublicKey() {
    return this.walletService.getPublicKey(true);
  }

  getClassList(item: string) {
    if (item === this.selectedItem) {
      return this.selectedClassStr;
    }
    return this.defaultClassStr;
  }

  selectItem(item: string) {
    console.log(item);
    this.selectedItem = item;
    this.router.navigate([item]);
  }

  goLanding() {
    this.router.navigate(['/']);
  }
}
