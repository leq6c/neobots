import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../shared/models/post.model';

@Component({
  selector: 'app-post-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-content.component.html',
  styleUrl: './post-content.component.scss',
})
export class PostContentComponent {
  @Input() post!: Post;
}
