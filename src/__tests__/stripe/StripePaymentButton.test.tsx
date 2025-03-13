import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentButton from '../../components/StripePaymentButton';
import { supabase } from '../../lib/supabase';

// Mock Stripe and Supabase
jest.mock('@stripe/stripe-js');
jest.mock('../../lib/supabase');

const mockStripe = {
  redirectToCheckout: jest.fn(),
};

describe('StripePaymentButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (loadStripe as jest.Mock).mockResolvedValue(mockStripe);
  });

  it('renders payment button correctly', () => {
    render(
      <StripePaymentButton 
        amount={20} 
        entryCount={10}
      />
    );
    
    expect(screen.getByText('Pay with Stripe')).toBeInTheDocument();
  });

  it('handles successful payment flow', async () => {
    const onSuccess = jest.fn();
    const sessionId = 'test_session_123';

    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { id: sessionId },
      error: null,
    });

    mockStripe.redirectToCheckout.mockResolvedValue({ error: null });

    render(
      <StripePaymentButton 
        amount={20} 
        entryCount={10}
        onSuccess={onSuccess}
      />
    );

    await userEvent.click(screen.getByText('Pay with Stripe'));

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'create-stripe-session',
        expect.objectContaining({
          body: {
            amount: 2000,
            entryCount: 10,
            currency: 'usd'
          }
        })
      );
    });

    expect(mockStripe.redirectToCheckout).toHaveBeenCalledWith({
      sessionId
    });
  });

  it('handles payment initialization errors', async () => {
    const onError = jest.fn();
    
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('Failed to create session'),
    });

    render(
      <StripePaymentButton 
        amount={20} 
        entryCount={10}
        onError={onError}
      />
    );

    await userEvent.click(screen.getByText('Pay with Stripe'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('handles Stripe redirect errors', async () => {
    const onError = jest.fn();
    const sessionId = 'test_session_123';

    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { id: sessionId },
      error: null,
    });

    mockStripe.redirectToCheckout.mockResolvedValue({
      error: { message: 'Redirect failed' }
    });

    render(
      <StripePaymentButton 
        amount={20} 
        entryCount={10}
        onError={onError}
      />
    );

    await userEvent.click(screen.getByText('Pay with Stripe'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('failed')
        })
      );
    });
  });

  it('shows loading state during payment processing', async () => {
    (supabase.functions.invoke as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <StripePaymentButton 
        amount={20} 
        entryCount={10}
      />
    );

    await userEvent.click(screen.getByText('Pay with Stripe'));
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});