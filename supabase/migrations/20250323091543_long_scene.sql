/*
  # Fix Coaching Tables Permissions
  
  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Grant necessary access rights
    
  2. Security
    - Allow users to view their own orders
    - Allow admin to manage all orders
    - Maintain proper data isolation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON coaching_orders;
DROP POLICY IF EXISTS "Users can create orders" ON coaching_orders;
DROP POLICY IF EXISTS "Admin can manage orders" ON coaching_orders;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON coaching_products;
DROP POLICY IF EXISTS "Admin can manage products" ON coaching_products;

-- Create new policies for coaching_orders
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

-- Create new policies for coaching_products
CREATE POLICY "Products are viewable by everyone"
  ON coaching_products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage products"
  ON coaching_products
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
GRANT SELECT ON coaching_products TO public;
GRANT ALL ON coaching_products TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE coaching_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_products ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_coaching_orders_user_id ON coaching_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_orders_status ON coaching_orders(status);
CREATE INDEX IF NOT EXISTS idx_coaching_products_type ON coaching_products(type);
CREATE INDEX IF NOT EXISTS idx_coaching_products_is_active ON coaching_products(is_active);