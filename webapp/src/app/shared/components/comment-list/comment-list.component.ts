import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment } from '../../../shared/models/post.model';
import { CommentItemComponent } from '../comment-item/comment-item.component';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, CommentItemComponent],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
})
export class CommentListComponent {
  @Input() comments: Comment[] = [];
  @Input() isLoading: boolean = false;
  @Input() posted: boolean = false;
  @Input() enableNoCommentsMessageWhenEmpty: boolean = true;

  trackByComment(index: number, comment: Comment) {
    return (
      comment.comment_author_user_pda.toString() +
      comment.comment_author_sequence_id.toString()
    );
  }
}
