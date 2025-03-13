import React, { useState } from 'react';
import { Match } from '../types';
import Button from './ui/Button';

interface BettingModalProps {
  match: Match;
  onClose: () => void;
  onPlaceBet: (prediction: 'team1' | 'team2' | 'draw', confidence?: number) => void;
  currentPrediction?: 'team1' | 'team2' | 'draw';
  currentConfidence?: number;
}

const BettingModal: React.FC<BettingModalProps> = ({
  match,
  onClose,
  onPlaceBet,
  currentPrediction,
  currentConfidence = 100
}) => {
  const [prediction, setPrediction] = useState<'team1' | 'team2' | 'draw'>(
    currentPrediction || 'team1'
  );
  const [confidence, setConfidence] = useState(currentConfidence);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceBet(prediction, confidence);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Place Your Bet</h2>
        <p className="text-gray-600 mb-4">{match.name}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <input
                type="radio"
                id="team1"
                name="prediction"
                value="team1"
                checked={prediction === 'team1'}
                onChange={() => setPrediction('team1')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="team1" className="ml-2 block text-sm font-medium text-gray-700">
                {match.team1.name} Win
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="draw"
                name="prediction"
                value="draw"
                checked={prediction === 'draw'}
                onChange={() => setPrediction('draw')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="draw" className="ml-2 block text-sm font-medium text-gray-700">
                Draw
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="team2"
                name="prediction"
                value="team2"
                checked={prediction === 'team2'}
                onChange={() => setPrediction('team2')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="team2" className="ml-2 block text-sm font-medium text-gray-700">
                {match.team2.name} Win
              </label>
            </div>
            
            <div className="mt-4">
              <label htmlFor="confidence" className="block text-sm font-medium text-gray-700 mb-1">
                Confidence Level: {confidence}%
              </label>
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
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Place Bet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BettingModal;