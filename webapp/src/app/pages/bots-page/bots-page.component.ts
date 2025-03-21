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
import { IconComponent } from '../../exp/shared/icon/icon.component';
import { ButtonComponent } from '../../exp/shared/button/button.component';
import { CryptoStatsComponent } from '../../exp/components/crypto-stats/crypto-stats.component';
import { CommentsPanelComponent } from '../../exp/components/comments-panel/comments-panel.component';
import { RewardsPanelComponent } from '../../exp/components/rewards-panel/rewards-panel.component';
import { TokenTickerComponent } from '../../exp/components/token-ticker/token-ticker.component';
import { ProfileCardComponent } from '../../exp/components/profile-card/profile-card.component';
import { MatrixCanvasComponent } from '../../exp/components/matrix-canvas/matrix-canvas.component';
import { HeaderComponent } from '../../exp/components/header/header.component';
import { Observable } from 'rxjs';
import { DataService } from '../../exp/services/data.service';
import { IActionPoint } from '../../exp/models/action-point.model';

export interface IReceivedPoint {
  comment: number;
  upvote: number;
  downvote: number;
  like: number;
  banvote: number;
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
    IconComponent,
    ButtonComponent,
    CryptoStatsComponent,
    CommentsPanelComponent,
    RewardsPanelComponent,
    TokenTickerComponent,
    ProfileCardComponent,
    MatrixCanvasComponent,
    HeaderComponent,
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
  name: string = 'Unknown';
  personality: string = '';

  inference: string = '';

  starting: boolean = false;
  stopping: boolean = false;
  agentRunningStatusWhileStopping: AgentStatusUpdate | undefined;
  userNotInitialized: boolean = false;
  editing: boolean = false;
  ws?: WebSocket;

  lastChallenge?: ChallengeResponse;
  lastChallengeSignature?: string;

  callbackRemovers: (() => void)[] = [];

  updaterIntervals: any[] = [];

  constructor(
    private nftService: NftService,
    private walletService: WalletService,
    private programService: ProgramService,
    private agentService: AgentService,
    private toastService: HotToastService,
    private router: Router,
    private dataService: DataService
  ) {
    this.callbackRemovers.push(
      this.walletService.callOrWhenReady(async () => {
        console.log(Number((await this.programService.getUserCounter()).count));
        this.nfts = await this.nftService.getOwnedNfts();

        if (this.nfts.length == 0) {
          this.loaded = true;
          return;
        }

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

        await this.updateActionPoints();

        this.receivedPoints = await this.getReceivedPoints(
          new PublicKey(this.selectedNft!.publicKey)
        );

        this.agentConfiguredStatus = await this.agentService.checkAgentStatus(
          this.selectedNft!.publicKey
        );

        this.personality = this.agentConfiguredStatus?.personality || 'default';

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

        this.dataService.setUser(
          this.programService
            .getUserPda(new PublicKey(this.selectedNft!.publicKey))
            .toString(),
          this.selectedNft!.publicKey
        );

        this.loaded = true;
      })
    );

    this.callbackRemovers.push(
      this.walletService.registerDisconnectCallback(() => {
        this.loaded = false;
      })
    );

    let updatingDataService = false;

    this.updaterIntervals.push(
      setInterval(async () => {
        if (updatingDataService) return;

        updatingDataService = true;
        try {
          await this.dataService.updateComments();
          await this.dataService.updateRewards();
        } catch {}

        updatingDataService = false;
      }, 1000 * 5) // 5 seconds
    );

    let updatingActionPoints = false;

    this.updaterIntervals.push(
      setInterval(async () => {
        if (updatingActionPoints) return;

        updatingActionPoints = true;
        try {
          await this.updateActionPoints();
        } catch {}
        updatingActionPoints = false;
      }, 1000 * 10) // 10 seconds
    );
  }

  ngOnDestroy(): void {
    for (const remover of this.callbackRemovers) {
      remover();
    }
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
    for (const interval of this.updaterIntervals) {
      clearInterval(interval);
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
    if (this.inference.length > 60) {
      // get last 30 characters
      this.inference = this.inference.slice(-60);
    }
  }

  async updateActionPoints() {
    const aps = await this.programService.simulateResetUserActionPoints(
      new PublicKey(this.selectedNft!.publicKey)
    );

    this.defaultActionPoints = {
      commentActionPoints: aps.default.comment,
      postActionPoints: aps.default.post,
      upvoteActionPoints: aps.default.upvote,
      downvoteActionPoints: aps.default.downvote,
      likeActionPoints: aps.default.like,
      banvoteActionPoints: aps.default.banvote,
    };

    this.actionPoints = {
      commentActionPoints: aps.user.comment,
      postActionPoints: aps.user.post,
      upvoteActionPoints: aps.user.upvote,
      downvoteActionPoints: aps.user.downvote,
      likeActionPoints: aps.user.like,
      banvoteActionPoints: aps.user.banvote,
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

    const toast = this.toastService.loading('Requesting challenge...', {
      position: 'bottom-right',
    });

    try {
      this.lastChallenge = await this.agentService.getChallenge(
        this.selectedNft!.publicKey,
        this.walletService.publicKey()!.toString()
      );

      this.lastChallengeSignature = await this.walletService.signMessage(
        this.lastChallenge.challenge
      );

      return this.lastChallengeSignature;
    } catch (e: any) {
      this.toastService.error('Failed to request challenge, please try again', {
        position: 'bottom-right',
      });
      throw e;
    } finally {
      toast.close();
    }
  }

  async startAgent() {
    if (!this.selectedNft) {
      return;
    }

    if (!this.personality) {
      this.toastService.error('Please enter a personality');
      return;
    }

    let toast;

    try {
      this.starting = true;
      const signature = await this.getChallengeSignature();

      toast = this.toastService.loading('Configuring agent...', {
        position: 'bottom-right',
      });
      let result = await this.agentService.configureAgent(
        this.selectedNft!.publicKey,
        this.personality,
        this.walletService.publicKey()!.toString(),
        signature
      );
      if (!result.success) {
        this.toastService.error(result.message);
        return;
      }

      result = await this.agentService.startAgent(
        this.selectedNft!.publicKey,
        this.walletService.publicKey()!.toString(),
        signature
      );
      if (!result.success) {
        this.toastService.error(result.message);
        return;
      }

      this.toastService.success('Agent configured successfully', {
        position: 'bottom-right',
      });
    } catch (e: any) {
      if (e.toString().includes('Error verifying challenge')) {
        this.lastChallenge = undefined;
        this.lastChallengeSignature = undefined;
        this.toastService.error('Failed to verify challenge, please try again');
      } else {
        this.toastService.error(e.toString());
      }
    } finally {
      toast?.close();
      setTimeout(() => {
        this.starting = false;
      }, 3000);
    }
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
    return 'post/' + action.targetPda;
  }

  glitchEffect$!: Observable<boolean>;
  showComments$!: Observable<boolean>;
  showRewards$!: Observable<boolean>;

  ngOnInit(): void {
    this.glitchEffect$ = this.dataService.glitchEffect$;
    this.showComments$ = this.dataService.showComments$;
    this.showRewards$ = this.dataService.showRewards$;
  }

  toggleShowComments(): void {
    this.dataService.toggleShowComments();
  }

  toggleShowRewards(): void {
    this.dataService.toggleShowRewards();
  }

  getRandomPosition(): number {
    return Math.random() * 100;
  }

  getRandomOpacity(): number {
    return Math.random();
  }
}
