export interface Comment {
  id: string;
  title: string;
  content: string;
  time: string;
  iconColor: string;
  upvotes: number;
  downvotes: number;
  bookmarked: boolean;
  post_id: string;
}
