import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

// Currency data for cricket-playing nations
const CURRENCIES = {
  INR: { name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  PKR: { name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  BDT: { name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  LKR: { name: 'Sri Lankan Rupee', symbol: 'Rs', flag: '🇱🇰' },
  AUD: { name: 'Australian Dollar', symbol: '$', flag: '🇦🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  NZD: { name: 'New Zealand Dollar', symbol: '$', flag: '🇳🇿' },
  ZAR: { name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' }
};

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Simulated exchange rates (in production, fetch from a real API)
  const getExchangeRate = (from: string, to: string) => {
    const rates: Record<string, number> = {
      'USD-INR': 82.5,
      'USD-PKR': 279.5,
      'USD-BDT': 109.8,
      'USD-LKR': 324.5,
      'USD-AUD': 1.52,
      'USD-GBP': 0.79,
      'USD-NZD': 1.64,
      'USD-ZAR': 19.2,
      'USD-EUR': 0.92,
      'EUR-USD': 1.09,
      'GBP-USD': 1.27,
      'AUD-USD': 0.66,
      'NZD-USD': 0.61,
      'ZAR-USD': 0.052,
      'INR-USD': 0.012,
      'PKR-USD': 0.0036,
      'BDT-USD': 0.0091,
      'LKR-USD': 0.0031
    };

    const key = `${from}-${to}`;
    if (rates[key]) return rates[key];
    
    // If direct rate not found, convert through USD
    if (from !== 'USD' && to !== 'USD') {
      const fromUSD = rates[`${from}-USD`];
      const toUSD = rates[`USD-${to}`];
      if (fromUSD && toUSD) return 1 / fromUSD * toUSD;
    }
    
    return 1; // Fallback
  };

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const rate = getExchangeRate(fromCurrency, toCurrency);
        setExchangeRate(rate);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleRefresh = () => {
    setExchangeRate(null);
    setLastUpdated(new Date());
  };

  const convertedAmount = exchangeRate !== null && !isNaN(Number(amount))
    ? (Number(amount) * exchangeRate).toFixed(2)
    : '0.00';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Currency Converter</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
            <Select
              label="From"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              options={Object.entries(CURRENCIES).map(([code, { name, flag }]) => ({
                value: code,
                label: `${flag} ${code} - ${name}`
              }))}
            />
            
            <Button
              variant="ghost"
              className="mb-2"
              onClick={handleSwapCurrencies}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            
            <Select
              label="To"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              options={Object.entries(CURRENCIES).map(([code, { name, flag }]) => ({
                value: code,
                label: `${flag} ${code} - ${name}`
              }))}
            />
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {amount} {CURRENCIES[fromCurrency].symbol}{fromCurrency} =
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {CURRENCIES[toCurrency].symbol}{convertedAmount} {toCurrency}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;