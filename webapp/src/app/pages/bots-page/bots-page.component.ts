import { Component, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BtnCreateBotComponent } from './btn-create-bot/btn-create-bot.component';
import { RingComponent } from '../../shared/components/ring/ring.component';
import { BarComponent } from '../../shared/components/bar/bar.component';
import { NftService } from '../../service/nft.service';
import { WalletService } from '../../service/wallet.service';
import { ProgramService } from '../../service/program.service';
import { PublicKey } from '@solana/web3.js';
import { AgentService } from '../../service/agent.service';
import {
  AgentInference,
  AgentStatusResponse,
  AgentStatusUpdate,
  ChallengeResponse,
  NeobotsAgentWebSocketCallbacks,
} from '../../service/lib/NeobotsAgentClient';
import { FormsModule } from '@angular/forms';
import { SampleRunningStatus } from './SampleRunningStatus';
import {
  BookText,
  LucideAngularModule,
  MessageCircleMore,
} from 'lucide-angular';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ThumbnailPickerComponent } from '../../shared/components/thumbnail-picker/thumbnail-picker.component';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HotToastService } from '@ngxpert/hot-toast';

export interface IReceivedPoint {
  comment: number;
  upvote: number;
  downvote: number;
  like: number;
  banvote: number;
}

export interface IActionPoint {
  postActionPoints: number;
  commentActionPoints: number;
  upvoteActionPoints: number;
  downvoteActionPoints: number;
  likeActionPoints: number;
  banvoteActionPoints: number;
}

@Component({
  selector: 'app-bots-page',
  imports: [
    NavbarComponent,
    BtnCreateBotComponent,
    RingComponent,
    BarComponent,
    LucideAngularModule,
    FormsModule,
    FooterComponent,
    ThumbnailPickerComponent,
    CommonModule,
  ],
  templateUrl: './bots-page.component.html',
  styleUrl: './bots-page.component.scss',
})
export class BotsPageComponent implements OnDestroy {
  bookText = BookText;
  messageCircleMore = MessageCircleMore;

  nfts?: { name: string; uri: string; publicKey: string }[];
  defaultActionPoints: IActionPoint = {
    postActionPoints: 5,
    commentActionPoints: 5,
    upvoteActionPoints: 5,
    downvoteActionPoints: 5,
    likeActionPoints: 5,
    banvoteActionPoints: 5,
  };
  actionPoints: IActionPoint = {
    postActionPoints: 0,
    commentActionPoints: 0,
    upvoteActionPoints: 0,
    downvoteActionPoints: 0,
    likeActionPoints: 0,
    banvoteActionPoints: 0,
  };
  receivedPoints: IReceivedPoint = {
    comment: 0,
    upvote: 0,
    downvote: 0,
    like: 0,
    banvote: 0,
  };
  agentConfiguredStatus?: AgentStatusResponse;
  agentRunningStatus?: AgentStatusUpdate;

  loaded: boolean = false;
  selectedNft?: { name: string; uri: string; publicKey: string };
  name: string = '';
  personality: string = '';

  inference: string = '';

  stopping: boolean = false;
  agentRunningStatusWhileStopping: AgentStatusUpdate | undefined;
  userNotInitialized: boolean = false;
  editing: boolean = false;
  ws?: WebSocket;

  lastChallenge?: ChallengeResponse;
  lastChallengeSignature?: string;

  constructor(
    private nftService: NftService,
    private walletService: WalletService,
    private programService: ProgramService,
    private agentService: AgentService,
    private toastService: HotToastService,
    private router: Router
  ) {
    this.walletService.callOrWhenReady(async () => {
      this.nfts = await this.nftService.getOwnedNfts();

      if (this.nfts.length == 0) {
        this.loaded = true;
        return;
      }

      const forum = await this.programService.getForum();
      this.defaultActionPoints = {
        postActionPoints: Number(forum.roundConfig.defaultActionPoints.post),
        commentActionPoints: Number(
          forum.roundConfig.defaultActionPoints.comment
        ),
        upvoteActionPoints: Number(
          forum.roundConfig.defaultActionPoints.upvote
        ),
        downvoteActionPoints: Number(
          forum.roundConfig.defaultActionPoints.downvote
        ),
        likeActionPoints: Number(forum.roundConfig.defaultActionPoints.like),
        banvoteActionPoints: Number(
          forum.roundConfig.defaultActionPoints.banvote
        ),
      };

      this.selectedNft = this.nfts![0];

      if (
        !(await this.programService.isUserInitialized(
          new PublicKey(this.selectedNft!.publicKey)
        ))
      ) {
        this.router.navigate(['/mint', this.selectedNft!.publicKey]);
        return;
      }

      const user = await this.programService.getUser(
        new PublicKey(this.selectedNft!.publicKey)
      );

      this.name = user.name;

      this.actionPoints = await this.getActionPoint(
        new PublicKey(this.selectedNft!.publicKey)
      );

      this.receivedPoints = await this.getReceivedPoints(
        new PublicKey(this.selectedNft!.publicKey)
      );

      this.agentConfiguredStatus = await this.agentService.checkAgentStatus(
        this.selectedNft!.publicKey
      );

      this.personality = this.agentConfiguredStatus?.personality || '';

      this.ws = this.agentService.subscribeToAgent(
        this.selectedNft!.publicKey,
        {
          onStatus: (status) => {
            if (this.stopping) {
              this.agentRunningStatusWhileStopping = status;
              return;
            }
            this.onAgentStatus(status);
          },
          onInference: (inference) => {
            this.onAgentInference(inference);
          },
        }
      );

      this.loaded = true;
    });
  }

  ngOnDestroy(): void {
    if (this.ws) {
      this.agentService.unsubscribeFromAgent(
        this.ws,
        this.selectedNft!.publicKey
      );
      try {
        this.ws.close();
        this.ws = undefined;
      } catch (e) {
        console.error(e);
      }
    }
  }

  addTest() {
    if (this.agentRunningStatus?.actions.length == 1) {
      this.agentRunningStatus?.actions.push({
        id: '4b9ef437-904b-47bd-a8a2-f74e7203e796',
        type: 'createPost',
        status: 'closed',
        current: 0,
        total: 0,
        message: 'ahahahah',
      });
    } else {
      this.agentRunningStatus?.actions.splice(0, 1);
    }
  }

  onAgentStatus(status: AgentStatusUpdate) {
    if (
      status.actions.length >= 2 &&
      (!status.actions[0].targetContent || !status.actions[1].targetContent)
    ) {
      console.log('missing');
    }
    this.agentRunningStatus = status;
    console.log(status);
  }

  onAgentInference(inference: AgentInference) {
    this.inference += inference.inference;
    if (this.inference.length > 30) {
      // get last 30 characters
      this.inference = this.inference.slice(-30);
    }
  }

  async getActionPoint(nftMint: PublicKey): Promise<IActionPoint> {
    const user = await this.programService.getUser(nftMint);
    console.log(user);

    return {
      postActionPoints: Number(user.actionPoints.post),
      commentActionPoints: Number(user.actionPoints.comment),
      upvoteActionPoints: Number(user.actionPoints.upvote),
      downvoteActionPoints: Number(user.actionPoints.downvote),
      likeActionPoints: Number(user.actionPoints.like),
      banvoteActionPoints: Number(user.actionPoints.banvote),
    };
  }

  async getReceivedPoints(nftMint: PublicKey): Promise<IReceivedPoint> {
    const user = await this.programService.getUser(nftMint);
    return {
      comment: Number(user.receivedCommentCount),
      upvote: Number(user.receivedUpvoteCount),
      downvote: Number(user.receivedDownvoteCount),
      like: Number(user.receivedLikeCount),
      banvote: Number(user.receivedBanvoteCount),
    };
  }

  async getChallengeSignature(): Promise<string> {
    if (this.lastChallenge && this.lastChallengeSignature) {
      if (new Date(this.lastChallenge.expiresAt) > new Date()) {
        return this.lastChallengeSignature;
      } else {
        this.lastChallenge = undefined;
        this.lastChallengeSignature = undefined;
      }
    }

    this.lastChallenge = await this.agentService.getChallenge(
      this.selectedNft!.publicKey,
      this.walletService.publicKey()!.toString()
    );

    this.lastChallengeSignature = await this.walletService.signMessage(
      this.lastChallenge.challenge
    );

    return this.lastChallengeSignature;
  }

  async startAgent() {
    if (!this.selectedNft) {
      return;
    }

    const signature = await this.getChallengeSignature();

    await this.agentService.configureAgent(
      this.selectedNft!.publicKey,
      this.personality,
      this.walletService.publicKey()!.toString(),
      signature
    );

    await this.agentService.startAgent(
      this.selectedNft!.publicKey,
      this.walletService.publicKey()!.toString(),
      signature
    );
  }

  async stopAgent() {
    if (!this.selectedNft) {
      return;
    }

    const signature = await this.getChallengeSignature();

    this.stopping = true;
    await this.agentService.stopAgent(
      this.selectedNft!.publicKey,
      this.walletService.publicKey()!.toString(),
      signature
    );
    setTimeout(() => {
      this.stopping = false;
      if (this.agentRunningStatusWhileStopping) {
        this.agentRunningStatus = this.agentRunningStatusWhileStopping;
        this.agentRunningStatusWhileStopping = undefined;
      }
    }, 10 * 1000);
  }

  isActionRunning(idx: number) {
    const action = this.agentRunningStatus?.actions[idx];
    if (!action) {
      return false;
    }
    return action.status == 'running';
  }

  hasActionStatus(idx: number) {
    const action = this.agentRunningStatus?.actions[idx];
    if (!action) {
      return false;
    }
    return true;
  }

  getActionStatusPercentage(idx: number) {
    const action = this.agentRunningStatus?.actions[idx];
    if (!action) {
      return 0;
    }

    if (action.total && action.current) {
      return Math.round((action.current! / action.total!) * 100);
    } else {
      return 0;
    }
  }

  isActionStatusIndeterminate(idx: number) {
    const action = this.agentRunningStatus?.actions[idx];
    if (!action) {
      return false;
    }
    return action.total == undefined || action.total == 0;
  }

  getActionStatusText(idx: number) {
    const action = this.agentRunningStatus?.actions[idx];
    if (!action) {
      return '';
    }
    let message = action.message;
    if (!message) {
      message = 'Loading...';
    }

    if (action.status === 'closed' || action.status === 'success') {
      message = '✅ ' + message;
    }

    let percentage = 0;

    if (action.status === 'closed' || action.status === 'success') {
      return message;
    }

    if (action.total && action.current) {
      percentage = Math.round((action.current! / action.total!) * 100);
      return `[${percentage}%] ${message}`;
    } else {
      return `[...] ${message}`;
    }
  }

  hasAnyTargetContent() {
    if (!this.agentRunningStatus) {
      return false;
    }
    for (let i = 0; i < this.agentRunningStatus?.actions.length; i++) {
      if (this.hasTargetContent(i)) {
        return true;
      }
    }
    return false;
  }

  hasTargetContent(idx: number) {
    const action = this.agentRunningStatus?.actions[idx];
    if (!action) {
      return false;
    }
    if (!action.targetContent) {
      return false;
    }
    if (action.targetContent?.trim() == '') {
      return false;
    }
    return true;
  }

  getTargetContent(idx: number) {
    const action = this.agentRunningStatus?.actions[idx];
    if (!action) {
      return '';
    }
    return action.targetContent;
  }

  getTargetHref(idx: number) {
    const action = this.agentRunningStatus?.actions[idx];
    if (!action) {
      return '';
    }
    return 'http://localhost:4200/post/' + action.targetPda;
  }
}
