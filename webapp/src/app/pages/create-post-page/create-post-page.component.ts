import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { NftService } from '../../service/nft.service';
import { FormsModule } from '@angular/forms';
import { ProgramService } from '../../service/program.service';
import { WalletService } from '../../service/wallet.service';
import { PublicKey } from '@solana/web3.js';
import { CommonModule } from '@angular/common';
import { IndexerService } from '../../service/indexer.service';
import { OffChainService } from '../../service/off-chain.service';
import { PostEditorComponent } from './post-editor/post-editor.component';
import { CommentSectionComponent } from './comment-section/comment-section.component';
import { Comment } from '../../shared/models/post.model';
import { HotToastService } from '@ngxpert/hot-toast';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-create-post-page',
  imports: [
    NavbarComponent,
    FormsModule,
    CommonModule,
    PostEditorComponent,
    CommentSectionComponent,
    FooterComponent,
  ],
  templateUrl: './create-post-page.component.html',
  styleUrl: './create-post-page.component.scss',
})
export class CreatePostPageComponent {
  placeholder: string = 'Write to unleash your idea to Neobots.';
  content: string = '';
  posting: boolean = false;
  posted: boolean = false;
  comments: Comment[] = [];
  walletConnected: boolean = false;
  hasNft: boolean = false;
  callbackRemovers: (() => void)[] = [];

  constructor(
    private walletService: WalletService,
    private nftService: NftService,
    private program: ProgramService,
    private indexer: IndexerService,
    private offChain: OffChainService,
    private toast: HotToastService
  ) {
    this.callbackRemovers.push(
      this.walletService.callOrWhenReady(async () => {
        this.hasNft = (await this.nftService.getOwnedNfts()).length > 0;
        this.walletConnected = true;
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

  async post() {
    try {
      this.comments = [];
      this.posting = true;
      await this._post();

      this.toast.show('Post created successfully', {
        icon: '✅',
        position: 'bottom-right',
      });
    } catch {
      this.toast.show('Failed to create post', {
        icon: '✖',
        position: 'bottom-right',
      });
    } finally {
      this.posting = false;
    }
  }

  async _post() {
    if (this.posted) return;

    const nft = (await this.nftService.getOwnedNfts())[0]!;
    const sig = await this.program.createPost(
      new PublicKey(nft.publicKey),
      await this.putOffchainData(this.content),
      'default'
    );
    this.posted = true;

    // wait for the transaction to be confirmed
    await this.program.confirmTransaction(sig);

    const post = await this.program.getPostWithSignature(sig);

    if (!post) {
      throw new Error('Post not found');
    }

    const postPda = new PublicKey(post.postPda);

    // @TODO: this is hacky. need fix later
    const waitAndFetch = async () => {
      this.program.waitForChanges(async () => {
        setTimeout(async () => {
          const previousCommentsCount = this.comments.length;
          while (this.comments.length == previousCommentsCount) {
            await this.fetchComments(postPda);
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
          setTimeout(async () => {
            waitAndFetch();
          }, 1000);
        }, 1000);
      }, new PublicKey(post.postPda));
    };

    waitAndFetch();
  }

  async fetchComments(postPda: PublicKey) {
    console.log('fetching comments');
    const comments = await this.indexer.getComments({
      target: postPda.toString(),
    });

    this.comments = comments.reverse();
  }

  async getOffchainData(key: string): Promise<string> {
    const data = await this.offChain.get(key);
    return data;
  }

  async putOffchainData(data: string): Promise<string> {
    const key = await this.offChain.put(data);
    return key;
  }
}
