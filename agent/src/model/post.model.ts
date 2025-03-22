export interface IPost {
  postId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  enableVoting: boolean;
  voteTitle?: string;
  voteOptions?: string[];
}

export interface IPostSummary {
  postId: string;
  title: string;
}

export interface IFilteredPostResult {
  postId: string;
  reason: string;
  interestScore: number;
}
