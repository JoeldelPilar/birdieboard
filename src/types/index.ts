export type ActionResponse<T> = { success: true; data: T } | { success: false; error: string };

export type ClubType =
  | 'driver'
  | '3_wood'
  | '5_wood'
  | '7_wood'
  | '2_hybrid'
  | '3_hybrid'
  | '4_hybrid'
  | '5_hybrid'
  | '2_iron'
  | '3_iron'
  | '4_iron'
  | '5_iron'
  | '6_iron'
  | '7_iron'
  | '8_iron'
  | '9_iron'
  | 'pitching_wedge'
  | 'gap_wedge'
  | 'sand_wedge'
  | 'lob_wedge'
  | 'putter';

export type MatchFormat = 'stroke_play' | 'stableford' | 'match_play' | 'best_ball' | 'scramble';

export type RoundStatus = 'in_progress' | 'completed' | 'abandoned';

export type MatchStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';

export type TourStatus = 'active' | 'completed' | 'cancelled';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export type InvitationType = 'match' | 'tour' | 'friend';

export type ShaftType = 'steel' | 'graphite';

export type ShaftFlex = 'ladies' | 'senior' | 'regular' | 'stiff' | 'x_stiff';
