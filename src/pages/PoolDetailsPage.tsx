import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Trophy, Filter, Download } from 'lucide-react';
import { useAppStore } from '../store';
import { getMatches } from '../lib/api';
import Button from '../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import MatchCard from '../components/MatchCard';
import LeaderboardTable from '../components/LeaderboardTable';
import BettingModal from '../components/BettingModal';
import { Match } from '../types';
import PoolResultMatrix from '../components/PoolResultMatrix';
import TournamentSchedule from '../components/TournamentSchedule';
import ScheduleDownloadOptions from '../components/ScheduleDownloadOptions';
import PredictionForm from '../components/PredictionForm';

const PoolDetailsPage: React.FC = () => {
  const { poolId } = useParams<{ poolId: string }>();
  const navigate = useNavigate();
  
  const { 
    currentUser, 
    getPoolById, 
    getMatchById,
    placeBet,
    matches,
    setMatches,
    tournaments
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isSubmittingPrediction, setIsSubmittingPrediction] = useState(false);
  
  const pool = poolId ? getPoolById(poolId) : undefined;
  const currentMember = pool?.members.find(m => m.userId === currentUser?.id);
  const tournament = pool ? tournaments.find(t => t.id === pool.tournamentId) : undefined;
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!pool) {
      navigate('/');
      return;
    }
    
    const fetchMatches = async () => {
      if (matches.length === 0) {
        const data = await getMatches(pool.tournamentId);
        setMatches(data);
      }
    };
    
    fetchMatches();
  }, [currentUser, pool, navigate, matches.length, setMatches]);
  
  const poolMatches = matches.filter(match => {
    // Only show matches for this tournament
    return match.tournamentId === pool?.tournamentId;
  });
  
  const upcomingMatches = poolMatches.filter(match => match.status === 'upcoming');
  const liveMatches = poolMatches.filter(match => match.status === 'live');
  const completedMatches = poolMatches.filter(match => match.status === 'completed');
  
  const handleMatchSelect = (match: Match) => {
    if (match.status === 'upcoming') {
      setSelectedMatch(match);
      setShowBettingModal(true);
    }
  };
  
  const handlePlaceBet = (prediction: 'team1' | 'team2' | 'draw', confidence?: number) => {
    if (poolId && selectedMatch) {
      setIsSubmittingPrediction(true);
      try {
        placeBet(poolId, selectedMatch.id, prediction, confidence);
      } finally {
        setIsSubmittingPrediction(false);
      }
    }
  };
  
  const copyInviteCode = () => {
    if (pool) {
      navigator.clipboard.writeText(pool.inviteCode);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };
  
  const getUserPrediction = (matchId: number) => {
    if (!currentMember) return undefined;
    
    const bet = currentMember.bets.find(b => b.matchId === matchId);
    return bet?.prediction;
  };
  
  const getUserPoints = (matchId: number) => {
    if (!currentMember) return undefined;
    
    const bet = currentMember.bets.find(b => b.matchId === matchId);
    return bet?.points;
  };
  
  const getUserConfidence = (matchId: number) => {
    if (!currentMember) return undefined;
    
    const bet = currentMember.bets.find(b => b.matchId === matchId);
    return bet?.confidence;
  };
  
  // Create a map of user predictions for all matches
  const userPredictions: Record<number, 'team1' | 'team2' | 'draw'> = {};
  if (currentMember) {
    currentMember.bets.forEach(bet => {
      userPredictions[bet.matchId] = bet.prediction;
    });
  }
  
  if (!pool) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Pools
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pool.name}</h1>
          <p className="text-gray-600">
            {pool.members.length} members • {tournament?.name || 'Tournament'}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            variant="outline"
            onClick={copyInviteCode}
          >
            <Share2 className="h-4 w-4 mr-2" />
            {copiedInvite ? 'Copied!' : 'Share Invite Code'}
          </Button>
          
          {pool.adminId === currentUser?.id && (
            <Button 
              variant="outline"
              onClick={() => navigate(`/pools/${pool.id}/manage`)}
            >
              Manage Pool
            </Button>
          )}
        </div>
      </div>
      
      <Tabs className="mb-8">
        <TabsList>
          <TabsTrigger 
            isActive={activeTab === 'matches'} 
            onClick={() => setActiveTab('matches')}
          >
            Matches
          </TabsTrigger>
          <TabsTrigger 
            isActive={activeTab === 'matrix'} 
            onClick={() => setActiveTab('matrix')}
          >
            Result Matrix
          </TabsTrigger>
          <TabsTrigger 
            isActive={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')}
          >
            Full Schedule
          </TabsTrigger>
          <TabsTrigger 
            isActive={activeTab === 'leaderboard'} 
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent isActive={activeTab === 'matches'}>
          {liveMatches.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Live Matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match}
                    userPrediction={getUserPrediction(match.id)}
                    showResult={true}
                  />
                ))}
              </div>
            </div>
          )}
          
          {upcomingMatches.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Upcoming Matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match}
                    onSelect={() => handleMatchSelect(match)}
                    userPrediction={getUserPrediction(match.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {completedMatches.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Completed Matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match}
                    showResult={true}
                    userPrediction={getUserPrediction(match.id)}
                    points={getUserPoints(match.id)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {poolMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No matches available for this tournament.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent isActive={activeTab === 'matrix'}>
          <PoolResultMatrix
            poolName={pool.name}
            matches={poolMatches}
            teams={Array.from(
              new Set(
                poolMatches.flatMap(match => [match.team1, match.team2])
              )
            )}
          />
        </TabsContent>
        
        <TabsContent isActive={activeTab === 'schedule'}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TournamentSchedule 
                matches={poolMatches}
                onSelectMatch={handleMatchSelect}
                showPredictionStats={true}
                userPredictions={userPredictions}
              />
            </div>
            <div>
              {tournament && (
                <ScheduleDownloadOptions 
                  tournament={tournament} 
                  matches={poolMatches}
                />
              )}
              
              {selectedMatch && selectedMatch.status === 'upcoming' && (
                <div className="mt-6">
                  <PredictionForm 
                    match={selectedMatch}
                    onSubmit={(prediction, confidence) => 
                      handlePlaceBet(prediction, confidence)
                    }
                    currentPrediction={getUserPrediction(selectedMatch.id)}
                    currentConfidence={getUserConfidence(selectedMatch.id)}
                    isSubmitting={isSubmittingPrediction}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent isActive={activeTab === 'leaderboard'}>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Leaderboard</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Current standings for all members in this pool.
              </p>
            </div>
            <LeaderboardTable 
              members={pool.members} 
              currentUserId={currentUser?.id}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {showBettingModal && selectedMatch && (
        <BettingModal
          match={selectedMatch}
          onClose={() => setShowBettingModal(false)}
          onPlaceBet={handlePlaceBet}
          currentPrediction={getUserPrediction(selectedMatch.id)}
          currentConfidence={getUserConfidence(selectedMatch.id)}
        />
      )}
    </div>
  );
};

export default PoolDetailsPage;