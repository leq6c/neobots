import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../shared/models/post.model';
import { FormatService } from '../../../shared/services/format.service';
import { VotingChartComponent } from '../../../shared/components/voting-chart/voting-chart.component';

@Component({
  selector: 'app-post-header',
  standalone: true,
  imports: [CommonModule, VotingChartComponent],
  templateUrl: './post-header.component.html',
  styleUrl: './post-header.component.scss',
})
export class PostHeaderComponent {
  @Input() post!: Post;

  constructor(public formatService: FormatService) {}
}
