import React from 'react';
import { Trophy, Target, ArrowUp, ArrowDown, Minus, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ResultMatrixProps {
  user: {
    name: string;
    profilePicture?: string;
  };
  totalPoints: number;
  correctPicks: number;
  weeklyRank: number;
  previousWeeklyRank?: number;
  seasonRank: number;
  previousSeasonRank?: number;
}

const ResultMatrix: React.FC<ResultMatrixProps> = ({
  user,
  totalPoints,
  correctPicks,
  weeklyRank,
  previousWeeklyRank,
  seasonRank,
  previousSeasonRank
}) => {
  const getRankChangeIcon = (current: number, previous?: number) => {
    if (!previous) return null;
    if (current < previous) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    }
    if (current > previous) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3">
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.name} 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          )}
          <span>Result Matrix for {user.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Points */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalPoints}</p>
            <p className="text-sm text-gray-600 mt-1">Total Points</p>
          </div>

          {/* Correct Picks */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{correctPicks}</p>
            <p className="text-sm text-gray-600 mt-1">Correct Picks</p>
          </div>

          {/* Weekly Rank */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {getRankChangeIcon(weeklyRank, previousWeeklyRank)}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">#{weeklyRank}</p>
            <p className="text-sm text-gray-600 mt-1">Weekly Rank</p>
          </div>

          {/* Season Rank */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {getRankChangeIcon(seasonRank, previousSeasonRank)}
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">#{seasonRank}</p>
            <p className="text-sm text-gray-600 mt-1">Season Rank</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultMatrix;