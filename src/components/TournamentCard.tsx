import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Target as Cricket } from 'lucide-react';
import { Tournament } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import Badge from './ui/Badge';

interface TournamentCardProps {
  tournament: Tournament;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const navigate = useNavigate();
  
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
  
  const getFormatBadge = () => {
    switch (tournament.format) {
      case 'T20':
        return <Badge variant="info">T20</Badge>;
      case 'ODI':
        return <Badge variant="warning">ODI</Badge>;
      case 'Test':
        return <Badge variant="success">Test</Badge>;
      case 'T10':
        return <Badge variant="danger">T10</Badge>;
      default:
        return <Badge variant="secondary">{tournament.format}</Badge>;
    }
  };
  
  const getCategoryBadge = () => {
    switch (tournament.category) {
      case 'ICC':
        return <Badge variant="primary">ICC</Badge>;
      case 'National':
        return <Badge variant="secondary">National</Badge>;
      case 'Bilateral':
        return <Badge variant="default">Bilateral</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col"
      onClick={() => navigate(`/tournaments/${tournament.id}`)}
    >
      <CardHeader className="pb-2 relative">
        <div className="absolute top-2 right-2 flex space-x-2">
          {getFormatBadge()}
          {getCategoryBadge()}
        </div>
        <div className="flex items-center space-x-4">
          {tournament.logo ? (
            <img 
              src={tournament.logo} 
              alt={tournament.name} 
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div className="h-16 w-16 flex items-center justify-center bg-blue-100 rounded-lg">
              <Cricket className="h-8 w-8 text-blue-600" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-lg">{tournament.name}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
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
      </CardContent>
    </Card>
  );
};

export default TournamentCard;