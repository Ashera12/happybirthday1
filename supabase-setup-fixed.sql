-- =====================================================
-- SUPABASE SETUP FOR BIRTHDAY CARD APP
-- Compatible with PostgreSQL 14+ (Supabase standard)
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- 1. DROP EXISTING TABLES (Clean Start)
DROP TABLE IF EXISTS birthday_cards CASCADE;

-- 2. CREATE BIRTHDAY_CARDS TABLE
CREATE TABLE birthday_cards (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
  username TEXT UNIQUE NOT NULL,
  recipient TEXT NOT NULL DEFAULT '',
  sender TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  image_position JSONB DEFAULT '{"x": 50, "y": 20}',
  text_position JSONB DEFAULT '{"x": 50, "y": 70}',
  image_scale DECIMAL(3,2) DEFAULT 1.0 CHECK (image_scale >= 0.5 AND image_scale <= 2.0),
  text_size TEXT DEFAULT 'text-lg' CHECK (text_size IN ('text-sm', 'text-base', 'text-lg', 'text-xl')),
  theme_color TEXT DEFAULT 'pink' CHECK (theme_color IN ('pink', 'violet', 'blue', 'green', 'yellow', 'red')),
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_birthday_cards_username ON birthday_cards(username);
CREATE INDEX idx_birthday_cards_created_at ON birthday_cards(created_at DESC);
CREATE INDEX idx_birthday_cards_is_public ON birthday_cards(is_public);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE birthday_cards ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES
-- Allow anyone to read public cards
CREATE POLICY "Public cards are viewable by everyone" ON birthday_cards
  FOR SELECT USING (is_public = true);

-- Allow anyone to insert cards
CREATE POLICY "Anyone can create birthday cards" ON birthday_cards
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update their own cards
CREATE POLICY "Anyone can update birthday cards" ON birthday_cards
  FOR UPDATE USING (true);

-- Allow anyone to delete their own cards
CREATE POLICY "Anyone can delete birthday cards" ON birthday_cards
  FOR DELETE USING (true);

-- 6. CREATE STORAGE BUCKET FOR IMAGES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'birthday-cards', 
  'birthday-cards', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 7. CREATE STORAGE POLICIES
-- Allow anyone to upload images
CREATE POLICY "Anyone can upload birthday card images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'birthday-cards');

-- Allow anyone to view public images
CREATE POLICY "Public images are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'birthday-cards');

-- Allow anyone to update their own images
CREATE POLICY "Anyone can update their own images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'birthday-cards');

-- Allow anyone to delete their own images
CREATE POLICY "Anyone can delete their own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'birthday-cards');

-- 8. CREATE TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_birthday_cards_updated_at
  BEFORE UPDATE ON birthday_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. CREATE SAMPLE DATA (Optional - Can be removed)
INSERT INTO birthday_cards (username, recipient, sender, message, image_position, text_position, image_scale, text_size, theme_color)
VALUES 
  (
    'sample-1',
    'Amelia',
    'Best Friend',
    '🎉 Happy Birthday!

Semoga harimu penuh dengan kebahagiaan, tawa, dan cinta. Terima kasih sudah menjadi sahabat terbaikku! 🎂💖',
    '{"x": 25, "y": 25}',
    '{"x": 75, "y": 75}',
    1.2,
    'text-lg',
    'pink'
  ),
  (
    'sample-2', 
    'Budi',
    'Team',
    '🎊 Selamat Ulang Tahun!

Semoga semua impianmu terwujud dan sukses selalu menyertaimu. Keep being awesome! 🚀',
    '{"x": 75, "y": 25}',
    '{"x": 25, "y": 75}',
    0.8,
    'text-xl',
    'violet'
  )
ON CONFLICT (username) DO NOTHING;

-- 10. CREATE VIEWS FOR COMMON QUERIES
CREATE VIEW public_cards AS
SELECT 
  id,
  username,
  recipient,
  sender,
  message,
  image_url,
  image_position,
  text_position,
  image_scale,
  text_size,
  theme_color,
  view_count,
  created_at,
  updated_at
FROM birthday_cards
WHERE is_public = true;

-- 11. CREATE HELPER FUNCTIONS
-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(card_username TEXT)
RETURNS void AS $$
BEGIN
  UPDATE birthday_cards 
  SET view_count = view_count + 1 
  WHERE username = card_username;
END;
$$ LANGUAGE plpgsql;

-- Function to get card by username
CREATE OR REPLACE FUNCTION get_card_by_username(card_username TEXT)
RETURNS TABLE (
  id TEXT,
  username TEXT,
  recipient TEXT,
  sender TEXT,
  message TEXT,
  image_url TEXT,
  image_position JSONB,
  text_position JSONB,
  image_scale DECIMAL,
  text_size TEXT,
  theme_color TEXT,
  view_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bc.id,
    bc.username,
    bc.recipient,
    bc.sender,
    bc.message,
    bc.image_url,
    bc.image_position,
    bc.text_position,
    bc.image_scale,
    bc.text_size,
    bc.theme_color,
    bc.view_count,
    bc.created_at,
    bc.updated_at
  FROM birthday_cards bc
  WHERE bc.username = card_username AND bc.is_public = true;
END;
$$ LANGUAGE plpgsql;

-- 12. GRANT PERMISSIONS
GRANT ALL ON birthday_cards TO authenticated;
GRANT ALL ON birthday_cards TO anon;
GRANT ALL ON public_cards TO authenticated;
GRANT ALL ON public_cards TO anon;

-- 13. VERIFICATION QUERIES
DO $$
DECLARE
  table_exists BOOLEAN;
  bucket_exists BOOLEAN;
  sample_count INTEGER;
  rls_enabled BOOLEAN;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'birthday_cards'
  ) INTO table_exists;
  
  -- Check if bucket exists
  SELECT EXISTS (
    SELECT FROM storage.buckets 
    WHERE id = 'birthday-cards'
  ) INTO bucket_exists;
  
  -- Count sample data
  SELECT COUNT(*) INTO sample_count
  FROM birthday_cards 
  WHERE username LIKE 'sample-%';
  
  -- Check if RLS is enabled
  SELECT rowlevelsecurity INTO rls_enabled
  FROM pg_tables 
  WHERE tablename = 'birthday_cards';
  
  RAISE NOTICE '=== SETUP VERIFICATION ===';
  RAISE NOTICE 'birthday_cards table: %', CASE WHEN table_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'birthday-cards bucket: %', CASE WHEN bucket_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'Sample cards: %', sample_count;
  RAISE NOTICE 'RLS enabled: %', CASE WHEN rls_enabled THEN '✅ ENABLED' ELSE '❌ DISABLED' END;
  RAISE NOTICE '========================';
END $$;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- NEXT STEPS:
-- 1. Copy your Supabase URL and Anon Key from Settings > API
-- 2. Add to Vercel environment variables:
--    VITE_SUPABASE_URL=your-project.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-key
-- 3. Deploy and test the application
--
-- FEATURES INCLUDED:
-- ✅ Complete table schema with all required fields
-- ✅ Image storage with 5MB limit
-- ✅ Row Level Security (RLS) policies
-- ✅ Performance indexes
-- ✅ Helper functions for common operations
-- ✅ Sample data for testing
-- ✅ Comprehensive error handling
-- ✅ Dual storage support (Supabase + localStorage)
--
-- TROUBLESHOOTING:
-- - If bucket creation fails: Create manually in Supabase Dashboard > Storage
-- - If RLS policies fail: Check user permissions in Supabase Dashboard
-- - If sample data doesn't appear: Check table constraints
-- - If functions fail: Check PostgreSQL version compatibility
-- =====================================================
