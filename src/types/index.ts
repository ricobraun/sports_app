export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  profilePicture?: string;
  totalPredictions?: number;
  correctPredictions?: number;
  badges?: Badge[];
  notifications?: Notification[];
  lastActive?: string;
}

export interface Pool {
  id: string;
  name: string;
  adminId: string;
  tournamentId: number;
  createdAt: string;
  inviteCode: string;
  members: PoolMember[];
  format?: 'ODI' | 'T10' | 'T20' | 'Test' | 'Bilateral';
  isPublic?: boolean;
  userLimit?: number;
  description?: string;
  endDate?: string;
  isFeatured?: boolean;
  totalParticipants?: number;
}

export interface PoolMember {
  userId: string;
  userName: string;
  points: number;
  bets: Bet[];
  joinedAt?: string;
  rank?: number;
  previousRank?: number;
}

export interface Bet {
  id: string;
  matchId: number;
  userId: string;
  prediction: 'team1' | 'team2' | 'draw';
  points: number;
  createdAt: string;
  settled: boolean;
  confidence?: number; // 1-100% confidence level
}

export interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  matches?: Match[];
  format?: 'ODI' | 'T10' | 'T20' | 'Test' | 'Bilateral';
  category?: 'ICC' | 'National' | 'Bilateral';
  logo?: string;
  is_featured?: boolean;
  totalMatches?: number;
  location?: string;
}

export interface Match {
  id: number;
  tournamentId: number;
  name: string;
  status: 'upcoming' | 'live' | 'completed';
  date: string;
  team1: Team;
  team2: Team;
  result?: MatchResult;
  format?: 'ODI' | 'T10' | 'T20' | 'Test';
  venue?: string;
  predictions?: {
    team1Percentage: number;
    team2Percentage: number;
    drawPercentage: number;
  };
}

export interface Team {
  id: number;
  name: string;
  code: string;
  logo?: string;
  ranking?: number;
}

export interface MatchResult {
  winner: number; // team id
  team1Score?: string;
  team2Score?: string;
  manOfTheMatch?: string;
  highlights?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'pool_invite' | 'match_result' | 'bet_result' | 'badge_earned';
  read: boolean;
  createdAt: string;
  relatedId?: string; // Pool ID, Match ID, etc.
}

export interface Leaderboard {
  global: LeaderboardEntry[];
  tournament?: Record<number, LeaderboardEntry[]>; // Tournament ID -> Entries
  pool?: Record<string, LeaderboardEntry[]>; // Pool ID -> Entries
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  profilePicture?: string;
  points: number;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  rank: number;
  previousRank: number;
}