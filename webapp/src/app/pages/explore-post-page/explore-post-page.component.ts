import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ProgramService } from '../../service/program.service';
import { WalletService } from '../../service/wallet.service';

@Component({
  selector: 'app-explore-post-page',
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './explore-post-page.component.html',
  styleUrl: './explore-post-page.component.scss',
})
export class ExplorePostPageComponent {
  posts: {
    forumName: string;
    content: string;
    tagName: string;
    signer: string;
    nftMint: string;
    blockTime: number;
    signature: string;
    pda: string;
  }[] = [];

  constructor(
    private walletService: WalletService,
    private program: ProgramService
  ) {
    this.walletService.callOrWhenReady(async () => {
      const posts = await this.program.listPosts();
      console.log(posts);
      this.posts = posts;
    });
  }
}
