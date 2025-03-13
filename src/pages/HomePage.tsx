import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Trophy, Calendar, TrendingUp, Target as Cricket } from 'lucide-react';
import CurrencyConverter from '../components/CurrencyConverter';
import Calculator from '../components/Calculator';
import { useAppStore } from '../store';
import { getTournaments, getMatches, getLeaderboard } from '../lib/api';
import Button from '../components/ui/Button';
import PoolCard from '../components/PoolCard';
import Input from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import MatchCard from '../components/MatchCard';
import TournamentCard from '../components/TournamentCard';
import ResultMatrix from '../components/ResultMatrix';
import LeaderboardTable from '../components/LeaderboardTable';
import { Tournament, Match, LeaderboardEntry } from '../types';
import Badge from '../components/ui/Badge';

const HomePage: React.FC = () => {
  const { 
    currentUser, 
    pools, 
    getUserPools, 
    joinPool, 
    setTournaments, 
    setMatches,
    tournaments,
    matches
  } = useAppStore();
  
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [featuredTournaments, setFeaturedTournaments] = useState<Tournament[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState({
    totalPredictions: 0,
    correctPredictions: 0,
    points: 0,
    rank: 0,
    previousRank: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  const userPools = getUserPools();
  const featuredPools = pools.filter(p => p.isFeatured).slice(0, 4);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Fetch tournaments and matches
    const fetchData = async () => {
      setIsLoading(true);
      // Fetch tournaments if not already loaded
      if (tournaments.length === 0) {
        const tournamentsData = await getTournaments();
        setTournaments(tournamentsData);
        
        // Set featured tournaments (ICC tournaments and IPL/PSL 2025)
        const featured = tournamentsData.filter(t => t.name.includes('2025'));
        setFeaturedTournaments(featured);
        
        // Fetch matches for each tournament
        for (const tournament of tournamentsData) {
          const matchesData = await getMatches(tournament.id);
          setMatches(matchesData);
        }
      } else {
        // Use existing data
        const featured = tournaments.filter(t => t.name.includes('2025'));
        setFeaturedTournaments(featured);
      }
      
      // Get upcoming matches
      const upcoming = matches
        .filter(m => m.status === 'upcoming' || m.status === 'live')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      setUpcomingMatches(upcoming);
      
      // Get leaderboard
      const leaderboardData = await getLeaderboard();
      setLeaderboard(leaderboardData.global.slice(0, 10));
      
      // Find current user in leaderboard
      const userEntry = leaderboardData.global.find(entry => entry.userId === currentUser.id);
      if (userEntry) {
        setUserStats({
          totalPredictions: userEntry.totalPredictions,
          correctPredictions: userEntry.correctPredictions,
          points: userEntry.points,
          rank: userEntry.rank,
          previousRank: userEntry.previousRank
        });
      }
      setIsLoading(false);
    };
    
    fetchData();
  }, [currentUser, navigate, setTournaments, setMatches, tournaments.length, matches]);
  
  const handleJoinPool = () => {
    if (!inviteCode.trim()) {
      setJoinError('Please enter an invite code');
      return;
    }
    
    setIsJoining(true);
    setJoinError('');
    
    try {
      const success = joinPool(inviteCode.trim());
      if (success) {
        setInviteCode('');
      } else {
        setJoinError('Invalid invite code');
      }
    } catch (error) {
      setJoinError('An error occurred. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };
  
  // Highlight IPL and PSL 2025 tournaments
  const ipl2025 = tournaments.find(t => t.id === 2025001);
  const psl2025 = tournaments.find(t => t.id === 2025002);
  const t20blast2025 = tournaments.find(t => t.id === 2025003);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {currentUser?.name}</h1>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={handleJoinPool}
              isLoading={isJoining}
            >
              Join Pool
            </Button>
          
            <Button 
              variant="primary"
              onClick={() => navigate('/create-pool')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Pool
            </Button>
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full"
              />
            </div>
            {joinError && (
              <p className="text-xs text-red-600 mt-1">{joinError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <CurrencyConverter />
            <Calculator />
          </div>
        </div>

        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-blue-600">Top Players</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/leaderboard')}
                className="text-blue-600 hover:text-blue-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Full Leaderboard
              </Button>
            </CardHeader>
            <CardContent>
              <LeaderboardTable 
                entries={leaderboard} 
                currentUserId={currentUser?.id}
                showRankChange={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <ResultMatrix
          user={{
            name: currentUser?.name || '',
            profilePicture: currentUser?.profilePicture
          }}
          totalPoints={userStats.points}
          correctPicks={userStats.correctPredictions}
          weeklyRank={userStats.rank}
          previousWeeklyRank={userStats.previousRank}
          seasonRank={userStats.rank}
          previousSeasonRank={userStats.previousRank}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Featured Tournaments */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Featured Tournaments</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/tournaments')}
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </div>

          {/* New 2025 Tournaments Highlight */}
          {(ipl2025 || psl2025 || t20blast2025) && !isLoading && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">2025 Tournaments</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/tournaments')}
                >
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ipl2025 && (
                  <Card className="border-blue-300 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        {ipl2025.logo ? (
                          <img 
                            src={ipl2025.logo} 
                            alt={ipl2025.name} 
                            className="h-16 w-auto object-contain mr-4"
                          />
                        ) : (
                          <div className="h-16 w-16 flex items-center justify-center bg-blue-200 rounded-lg mr-4">
                            <Cricket className="h-10 w-10 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold">{ipl2025.name}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(ipl2025.startDate).toLocaleDateString()} - {new Date(ipl2025.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">
                        The 2025 season of the Indian Premier League is here! Create or join a pool to predict match outcomes and compete with friends.
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/tournaments/${ipl2025.id}`)}
                      >
                        View Tournament
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {psl2025 && (
                  <Card className="border-green-300 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="h-16 w-16 flex items-center justify-center bg-green-200 rounded-lg mr-4">
                          <Cricket className="h-10 w-10 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{psl2025.name}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(psl2025.startDate).toLocaleDateString()} - {new Date(psl2025.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">
                        The Pakistan Super League 2025 is coming soon! Join the excitement by creating a prediction pool with your friends.
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/tournaments/${psl2025.id}`)}
                      >
                        View Tournament
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {t20blast2025 && (
                  <Card className="border-purple-300 bg-purple-50">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        {t20blast2025.logo ? (
                          <img 
                            src={t20blast2025.logo} 
                            alt={t20blast2025.name} 
                            className="h-16 w-auto object-contain mr-4"
                          />
                        ) : (
                          <div className="h-16 w-16 flex items-center justify-center bg-purple-200 rounded-lg mr-4">
                            <Cricket className="h-10 w-10 text-purple-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold">{t20blast2025.name}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(t20blast2025.startDate).toLocaleDateString()} - {new Date(t20blast2025.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">
                        The 2025 season of England's premier T20 competition is here! Create or join a pool to predict match outcomes and compete with friends.
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/tournaments/${t20blast2025.id}`)}
                      >
                        View Tournament
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          {/* Live & Upcoming Matches */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Live & Upcoming Matches</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/tournaments')}
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {upcomingMatches.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match}
                  showPredictionStats={true}
                  onSelect={() => navigate(`/tournaments/${match.tournamentId}`)}
                />
              ))}
              
              {upcomingMatches.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Matches</h3>
                    <p className="text-gray-500">
                      Check back later for upcoming matches.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          {/* Your Pools */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Pools</h2>
              {userPools.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/profile')}
                >
                  View All
                </Button>
              )}
            </div>
            
            {userPools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPools.slice(0, 4).map(pool => (
                  <PoolCard 
                    key={pool.id} 
                    pool={pool} 
                    isAdmin={pool.adminId === currentUser?.id}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pools Yet</h3>
                  <p className="text-gray-500 mb-4">
                    Create a new pool or join an existing one with an invite code.
                  </p>
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/create-pool')}
                  >
                    Create Your First Pool
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Top Pools */}
        {featuredPools.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Top Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featuredPools.map(pool => (
                  <div 
                    key={pool.id} 
                    className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/pools/${pool.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{pool.name}</h4>
                        <p className="text-sm text-gray-500">{pool.members.length} members</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HomePage;