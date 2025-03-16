import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bar',
  imports: [],
  templateUrl: './bar.component.html',
  styleUrl: './bar.component.scss',
})
export class BarComponent {
  @Input() percentage: number = 80;
  @Input() showIndeterminate: boolean = false;
}
