import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { PoolMember, LeaderboardEntry } from '../types';

interface LeaderboardTableProps {
  members?: PoolMember[];
  entries?: LeaderboardEntry[];
  currentUserId?: string;
  showRankChange?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ 
  members,
  entries,
  currentUserId,
  showRankChange = false
}) => {
  // Use either members or entries
  const hasEntries = entries && entries.length > 0;
  const hasMembers = members && members.length > 0;
  
  // Sort members by points (descending) if provided
  const sortedMembers = hasMembers 
    ? [...members].sort((a, b) => b.points - a.points)
    : [];
  
  // Use entries directly if provided
  const sortedEntries = hasEntries ? entries : [];
  
  // Determine what data to display
  const displayData = hasEntries ? sortedEntries : sortedMembers;
  
  const getRankChangeIcon = (current: number, previous: number) => {
    if (current < previous) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
     }
    if (current > previous) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            {showRankChange && (
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
            )}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bets</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayData.map((item, index) => {
            const isCurrentUser = hasEntries 
              ? (item as LeaderboardEntry).userId === currentUserId
              : (item as PoolMember).userId === currentUserId;
            
            // Calculate stats based on data type
            let totalBets = 0;
            let winningBets = 0;
            let winRate = 0;
            let rank = index + 1;
            let previousRank = rank;
            let profilePicture = undefined;
            let userName = '';
            
            if (hasEntries) {
              const entry = item as LeaderboardEntry;
              totalBets = entry.totalPredictions;
              winningBets = entry.correctPredictions;
              winRate = entry.accuracy;
              rank = entry.rank;
              previousRank = entry.previousRank;
              profilePicture = entry.profilePicture;
              userName = entry.userName;
            } else {
              const member = item as PoolMember;
              totalBets = member.bets.length;
              winningBets = member.bets.filter(bet => bet.points > 0).length;
              winRate = totalBets > 0 ? Math.round((winningBets / totalBets) * 100) : 0;
              userName = member.userName;
              rank = member.rank || index + 1;
              previousRank = member.previousRank || rank;
            }
            
            return (
              <tr 
                key={hasEntries 
                  ? (item as LeaderboardEntry).userId 
                  : (item as PoolMember).userId
                } 
                className={isCurrentUser ? 'bg-blue-50' : undefined}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {rank}
                </td>
                
                {showRankChange && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    {getRankChangeIcon(rank, previousRank)}
                  </td>
                )}
                
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    {profilePicture && (
                      <img 
                        src={profilePicture} 
                        alt={userName} 
                        className="h-6 w-6 rounded-full mr-2 object-cover"
                      />
                    )}
                    <span>{userName} {isCurrentUser && '(You)'}</span>
                  </div>
                </td>
                
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right font-medium">
                  {hasEntries 
                    ? (item as LeaderboardEntry).points 
                    : (item as PoolMember).points
                  }
                </td>
                
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                  {totalBets}
                </td>
                
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                  {winRate}%
                </td>
              </tr>
            );
          })}
          
          {displayData.length === 0 && (
            <tr>
              <td colSpan={showRankChange ? 6 : 5} className="px-4 py-3 text-center text-sm text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;