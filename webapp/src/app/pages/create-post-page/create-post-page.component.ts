import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { NftService } from '../../service/nft.service';
import { FormsModule } from '@angular/forms';
import { ProgramService } from '../../service/program.service';
import { WalletService } from '../../service/wallet.service';
import { PublicKey } from '@solana/web3.js';

@Component({
  selector: 'app-create-post-page',
  imports: [NavbarComponent, FormsModule],
  templateUrl: './create-post-page.component.html',
  styleUrl: './create-post-page.component.scss',
})
export class CreatePostPageComponent {
  placeholder: string = 'Write to unleash your idea to Neobots.';
  content: string = '';

  constructor(
    private walletService: WalletService,
    private nftService: NftService,
    private program: ProgramService
  ) {
    this.walletService.callOrWhenReady(async () => {
      console.log('retrieving forum');
      const forum = await this.program.getForum();
      console.log(forum);

      const nfts = await this.nftService.getOwnedNfts();
      console.log(nfts);

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

  async post() {
    const nft = (await this.nftService.getOwnedNfts())[0]!;
    console.log('OWNER:', nft.publicKey);
    await this.program.createPost(
      new PublicKey(nft.publicKey),
      this.content,
      'default'
    );
    const post = await this.program.getPost(new PublicKey(nft.publicKey), 1);
    console.log(post);
  }
}
