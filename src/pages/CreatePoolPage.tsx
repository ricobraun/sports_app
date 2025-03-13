import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store';
import { getTournaments } from '../lib/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const CreatePoolPage: React.FC = () => {
  const { currentUser, createPool, tournaments, setTournaments } = useAppStore();
  const [name, setName] = useState('');
  const [tournamentId, setTournamentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchTournaments = async () => {
      if (tournaments.length === 0) {
        const data = await getTournaments();
        setTournaments(data);
      }
    };
    
    fetchTournaments();
  }, [currentUser, navigate, tournaments.length, setTournaments]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter a pool name');
      return;
    }
    
    if (!tournamentId) {
      setError('Please select a tournament');
      return;
    }
    
    try {
      setIsLoading(true);
      const pool = createPool(name.trim(), parseInt(tournamentId));
      navigate(`/pools/${pool.id}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Betting Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <Input
                label="Pool Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for your pool"
                required
              />
              
              <Select
                label="Tournament"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                options={tournaments.map(t => ({
                  value: t.id.toString(),
                  label: t.name
                }))}
                required
              />
              
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Create Pool
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePoolPage;