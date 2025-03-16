import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BtnCreateBotComponent } from '../bots-page/btn-create-bot/btn-create-bot.component';
import { NftService } from '../../service/nft.service';
import { WalletService } from '../../service/wallet.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { ProgramService } from '../../service/program.service';
import { PublicKey } from '@solana/web3.js';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-mint-bots-page',
  imports: [
    NavbarComponent,
    BtnCreateBotComponent,
    FooterComponent,
    FormsModule,
  ],
  templateUrl: './mint-bots-page.component.html',
  styleUrl: './mint-bots-page.component.scss',
})
export class MintBotsPageComponent {
  walletConnected: boolean = false;
  maxMint?: number;
  minted?: number;
  minting: boolean = false;
  step: number = 0;
  configuring: boolean = false;
  name: string = 'neo';
  configureMintAddress?: PublicKey;
  configured: boolean = false;

  constructor(
    private programService: ProgramService,
    private nftService: NftService,
    private walletService: WalletService,
    private toast: HotToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.name = 'neo_' + this.generateRandomNumber().toString();
    if (this.route.snapshot.params['id']) {
      this.configureMintAddress = new PublicKey(
        this.route.snapshot.params['id']
      );
      this.step = 1;
    } else {
      this.step = 0;
    }

    walletService.callOrWhenReady(async () => {
      if (this.configureMintAddress) {
        const isInitialized = await this.programService.isUserInitialized(
          this.configureMintAddress
        );
        if (isInitialized) {
          this.configured = true;
        }
      }
      this.walletConnected = true;
      this.updateMaxMint();
    });
  }

  async updateMaxMint() {
    const candyMachine = await this.nftService.getCandyMachine();
    this.maxMint = candyMachine.itemsLoaded;
    this.minted = Number(candyMachine.itemsRedeemed);
  }

  generateRandomNumber() {
    return Math.floor(Math.random() * 1000000);
  }

  async mint() {
    if ((await this.nftService.getOwnedNfts()).length > 0) {
      this.toast.error('You cannot mint bots more than one bot currently', {
        position: 'bottom-right',
      });
      return;
    }
    const toast = this.toast.loading('Minting...', {
      position: 'bottom-right',
    });
    this.minting = true;
    try {
      const asset = await this.nftService.generateAssetSigner();
      this.configureMintAddress = new PublicKey(asset.publicKey.toString());
      await this.nftService.mint(asset);
      toast.close();
      this.toast.success('Minting successful', {
        position: 'bottom-right',
      });
      this.router.navigate(['/mint', this.configureMintAddress.toString()]);
    } catch (e) {
      toast.close();
      this.toast.error('Minting failed', {
        position: 'bottom-right',
      });
    } finally {
      this.minting = false;
    }
  }

  async configure() {
    if (!this.configureMintAddress) {
      this.toast.error('Mint address not found', {
        position: 'bottom-right',
      });
      return;
    }
    this.configuring = true;
    const toast = this.toast.loading('Configuring...', {
      position: 'bottom-right',
    });
    try {
      await this.programService.initializerUserWithOperator(
        this.configureMintAddress,
        '',
        this.name,
        '',
        this.programService.defaultOperator
      );
      toast.close();
      this.toast.success('Configuration successful', {
        position: 'bottom-right',
      });
      this.configured = true;
      this.router.navigate(['/bots']);
    } catch (e) {
      toast.close();
      this.toast.error('Configuration failed', {
        position: 'bottom-right',
      });
    } finally {
      this.configuring = false;
    }
  }
}
