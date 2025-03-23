import {
  Component,
  Input,
  Output,
  EventEmitter,
  type OnInit,
} from '@angular/core';
import type { Observable } from 'rxjs';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { IActionPoint } from '../../models/action-point.model';
import {
  AgentActionStatus,
  AgentStatusUpdate,
} from '../../../service/lib/NeobotsAgentClient';
import { SampleRunningStatus } from '../../../pages/bots-page/SampleRunningStatus';
import { RunningStatusItemComponent } from '../../../shared/components/running-status-item/running-status-item.component';
import { ConfigureBotComponent } from '../../../shared/components/configure-bot/configure-bot.component';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrl: './profile-card.component.scss',
  imports: [
    CommonModule,
    IconComponent,
    ButtonComponent,
    RunningStatusItemComponent,
    ConfigureBotComponent,
  ],
})
export class ProfileCardComponent implements OnInit {
  networkStatus$!: Observable<number[]>;
  processingStatus$!: Observable<number>;

  @Input() name: string = '';
  @Input() nftMint: string = '';
  @Input() defaultActionPoints!: IActionPoint;
  @Input() actionPoints!: IActionPoint;
  @Input() inference: string = 'thinking...';
  @Input() agentRunningStatus?: AgentStatusUpdate;
  @Input() starting: boolean = false;
  @Input() stopping: boolean = false;
  @Input() loaded: boolean = false;
  @Output() startAgent = new EventEmitter<void>();
  @Output() stopAgent = new EventEmitter<void>();
  @Output() botConfigUpdated = new EventEmitter<{
    systemPrompt: string;
    userPrompt: string;
  }>();

  showConfigureBot: boolean = false;
  @Input() systemPrompt: string = '';
  @Input() userPrompt: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.networkStatus$ = this.dataService.networkStatus$;
    this.processingStatus$ = this.dataService.processingStatus$;
  }

  triggerShowConfigureBot(): void {
    this.showConfigureBot = true;
  }

  onConfigureBotClose(event: {
    cancel: boolean;
    systemPrompt: string;
    userPrompt: string;
  }): void {
    this.showConfigureBot = false;
    if (!event.cancel) {
      this.botConfigUpdated.emit({
        systemPrompt: event.systemPrompt,
        userPrompt: event.userPrompt,
      });
    }
  }

  getRowIndex(index: number): number {
    return Math.floor(index / 3);
  }

  hasNoRunningActions(): boolean {
    return (
      this.agentRunningStatus?.actions.every(
        (action) => action.status !== 'running'
      ) ?? true
    );
  }

  getEmptyActionStatus(): AgentActionStatus {
    return {
      id: 'empty',
      type: 'status',
      status: 'running',
      message: 'Pending',
    };
  }

  getActionColorParentClass(index: number): string {
    switch (index) {
      case 0:
        return 'hover:border-blue-500/30';
      case 1:
        return 'hover:border-green-500/30';
      case 2:
        return 'hover:border-purple-500/30';
      default:
        return 'hover:border-blue-500/30';
    }
  }

  getActionColorClass(index: number): string {
    switch (index) {
      case 0:
        return 'from-blue-500/5 to-blue-500/0';
      case 1:
        return 'from-green-500/5 to-green-500/0';
      case 2:
        return 'from-purple-500/5 to-purple-500/0';
      default:
        return 'from-blue-500/5 to-blue-500/0';
    }
  }

  getActionColorClassIcon(index: number): string {
    switch (index) {
      case 0:
        return 'from-blue-500/20 to-blue-600/10';
      case 1:
        return 'from-green-500/20 to-green-600/10';
      case 2:
        return 'from-purple-500/20 to-purple-600/10';
      default:
        return 'from-blue-500/20 to-blue-600/10';
    }
  }

  getActionColorClassText(index: number): string {
    switch (index) {
      case 0:
        return 'text-blue-400';
      case 1:
        return 'text-green-400';
      case 2:
        return 'text-purple-400';
      default:
        return 'text-blue-400';
    }
  }
}
