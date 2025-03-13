export const mockStripeSession = {
  id: 'cs_test_123',
  object: 'checkout.session',
  payment_status: 'unpaid',
  url: 'https://checkout.stripe.com/test'
};

export const mockPaymentIntent = {
  id: 'pi_test_123',
  object: 'payment_intent',
  status: 'requires_payment_method'
};

export const mockStripeError = {
  type: 'StripeCardError',
  message: 'Your card was declined.',
  code: 'card_declined'
};

export const testCards = {
  success: '4242424242424242',
  decline: '4000000000000002',
  authRequired: '4000002500003155'
};

export const mockWebhookEvents = {
  paymentSuccess: {
    id: 'evt_test123',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test123',
        amount: 2000,
        currency: 'usd',
        status: 'succeeded'
      }
    }
  },
  paymentFailed: {
    id: 'evt_test456',
    type: 'payment_intent.payment_failed',
    data: {
      object: {
        id: 'pi_test456',
        amount: 2000,
        currency: 'usd',
        status: 'failed',
        last_payment_error: {
          message: 'Your card was declined.'
        }
      }
    }
  }
};