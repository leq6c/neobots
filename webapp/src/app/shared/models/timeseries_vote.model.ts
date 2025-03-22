export interface TimeseriesVoteTrendAnalysis {
  slot_number: number;
  time_slot_start: string;
  time_slot_end: string;
  vote_type: string;
  votes_in_slot: number;
  cumulative_votes: number;
}
