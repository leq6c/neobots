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

@Component({
  selector: 'app-create-post-page',
  imports: [
    NavbarComponent,
    FormsModule,
    CommonModule,
    PostEditorComponent,
    CommentSectionComponent,
  ],
  templateUrl: './create-post-page.component.html',
  styleUrl: './create-post-page.component.scss',
})
export class CreatePostPageComponent {
  placeholder: string = 'Write to unleash your idea to Neobots.';
  content: string = '';
  posted: boolean = false;
  comments: Comment[] = [];

  constructor(
    private walletService: WalletService,
    private nftService: NftService,
    private program: ProgramService,
    private indexer: IndexerService,
    private offChain: OffChainService
  ) {}

  async post() {
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
      alert('Post not found');
      return;
    }

    const postPda = new PublicKey(post.postPda);

    // @TODO: this is hacky. need fix later
    const waitAndFetch = async () => {
      this.program.waitForChanges(async () => {
        setTimeout(async () => {
          await this.fetchComments(postPda);
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
