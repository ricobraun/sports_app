import React, { useState } from 'react';
import { Match } from '../types';
import Button from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface PredictionFormProps {
  match: Match;
  onSubmit: (prediction: 'team1' | 'team2' | 'draw', confidence: number) => void;
  currentPrediction?: 'team1' | 'team2' | 'draw';
  currentConfidence?: number;
  isSubmitting?: boolean;
}

const PredictionForm: React.FC<PredictionFormProps> = ({
  match,
  onSubmit,
  currentPrediction,
  currentConfidence = 100,
  isSubmitting = false
}) => {
  const [prediction, setPrediction] = useState<'team1' | 'team2' | 'draw'>(currentPrediction || 'team1');
  const [confidence, setConfidence] = useState(currentConfidence);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prediction, confidence);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predict Match Outcome</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="font-medium text-gray-700 mb-2">Who will win?</div>
            
            <div className="grid grid-cols-3 gap-3">
              <div 
                className={`border rounded-md p-4 text-center cursor-pointer transition-colors ${
                  prediction === 'team1' 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setPrediction('team1')}
              >
                <div className="flex justify-center mb-2">
                  {match.team1.logo && (
                    <img 
                      src={match.team1.logo} 
                      alt={match.team1.name} 
                      className="h-10 w-10 object-contain"
                    />
                  )}
                </div>
                <p className="font-medium">{match.team1.name}</p>
              </div>
              
              <div 
                className={`border rounded-md p-4 text-center cursor-pointer transition-colors ${
                  prediction === 'draw' 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setPrediction('draw')}
              >
                <div className="h-10 flex items-center justify-center mb-2">
                  <span className="text-gray-400 text-xl">VS</span>
                </div>
                <p className="font-medium">Draw</p>
              </div>
              
              <div 
                className={`border rounded-md p-4 text-center cursor-pointer transition-colors ${
                  prediction === 'team2' 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setPrediction('team2')}
              >
                <div className="flex justify-center mb-2">
                  {match.team2.logo && (
                    <img 
                      src={match.team2.logo} 
                      alt={match.team2.name} 
                      className="h-10 w-10 object-contain"
                    />
                  )}
                </div>
                <p className="font-medium">{match.team2.name}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="confidence" className="font-medium text-gray-700">
                Confidence Level: {confidence}%
              </label>
            </div>
            <input
              id="confidence"
              type="range"
              min="50"
              max="100"
              step="5"
              value={confidence}
              onChange={(e) => setConfidence(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            {currentPrediction ? 'Update Prediction' : 'Submit Prediction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PredictionForm;