import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../../../exp/shared/icon/icon.component';
import { AgentActionStatus } from '../../../service/lib/NeobotsAgentClient';

@Component({
  selector: 'app-running-status-item',
  imports: [CommonModule, IconComponent],
  templateUrl: './running-status-item.component.html',
  styleUrl: './running-status-item.component.scss',
})
export class RunningStatusItemComponent {
  @Input() actionStatus!: AgentActionStatus;
  @Input() inference!: string;

  get progress(): number {
    if (this.actionStatus.current && this.actionStatus.total) {
      return Math.ceil(
        (this.actionStatus.current / this.actionStatus.total) * 100
      );
    }
    return -1;
  }
}
