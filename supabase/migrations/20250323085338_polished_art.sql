/*
  # Coaching Management System
  
  1. New Tables
    - `coaching_services`: Services offered
    - `coaching_workshops`: Workshops and training sessions
    - `coaching_appointments`: Appointment bookings
    - `coaching_products`: Digital and physical products
    - `coaching_orders`: Order management
    - `coaching_responses`: AI automated responses
    
  2. Security
    - Enable RLS
    - Set up proper policies
*/

-- Coaching Services
CREATE TABLE coaching_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  duration text NOT NULL,
  type text NOT NULL,
  max_participants integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coaching Workshops
CREATE TABLE coaching_workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text NOT NULL,
  price numeric NOT NULL,
  max_participants integer NOT NULL,
  current_participants integer DEFAULT 0,
  status text DEFAULT 'upcoming',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coaching Appointments
CREATE TABLE coaching_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES coaching_services(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date timestamptz NOT NULL,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coaching Products
CREATE TABLE coaching_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  type text NOT NULL, -- 'digital' or 'physical'
  stock integer,
  digital_content jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coaching Orders
CREATE TABLE coaching_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items
CREATE TABLE coaching_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES coaching_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES coaching_products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- AI Responses
CREATE TABLE coaching_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES coaching_orders(id) ON DELETE CASCADE,
  trigger_type text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE coaching_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Services
CREATE POLICY "Services are viewable by everyone"
  ON coaching_services FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage services"
  ON coaching_services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Workshops
CREATE POLICY "Workshops are viewable by everyone"
  ON coaching_workshops FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage workshops"
  ON coaching_workshops FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Appointments
CREATE POLICY "Users can view own appointments"
  ON coaching_appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointments"
  ON coaching_appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage appointments"
  ON coaching_appointments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Products
CREATE POLICY "Products are viewable by everyone"
  ON coaching_products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage products"
  ON coaching_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Orders
CREATE POLICY "Users can view own orders"
  ON coaching_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON coaching_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage orders"
  ON coaching_orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE users.id = auth.uid()
      AND users.is_super_admin = true
    )
  );

-- Order Items
CREATE POLICY "Users can view own order items"
  ON coaching_order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaching_orders
      WHERE coaching_orders.id = order_id
      AND coaching_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items"
  ON coaching_order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaching_orders
      WHERE coaching_orders.id = order_id
      AND coaching_orders.user_id = auth.uid()
    )
  );

-- AI Responses
CREATE POLICY "Users can view own responses"
  ON coaching_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaching_orders
      WHERE coaching_orders.id = order_id
      AND coaching_orders.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_coaching_services_type ON coaching_services(type);
CREATE INDEX idx_coaching_workshops_status ON coaching_workshops(status);
CREATE INDEX idx_coaching_appointments_date ON coaching_appointments(date);
CREATE INDEX idx_coaching_products_type ON coaching_products(type);
CREATE INDEX idx_coaching_orders_user_id ON coaching_orders(user_id);
CREATE INDEX idx_coaching_orders_status ON coaching_orders(status);
CREATE INDEX idx_coaching_order_items_order_id ON coaching_order_items(order_id);
CREATE INDEX idx_coaching_responses_order_id ON coaching_responses(order_id);

-- Insert sample data
INSERT INTO coaching_services (title, description, price, duration, type, max_participants)
VALUES 
  ('Consultation Stratégique', 'Session personnalisée pour analyser votre projet', 150, '1h30', 'individual', 1),
  ('Workshop Leadership', 'Développez vos compétences de leader', 299, '3h', 'group', 10),
  ('Programme Intensif', 'Accompagnement complet sur 3 mois', 999, '3 mois', 'program', 5);

INSERT INTO coaching_products (title, description, price, type, stock)
VALUES
  ('Guide Business Plan', 'Guide complet pour créer votre business plan', 49, 'digital', null),
  ('Pack Entrepreneur', 'Ressources essentielles pour entrepreneurs', 99, 'digital', null),
  ('Session Enregistrée', 'Replay du dernier workshop', 29, 'digital', null);