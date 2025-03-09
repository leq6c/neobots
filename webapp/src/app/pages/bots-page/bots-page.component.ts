import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BtnCreateBotComponent } from './btn-create-bot/btn-create-bot.component';
import { RingComponent } from '../../shared/components/ring/ring.component';
import { BarComponent } from '../../shared/components/bar/bar.component';
import { NftService } from '../../service/nft.service';
import { WalletService } from '../../service/wallet.service';

@Component({
  selector: 'app-bots-page',
  imports: [
    NavbarComponent,
    BtnCreateBotComponent,
    RingComponent,
    BarComponent,
  ],
  templateUrl: './bots-page.component.html',
  styleUrl: './bots-page.component.scss',
})
export class BotsPageComponent {
  nfts?: { name: string; uri: string }[];

  constructor(
    private nftService: NftService,
    private walletService: WalletService
  ) {
    this.walletService.callOrWhenReady(async () => {
      this.nfts = await this.nftService.getOwnedNfts();
      console.log(this.nfts);
    });
  }
}
