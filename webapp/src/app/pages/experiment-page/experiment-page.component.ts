import { Component, type OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import { DataService } from '../../exp/services/data.service';
import { IconComponent } from '../../exp/shared/icon/icon.component';
import { ButtonComponent } from '../../exp/shared/button/button.component';
import { CommonModule } from '@angular/common';
import { CommentsPanelComponent } from '../../exp/components/comments-panel/comments-panel.component';
import { CryptoStatsComponent } from '../../exp/components/crypto-stats/crypto-stats.component';
import { RewardsPanelComponent } from '../../exp/components/rewards-panel/rewards-panel.component';
import { TokenTickerComponent } from '../../exp/components/token-ticker/token-ticker.component';
import { ProfileCardComponent } from '../../exp/components/profile-card/profile-card.component';
import { MatrixCanvasComponent } from '../../exp/components/matrix-canvas/matrix-canvas.component';
import { HeaderComponent } from '../../exp/components/header/header.component';

@Component({
  selector: 'app-experiment-page',
  imports: [
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
  templateUrl: './experiment-page.component.html',
  styleUrl: './experiment-page.component.scss',
})
export class ExperimentPageComponent {
  glitchEffect$!: Observable<boolean>;
  showComments$!: Observable<boolean>;
  showRewards$!: Observable<boolean>;

  constructor(private dataService: DataService) {}

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
