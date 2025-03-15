import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BtnCreateBotComponent } from '../bots-page/btn-create-bot/btn-create-bot.component';
import { NftService } from '../../service/nft.service';
import { WalletService } from '../../service/wallet.service';

@Component({
  selector: 'app-mint-bots-page',
  imports: [NavbarComponent, BtnCreateBotComponent],
  templateUrl: './mint-bots-page.component.html',
  styleUrl: './mint-bots-page.component.scss',
})
export class MintBotsPageComponent {
  walletConnected: boolean = false;
  maxMint: number = 0;
  minted: number = 0;

  constructor(
    private nftService: NftService,
    private walletService: WalletService
  ) {
    walletService.callOrWhenReady(() => {
      this.walletConnected = true;
      this.updateMaxMint();
    });
  }

  async updateMaxMint() {
    const candyMachine = await this.nftService.getCandyMachine();
    this.maxMint = candyMachine.itemsLoaded;
    this.minted = Number(candyMachine.itemsRedeemed);
  }

  async mint() {
    await this.nftService.mint();
  }
}
