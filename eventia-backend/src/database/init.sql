-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stadiums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    address TEXT,
    capacity INTEGER NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    capacity INTEGER NOT NULL,
    booked_seats INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    team_id INTEGER REFERENCES teams(id),
    stadium_id INTEGER REFERENCES stadiums(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    utr_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upi_settings (
    id SERIAL PRIMARY KEY,
    upi_vpa VARCHAR(255) UNIQUE NOT NULL,
    merchant_name VARCHAR(255) NOT NULL DEFAULT 'Eventia Tickets',
    discount_code VARCHAR(50),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO admins (email, password_hash)
VALUES (
    'admin@example.com',
    -- This is a bcrypt hash of 'admin123'
    '$2a$10$uSaK.nlYhVoEPJHYGZXGZu0otrVh/AXm0EAz4QLJX6BBCjVuD/QXC'
) ON CONFLICT (email) DO NOTHING;

-- Insert default UPI settings
INSERT INTO upi_settings (upi_vpa, merchant_name, discount_amount, is_active)
VALUES (
    'eventia@okicici',
    'Eventia Tickets',
    0,
    true
) ON CONFLICT (upi_vpa) DO NOTHING;

-- Insert sample teams
INSERT INTO teams (name, logo_url) VALUES
('Mumbai Indians', 'https://example.com/mi.png'),
('Chennai Super Kings', 'https://example.com/csk.png')
ON CONFLICT DO NOTHING;

-- Insert sample stadiums
INSERT INTO stadiums (name, city, address, capacity) VALUES
('Wankhede Stadium', 'Mumbai', 'Marine Lines, Mumbai', 33000),
('M. A. Chidambaram Stadium', 'Chennai', 'Chepauk, Chennai', 50000)
ON CONFLICT DO NOTHING; 