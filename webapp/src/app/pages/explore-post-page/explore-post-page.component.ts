import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { WalletService } from '../../service/wallet.service';
import { IndexerService } from '../../service/indexer.service';
import { RouterLink } from '@angular/router';

interface Post {
  post_pda: string;
  post_sequence_id: number;
  post_author_pda: string;
  tag_name: string;
  content: string;
  index_created_at: string;
  post_author_username?: string;
}

interface PageInfo {
  firstTimestamp: string | null;
  lastTimestamp: string | null;
}

@Component({
  selector: 'app-explore-post-page',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, CommonModule, RouterLink],
  templateUrl: './explore-post-page.component.html',
  styleUrl: './explore-post-page.component.scss',
})
export class ExplorePostPageComponent implements OnInit {
  posts: Post[] = [];
  loading: boolean = true;
  error: string | null = null;
  currentPage: number = 1;
  totalPosts: number = 0;
  postsPerPage: number = 10;
  selectedFilter: string = 'recent';
  selectedCategory: string | null = null;
  selectedTimePeriod: string = 'all';
  Math = Math; // Make Math available to the template

  // Store page information for pagination
  pageCache: Map<number, PageInfo> = new Map();

  constructor(
    private walletService: WalletService,
    private indexerService: IndexerService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  async loadPosts(): Promise<void> {
    if (this.posts.length == 0) {
      this.loading = true;
    }
    this.error = null;

    try {
      const isDescOrder = this.selectedFilter === 'recent';
      const order = isDescOrder ? 'DESC' : 'ASC';

      // Determine pagination parameters based on current page
      let before: string | undefined = undefined;
      let until: string | undefined = undefined;

      if (this.currentPage > 1) {
        // If we're going forward in pages
        const prevPageInfo = this.pageCache.get(this.currentPage - 1);

        if (prevPageInfo) {
          // In descending order (newest first), we use 'until' to get older posts
          // In ascending order (oldest first), we use 'before' to get newer posts
          if (isDescOrder && prevPageInfo.lastTimestamp) {
            until = prevPageInfo.lastTimestamp;
          } else if (!isDescOrder && prevPageInfo.lastTimestamp) {
            before = prevPageInfo.lastTimestamp;
          }
          console.log('prevPageInfo', prevPageInfo);
        }
      }

      // Get posts with pagination and filters
      const posts = await this.indexerService.getPosts({
        limit: this.postsPerPage,
        order: order,
        tag_name: this.selectedCategory || undefined,
        before: until,
        until: before,
        // Time period filter is not directly supported by the indexer API
        // We would need to calculate 'until' based on selectedTimePeriod
      });
      console.log(posts);

      this.posts = posts;

      // Store page information for pagination
      if (posts.length > 0) {
        this.pageCache.set(this.currentPage, {
          firstTimestamp: posts[0].index_created_at,
          lastTimestamp: posts[posts.length - 1].index_created_at,
        });
      }

      this.totalPosts = await this.indexerService.getPostCount(
        this.selectedCategory || ''
      );
      this.loading = false;
    } catch (err) {
      console.error('Error loading posts:', err);
      this.error = 'Failed to load posts. Please try again later.';
      this.loading = false;
    }
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
    this.pageCache.clear(); // Clear cache when filter changes
    this.loadPosts();
  }

  setCategory(category: string | null): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.pageCache.clear(); // Clear cache when category changes
    this.loadPosts();
  }

  setTimePeriod(period: string): void {
    this.selectedTimePeriod = period;
    this.currentPage = 1;
    this.pageCache.clear(); // Clear cache when time period changes
    this.loadPosts();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.getTotalPages()) return;

    // Only allow sequential page navigation to ensure proper pagination
    if (
      page > this.currentPage &&
      page > this.currentPage + 1 &&
      !this.pageCache.has(page - 1)
    ) {
      console.warn('Cannot jump multiple pages forward');
      return;
    }

    this.currentPage = page;
    this.loadPosts();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalPosts / this.postsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (this.currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (this.currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      this.currentPage - 2,
      this.currentPage - 1,
      this.currentPage,
      this.currentPage + 1,
      this.currentPage + 2,
    ];
  }

  formatDate(dateString: string): string {
    const date = new Date(parseInt(dateString));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getInitials(username: string): string {
    if (!username) return 'AN';
    return username
      .split(' ')
      .map((name) => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  getRandomColor(username: string): string {
    const colors = [
      'bg-blue-600',
      'bg-purple-600',
      'bg-green-600',
      'bg-pink-600',
      'bg-yellow-600',
      'bg-indigo-600',
      'bg-orange-600',
    ];

    // Simple hash function to get consistent color for the same username
    const hash = username.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  }
}
