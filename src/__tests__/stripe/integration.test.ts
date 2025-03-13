import { supabase } from '../../lib/supabase';

describe('Stripe Integration Tests', () => {
  const testCards = {
    success: '4242424242424242',
    decline: '4000000000000002',
    authRequired: '4000002500003155',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a successful payment session', async () => {
    const response = await supabase.functions.invoke('create-stripe-session', {
      body: {
        amount: 2000,
        currency: 'usd',
        entryCount: 10
      }
    });

    expect(response.error).toBeNull();
    expect(response.data).toHaveProperty('id');
  });

  it('handles payment session with test card', async () => {
    // This test would typically be run in an E2E testing environment
    // Here we're just validating the API call structure
    const response = await supabase.functions.invoke('create-stripe-session', {
      body: {
        amount: 2000,
        currency: 'usd',
        entryCount: 10,
        payment_method_data: {
          type: 'card',
          card: {
            number: testCards.success,
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      }
    });

    expect(response.error).toBeNull();
    expect(response.data).toHaveProperty('id');
  });

  it('handles declined payments appropriately', async () => {
    const response = await supabase.functions.invoke('create-stripe-session', {
      body: {
        amount: 2000,
        currency: 'usd',
        entryCount: 10,
        payment_method_data: {
          type: 'card',
          card: {
            number: testCards.decline,
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      }
    });

    expect(response.error).toBeTruthy();
    expect(response.error?.message).toContain('declined');
  });

  it('handles authentication required scenario', async () => {
    const response = await supabase.functions.invoke('create-stripe-session', {
      body: {
        amount: 2000,
        currency: 'usd',
        entryCount: 10,
        payment_method_data: {
          type: 'card',
          card: {
            number: testCards.authRequired,
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      }
    });

    expect(response.data).toHaveProperty('requires_action', true);
  });
});