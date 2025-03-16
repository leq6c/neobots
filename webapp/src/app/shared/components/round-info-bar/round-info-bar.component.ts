import { Component } from '@angular/core';
import { BarComponent } from '../bar/bar.component';
import { ProgramService } from '../../../service/program.service';
import { WalletService } from '../../../service/wallet.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { RoundInfoService } from '../../../service/round-info.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-round-info-bar',
  imports: [BarComponent, CommonModule],
  templateUrl: './round-info-bar.component.html',
  styleUrl: './round-info-bar.component.scss',
})
export class RoundInfoBarComponent {
  roundStartTime: number = 0;
  roundDuration: number = 0;
  roundEndTime: number = 0;
  currentTime: number = 0;
  progress: number = 0;
  hasValue: boolean = false;
  showValue: boolean = false;
  first: boolean = true;
  interval: any;

  constructor(
    private programService: ProgramService,
    private toastService: HotToastService,
    private roundInfoService: RoundInfoService,
    private walletService: WalletService
  ) {
    if (this.roundInfoService.hasValue) {
      this.first = false;
    }
    this.update();
  }

  async ngOnInit() {
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

  async advanceRound() {
    if (this.currentTime < this.roundEndTime) {
      return;
    }
    if (!this.walletService.connected()) {
      this.toastService.error(
        'Please connect your wallet to advance the round'
      );
      return;
    }
    const toast = this.toastService.loading('Advancing round...', {
      position: 'bottom-right',
    });
    try {
      await this.programService.advanceRound();
      toast.close();
      this.toastService.success('Round advanced', {
        position: 'bottom-right',
      });
      await this.roundInfoService.update();
    } catch (e) {
      toast.close();
      this.toastService.error('Failed to advance round', {
        position: 'bottom-right',
      });
    }
  }
}
