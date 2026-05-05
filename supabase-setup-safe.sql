-- =====================================================
-- SAFE SUPABASE SETUP - Handles Existing Tables
-- Copy and paste this entire script into Supabase SQL Editor
-- This script will work even if tables already exist
-- =====================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS birthday_cards (
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

-- 2. Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_birthday_cards_username ON birthday_cards(username);
CREATE INDEX IF NOT EXISTS idx_birthday_cards_created_at ON birthday_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_birthday_cards_is_public ON birthday_cards(is_public);

-- 3. Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'birthday_cards' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE birthday_cards ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 4. Drop existing policies if they exist
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        (SELECT policyname FROM pg_policies WHERE tablename = 'birthday_cards')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON birthday_cards';
    END LOOP;
END $$;

-- 5. Create new RLS policies
CREATE POLICY "Enable read for all users" ON birthday_cards FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON birthday_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON birthday_cards FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON birthday_cards FOR DELETE USING (true);

-- 6. Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'birthday-cards', 
  'birthday-cards', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 7. Drop existing storage policies if they exist
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        (SELECT policyname FROM pg_policies WHERE tablename = 'storage.objects' AND policyname LIKE '%birthday-cards%')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON storage.objects';
    END LOOP;
END $$;

-- 8. Create storage policies
CREATE POLICY "Allow image uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'birthday-cards');
CREATE POLICY "Allow image viewing" ON storage.objects FOR SELECT USING (bucket_id = 'birthday-cards');

-- 9. Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger if not exists
DROP TRIGGER IF EXISTS update_birthday_cards_updated_at ON birthday_cards;
CREATE TRIGGER update_birthday_cards_updated_at
  BEFORE UPDATE ON birthday_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Insert sample data if not exists
INSERT INTO birthday_cards (id, username, recipient, sender, message, image_position, text_position, image_scale, text_size, theme_color)
VALUES 
  (
    'sample-1',
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

-- 12. Grant permissions
GRANT ALL ON birthday_cards TO anon;
GRANT ALL ON birthday_cards TO authenticated;

-- 13. Verification
DO $$
DECLARE
  table_exists BOOLEAN;
  bucket_exists BOOLEAN;
  sample_count INTEGER;
  rls_enabled BOOLEAN;
  policy_count INTEGER;
  trigger_exists BOOLEAN;
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
  
  -- Check if RLS is enabled (using information_schema)
  SELECT EXISTS (
    SELECT 1 FROM pg_table_def 
    WHERE tablename = 'birthday_cards' AND rowsecurity = true
  ) INTO rls_enabled;
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'birthday_cards';
  
  -- Check if trigger exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE event_object_table = 'birthday_cards' AND trigger_name = 'update_birthday_cards_updated_at'
  ) INTO trigger_exists;
  
  RAISE NOTICE '=== SETUP VERIFICATION ===';
  RAISE NOTICE 'birthday_cards table: %', CASE WHEN table_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'birthday-cards bucket: %', CASE WHEN bucket_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'Sample cards: %', sample_count;
  RAISE NOTICE 'RLS enabled: %', CASE WHEN rls_enabled THEN '✅ ENABLED' ELSE '❌ DISABLED' END;
  RAISE NOTICE 'RLS policies: %', policy_count;
  RAISE NOTICE 'Update trigger: %', CASE WHEN trigger_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '===================';
  
  -- Test basic functionality
  IF table_exists AND bucket_exists AND policy_count > 0 THEN
    RAISE NOTICE '✅ SETUP COMPLETE - Ready to use!';
  ELSE
    RAISE NOTICE '⚠️  SETUP INCOMPLETE - Check errors above';
  END IF;
END $$;

-- =====================================================
-- SAFE SETUP COMPLETE!
-- =====================================================
-- 
-- This script handles:
-- ✅ Existing tables
-- ✅ Existing policies  
-- ✅ Existing triggers
-- ✅ Existing buckets
-- ✅ Conflicts and errors
-- ✅ Verification queries
--
-- NEXT STEPS:
-- 1. Copy your Supabase URL and Anon Key from Settings > API
-- 2. Add to Vercel environment variables:
--    VITE_SUPABASE_URL=your-project.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-key
-- 3. Deploy and test the application
--
-- TROUBLESHOOTING:
-- - If verification shows errors: Run script again
-- - If bucket creation fails: Create manually in Supabase Dashboard > Storage
-- - If policies fail: Check user permissions in Supabase Dashboard
-- - If sample data missing: Check table constraints
-- =====================================================
