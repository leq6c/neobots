import {
  Component,
  Input,
  Output,
  EventEmitter,
  type OnInit,
} from '@angular/core';
import type { Comment } from '../../models/comment.model';
import { IconComponent } from '../../shared/icon/icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comment-card',
  templateUrl: './comment-card.component.html',
  styleUrls: ['./comment-card.component.scss'],
  imports: [CommonModule, IconComponent],
})
export class CommentCardComponent implements OnInit {
  @Input() comment!: Comment;
  @Input() hoverBorderColor = 'blue-500';
  @Input() gradientColor = 'blue';

  @Output() onUpvote = new EventEmitter<string>();
  @Output() onDownvote = new EventEmitter<string>();
  @Output() onBookmark = new EventEmitter<string>();

  ngOnInit() {
    // Set hover border color based on icon color
    if (this.comment.iconColor.includes('blue')) {
      this.hoverBorderColor = 'blue-500';
      this.gradientColor = 'blue';
    } else if (this.comment.iconColor.includes('green')) {
      this.hoverBorderColor = 'green-500';
      this.gradientColor = 'green';
    } else if (this.comment.iconColor.includes('purple')) {
      this.hoverBorderColor = 'purple-500';
      this.gradientColor = 'purple';
    } else if (this.comment.iconColor.includes('pink')) {
      this.hoverBorderColor = 'pink-500';
      this.gradientColor = 'pink';
    } else if (this.comment.iconColor.includes('yellow')) {
      this.hoverBorderColor = 'yellow-500';
      this.gradientColor = 'yellow';
    }
  }
}
