/*
  # Add Payment System Tables and Functions

  1. New Tables
    - `payment_methods` - Stores supported payment methods and their fees
    - `pool_payments` - Tracks payments for pools
    - `payment_transactions` - Records individual payment transactions

  2. Security
    - Enable RLS on all tables
    - Add policies for appropriate access control

  3. Features
    - Support for multiple payment methods
    - Transaction tracking
    - Fee calculation
*/

-- Create payment_methods table
CREATE TABLE payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  processing_fee_percent numeric(5,2) NOT NULL,
  fixed_fee numeric(10,2) NOT NULL,
  icon text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for reading payment methods
CREATE POLICY "Anyone can read payment methods" ON payment_methods
  FOR SELECT USING (true);

-- Create pool_payments table
CREATE TABLE pool_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES pools(id),
  amount numeric(10,2) NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending', 'completed', 'failed', 'refunded'])),
  payment_method_id uuid REFERENCES payment_methods(id),
  payer_id uuid REFERENCES auth.users(id),
  processing_fee numeric(10,2) NOT NULL,
  service_fee numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE pool_payments ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for pool_payments
CREATE POLICY "Users can read own payments" ON pool_payments
  FOR SELECT USING (auth.uid() = payer_id);

CREATE POLICY "Pool admins can read pool payments" ON pool_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pools 
      WHERE pools.id = pool_payments.pool_id 
      AND pools.admin_id = auth.uid()
    )
  );

-- Create payment_transactions table
CREATE TABLE payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES pool_payments(id),
  type text NOT NULL CHECK (type = ANY (ARRAY['charge', 'refund'])),
  status text NOT NULL CHECK (status = ANY (ARRAY['pending', 'success', 'failed'])),
  amount numeric(10,2) NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for payment_transactions
CREATE POLICY "Users can read own payment transactions" ON payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pool_payments 
      WHERE pool_payments.id = payment_transactions.payment_id 
      AND pool_payments.payer_id = auth.uid()
    )
  );

-- Insert default payment methods
INSERT INTO payment_methods (name, code, processing_fee_percent, fixed_fee, icon) VALUES
('Credit Card', 'credit_card', 2.9, 0.30, 'credit-card'),
('Debit Card', 'debit_card', 1.5, 0.30, 'credit-card'),
('PayPal', 'paypal', 2.9, 0.30, 'paypal'),
('Venmo', 'venmo', 1.9, 0.10, 'wallet');

-- Create function to calculate payment fees
CREATE OR REPLACE FUNCTION calculate_payment_fees(
  base_amount numeric,
  payment_method_code text
) RETURNS TABLE (
  processing_fee numeric,
  service_fee numeric,
  total_amount numeric
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND((base_amount * (pm.processing_fee_percent / 100) + pm.fixed_fee)::numeric, 2) as processing_fee,
    ROUND((base_amount * 0.05)::numeric, 2) as service_fee,
    ROUND((base_amount + 
      (base_amount * (pm.processing_fee_percent / 100) + pm.fixed_fee) +
      (base_amount * 0.05))::numeric, 2) as total_amount
  FROM payment_methods pm
  WHERE pm.code = payment_method_code;
END;
$$;