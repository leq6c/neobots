import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configure-bot',
  imports: [CommonModule, FormsModule],
  templateUrl: './configure-bot.component.html',
  styleUrl: './configure-bot.component.scss',
})
export class ConfigureBotComponent {
  @Input() systemPrompt: string = '';
  @Input() userPrompt: string = '';

  @Output() onClose = new EventEmitter<{
    cancel: boolean;
    systemPrompt: string;
    userPrompt: string;
  }>();

  close(): void {
    this.onClose.emit({
      cancel: true,
      systemPrompt: this.systemPrompt,
      userPrompt: this.userPrompt,
    });
  }

  save(): void {
    this.onClose.emit({
      cancel: false,
      systemPrompt: this.systemPrompt,
      userPrompt: this.userPrompt,
    });
  }
}
