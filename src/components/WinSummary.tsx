import React from 'react';
import { Trophy, Target, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent } from './ui/Card';

interface WinSummaryProps {
  totalPredictions: number;
  correctPredictions: number;
  points: number;
  rank: number;
  previousRank?: number;
}

const WinSummary: React.FC<WinSummaryProps> = ({
  totalPredictions,
  correctPredictions,
  points,
  rank,
  previousRank
}) => {
  const accuracy = totalPredictions > 0 
    ? Math.round((correctPredictions / totalPredictions) * 100) 
    : 0;
  
  const rankChange = previousRank !== undefined ? previousRank - rank : 0;
  
  const getRankChangeDisplay = () => {
    if (rankChange > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="h-4 w-4 mr-1" />
          <span>{rankChange}</span>
        </div>
      );
    }
    if (rankChange < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="h-4 w-4 mr-1" />
          <span>{Math.abs(rankChange)}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-gray-400">
        <Minus className="h-4 w-4 mr-1" />
        <span>0</span>
      </div>
    );
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Win Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Predictions</span>
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalPredictions}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Correct</span>
              <Trophy className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{correctPredictions}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Accuracy</span>
              <div className="h-5 w-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">%</div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{accuracy}%</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Rank</span>
              <div className="flex items-center">
                {previousRank !== undefined && getRankChangeDisplay()}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">#{rank}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Points</span>
            <span className="text-xl font-bold text-blue-600">{points}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WinSummary;