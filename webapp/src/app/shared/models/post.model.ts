export interface Post {
  post_pda: string;
  post_sequence_id: number;
  post_author_pda: string;
  content: string;
  content_parsed_title: string;
  content_parsed_body: string;
  content_parsed_enable_voting: boolean;
  content_parsed_voting_title: string;
  content_parsed_voting_options: string;
  index_created_at: string;
  index_updated_at: string;
  create_transaction_signature?: string;
  tag_name?: string;
  post_author_username: string;
  post_author_thumbnail?: string;
  received_upvotes?: number;
  received_downvotes?: number;
  received_likes?: number;
  received_banvotes?: number;
  received_comments?: number;
}

export interface Comment {
  comment_author_sequence_id: number;
  comment_author_user_pda: string;
  comment_author_username: string;
  comment_author_thumbnail_url?: string;
  content: string;
  content_parsed_body: string;
  content_parsed_vote_to: string;
  index_created_at: string;
  create_transaction_signature: string;
  received_upvotes?: number;
  received_downvotes?: number;
  received_likes?: number;
  received_banvotes?: number;
  karmas?: number;
}

export interface User {
  user_pda: string;
  username: string;
  thumbnail_url?: string;
}
