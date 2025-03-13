import { supabase } from '../../lib/supabase';

describe('Stripe Webhook Handler Tests', () => {
  const mockEvent = {
    id: 'evt_test123',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test123',
        amount: 2000,
        currency: 'usd',
        status: 'succeeded',
        metadata: {
          poolId: 'test_pool_123'
        }
      }
    }
  };

  it('processes successful payment webhook', async () => {
    const response = await supabase.functions.invoke('stripe-webhook', {
      body: mockEvent
    });

    expect(response.error).toBeNull();
    expect(response.data).toEqual(expect.objectContaining({
      received: true
    }));
  });

  it('handles payment failure webhook', async () => {
    const failedEvent = {
      ...mockEvent,
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          ...mockEvent.data.object,
          status: 'failed',
          last_payment_error: {
            message: 'Your card was declined.'
          }
        }
      }
    };

    const response = await supabase.functions.invoke('stripe-webhook', {
      body: failedEvent
    });

    expect(response.error).toBeNull();
    expect(response.data).toEqual(expect.objectContaining({
      received: true,
      status: 'failed'
    }));
  });

  it('validates webhook signatures', async () => {
    const invalidSignature = 'invalid_signature';
    
    const response = await supabase.functions.invoke('stripe-webhook', {
      headers: {
        'stripe-signature': invalidSignature
      },
      body: mockEvent
    });

    expect(response.error).toBeTruthy();
    expect(response.error?.message).toContain('Invalid signature');
  });

  it('handles refund events', async () => {
    const refundEvent = {
      ...mockEvent,
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_test123',
          refunded: true,
          amount_refunded: 2000
        }
      }
    };

    const response = await supabase.functions.invoke('stripe-webhook', {
      body: refundEvent
    });

    expect(response.error).toBeNull();
    expect(response.data).toEqual(expect.objectContaining({
      received: true,
      refunded: true
    }));
  });
});