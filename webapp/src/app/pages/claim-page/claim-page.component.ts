import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { WalletService } from '../../service/wallet.service';
import { injectConnected } from '../../lib/solana/lib/inject-connected';
import { HotToastService } from '@ngxpert/hot-toast';
import { ProgramService } from '../../service/program.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NftService } from '../../service/nft.service';
import { PublicKey } from '@solana/web3.js';

@Component({
  selector: 'app-claim-page',
  imports: [NavbarComponent, FooterComponent, FormsModule],
  templateUrl: './claim-page.component.html',
  styleUrl: './claim-page.component.scss',
})
export class ClaimPageComponent {
  walletConnected: boolean = false;
  claimableAmount: number = 0;
  claimAmount: number = 0;
  claiming: boolean = false;
  connected = injectConnected();
  callbackRemovers: (() => void)[] = [];

  constructor(
    private programService: ProgramService,
    private nftService: NftService,
    private walletService: WalletService,
    private toast: HotToastService,
    private router: Router
  ) {
    this.callbackRemovers.push(
      this.walletService.callOrWhenReady(async () => {
        this.walletConnected = true;
        await this.updateClaimableAmount();
      })
    );
    this.callbackRemovers.push(
      this.walletService.registerDisconnectCallback(() => {
        this.walletConnected = false;
      })
    );
  }

  ngOnDestroy(): void {
    for (const remover of this.callbackRemovers) {
      remover();
    }
  }

  async updateClaimableAmount() {
    const nfts = await this.nftService.getOwnedNfts();
    this.claimableAmount = await this.programService.getClaimableAmount(
      new PublicKey(nfts[0].publicKey)
    );
    this.claimableAmount = this.claimableAmount / this.programService.tokenUnit;
    this.claimAmount = this.claimableAmount;
  }

  async claim() {
    if (this.claimAmount <= 0) {
      this.toast.error('Please enter a valid amount to claim', {
        position: 'bottom-right',
      });
      return;
    }

    if (this.claimAmount > this.claimableAmount) {
      this.toast.error('Cannot claim more than available amount', {
        position: 'bottom-right',
      });
      return;
    }

    const toast = this.toast.loading('Claiming...', {
      position: 'bottom-right',
    });
    this.claiming = true;

    try {
      const splTokenMint = await this.programService.getSplTokenMint();
      const nfts = await this.nftService.getOwnedNfts();
      const userNftMint = new PublicKey(nfts[0].publicKey);

      await this.programService.claim(splTokenMint, userNftMint);

      await this.updateClaimableAmount();
      this.claimAmount = 0;

      toast.close();
      this.toast.success('Claim successful', {
        position: 'bottom-right',
      });
    } catch (e) {
      toast.close();
      this.toast.error('Claim failed', {
        position: 'bottom-right',
      });
    } finally {
      this.claiming = false;
    }
  }
}
