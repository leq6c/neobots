import { Component, type OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from '../../services/data.service';
import type { RewardData } from '../../models/reward-data.model';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { MinimalChartComponent } from '../../../shared/components/minimal-chart/minimal-chart.component';

@Component({
  selector: 'app-rewards-panel',
  templateUrl: './rewards-panel.component.html',
  imports: [
    CommonModule,
    IconComponent,
    ButtonComponent,
    MinimalChartComponent,
  ],
})
export class RewardsPanelComponent implements OnInit {
  rewardData$!: Observable<RewardData>;
  showRewards$!: Observable<boolean>;
  hasRewardData$!: Observable<boolean>;
  maxComments$!: Observable<number>;
  maxLikes$!: Observable<number>;
  maxPoints$!: Observable<number>;
  totalPoints$!: Observable<number>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.rewardData$ = this.dataService.rewardData$;
    this.showRewards$ = this.dataService.showRewards$;
    this.hasRewardData$ = this.dataService.hasRewardData$;

    // Calculate max values for charts
    this.maxComments$ = this.rewardData$.pipe(
      map((data) => Math.max(...data.comments))
    );

    this.maxLikes$ = this.rewardData$.pipe(
      map((data) => Math.max(...data.likes))
    );

    this.maxPoints$ = this.rewardData$.pipe(
      map((data) => Math.max(...data.points))
    );

    this.totalPoints$ = this.dataService.totalPoints$;
  }

  toggleShowRewards(): void {
    this.dataService.toggleShowRewards();
  }

  getTotalComments(data: RewardData): number {
    return data.comments.reduce((a, b) => a + b, 0);
  }

  getTotalLikes(data: RewardData): number {
    return data.likes.reduce((a, b) => a + b, 0);
  }

  getTotalPoints(data: RewardData): number {
    return data.points.reduce((a, b) => a + b, 0);
  }

  getTotalPointsChangesPercentageFromStartToEnd(data: RewardData): number {
    const startPoint = data.points[0];
    const endPoint = data.points[data.points.length - 1];
    const diff = endPoint - startPoint;
    if (startPoint === 0) return 0;
    return (diff / startPoint) * 100;
  }

  getHeightPercentage(value: number, max: number | null): number {
    if (!max) return 0;
    return (value / max) * 100;
  }

  createSvgPath(data: number[], width: number, height: number): string {
    if (data.length === 0) return '';

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1; // Avoid division by zero
    const step = width / (data.length - 1);

    let path = `M0,${height}`;

    const points: { x: number; y: number }[] = data.map((value, index) => {
      const x = index * step;
      const normalizedY = ((value - minValue) / range) * height;
      const y = height - normalizedY;
      return { x, y };
    });

    const smoothing = true;

    if (smoothing) {
      path += ` M${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = i > 0 ? points[i - 1] : points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i < points.length - 2 ? points[i + 2] : p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
    } else {
      points.forEach(({ x, y }) => {
        path += ` L${x},${y}`;
      });
    }

    path += ` L${width},${height} L0,${height} Z`; // Closing the shape
    return path;
  }
}
