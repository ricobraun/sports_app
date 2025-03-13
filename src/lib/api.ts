import axios from 'axios';
import { Tournament, Match, Team, User, Leaderboard } from '../types';
import mockTournamentsData from '../data/tournaments.json';
import mockMatchesData from '../data/matches.json';

// Replace with your actual API key from cricketdata.org
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = 'https://api.cricketdata.org/v1';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    apikey: API_KEY
  }
});

export async function getTournaments(): Promise<Tournament[]> {
  try {
    // For development, return mock data
    return mockTournamentsData;
    
    // Uncomment for production with real API key
    // const response = await api.get('/series');
    // return response.data.data.map((item: any) => ({
    //   id: item.id,
    //   name: item.name,
    //   startDate: item.startDate,
    //   endDate: item.endDate,
    //   format: getTournamentFormat(item.name),
    //   category: getTournamentCategory(item.name),
    //   logo: getTournamentLogo(item.id)
    // }));
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
}

export async function getMatches(tournamentId: number): Promise<Match[]> {
  try {
    // For development, return mock data
    return mockMatchesData.filter(match => match.tournamentId === tournamentId);
    
    // Uncomment for production with real API key
    // const response = await api.get('/matches', {
    //   params: { seriesId: tournamentId }
    // });
    // return response.data.data.map((item: any) => ({
    //   id: item.id,
    //   name: item.name,
    //   status: getMatchStatus(item.status),
    //   date: item.date,
    //   team1: {
    //     id: item.teamInfo[0].id,
    //     name: item.teamInfo[0].name,
    //     code: item.teamInfo[0].shortname,
    //     logo: getTeamLogo(item.teamInfo[0].id)
    //   },
    //   team2: {
    //     id: item.teamInfo[1].id,
    //     name: item.teamInfo[1].name,
    //     code: item.teamInfo[1].shortname,
    //     logo: getTeamLogo(item.teamInfo[1].id)
    //   },
    //   format: getMatchFormat(item),
    //   venue: item.venue,
    //   predictions: getMockPredictions(),
    //   result: item.status === 'completed' ? {
    //     winner: item.score[0].inning.includes('won') ? item.teamInfo[0].id : item.teamInfo[1].id,
    //     team1Score: item.score[0].r + '/' + item.score[0].w,
    //     team2Score: item.score[1]?.r + '/' + item.score[1]?.w
    //   } : undefined
    // }));
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
}

export async function getLeaderboard(): Promise<Leaderboard> {
  // In a real app, this would fetch from an API
  return mockLeaderboard;
}

export async function getTeams(): Promise<Team[]> {
  // In a real app, this would fetch from an API
  return mockTeams;
}

export async function getUserStats(userId: string): Promise<User | null> {
  // In a real app, this would fetch from an API
  const user = mockUsers.find(u => u.id === userId);
  return user || null;
}

// Helper functions
function getMatchStatus(apiStatus: string): 'upcoming' | 'live' | 'completed' {
  if (apiStatus === 'scheduled') return 'upcoming';
  if (apiStatus === 'started') return 'live';
  return 'completed';
}

function getTournamentFormat(name: string): 'ODI' | 'T10' | 'T20' | 'Test' | 'Bilateral' {
  if (name.includes('T20') || name.includes('Twenty20')) return 'T20';
  if (name.includes('ODI')) return 'ODI';
  if (name.includes('Test')) return 'Test';
  if (name.includes('T10')) return 'T10';
  return 'Bilateral';
}

function getTournamentCategory(name: string): 'ICC' | 'National' | 'Bilateral' {
  if (name.includes('ICC') || name.includes('World Cup')) return 'ICC';
  if (name.includes('vs')) return 'Bilateral';
  return 'National';
}

function getMatchFormat(match: any): 'ODI' | 'T10' | 'T20' | 'Test' {
  // Logic to determine match format
  if (match.matchType === 't20') return 'T20';
  if (match.matchType === 'odi') return 'ODI';
  if (match.matchType === 'test') return 'Test';
  if (match.matchType === 't10') return 'T10';
  return 'T20'; // Default
}

function getMockPredictions() {
  // Generate random prediction percentages
  const team1 = Math.floor(Math.random() * 80) + 10;
  const team2 = Math.floor(Math.random() * (100 - team1 - 5)) + 5;
  const draw = 100 - team1 - team2;
  
  return {
    team1Percentage: team1,
    team2Percentage: team2,
    drawPercentage: draw
  };
}

// Mock data for development
const mockTeams: Team[] = [
  { id: 1, name: 'India', code: 'IND', ranking: 1, logo: '' },
  { id: 2, name: 'Pakistan', code: 'PAK', ranking: 3, logo: '' },
  { id: 3, name: 'Australia', code: 'AUS', ranking: 2, logo: '' },
  { id: 4, name: 'England', code: 'ENG', ranking: 4, logo: '' },
  { id: 5, name: 'South Africa', code: 'SA', ranking: 5, logo: '' },
  { id: 6, name: 'New Zealand', code: 'NZ', ranking: 6, logo: '' }
];

const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John Smith',
    email: 'john@example.com',
    isAdmin: true,
    profilePicture: '',
    totalPredictions: 45,
    correctPredictions: 32,
    badges: [
      {
        id: 'badge1',
        name: 'Cricket Master',
        description: 'Won 10 consecutive bets',
        icon: 'trophy',
        unlockedAt: '2024-03-15T10:30:00Z'
      }
    ]
  },
  {
    id: 'user2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    isAdmin: false,
    profilePicture: '',
    totalPredictions: 38,
    correctPredictions: 25
  }
];

const mockLeaderboard: Leaderboard = {
  global: [
    {
      userId: 'user1',
      userName: 'John Smith',
      profilePicture: '',
      points: 320,
      totalPredictions: 45,
      correctPredictions: 32,
      accuracy: 71.1,
      rank: 1,
      previousRank: 2
    },
    {
      userId: 'user2',
      userName: 'Jane Doe',
      profilePicture: '',
      points: 250,
      totalPredictions: 38,
      correctPredictions: 25,
      accuracy: 65.8,
      rank: 2,
      previousRank: 1
    },
    {
      userId: 'user3',
      userName: 'Mike Johnson',
      profilePicture: '',
      points: 230,
      totalPredictions: 42,
      correctPredictions: 23,
      accuracy: 54.8,
      rank: 3,
      previousRank: 4
    },
    {
      userId: 'user4',
      userName: 'Sarah Williams',
      profilePicture: '',
      points: 210,
      totalPredictions: 35,
      correctPredictions: 21,
      accuracy: 60.0,
      rank: 4,
      previousRank: 3
    },
    {
      userId: 'user5',
      userName: 'David Brown',
      profilePicture: '',
      points: 190,
      totalPredictions: 30,
      correctPredictions: 19,
      accuracy: 63.3,
      rank: 5,
      previousRank: 5
    }
  ]
};