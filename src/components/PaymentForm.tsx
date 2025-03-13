import React, { useState, useEffect } from 'react';
import { CreditCard, GoalIcon as PaypalIcon, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { supabase } from '../lib/supabase';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  processing_fee_percent: number;
  fixed_fee: number;
  icon: string;
}

interface PaymentFees {
  processing_fee: number;
  service_fee: number;
  total_amount: number;
}

interface PaymentFormProps {
  poolId: string;
  baseAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  poolId,
  baseAmount,
  onSuccess,
  onCancel
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [fees, setFees] = useState<PaymentFees | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('enabled', true);

      if (error) {
        console.error('Error fetching payment methods:', error);
        return;
      }

      setPaymentMethods(data);
      if (data.length > 0) {
        setSelectedMethod(data[0].code);
      }
    };

    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    const calculateFees = async () => {
      if (!selectedMethod) return;

      const { data, error } = await supabase
        .rpc('calculate_payment_fees', {
          base_amount: baseAmount,
          payment_method_code: selectedMethod
        });

      if (error) {
        console.error('Error calculating fees:', error);
        return;
      }

      setFees(data[0]);
    };

    calculateFees();
  }, [selectedMethod, baseAmount]);

  const handleSubmit = async () => {
    if (!fees) return;

    setIsLoading(true);
    setError('');

    try {
      // In a real app, integrate with a payment processor here
      const { data, error } = await supabase
        .from('pool_payments')
        .insert({
          pool_id: poolId,
          amount: baseAmount,
          status: 'pending',
          payment_method_id: paymentMethods.find(m => m.code === selectedMethod)?.id,
          processing_fee: fees.processing_fee,
          service_fee: fees.service_fee,
          total_amount: fees.total_amount
        })
        .select()
        .single();

      if (error) throw error;

      onSuccess();
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentIcon = (code: string) => {
    switch (code) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-5 w-5" />;
      case 'paypal':
        return <PaypalIcon className="h-5 w-5" />;
      case 'venmo':
        return <Wallet className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Select Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.code}
                  className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                    selectedMethod === method.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMethod(method.code)}
                >
                  <div className="flex items-center gap-2">
                    {getPaymentIcon(method.code)}
                    <span className="font-medium">{method.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fee Breakdown */}
          {fees && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Amount</span>
                <span>{formatCurrency(baseAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing Fee</span>
                <span>{formatCurrency(fees.processing_fee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service Fee</span>
                <span>{formatCurrency(fees.service_fee)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(fees.total_amount)}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isLoading}
              className="flex-1"
            >
              Pay {fees && formatCurrency(fees.total_amount)}
            </Button>
          </div>

          {/* Payment Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• All payments are processed securely</p>
            <p>• Fees are calculated based on the selected payment method</p>
            <p>• Service fee helps maintain the platform</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;