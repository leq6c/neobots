import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { Comment } from '../models/comment.model';
import type { RewardData } from '../models/reward-data.model';
import { IndexerService } from '../../service/indexer.service';
import { WalletService } from '../../service/wallet.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // Network status
  private networkStatusSource = new BehaviorSubject<number[]>(
    Array(8)
      .fill(0)
      .map(() => Math.random())
  );
  networkStatus$ = this.networkStatusSource.asObservable();

  // Processing status
  private processingStatusSource = new BehaviorSubject<number>(10);
  processingStatus$ = this.processingStatusSource.asObservable();

  // Glitch effect
  private glitchEffectSource = new BehaviorSubject<boolean>(false);
  glitchEffect$ = this.glitchEffectSource.asObservable();

  // Comments
  private hasCommentsSource = new BehaviorSubject<boolean>(false);
  hasComments$ = this.hasCommentsSource.asObservable();

  private commentsSource = new BehaviorSubject<Comment[]>([]);
  comments$ = this.commentsSource.asObservable();

  // Reward data
  private hasRewardDataSource = new BehaviorSubject<boolean>(false);
  hasRewardData$ = this.hasRewardDataSource.asObservable();

  private rewardDataSource = new BehaviorSubject<RewardData>({
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    comments: [],
    likes: [],
    points: [],
  });
  rewardData$ = this.rewardDataSource.asObservable();

  // UI state
  private showCommentsSource = new BehaviorSubject<boolean>(true);
  showComments$ = this.showCommentsSource.asObservable();

  private showRewardsSource = new BehaviorSubject<boolean>(true);
  showRewards$ = this.showRewardsSource.asObservable();

  constructor(private wallet: WalletService, private api: IndexerService) {}

  user: string = '';

  setUser(user: string): void {
    this.user = user;

    this.updateComments();
    this.updateRewards();
  }

  async updateComments() {
    if (!this.user) return;

    const result = await this.api.getComments({
      user: this.user,
      order: 'DESC',
      limit: 10,
    });

    const comments = result.map((comment) => {
      return {
        id: comment.comment_author_sequence_id,
        title: comment.content,
        content: comment.content,
        time: this.createdAtToReadableFormat(
          parseInt(comment.index_created_at)
        ),
        iconColor: 'text-blue-400',
        upvotes: comment.received_upvotes,
        downvotes: comment.received_downvotes,
        bookmarked: false,
        post_id: comment.parent_post_pda,
      };
    });

    this.commentsSource.next(comments);
    this.hasCommentsSource.next(true);
  }

  async updateRewards() {
    if (!this.user) return;

    const dailyLikeStats = await this.api.getDailyLikeStats(this.user);
    const dailyCommentStats = await this.api.getDailyCommentStats(this.user);

    this.rewardDataSource.next({
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      comments: dailyCommentStats.map((stat) => stat.count).reverse(),
      likes: dailyLikeStats.map((stat) => stat.count).reverse(),
      points: dailyLikeStats.map((stat) => stat.count).reverse(),
    });
    this.hasRewardDataSource.next(true);
  }

  createdAtToReadableFormat(createdAt: number): string {
    const date = new Date(createdAt);
    // min ago, hour ago, day ago, month ago, year ago
    const diff = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const diffYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 30 * 12));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 30) {
      return `${diffDays}d ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths}mo ago`;
    } else {
      return `${diffYears}y ago`;
    }
  }

  toggleShowComments(): void {
    this.showCommentsSource.next(!this.showCommentsSource.value);
  }

  toggleShowRewards(): void {
    this.showRewardsSource.next(!this.showRewardsSource.value);
  }

  updateVote(commentId: string, voteType: 'upvotes' | 'downvotes'): void {
    const comments = this.commentsSource.value;
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          [voteType]: comment[voteType] + 1,
        };
      }
      return comment;
    });
    this.commentsSource.next(updatedComments);
  }

  toggleBookmark(commentId: string): void {
    const comments = this.commentsSource.value;
    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          bookmarked: !comment.bookmarked,
        };
      }
      return comment;
    });
    this.commentsSource.next(updatedComments);
  }

  private updateProcessingStatus(): void {
    let currentStatus = this.processingStatusSource.value;
    if (currentStatus >= 100) {
      currentStatus = 10;
    } else {
      currentStatus += 1;
    }
    this.processingStatusSource.next(currentStatus);
  }

  private updateNetworkStatus(): void {
    this.networkStatusSource.next(
      Array(8)
        .fill(0)
        .map(() => Math.random())
    );
  }

  private triggerRandomGlitch(): void {
    if (Math.random() > 0.95) {
      this.glitchEffectSource.next(true);
      setTimeout(() => {
        this.glitchEffectSource.next(false);
      }, 150);
    }
  }
}
