import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Match, Team } from '../types';

interface PoolResultMatrixProps {
  poolName: string;
  matches: Match[];
  teams: Team[];
}

const PoolResultMatrix: React.FC<PoolResultMatrixProps> = ({
  poolName,
  matches,
  teams
}) => {
  // Create a map of match results
  const resultMap: Record<string, Record<string, string>> = {};
  
  // Initialize the result map
  teams.forEach(team1 => {
    resultMap[team1.id] = {};
    teams.forEach(team2 => {
      resultMap[team1.id][team2.id] = '-';
    });
  });
  
  // Fill in the results from completed matches
  matches.forEach(match => {
    if (match.status === 'completed' && match.result) {
      const winner = match.result.winner;
      const team1Id = match.team1.id;
      const team2Id = match.team2.id;
      
      if (winner === team1Id) {
        resultMap[team1Id][team2Id] = 'W';
        resultMap[team2Id][team1Id] = 'L';
      } else if (winner === team2Id) {
        resultMap[team1Id][team2Id] = 'L';
        resultMap[team2Id][team1Id] = 'W';
      } else {
        resultMap[team1Id][team2Id] = 'D';
        resultMap[team2Id][team1Id] = 'D';
      }
    }
  });

  const getResultClass = (result: string) => {
    switch (result) {
      case 'W':
        return 'bg-green-100 text-green-700';
      case 'L':
        return 'bg-red-100 text-red-700';
      case 'D':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Results: {poolName}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-max">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border-b border-r bg-gray-50 sticky left-0 z-10">
                  Teams
                </th>
                {teams.map((team, index) => (
                  <th 
                    key={`header-${index}-${team.id}`}
                    className="p-2 border-b min-w-[100px] bg-gray-50 text-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {team.logo && (
                        <img 
                          src={team.logo} 
                          alt={team.name} 
                          className="h-6 w-6 object-contain"
                        />
                      )}
                      <span>{team.code}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((team1, rowIndex) => (
                <tr key={`row-${rowIndex}-${team1.id}`}>
                  <td className="p-2 border-r font-medium sticky left-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      {team1.logo && (
                        <img 
                          src={team1.logo} 
                          alt={team1.name} 
                          className="h-6 w-6 object-contain"
                        />
                      )}
                      <span>{team1.code}</span>
                    </div>
                  </td>
                  {teams.map((team2, colIndex) => (
                    <td 
                      key={`cell-${rowIndex}-${colIndex}-${team1.id}-${team2.id}`}
                      className={`p-2 text-center font-medium ${
                        team1.id === team2.id 
                          ? 'bg-gray-100' 
                          : getResultClass(resultMap[team1.id][team2.id])
                      }`}
                    >
                      {team1.id === team2.id ? '-' : resultMap[team1.id][team2.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-100 rounded"></span>
              <span>Win (W)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-100 rounded"></span>
              <span>Loss (L)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-yellow-100 rounded"></span>
              <span>Draw (D)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-100 rounded"></span>
              <span>Not Played (-)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoolResultMatrix;