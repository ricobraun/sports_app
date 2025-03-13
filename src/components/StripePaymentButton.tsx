import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard } from 'lucide-react';
import Button from './ui/Button';
import { supabase } from '../lib/supabase';
import type { FunctionsError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

interface StripePaymentButtonProps {
  amount: number;
  entryCount: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StripePaymentButton: React.FC<StripePaymentButtonProps> = ({
  amount,
  entryCount,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    let stripe;
    try {
      // Initialize Stripe first
      stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Payment system unavailable. Please refresh the page and try again.');
      }

      // Create a checkout session through Supabase function
      const { data: session, error } = await supabase.functions.invoke(
        'create-stripe-session',
        {
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            amount: Math.round(amount * 100), // Convert to cents
            entryCount,
            currency: 'usd'
          }
        }
      );

      if (error) {
        // Handle specific Supabase Functions errors
        if (error instanceof FunctionsHttpError) {
          throw new Error('Payment service unavailable. Please try again in a few minutes.');
        }
        if (error instanceof FunctionsRelayError) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        if (error instanceof FunctionsError) {
          throw new Error(error.message || 'Payment initialization failed. Please try again.');
        }
        throw error;
      }

      if (!session?.id) {
        throw new Error('Could not initialize payment. Please try again.');
      }

      const { error: checkoutError } = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (checkoutError) {
        throw new Error(checkoutError.message || 'Payment initialization failed. Please try again.');
      }

      onSuccess?.();
    } catch (err) {
      console.error('Payment error:', err);
      
      // Provide user-friendly error messages
      let errorMessage = 'Payment processing failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      onError?.(new Error(errorMessage.replace(/\.$/, '') + '. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handlePayment}
      isLoading={isLoading}
      className="w-full"
    >
      <CreditCard className="h-5 w-5 mr-2" />
      Pay with Stripe
    </Button>
  );
};

export default StripePaymentButton;