import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trophy, Calendar, Award } from 'lucide-react';
import { useAppStore } from '../store';
import { getUserStats } from '../lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import PoolCard from '../components/PoolCard';
import WinSummary from '../components/WinSummary';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import MatchCard from '../components/MatchCard';
import Badge from '../components/ui/Badge';
import { Match, Badge as BadgeType } from '../types';

const ProfilePage: React.FC = () => {
  const { currentUser, getUserPools, pools } = useAppStore();
  const [activeTab, setActiveTab] = useState('pools');
  const [userStats, setUserStats] = useState({
    totalPredictions: 0,
    correctPredictions: 0,
    points: 0,
    rank: 0,
    previousRank: 0,
    badges: [] as BadgeType[]
  });
  const [recentBets, setRecentBets] = useState<{match: Match, prediction: 'team1' | 'team2' | 'draw', points: number}[]>([]);
  
  const navigate = useNavigate();
  const userPools = getUserPools();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchUserStats = async () => {
      const stats = await getUserStats(currentUser.id);
      if (stats) {
        setUserStats({
          totalPredictions: stats.totalPredictions || 0,
          correctPredictions: stats.correctPredictions || 0,
          points: 0, // Calculate from pools
          rank: 0, // Get from leaderboard
          previousRank: 0,
          badges: stats.badges || []
        });
      }
    };
    
    fetchUserStats();
    
    // Calculate total points from all pools
    let totalPoints = 0;
    const bets: {match: Match, prediction: 'team1' | 'team2' | 'draw', points: number}[] = [];
    
    userPools.forEach(pool => {
      const member = pool.members.find(m => m.userId === currentUser.id);
      if (member) {
        totalPoints += member.points;
        
        // Collect recent bets
        member.bets.forEach(bet => {
          const match = pools
            .flatMap(p => p.matches || [])
            .find(m => m.id === bet.matchId);
          
          if (match) {
            bets.push({
              match,
              prediction: bet.prediction,
              points: bet.points
            });
          }
        });
      }
    });
    
    setUserStats(prev => ({
      ...prev,
      points: totalPoints
    }));
    
    // Sort bets by date (most recent first) and take the first 5
    setRecentBets(
      bets
        .sort((a, b) => new Date(b.match.date).getTime() - new Date(a.match.date).getTime())
        .slice(0, 5)
    );
  }, [currentUser, navigate, userPools, pools]);
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="mb-4 md:mb-0 md:mr-6">
            {currentUser.profilePicture ? (
              <img 
                src={currentUser.profilePicture} 
                alt={currentUser.name} 
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-12 w-12 text-blue-500" />
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
            <p className="text-gray-600">{currentUser.email}</p>
            
            {userStats.badges && userStats.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {userStats.badges.map(badge => (
                  <Badge key={badge.id} variant="success">
                    {badge.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <WinSummary 
          totalPredictions={userStats.totalPredictions}
          correctPredictions={userStats.correctPredictions}
          points={userStats.points}
          rank={userStats.rank}
          previousRank={userStats.previousRank}
        />
      </div>
      
      <Tabs className="mb-8">
        <TabsList>
          <TabsTrigger 
            isActive={activeTab === 'pools'} 
            onClick={() => setActiveTab('pools')}
          >
            Your Pools
          </TabsTrigger>
          <TabsTrigger 
            isActive={activeTab === 'predictions'} 
            onClick={() => setActiveTab('predictions')}
          >
            Prediction History
          </TabsTrigger>
          <TabsTrigger 
            isActive={activeTab === 'achievements'} 
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent isActive={activeTab === 'pools'}>
          {userPools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPools.map(pool => (
                <PoolCard 
                  key={pool.id} 
                  pool={pool} 
                  isAdmin={pool.adminId === currentUser.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't joined any pools yet.</p>
              <button 
                className="text-blue-600 font-medium"
                onClick={() => navigate('/')}
              >
                Explore pools to join
              </button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent isActive={activeTab === 'predictions'}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentBets.length > 0 ? (
                <div className="space-y-4">
                  {recentBets.map((bet, index) => (
                    <MatchCard 
                      key={`${bet.match.id}-${index}`}
                      match={bet.match}
                      showResult={bet.match.status === 'completed'}
                      userPrediction={bet.prediction}
                      points={bet.points}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No predictions made yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent isActive={activeTab === 'achievements'}>
          <Card>
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {userStats.badges && userStats.badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userStats.badges.map(badge => (
                    <div key={badge.id} className="border rounded-lg p-4 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <Award className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{badge.name}</h3>
                        <p className="text-sm text-gray-500">{badge.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Badges Yet</h3>
                  <p className="text-gray-500">
                    Make predictions and win to earn badges and achievements.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;