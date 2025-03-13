import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { getLeaderboard } from '../lib/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import LeaderboardTable from '../components/LeaderboardTable';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LeaderboardEntry } from '../types';

const LeaderboardPage: React.FC = () => {
  const { currentUser } = useAppStore();
   const [activeTab, setActiveTab] = useState('global');
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tournamentLeaderboards, setTournamentLeaderboards] = useState<Record<number, LeaderboardEntry[]>>({});
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard();
      setGlobalLeaderboard(data.global);
      
      if (data.tournament) {
        setTournamentLeaderboards(data.tournament);
      }
    };
    
    fetchLeaderboard();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Leaderboard</h1>
      
      <Tabs className="mb-8">
        <TabsList>
          <TabsTrigger 
            isActive={activeTab === 'global'} 
            onClick={() => setActiveTab('global')}
          >
            Global Leaderboard
          </TabsTrigger>
          <TabsTrigger 
            isActive={activeTab === 'tournaments'} 
            onClick={() => setActiveTab('tournaments')}
          >
            Tournament Leaderboards
          </TabsTrigger>
        </TabsList>
        
        <TabsContent isActive={activeTab === 'global'}>
          <Card>
            <CardHeader>
              <CardTitle>Global Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <LeaderboardTable 
                entries={globalLeaderboard} 
                currentUserId={currentUser?.id}
                showRankChange={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent isActive={activeTab === 'tournaments'}>
          <div className="space-y-8">
            {Object.keys(tournamentLeaderboards).length > 0 ? (
              Object.entries(tournamentLeaderboards).map(([tournamentId, entries]) => (
                <Card key={tournamentId}>
                  <CardHeader>
                    <CardTitle>
                      {/* In a real app, get tournament name from the tournament ID */}
                      Tournament Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LeaderboardTable 
                      entries={entries} 
                      currentUserId={currentUser?.id}
                      showRankChange={true}
                    />
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No tournament leaderboards available.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardPage;