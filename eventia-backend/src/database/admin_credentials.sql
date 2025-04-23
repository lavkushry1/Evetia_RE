-- Insert default admin user
INSERT INTO public.admins (email, password_hash)
VALUES (
    'admin@example.com',
    -- This is a bcrypt hash of 'admin123'
    '$2a$10$uSaK.nlYhVoEPJHYGZXGZu0otrVh/AXm0EAz4QLJX6BBCjVuD/QXC'
)
ON CONFLICT (email) DO NOTHING;

-- Insert default UPI settings
INSERT INTO public.upi_settings (upiVPA, discountAmount, isActive)
VALUES ('eventia@okicici', 0, true)
ON CONFLICT (upiVPA) DO NOTHING; 