import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { NftService } from '../../service/nft.service';
import { FormsModule } from '@angular/forms';
import { ProgramService } from '../../service/program.service';
import { WalletService } from '../../service/wallet.service';
import { PublicKey } from '@solana/web3.js';
import { CommonModule } from '@angular/common';
import { AnchorProvider, getProvider } from '@coral-xyz/anchor';
import { IndexerService } from '../../service/indexer.service';
import { OffChainService } from '../../service/off-chain.service';

interface Comment {
  comment_author_sequence_id: number;
  comment_author_user_pda: string;
  comment_author_username: string;
  comment_author_thumbnail_url?: string;
  content: string;
  index_created_at: string;
  create_transaction_signature: string;
  received_upvotes?: number;
  received_downvotes?: number;
  received_likes?: number;
  received_banvotes?: number;
  karmas?: number;
}

@Component({
  selector: 'app-create-post-page',
  imports: [NavbarComponent, FormsModule, CommonModule],
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
  ) {
    this.walletService.callOrWhenReady(async () => {
      const nfts = await this.nftService.getOwnedNfts();

      try {
        const user = await this.program.getUser(
          new PublicKey(nfts[0].publicKey)
        );
        console.log(user);
      } catch {
        console.log('user not found? initializing...');
        const confirmed = confirm('Do you want to initialize your user?');
        if (!confirmed) {
          return;
        }

        await this.program.initializeUser(
          new PublicKey(nfts[0].publicKey),
          'default',
          'default',
          'default'
        );
      }

      const posts = await this.program.listPosts();
      console.log(posts);
    });
  }

  trackByComment(index: number, comment: Comment) {
    return (
      comment.comment_author_user_pda.toString() +
      comment.comment_author_sequence_id.toString()
    );
  }

  async post() {
    if (this.posted) return;

    const nft = (await this.nftService.getOwnedNfts())[0]!;
    const sig = await this.program.createPost(
      new PublicKey(nft.publicKey),
      await this.putOffchainData(this.content),
      'default'
    );
    this.posted = true;

    const anchorProvider = getProvider();

    // wait for the transaction to be confirmed
    while (true) {
      const stat = await anchorProvider.connection.getSignatureStatus(sig);
      if (
        stat.value?.confirmationStatus == 'confirmed' ||
        stat.value?.confirmationStatus == 'finalized'
      ) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const tx = await anchorProvider.connection.getParsedTransaction(sig, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    let postPda: PublicKey | undefined;

    for (const inst of tx?.transaction.message.instructions ?? []) {
      if (inst.programId.toString() == this.program.programId.toString()) {
        postPda = (inst as any).accounts[3];
      }
    }

    if (!postPda) {
      alert('Post PDA not found');
      return;
    }

    let fetching = false;

    anchorProvider.connection.onLogs(
      postPda,
      (c) => {
        if (fetching) return;
        fetching = true;
        setTimeout(async () => {
          await this.fetchComments(postPda);
          fetching = false;
        }, 1000);
      },
      'confirmed'
    );
  }

  async fetchComments(postPda: PublicKey) {
    console.log('fetching comments');
    const comments = await this.indexer.getComments({
      target: postPda.toString(),
    });

    console.log(comments);

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

  formatDate(dateString: string): string {
    try {
      const date = new Date(parseInt(dateString));
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      console.error('Error parsing date:', e);
      return 'Invalid date';
    }
  }

  getInitials(username: string): string {
    if (!username) return 'AN';
    return username
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  getRandomColor(seed: string): string {
    const colors = [
      'bg-blue-600',
      'bg-purple-600',
      'bg-green-600',
      'bg-pink-600',
      'bg-yellow-600',
      'bg-indigo-600',
      'bg-orange-600',
    ];

    // Simple hash function to get consistent color for the same string
    const hash = seed.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  }
}
