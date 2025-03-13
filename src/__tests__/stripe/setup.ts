import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock Stripe API endpoints
export const server = setupServer(
  rest.post('https://api.stripe.com/v1/checkout/sessions', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'cs_test_123',
        object: 'checkout.session',
        payment_status: 'unpaid',
        url: 'https://checkout.stripe.com/test'
      })
    );
  }),

  rest.post('https://api.stripe.com/v1/payment_intents', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'pi_test_123',
        object: 'payment_intent',
        status: 'requires_payment_method'
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());