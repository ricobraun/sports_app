import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAppStore } from '../store';
import { getTournaments } from '../lib/api';
import { Tournament } from '../types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import TournamentCard from '../components/TournamentCard';
import Input from '../components/ui/Input';

const TournamentsPage: React.FC = () => {
  const { tournaments, setTournaments } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'icc' | 'national' | 'bilateral'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTournaments = async () => {
      if (tournaments.length === 0) {
        const data = await getTournaments();
        setTournaments(data);
      }
    };
    
    fetchTournaments();
  }, [tournaments.length, setTournaments]);
  
  const filterTournaments = (category?: 'ICC' | 'National' | 'Bilateral') => {
    let filtered = [...tournaments];
    
    // Filter by category if specified
    if (category) {
      filtered = filtered.filter(t => t.category === category);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) || 
        (t.location && t.location.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };
  
  const allTournaments = filterTournaments();
  const iccTournaments = filterTournaments('ICC');
  const nationalTournaments = filterTournaments('National');
  const bilateralTournaments = filterTournaments('Bilateral');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cricket Tournaments</h1>
        
        <div className="mt-4 md:mt-0 w-full md:w-64">
          <div className="relative">
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      
      <Tabs className="mb-8">
        <TabsList>
          <TabsTrigger 
            isActive={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
          >
            All Tournaments
          </TabsTrigger>
          <TabsTrigger 
            isActive={activeTab === 'icc'} 
            onClick={() => setActiveTab('icc')}
          >
            ICC Tournaments
          </TabsTrigger>
          <TabsTrigger 
            isActive={activeTab === 'national'} 
            onClick={() => setActiveTab('national')}
          >
            National Leagues
          </TabsTrigger>
          <TabsTrigger 
            isActive={activeTab === 'bilateral'} 
            onClick={() => setActiveTab('bilateral')}
          >
            Bilateral Series
          </TabsTrigger>
        </TabsList>
        
        <TabsContent isActive={activeTab === 'all'}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTournaments.map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
            
            {allTournaments.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No tournaments found.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent isActive={activeTab === 'icc'}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {iccTournaments.map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
            
            {iccTournaments.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No ICC tournaments found.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent isActive={activeTab === 'national'}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nationalTournaments.map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
            
            {nationalTournaments.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No national leagues found.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent isActive={activeTab === 'bilateral'}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bilateralTournaments.map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
            
            {bilateralTournaments.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">No bilateral series found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TournamentsPage;