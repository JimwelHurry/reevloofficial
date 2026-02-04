-- ==========================================
-- SECURE PAYOUT & WALLET SCHEMA
-- Designed to prevent data leaks and ensure data integrity
-- ==========================================

-- 1. Create Payout Requests Table
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_coins NUMERIC NOT NULL,
  amount_usd NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, paid
  payment_method TEXT DEFAULT 'stripe',
  payment_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS) - "Defense in Depth"
-- This ensures that even if API endpoints are exposed, users can ONLY access their own data.

-- Payout Requests RLS
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payout requests"
ON payout_requests FOR SELECT
USING (auth.uid() = user_id);

-- Rewards Balance RLS (Critical for privacy)
ALTER TABLE rewards_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance"
ON rewards_balance FOR SELECT
USING (auth.uid() = user_id);

-- Rewards Transactions RLS
ALTER TABLE rewards_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON rewards_transactions FOR SELECT
USING (auth.uid() = user_id);

-- 3. SECURE RPC FUNCTION
-- This function handles the money deduction atomically.
-- We use SECURITY DEFINER to allow it to update balances (which users can't do directly).
-- BUT, we REVOKE public access so it can ONLY be called by our trusted API (Service Role).

CREATE OR REPLACE FUNCTION request_payout(
  p_user_id UUID,
  p_amount_coins NUMERIC,
  p_amount_usd NUMERIC,
  p_payment_method TEXT DEFAULT 'stripe'
)
RETURNS JSONB AS $$
DECLARE
  v_current_balance NUMERIC;
  v_payout_id UUID;
BEGIN
  -- Extra Safety Check: If called by a user directly (not service role), ensure they own the ID
  -- (Though we revoke access below, this is a fail-safe)
  IF (auth.role() = 'authenticated' AND auth.uid() != p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: You can only request payouts for yourself.';
  END IF;

  -- Check balance
  SELECT virtual_money INTO v_current_balance
  FROM rewards_balance
  WHERE user_id = p_user_id;

  IF v_current_balance IS NULL OR v_current_balance < p_amount_coins THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Deduct Balance
  UPDATE rewards_balance
  SET virtual_money = virtual_money - p_amount_coins,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create Payout Request
  INSERT INTO payout_requests (user_id, amount_coins, amount_usd, status, payment_method)
  VALUES (p_user_id, p_amount_coins, p_amount_usd, 'pending', p_payment_method)
  RETURNING id INTO v_payout_id;

  -- Log Transaction
  INSERT INTO rewards_transactions (user_id, type, reward_type, amount, source, note)
  VALUES (p_user_id, 'spent', 'virtual_money', -p_amount_coins, 'payout_request', 'Payout Request ID: ' || v_payout_id);

  RETURN jsonb_build_object('success', true, 'payout_id', v_payout_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. LOCK DOWN THE FUNCTION
-- Revoke execution from public roles. Only Service Role (Admin) can call this.
REVOKE EXECUTE ON FUNCTION request_payout FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION request_payout FROM anon;
REVOKE EXECUTE ON FUNCTION request_payout FROM authenticated;
-- Grant to service_role (implicit in Supabase usually, but good to be explicit if needed, 
-- though Postgres defaults usually allow owner/superuser. In Supabase service_role is superuser-like).
analy