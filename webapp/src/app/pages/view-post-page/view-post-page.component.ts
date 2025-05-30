import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BarComponent } from '../../shared/components/bar/bar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IndexerService } from '../../service/indexer.service';
import { Post, Comment } from '../../shared/models/post.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { PostHeaderComponent } from './post-header/post-header.component';
import { PostContentComponent } from './post-content/post-content.component';
import { CommentListComponent } from './comment-list/comment-list.component';
import { CommentItemComponent } from './comment-item/comment-item.component';
import { FormatService } from '../../shared/services/format.service';
import {
  VotingChartComponent,
  ChartData,
} from '../../shared/components/voting-chart/voting-chart.component';
import { TimeseriesVoteTrendAnalysis } from '../../shared/models/timeseries_vote.model';
import { TimeSeriesToChartData } from './TimeSeriesToChartData';

@Component({
  selector: 'app-view-post-page',
  standalone: true,
  imports: [
    NavbarComponent,
    BarComponent,
    FooterComponent,
    CommonModule,
    RouterLink,
    LoadingComponent,
    ErrorMessageComponent,
    PostHeaderComponent,
    PostContentComponent,
    CommentListComponent,
    VotingChartComponent,
  ],
  templateUrl: './view-post-page.component.html',
  styleUrl: './view-post-page.component.scss',
})
export class ViewPostPageComponent {
  postId: string | null = null;
  post: Post | null = null;
  comments: Comment[] = [];
  loading: boolean = true;
  error: string | null = null;
  timeseriesVoteTrendAnalysis: TimeseriesVoteTrendAnalysis[] = [];
  chartData?: ChartData;
  first: boolean = true;
  interval?: any;
  unloaded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private indexerService: IndexerService,
    private formatService: FormatService
  ) {
    this.route.paramMap.subscribe(async (params) => {
      this.postId = params.get('id');
      console.log('Post ID:', this.postId);

      if (this.postId) {
        await this.fetch();
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.unloaded = true;
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  commentsToComparableString(comments: Comment[]) {
    return comments
      .map(
        (comment) =>
          comment.comment_author_user_pda + comment.comment_author_sequence_id
      )
      .join('|');
  }

  async fetch() {
    if (!this.postId) return;

    try {
      let first = this.first;
      if (this.first) {
        this.loading = true;
      }
      this.error = null;

      // Fetch post data
      if (this.first) {
        const post = await this.indexerService.getPost(this.postId);
        this.post = post;
        console.log('post', this.post);
        this.first = false;
      }

      if (!this.post) {
        this.error = 'Post not found';
        this.loading = false;
        return;
      }

      // Fetch comments for this post
      const comments = await this.indexerService.getComments({
        target: this.postId,
        order: 'DESC',
      });

      if (
        this.commentsToComparableString(comments) !==
          this.commentsToComparableString(this.comments) ||
        first
      ) {
        this.comments = comments;

        // Fetch votes
        const timeseriesVoteTrendAnalysis =
          await this.indexerService.getTimeseriesVoteTrendAnalysis(
            this.postId!,
            8
          );
        console.log(
          'Timeseries Vote Trend Analysis:',
          timeseriesVoteTrendAnalysis
        );
        this.timeseriesVoteTrendAnalysis = timeseriesVoteTrendAnalysis;
        this.chartData = TimeSeriesToChartData(
          this.post!,
          timeseriesVoteTrendAnalysis
        );

        console.log('Comments:', comments);
        console.log('Chart Data:', this.chartData);
      }

      this.loading = false;
    } catch (err) {
      console.error('Error fetching post data:', err);
      this.error = 'Failed to load post data. Please try again later.';
      this.loading = false;
    }

    if (this.post && !this.unloaded) {
      this.interval = setTimeout(async () => {
        await this.fetch();
      }, 5000);
    }
  }
}
