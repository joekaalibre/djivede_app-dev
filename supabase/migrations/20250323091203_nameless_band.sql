/*
  # Fix Coaching Products Permissions
  
  1. Changes
    - Drop existing policies
    - Create new policies with proper permissions
    - Grant necessary access rights
    
  2. Security
    - Allow public read access to active products
    - Allow admin to manage all products
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON coaching_products;
DROP POLICY IF EXISTS "Admin can manage products" ON coaching_products;

-- Create new policies
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
GRANT SELECT ON coaching_products TO public;
GRANT ALL ON coaching_products TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE coaching_products ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_coaching_products_type ON coaching_products(type);
CREATE INDEX IF NOT EXISTS idx_coaching_products_is_active ON coaching_products(is_active);

-- Insert sample data if table is empty
INSERT INTO coaching_products (title, description, price, type, stock, is_active)
SELECT 
  'Guide Business Plan',
  'Guide complet pour créer votre business plan',
  49,
  'digital',
  null,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM coaching_products
);

INSERT INTO coaching_products (title, description, price, type, stock, is_active)
SELECT 
  'Pack Entrepreneur',
  'Ressources essentielles pour entrepreneurs',
  99,
  'digital',
  null,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM coaching_products WHERE title = 'Pack Entrepreneur'
);

INSERT INTO coaching_products (title, description, price, type, stock, is_active)
SELECT 
  'Session Enregistrée',
  'Replay du dernier workshop',
  29,
  'digital',
  null,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM coaching_products WHERE title = 'Session Enregistrée'
);