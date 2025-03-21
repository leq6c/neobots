import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  imports: [CommonModule],
})
export class IconComponent {
  @Input() name = '';
  @Input() class = '';
  @Input() fill = false;
}
