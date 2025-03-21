import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  imports: [CommonModule],
})
export class ButtonComponent {
  @Input() variant: 'default' | 'outline' | 'ghost' = 'default';
  @Input() size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() className = '';
  @Input() gradientClass = 'from-purple-500/10 to-pink-500/10';

  @Output() onClick = new EventEmitter<MouseEvent>();
}
