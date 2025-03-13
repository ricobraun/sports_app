import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { Pool } from '../types';
import { formatDate } from '../lib/utils';

interface PoolCardProps {
  pool: Pool;
  isAdmin: boolean;
  isFeatured?: boolean;
}

const PoolCard: React.FC<PoolCardProps> = ({ pool, isAdmin, isFeatured }) => {
  const navigate = useNavigate();
  
  const getFormatBadge = () => {
    if (!pool.format) return null;
    
    switch (pool.format) {
      case 'T20':
        return <Badge variant="info">T20</Badge>;
      case 'ODI':
        return <Badge variant="warning">ODI</Badge>;
      case 'Test':
        return <Badge variant="success">Test</Badge>;
      case 'T10':
        return <Badge variant="danger">T10</Badge>;
      default:
        return <Badge variant="secondary">{pool.format}</Badge>;
    }
  };
  
  return (
    <Card className={`h-full flex flex-col ${isFeatured ? 'border-blue-300 bg-blue-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{pool.name}</CardTitle>
            <CardDescription>Created on {formatDate(pool.createdAt)}</CardDescription>
          </div>
          <div className="flex space-x-2">
            {getFormatBadge()}
            {isFeatured && <Badge variant="primary">Featured</Badge>}
            {pool.isPublic ? (
              <Badge variant="success">Public</Badge>
            ) : (
              <Badge variant="secondary">Private</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            <span>{pool.members.length} members</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Trophy className="h-4 w-4 mr-2" />
            <span>Top player: {pool.members.length > 0 
              ? pool.members.sort((a, b) => b.points - a.points)[0].userName 
              : 'None'}</span>
          </div>
          
          {pool.endDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Ends: {new Date(pool.endDate).toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-sm">
              <span className="font-medium">Invite Code:</span> {pool.inviteCode}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button 
          variant="primary"
          onClick={() => navigate(`/pools/${pool.id}`)}
        >
          View Pool
        </Button>
        {isAdmin && (
          <Button 
            variant="outline"
            onClick={() => navigate(`/pools/${pool.id}/manage`)}
          >
            Manage
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PoolCard;