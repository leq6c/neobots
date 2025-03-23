import { Component, Input, type OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { RoundInfoService } from '../../../service/round-info.service';
import { AgentStatusUpdate } from '../../../service/lib/NeobotsAgentClient';

@Component({
  selector: 'app-crypto-stats',
  templateUrl: './crypto-stats.component.html',
  styleUrls: ['./crypto-stats.component.scss'],
  imports: [CommonModule, IconComponent, ButtonComponent],
})
export class CryptoStatsComponent implements OnInit {
  agents: number = 0;
  currentRound: number = 0;

  roundDuration: number = 0;
  roundStartTime: number = 0;
  roundEndTime: number = 0;
  currentTime: number = 0;
  progress: number = 0;
  hasValue: boolean = false;
  showValue: boolean = false;
  first: boolean = true;
  interval: any;
  @Input() agentRunningStatus?: AgentStatusUpdate;

  constructor(
    private dataService: DataService,
    private roundInfoService: RoundInfoService
  ) {
    this.update();
  }

  ngOnInit(): void {
    this.interval = setInterval(async () => {
      if (!this.roundInfoService.hasValue) {
        await this.roundInfoService.update();
      }
      this.update();
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  update() {
    if (!this.roundInfoService.hasValue) return;

    this.agents = this.roundInfoService.NumberOfAgents;
    this.currentRound = this.roundInfoService.currentRoundNumber;
    this.roundStartTime = this.roundInfoService.roundStartTime;
    this.roundDuration = this.roundInfoService.roundDuration;
    this.roundEndTime = this.roundInfoService.roundEndTime;

    this.currentTime = Math.floor(Date.now() / 1000);
    if (this.currentTime > this.roundEndTime || this.roundDuration === 0) {
      this.progress = 100;
    } else {
      this.progress =
        ((this.currentTime - this.roundStartTime) / this.roundDuration) * 100;
    }

    this.hasValue = true;
    this.showValue = true;

    if (this.first) {
      setTimeout(() => {
        this.first = false;
      }, 1000);
    }
  }

  getAreaPath(prices: number[]): string {
    if (!prices || prices.length === 0) {
      return '';
    }

    return `M 0,${100 - prices[0] / 2} ${prices
      .map((price, i) => `L ${i * 10},${100 - price / 2}`)
      .join(' ')} V 100 H 0 Z`;
  }

  getLinePath(prices: number[]): string {
    if (!prices || prices.length === 0) {
      return '';
    }

    return `M 0,${100 - prices[0] / 2} ${prices
      .map((price, i) => `L ${i * 10},${100 - price / 2}`)
      .join(' ')}`;
  }

  hasVisibleActions() {
    if (!this.agentRunningStatus) return false;
    return this.agentRunningStatus.actions.some(
      (action) =>
        action.status == 'running' && action.targetContent && action.targetPda
    );
  }

  parseTargetContent(content: string) {
    if (!content) return content;
    if (content.startsWith('{')) {
      try {
        const json = JSON.parse(content);
        if (json.title) {
          return json.title;
        } else if (json.body) {
          return json.body;
        } else if (json.content) {
          return json.content;
        }
      } catch (e) {
        return content;
      }
    }
    return content;
  }
}
