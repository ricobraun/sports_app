import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Target as Cricket, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import StripePaymentButton from '../components/StripePaymentButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Select from '../components/ui/Select';

const PricingPage: React.FC = () => {
  const [entryCount, setEntryCount] = useState(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const calculatePrice = (entries: number) => {
    let total = 0;
    let breakdown = [];
    
    if (entries <= 10) {
      total = 20;
      breakdown.push('$20 base fee');
    } else if (entries <= 50) {
      const baseFee = 20;
      const additionalEntries = entries - 10;
      const additionalCost = additionalEntries * 1.75;
      total = baseFee + additionalCost;
      breakdown.push('$20 base fee', `${additionalEntries} entries × $1.75 = $${additionalCost.toFixed(2)}`);
    } else if (entries <= 200) {
      const baseFee = 20;
      const tier1Cost = 40 * 1.75;
      const additionalEntries = entries - 50;
      const additionalCost = additionalEntries * 1.50;
      total = baseFee + tier1Cost + additionalCost;
      breakdown.push(
        '$20 base fee',
        '40 entries × $1.75 = $70.00',
        `${additionalEntries} entries × $1.50 = $${additionalCost.toFixed(2)}`
      );
    } else if (entries <= 500) {
      const baseFee = 20;
      const tier1Cost = 40 * 1.75;
      const tier2Cost = 150 * 1.50;
      const additionalEntries = entries - 200;
      const additionalCost = additionalEntries * 1.25;
      total = baseFee + tier1Cost + tier2Cost + additionalCost;
      breakdown.push(
        '$20 base fee',
        '40 entries × $1.75 = $70.00',
        '150 entries × $1.50 = $225.00',
        `${additionalEntries} entries × $1.25 = $${additionalCost.toFixed(2)}`
      );
    } else {
      const baseFee = 20;
      const tier1Cost = 40 * 1.75;
      const tier2Cost = 150 * 1.50;
      const tier3Cost = 300 * 1.25;
      const additionalEntries = entries - 500;
      const additionalCost = additionalEntries * 1.00;
      total = baseFee + tier1Cost + tier2Cost + tier3Cost + additionalCost;
      breakdown.push(
        '$20 base fee',
        '40 entries × $1.75 = $70.00',
        '150 entries × $1.50 = $225.00',
        '300 entries × $1.25 = $375.00',
        `${additionalEntries} entries × $1.00 = $${additionalCost.toFixed(2)}`
      );
    }
    return { total: total.toFixed(2), breakdown };
  };

  const features = [
    'Create unlimited pools',
    'Invite unlimited members',
    'Real-time match updates',
    'Live leaderboards',
    'Tournament schedules',
    'Mobile-friendly interface',
    'Email notifications',
    'Detailed statistics',
    'Secure payments',
    'Customer support'
  ];

  const entryOptions = [
    { value: '10', label: 'Up to 10 entries' },
    { value: '50', label: 'Up to 50 entries' },
    { value: '100', label: 'Up to 100 entries' },
    { value: '200', label: 'Up to 200 entries' },
    { value: '500', label: 'Up to 500 entries' },
    { value: '1000', label: 'Up to 1000 entries' }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <Cricket className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600">Join the most exciting cricket prediction platform</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="border-blue-200 bg-gradient-to-b from-blue-50 to-white">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Pool Pricing Calculator</CardTitle>
            <p className="text-gray-600 mt-2">Perfect for friends and office pools</p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center">
                <div className="mb-4">
                  <Select
                    label="Number of Entries"
                    value={entryCount.toString()}
                    onChange={(e) => setEntryCount(parseInt(e.target.value))}
                    options={entryOptions}
                  />
                </div>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">${calculatePrice(entryCount).total}</span>
                  <span className="text-gray-600 ml-2">one-time fee</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">One-time payment for the pool</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Pricing Tiers</h3>
              {calculatePrice(entryCount).breakdown.length > 0 && (
                <div className="mb-4 p-3 bg-white rounded border border-blue-100">
                  <h4 className="font-medium text-gray-900 mb-2">Price Breakdown</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {calculatePrice(entryCount).breakdown.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Up to 10 entries</span>
                  <span className="font-medium">$20 flat</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>11-50 entries</span>
                  <span className="font-medium">+$1.75 per entry</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>51-200 entries</span>
                  <span className="font-medium">+$1.50 per entry</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>201-500 entries</span>
                  <span className="font-medium">+$1.25 per entry</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>500+ entries</span>
                  <span className="font-medium">+$1.00 per entry</span>
                </li>
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Everything you need</h3>
                <ul className="space-y-3">
                  {features.slice(0, 5).map((feature) => (
                    <li key={feature} className="flex items-center text-gray-700">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Plus these benefits</h3>
                <ul className="space-y-3">
                  {features.slice(5).map((feature) => (
                    <li key={feature} className="flex items-center text-gray-700">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {errorMessage}
                </div>
              )}
              <StripePaymentButton 
                amount={parseFloat(calculatePrice(entryCount).total)}
                entryCount={entryCount}
                onSuccess={() => {
                  navigate('/create-pool');
                }}
                onError={(error) => {
                  console.error('Payment failed:', error);
                  setErrorMessage(error.message);
                }}
              />
              <p className="text-sm text-gray-500 mt-4">
                No hidden fees • Pay only when you join a pool • Secure payment
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900">How does the pricing work?</h3>
              <p className="text-gray-600 mt-1">The pool admin pays a one-time fee based on the number of entries. The more entries, the lower the per-entry cost.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Can I create multiple pools?</h3>
              <p className="text-gray-600 mt-1">Yes! You can create multiple pools. Each pool requires its own one-time payment based on the number of entries.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Is there a limit to pool members?</h3>
              <p className="text-gray-600 mt-1">You can choose the number of entries when creating the pool. The price is determined by your chosen entry limit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;