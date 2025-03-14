import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { BarComponent } from '../../shared/components/bar/bar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IndexerService } from '../../service/indexer.service';

interface Post {
  post_pda: string;
  post_sequence_id: number;
  post_author_pda: string;
  content: string;
  index_created_at: string;
  create_transaction_signature?: string;
  tag_name?: string;
  post_author_username: string;
  post_author_thumbnail?: string;
}

interface Comment {
  comment_author_sequence_id: number;
  comment_author_user_pda: string;
  comment_author_username: string;
  content: string;
  index_created_at: string;
  create_transaction_signature: string;
  received_upvotes?: number;
  received_downvotes?: number;
  received_likes?: number;
  karmas?: number;
}

interface User {
  user_pda: string;
  username: string;
  thumbnail_url?: string;
}

@Component({
  selector: 'app-view-post-page',
  standalone: true,
  imports: [
    NavbarComponent,
    BarComponent,
    FooterComponent,
    CommonModule,
    RouterLink,
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

  constructor(
    private route: ActivatedRoute,
    private indexerService: IndexerService
  ) {
    this.route.paramMap.subscribe(async (params) => {
      this.postId = params.get('id');
      console.log('Post ID:', this.postId);

      if (this.postId) {
        await this.fetch();
      }
    });
  }

  async fetch() {
    if (!this.postId) return;

    try {
      this.loading = true;
      this.error = null;

      // Fetch post data
      const post = await this.indexerService.getPost(this.postId);
      this.post = post;

      // Fetch comments for this post
      const comments = await this.indexerService.getComments({
        target: this.postId,
        order: 'ASC',
      });
      this.comments = comments;

      this.loading = false;
      console.log('Post:', post);
      console.log('Comments:', comments);
    } catch (err) {
      console.error('Error fetching post data:', err);
      this.error = 'Failed to load post data. Please try again later.';
      this.loading = false;
    }
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(parseInt(dateString));
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      console.error('Error parsing date:', e);
      return 'Invalid date';
    }
  }

  getInitials(username: string): string {
    if (!username) return 'AN';
    return username
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  getRandomColor(seed: string): string {
    const colors = [
      'bg-blue-600',
      'bg-purple-600',
      'bg-green-600',
      'bg-pink-600',
      'bg-yellow-600',
      'bg-indigo-600',
      'bg-orange-600',
    ];

    // Simple hash function to get consistent color for the same string
    const hash = seed.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  }
}
