/*
  # Fix Coaching Orders Permissions
  
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

-- Create new policies
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
CREATE INDEX IF NOT EXISTS idx_coaching_orders_user_id ON coaching_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_orders_status ON coaching_orders(status);
CREATE INDEX IF NOT EXISTS idx_coaching_orders_payment_status ON coaching_orders(payment_status);

-- Insert sample data if table is empty
INSERT INTO coaching_orders (user_id, total_amount, status, payment_status)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'admin@djivede.com' LIMIT 1),
  199.99,
  'completed',
  'paid'
WHERE NOT EXISTS (
  SELECT 1 FROM coaching_orders
);

-- Create policies for order items
DROP POLICY IF EXISTS "Users can view own order items" ON coaching_order_items;
DROP POLICY IF EXISTS "Users can create order items" ON coaching_order_items;
DROP POLICY IF EXISTS "Admin can manage order items" ON coaching_order_items;

CREATE POLICY "Users can view own order items"
  ON coaching_order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaching_orders
      WHERE coaching_orders.id = order_id
      AND coaching_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items"
  ON coaching_order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaching_orders
      WHERE coaching_orders.id = order_id
      AND coaching_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage order items"
  ON coaching_order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Grant necessary permissions for order items
GRANT SELECT, INSERT ON coaching_order_items TO authenticated;
GRANT ALL ON coaching_order_items TO authenticated;

-- Ensure RLS is enabled for order items
ALTER TABLE coaching_order_items ENABLE ROW LEVEL SECURITY;

-- Create indexes for order items
CREATE INDEX IF NOT EXISTS idx_coaching_order_items_order_id ON coaching_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_coaching_order_items_product_id ON coaching_order_items(product_id);