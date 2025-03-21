import { Component, type OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-token-ticker',
  templateUrl: './token-ticker.component.html',
  imports: [CommonModule, IconComponent],
})
export class TokenTickerComponent implements OnInit {
  tokenPrice$!: Observable<number[]>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {}

  getChartPath(prices: number[] | null): string {
    if (!prices || prices.length === 0) {
      return '';
    }

    return `M 0,${12 + (prices[0] - 75) / 5} ${prices
      .map((price, i) => `L ${i * 10},${12 + (price - 75) / 5}`)
      .join(' ')}`;
  }
}
