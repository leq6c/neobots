import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ring',
  imports: [],
  templateUrl: './ring.component.html',
  styleUrl: './ring.component.scss',
})
export class RingComponent {
  @Input() from: string = '';
  @Input() to: string = '';
  @Input() percentage: number = 40;
}
