import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment } from '../../../shared/models/post.model';
import { CommentListComponent } from '../../../shared/components/comment-list/comment-list.component';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, CommentListComponent],
  templateUrl: './comment-section.component.html',
  styleUrl: './comment-section.component.scss',
})
export class CommentSectionComponent {
  @Input() comments: Comment[] = [];
  @Input() posted: boolean = false;
  @Input() enableNoCommentsMessageWhenEmpty: boolean = true;
}
