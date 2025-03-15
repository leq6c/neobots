import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss',
})
export class ErrorMessageComponent {
  @Input() errorMessage: string = '';
  @Input() retryFunction: (() => void) | null = null;

  retry() {
    if (this.retryFunction) {
      this.retryFunction();
    }
  }
}
