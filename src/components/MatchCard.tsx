import React from 'react';
import { formatDate } from '../lib/utils';
import { Match } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import Badge from './ui/Badge';

interface MatchCardProps {
  match: Match;
  onSelect?: () => void;
  showResult?: boolean;
  userPrediction?: 'team1' | 'team2' | 'draw';
  points?: number;
  showPredictionStats?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  onSelect, 
  showResult = false,
  userPrediction,
  points,
  showPredictionStats = false
}) => {
  const getStatusBadge = () => {
    switch (match.status) {
      case 'upcoming':
        return <Badge variant="info">Upcoming</Badge>;
      case 'live':
        return <Badge variant="warning">Live</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
    }
  };

  const getTeamStyle = (teamId: number) => {
    if (!showResult || !match.result) return '';
    
    if (match.result.winner === teamId) {
      return 'font-bold text-green-600';
    }
    return '';
  };

  const getPredictionStyle = (prediction: 'team1' | 'team2' | 'draw') => {
    if (userPrediction !== prediction) return '';
    
    if (match.status !== 'completed' || !match.result) {
      return 'bg-blue-100 border-blue-300';
    }
    
    const isCorrect = 
      (prediction === 'team1' && match.result.winner === match.team1.id) ||
      (prediction === 'team2' && match.result.winner === match.team2.id) ||
      (prediction === 'draw' && match.result.winner === 0);
    
    return isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
  };

  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <h3 className="font-medium">{match.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-sm text-gray-500">{formatDate(match.date)}</p>
            {match.venue && (
              <p className="text-xs text-gray-500">• {match.venue}</p>
            )}
          </div>
          {match.format && (
            <Badge variant="secondary" className="mt-1">{match.format}</Badge>
          )}
        </div>
        <div className="flex space-x-2">
          {getStatusBadge()}
          {points !== undefined && (
            <Badge variant={points > 0 ? 'success' : 'secondary'}>
              {points > 0 ? `+${points}` : '0'} pts
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <div className={`border rounded-md p-3 text-center ${getPredictionStyle('team1')}`}>
            <div className="flex justify-center mb-2">
              {match.team1.logo && (
                <img 
                  src={match.team1.logo} 
                  alt={match.team1.name} 
                  className="h-8 w-8 object-contain"
                />
              )}
            </div>
            <p className={`font-medium ${getTeamStyle(match.team1.id)}`}>
              {match.team1.name}
            </p>
            {showResult && match.result?.team1Score && (
              <p className="text-sm mt-1">{match.result.team1Score}</p>
            )}
            {showPredictionStats && match.predictions && (
              <div className="mt-2 text-xs text-gray-500">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ width: `${match.predictions.team1Percentage}%` }}
                  ></div>
                </div>
                <p className="mt-1">{match.predictions.team1Percentage}%</p>
              </div>
            )}
          </div>
          
          <div className={`border rounded-md p-3 text-center ${getPredictionStyle('draw')}`}>
            <div className="h-8 flex items-center justify-center mb-2">
              <span className="text-gray-400 text-xl">VS</span>
            </div>
            <p className="font-medium">Draw</p>
            {showPredictionStats && match.predictions && (
              <div className="mt-2 text-xs text-gray-500">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gray-600 h-1.5 rounded-full" 
                    style={{ width: `${match.predictions.drawPercentage}%` }}
                  ></div>
                </div>
                <p className="mt-1">{match.predictions.drawPercentage}%</p>
              </div>
            )}
          </div>
          
          <div className={`border rounded-md p-3 text-center ${getPredictionStyle('team2')}`}>
            <div className="flex justify-center mb-2">
              {match.team2.logo && (
                <img 
                  src={match.team2.logo} 
                  alt={match.team2.name} 
                  className="h-8 w-8 object-contain"
                />
              )}
            </div>
            <p className={`font-medium ${getTeamStyle(match.team2.id)}`}>
              {match.team2.name}
            </p>
            {showResult && match.result?.team2Score && (
              <p className="text-sm mt-1">{match.result.team2Score}</p>
            )}
            {showPredictionStats && match.predictions && (
              <div className="mt-2 text-xs text-gray-500">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-600 h-1.5 rounded-full" 
                    style={{ width: `${match.predictions.team2Percentage}%` }}
                  ></div>
                </div>
                <p className="mt-1">{match.predictions.team2Percentage}%</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;