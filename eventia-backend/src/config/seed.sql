-- Create admin user
INSERT INTO users (email, password, role, created_at, updated_at)
VALUES (
  'admin@eventia.com',
  '$2b$10$YourHashedPasswordHere', -- Replace with actual hashed password
  'admin',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Create UPI QR settings
INSERT INTO upi_settings (
  merchant_name,
  merchant_vpa,
  qr_code_url,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'Eventia',
  'eventia@upi',
  'https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=eventia@upi&pn=Eventia',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (merchant_vpa) DO NOTHING;

-- Create default discount codes
INSERT INTO discounts (
  code,
  type,
  value,
  max_uses,
  current_uses,
  start_date,
  end_date,
  min_purchase_amount,
  max_discount_amount,
  is_active,
  created_at,
  updated_at
)
VALUES
(
  'WELCOME10',
  'percentage',
  10,
  1000,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '1 year',
  500,
  1000,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
),
(
  'FLAT100',
  'fixed',
  100,
  500,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '6 months',
  1000,
  NULL,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (code) DO NOTHING; 