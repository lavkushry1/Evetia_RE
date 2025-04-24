-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('event-images', 'Event Images', true),
  ('team-logos', 'Team Logos', true),
  ('stadium-images', 'Stadium Images', true),
  ('ticket-pdfs', 'Ticket PDFs', false)
ON CONFLICT (id) DO NOTHING;

-- Set bucket configurations
UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id IN ('event-images', 'team-logos', 'stadium-images');

UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 1048576, -- 1MB
  allowed_mime_types = ARRAY['application/pdf']
WHERE id = 'ticket-pdfs';

-- Create bucket policies
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('event-images', 'team-logos', 'stadium-images'));

CREATE POLICY "Admin write access for images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('event-images', 'team-logos', 'stadium-images')
  AND auth.role() = 'admin'
);

CREATE POLICY "Admin delete access for images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('event-images', 'team-logos', 'stadium-images')
  AND auth.role() = 'admin'
);

CREATE POLICY "User read access for own tickets"
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

CREATE POLICY "Admin write access for tickets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ticket-pdfs'
  AND auth.role() = 'admin'
);

CREATE POLICY "Admin delete access for tickets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ticket-pdfs'
  AND auth.role() = 'admin'
); 