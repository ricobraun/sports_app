import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Match } from '../types';
import MatchCard from './MatchCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import Select from './ui/Select';
import { format } from 'date-fns';

interface TournamentScheduleProps {
  matches: Match[];
  onSelectMatch?: (match: Match) => void;
  showPredictionStats?: boolean;
  userPredictions?: Record<number, 'team1' | 'team2' | 'draw'>;
}

const TournamentSchedule: React.FC<TournamentScheduleProps> = ({
  matches,
  onSelectMatch,
  showPredictionStats = false,
  userPredictions = {}
}) => {
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [filterVenue, setFilterVenue] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'popularity'>('date');
  
  // Extract unique teams and venues for filters
  const teams = Array.from(new Set(
    matches.flatMap(match => [match.team1.name, match.team2.name])
  )).sort();
  
  const venues = Array.from(new Set(
    matches.filter(match => match.venue).map(match => match.venue as string)
  )).sort();
  
  // Filter and sort matches
  const filteredMatches = matches.filter(match => {
    if (filterTeam && match.team1.name !== filterTeam && match.team2.name !== filterTeam) {
      return false;
    }
    
    if (filterVenue && match.venue !== filterVenue) {
      return false;
    }
    
    return true;
  });
  
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      // Sort by popularity (prediction count)
      const aPopularity = (a.predictions?.team1Percentage || 0) + (a.predictions?.team2Percentage || 0);
      const bPopularity = (b.predictions?.team1Percentage || 0) + (b.predictions?.team2Percentage || 0);
      return bPopularity - aPopularity;
    }
  });
  
  // Group matches by date
  const matchesByDate: Record<string, Match[]> = {};
  
  sortedMatches.forEach(match => {
    const dateKey = format(new Date(match.date), 'yyyy-MM-dd');
    if (!matchesByDate[dateKey]) {
      matchesByDate[dateKey] = [];
    }
    matchesByDate[dateKey].push(match);
  });
  
  const dateKeys = Object.keys(matchesByDate).sort();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tournament Schedule</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setFilterTeam('');
                setFilterVenue('');
                setSortBy('date');
              }}
            >
              Reset Filters
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Select
              label="Filter by Team"
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              options={[
                { value: '', label: 'All Teams' },
                ...teams.map(team => ({ value: team, label: team }))
              ]}
            />
            
            <Select
              label="Filter by Venue"
              value={filterVenue}
              onChange={(e) => setFilterVenue(e.target.value)}
              options={[
                { value: '', label: 'All Venues' },
                ...venues.map(venue => ({ value: venue, label: venue }))
              ]}
            />
            
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'popularity')}
              options={[
                { value: 'date', label: 'Date (Ascending)' },
                { value: 'popularity', label: 'Popularity' }
              ]}
            />
          </div>
          
          {filteredMatches.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
              <p className="text-gray-500">
                Try adjusting your filters to see more matches.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {dateKeys.map(dateKey => (
                <div key={dateKey}>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                    {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {matchesByDate[dateKey].map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onSelect={() => onSelectMatch && onSelectMatch(match)}
                        showPredictionStats={showPredictionStats}
                        userPrediction={userPredictions[match.id]}
                        showResult={match.status === 'completed'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentSchedule;