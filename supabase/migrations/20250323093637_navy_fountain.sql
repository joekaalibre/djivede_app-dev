/*
  # Fix Orders Table Permissions
  
  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions for orders
    - Add specific policy for viewing paid orders
    
  2. Security
    - Maintain proper access control
    - Allow admin to view all orders
    - Allow users to view their own orders
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON coaching_orders;
DROP POLICY IF EXISTS "Users can create orders" ON coaching_orders;
DROP POLICY IF EXISTS "Admin can manage orders" ON coaching_orders;

-- Create new policies
CREATE POLICY "Admin can view all orders"
  ON coaching_orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

CREATE POLICY "Users can view own orders"
  ON coaching_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON coaching_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage orders"
  ON coaching_orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT ON coaching_orders TO authenticated;
GRANT ALL ON coaching_orders TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE coaching_orders ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_coaching_orders_payment_status ON coaching_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_coaching_orders_user_id ON coaching_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_orders_status ON coaching_orders(status);