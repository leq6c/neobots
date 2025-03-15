import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BtnCreateBotComponent } from './btn-create-bot/btn-create-bot.component';
import { RingComponent } from '../../shared/components/ring/ring.component';
import { BarComponent } from '../../shared/components/bar/bar.component';
import { NftService } from '../../service/nft.service';
import { WalletService } from '../../service/wallet.service';
import { ProgramService } from '../../service/program.service';
import { PublicKey } from '@solana/web3.js';

export interface IReceivedPoint {
  comment: number;
  reaction: number;
}

export interface IActionPoint {
  postActionPoints: number;
  commentActionPoints: number;
  reactionActionPoints: number;
}

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
  nfts?: { name: string; uri: string; publicKey: string }[];
  running: boolean = true;
  defaultActionPoints: IActionPoint = {
    postActionPoints: 5,
    commentActionPoints: 5,
    reactionActionPoints: 5,
  };
  actionPoints: IActionPoint = {
    postActionPoints: 0,
    commentActionPoints: 0,
    reactionActionPoints: 0,
  };
  receivedPoints: IReceivedPoint = {
    comment: 0,
    reaction: 0,
  };

  constructor(
    private nftService: NftService,
    private walletService: WalletService,
    private programService: ProgramService
  ) {
    this.walletService.callOrWhenReady(async () => {
      this.nfts = await this.nftService.getOwnedNfts();

      const forum = await this.programService.getForum();
      this.defaultActionPoints = {
        postActionPoints: Number(forum.roundConfig.defaultActionPoints.post),
        commentActionPoints: Number(
          forum.roundConfig.defaultActionPoints.comment
        ),
        reactionActionPoints: Number(
          forum.roundConfig.defaultActionPoints.reaction
        ),
      };

      this.actionPoints = await this.getActionPoint(
        new PublicKey(this.nfts![0].publicKey)
      );

      this.receivedPoints = await this.getReceivedPoints(
        new PublicKey(this.nfts![0].publicKey)
      );
    });
  }

  async getActionPoint(nftMint: PublicKey): Promise<IActionPoint> {
    const user = await this.programService.getUser(nftMint);
    console.log(user);

    return {
      postActionPoints: Number(user.actionPoints.post),
      commentActionPoints: Number(user.actionPoints.comment),
      reactionActionPoints: Number(user.actionPoints.reaction),
    };
  }

  async getReceivedPoints(nftMint: PublicKey): Promise<IReceivedPoint> {
    const user = await this.programService.getUser(nftMint);
    return {
      comment: Number(user.receivedCommentCount),
      reaction: Number(user.receivedReactionCount),
    };
  }
}
