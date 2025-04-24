-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stadiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE upi_settings ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Events table policies
CREATE POLICY "Anyone can view active events"
ON events FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins can manage events"
ON events FOR ALL
TO authenticated
USING (auth.role() = 'admin');

-- Bookings table policies
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Only admins can view all bookings"
ON bookings FOR SELECT
TO authenticated
USING (auth.role() = 'admin');

-- Payments table policies
CREATE POLICY "Users can view their own payments"
ON payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = payments.booking_id
    AND bookings.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create payments for their bookings"
ON payments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = booking_id
    AND bookings.user_id = auth.uid()
  )
);

CREATE POLICY "Only admins can view all payments"
ON payments FOR SELECT
TO authenticated
USING (auth.role() = 'admin');

-- Teams table policies
CREATE POLICY "Anyone can view teams"
ON teams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage teams"
ON teams FOR ALL
TO authenticated
USING (auth.role() = 'admin');

-- Stadiums table policies
CREATE POLICY "Anyone can view stadiums"
ON stadiums FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can manage stadiums"
ON stadiums FOR ALL
TO authenticated
USING (auth.role() = 'admin');

-- UPI settings policies
CREATE POLICY "Anyone can view active UPI settings"
ON upi_settings FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins can manage UPI settings"
ON upi_settings FOR ALL
TO authenticated
USING (auth.role() = 'admin');

-- Storage bucket policies
CREATE POLICY "Anyone can view public images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('event-images', 'team-logos', 'stadium-images'));

CREATE POLICY "Users can view their own tickets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ticket-pdfs'
  AND EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.user_id = auth.uid()
    AND storage.filename() LIKE 'ticket-' || bookings.id || '.pdf'
  )
);

CREATE POLICY "Only admins can manage files"
ON storage.objects FOR ALL
TO authenticated
USING (auth.role() = 'admin'); 