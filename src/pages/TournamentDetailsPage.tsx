import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Plus, Users, Bell, Target as Cricket } from 'lucide-react';
import { useAppStore } from '../store';
import { getMatches } from '../lib/api';
import Button from '../components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import MatchCard from '../components/MatchCard';
import Badge from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Match, Pool } from '../types';
import BettingModal from '../components/BettingModal';
import TournamentSchedule from '../components/TournamentSchedule';
import DownloadScheduleButton from '../components/DownloadScheduleButton';
import PredictionForm from '../components/PredictionForm';

const TournamentDetailsPage: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  
  const { 
    currentUser, 
    tournaments, 
    matches, 
    setMatches,
    pools,
    createPool,
    getUserPools,
    placeBet
  } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [userPredictions, setUserPredictions] = useState<Record<number, 'team1' | 'team2' | 'draw'>>({});
  const [isSubmittingPrediction, setIsSubmittingPrediction] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const tournament = tournaments.find(t => t.id === parseInt(tournamentId || '0'));
  const userPools = getUserPools();
  
  useEffect(() => {
    if (!tournament) return;
    
    const fetchData = async () => {
      // Only fetch matches if we don't have any for this tournament
      const tournamentMatches = matches.filter(m => m.tournamentId === tournament.id);
      if (tournamentMatches.length === 0) {
        const data = await getMatches(tournament.id);
        setMatches(data);
      }
      
      // Get user predictions for this tournament
      if (currentUser) {
        const predictions: Record<number, 'team1' | 'team2' | 'draw'> = {};
        
        userPools.forEach(pool => {
          if (pool.tournamentId === tournament.id) {
            const member = pool.members.find(m => m.userId === currentUser.id);
            if (member) {
              member.bets.forEach(bet => {
                predictions[bet.matchId] = bet.prediction;
              });
            }
          }
        });
        
        setUserPredictions(predictions);
      }
      
      setDataLoaded(true);
    };
    
    if (!dataLoaded) {
      fetchData();
    }
  }, [tournament, matches, setMatches, currentUser, userPools, dataLoaded]);
  
  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Tournament not found.</p>
      </div>
    );
  }
  
  const tournamentMatches = matches.filter(m => m.tournamentId === tournament.id);
  const upcomingMatches = tournamentMatches.filter(m => m.status === 'upcoming');
  const liveMatches = tournamentMatches.filter(m => m.status === 'live');
  const completedMatches = tournamentMatches.filter(m => m.status === 'completed');
  
  const tournamentPools = pools.filter(p => p.tournamentId === tournament.id);
  
  const handleCreatePool = () => {
    const pool = createPool(tournament.name + ' Pool', tournament.id);
    navigate(`/pools/${pool.id}`);
  };
  
  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    setShowBettingModal(true);
  };
  
  const handlePredictionSubmit = async (matchId: number, prediction: 'team1' | 'team2' | 'draw', confidence: number) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setIsSubmittingPrediction(true);
    
    try {
      // Find a pool for this tournament that the user is a member of
      let userPool = userPools.find(p => p.tournamentId === tournament.id);
      
      // If no pool exists, create one
      if (!userPool) {
        userPool = createPool(tournament.name + ' Pool', tournament.id);
      }
      
      // Place bet
      placeBet(userPool.id, matchId, prediction, confidence);
      
      // Update local state to show the prediction immediately
      setUserPredictions(prev => ({
        ...prev,
        [matchId]: prediction
      }));
    } catch (error) {
      console.error('Error submitting prediction:', error);
    } finally {
      setIsSubmittingPrediction(false);
    }
  };
  
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const endMonth = endDate.toLocaleString('default', { month: 'short' });
    
    if (startMonth === endMonth && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.getDate()} - ${endDate.getDate()} ${startMonth} ${startDate.getFullYear()}`;
    }
    
    if (startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.getDate()} ${startMonth} - ${endDate.getDate()} ${endMonth} ${startDate.getFullYear()}`;
    }
    
    return `${startDate.getDate()} ${startMonth} ${startDate.getFullYear()} - ${endDate.getDate()} ${endMonth} ${endDate.getFullYear()}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/tournaments')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tournaments
      </Button>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          {tournament.logo ? (
            <img 
              src={tournament.logo} 
              alt={tournament.name} 
              className="h-20 w-auto object-contain mr-6 mb-4 md:mb-0"
            />
          ) : (
            <div className="h-20 w-20 flex items-center justify-center bg-blue-100 rounded-lg mr-6 mb-4 md:mb-0">
              <Cricket className="h-12 w-12 text-blue-600" />
            </div>
          )}
          
          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {tournament.format && (
                <Badge variant="info">{tournament.format}</Badge>
              )}
              {tournament.category && (
                <Badge variant="secondary">{tournament.category}</Badge>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{tournament.name}</h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDateRange(tournament.startDate, tournament.endDate)}
              </div>
              
              {tournament.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {tournament.location}
                </div>
              )}
              
              {tournament.totalMatches && (
                <div className="text-sm text-gray-600">
                  {tournament.totalMatches} matches
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-4 flex flex-col sm:flex-row gap-2">
            <DownloadScheduleButton tournament={tournament} />
            <Button 
              variant="primary"
              onClick={handleCreatePool}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Pool
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs className="mb-8">
            <TabsList>
              <TabsTrigger 
                isActive={activeTab === 'schedule'} 
                onClick={() => setActiveTab('schedule')}
              >
                Full Schedule
              </TabsTrigger>
              <TabsTrigger 
                isActive={activeTab === 'upcoming'} 
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger 
                isActive={activeTab === 'live'} 
                onClick={() => setActiveTab('live')}
              >
                Live
              </TabsTrigger>
              <TabsTrigger 
                isActive={activeTab === 'completed'} 
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </TabsTrigger>
            </TabsList>
            
            <TabsContent isActive={activeTab === 'schedule'}>
              <TournamentSchedule 
                matches={tournamentMatches}
                onSelectMatch={handleMatchSelect}
                showPredictionStats={true}
                userPredictions ={userPredictions}
              />
            </TabsContent>
            
            <TabsContent isActive={activeTab === 'upcoming'}>
              <div className="space-y-4">
                {upcomingMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match}
                    showPredictionStats={true}
                    onSelect={() => handleMatchSelect(match)}
                    userPrediction={userPredictions[match.id]}
                  />
                ))}
                
                {upcomingMatches.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No upcoming matches.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent isActive={activeTab === 'live'}>
              <div className="space-y-4">
                {liveMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match}
                    showPredictionStats={true}
                    userPrediction={userPredictions[match.id]}
                  />
                ))}
                
                {liveMatches.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No live matches.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent isActive={activeTab === 'completed'}>
              <div className="space-y-4">
                {completedMatches.map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match}
                    showResult={true}
                    showPredictionStats={true}
                    userPrediction={userPredictions[match.id]}
                  />
                ))}
                
                {completedMatches.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No completed matches.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          {/* Quick Prediction Form */}
          {selectedMatch && selectedMatch.status === 'upcoming' && (
            <div className="mb-6">
              <PredictionForm 
                match={selectedMatch}
                onSubmit={(prediction, confidence) => 
                  handlePredictionSubmit(selectedMatch.id, prediction, confidence)
                }
                currentPrediction={userPredictions[selectedMatch.id]}
                isSubmitting={isSubmittingPrediction}
              />
            </div>
          )}
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Available Pools</h2>
              
              {tournamentPools.length > 0 ? (
                <div className="space-y-4">
                  {tournamentPools.map(pool => (
                    <div 
                      key={pool.id} 
                      className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/pools/${pool.id}`)}
                    >
                      <h3 className="font-medium">{pool.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Users className="h-4 w-4 mr-2" />
                        {pool.members.length} members
                      </div>
                      {pool.adminId === currentUser?.id && (
                        <Badge variant="secondary" className="mt-2">You're Admin</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">No pools available for this tournament.</p>
                  <Button 
                    variant="primary"
                    onClick={handleCreatePool}
                  >
                    Create First Pool
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {liveMatches.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Live Matches</h2>
                <div className="space-y-4">
                  {liveMatches.map(match => (
                    <div 
                      key={match.id} 
                      className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/pools/${tournamentPools[0]?.id || ''}`)}
                    >
                      <p className="font-medium">{match.name}</p>
                      <p className="text-sm text-gray-500">{match.venue}</p>
                      <Badge variant="warning" className="mt-2">Live</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Tournament Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Matches</span>
                  <span className="font-semibold">{tournament.totalMatches}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold">{completedMatches.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Upcoming</span>
                  <span className="font-semibold">{upcomingMatches.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Live</span>
                  <span className="font-semibold">{liveMatches.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Pools</span>
                  <span className="font-semibold">{tournamentPools.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {showBettingModal && selectedMatch && (
        <BettingModal
          match={selectedMatch}
          onClose={() => setShowBettingModal(false)}
          onPlaceBet={(prediction, confidence) => {
            // Find a pool for this tournament that the user is a member of
            const userPool = userPools.find(p => p.tournamentId === tournament.id);
            
            if (userPool) {
              // Place bet in the first available pool
              placeBet(userPool.id, selectedMatch.id, prediction, confidence);
              
              // Update local state to show the prediction immediately
              setUserPredictions(prev => ({
                ...prev,
                [selectedMatch.id]: prediction
              }));
            } else {
              // If no pool exists, create one and place bet
              const newPool = createPool(tournament.name + ' Pool', tournament.id);
              placeBet(newPool.id, selectedMatch.id, prediction, confidence);
              
              // Update local state
              setUserPredictions(prev => ({
                ...prev,
                [selectedMatch.id]: prediction
              }));
            }
            
            setShowBettingModal(false);
          }}
          currentPrediction={userPredictions[selectedMatch.id]}
        />
      )}
    </div>
  );
};

export default TournamentDetailsPage;