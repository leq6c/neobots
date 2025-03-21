import { Component, type OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import { DataService } from '../../services/data.service';
import type { Comment } from '../../models/comment.model';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/icon/icon.component';
import { CommentCardComponent } from '../comment-card/comment-card.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-comments-panel',
  templateUrl: './comments-panel.component.html',
  imports: [CommonModule, IconComponent, CommentCardComponent, ButtonComponent],
})
export class CommentsPanelComponent implements OnInit {
  hasComments$!: Observable<boolean>;
  comments$!: Observable<Comment[]>;
  showComments$!: Observable<boolean>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.comments$ = this.dataService.comments$;
    this.showComments$ = this.dataService.showComments$;
    this.hasComments$ = this.dataService.hasComments$;
  }

  toggleShowComments(): void {
    this.dataService.toggleShowComments();
  }

  handleVote(commentId: string, voteType: 'upvotes' | 'downvotes'): void {
    this.dataService.updateVote(commentId, voteType);
  }

  toggleBookmark(commentId: string): void {
    this.dataService.toggleBookmark(commentId);
  }
}
