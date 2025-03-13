import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Users } from 'lucide-react';
import { useAppStore } from '../store';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Match } from '../types';

const ManagePoolPage: React.FC = () => {
  const { poolId } = useParams<{ poolId: string }>();
  const navigate = useNavigate();
  
  const { 
    currentUser, 
    getPoolById,
    matches,
    updateMatchResults
  } = useAppStore();
  
  const [copiedInvite, setCopiedInvite] = useState(false);
  
  const pool = poolId ? getPoolById(poolId) : undefined;
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!pool) {
      navigate('/');
      return;
    }
    
    // Check if user is admin
    if (pool.adminId !== currentUser.id) {
      navigate(`/pools/${poolId}`);
    }
  }, [currentUser, pool, poolId, navigate]);
  
  const copyInviteCode = () => {
    if (pool) {
      navigator.clipboard.writeText(pool.inviteCode);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };
  
  // This would be used in a real app to update match results
  const simulateMatchResult = (match: Match) => {
    if (match.status !== 'live') return;
    
    // Simulate a random result
    const winner = Math.random() > 0.5 ? match.team1.id : match.team2.id;
    
    const updatedMatch: Match = {
      ...match,
      status: 'completed',
      result: {
        winner,
        team1Score: '158/6',
        team2Score: winner === match.team2.id ? '160/4' : '145/8'
      }
    };
    
    updateMatchResults(updatedMatch);
  };
  
  const poolMatches = matches.filter(match => {
    // In a real app, filter by tournament ID
    return true;
  });
  
  const liveMatches = poolMatches.filter(match => match.status === 'live');
  
  if (!pool) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(`/pools/${poolId}`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Pool
      </Button>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Manage Pool: {pool.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pool Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bets</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pool.members.map(member => (
                      <tr key={member.userId}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {member.userName} {member.userId === currentUser?.id && '(You)'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                          {member.points}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                          {member.bets.length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {liveMatches.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Update Match Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  As an admin, you can manually update match results if needed.
                </p>
                
                <div className="space-y-4">
                  {liveMatches.map(match => (
                    <div key={match.id} className="flex justify-between items-center p-4 border rounded-md">
                      <div>
                        <p className="font-medium">{match.name}</p>
                        <p className="text-sm text-gray-500">Currently Live</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => simulateMatchResult(match)}
                      >
                        Simulate Result
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Invite Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500 mb-2">Share this invite code:</p>
                  <div className="flex items-center justify-between bg-white border rounded-md p-2">
                    <code className="text-sm font-mono">{pool.inviteCode}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyInviteCode}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                  {copiedInvite && (
                    <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
                  )}
                </div>
                
                <div className="flex items-center justify-center py-4">
                  <Users className="h-8 w-8 text-gray-400 mr-2" />
                  <span className="text-gray-500">{pool.members.length} members</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagePoolPage;